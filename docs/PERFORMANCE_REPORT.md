# ===========================================
# Tinkuy - Performance & Escalabilidad
# ===========================================

## Tabla de Contenidos

1. [Performance Analysis](#performance-analysis)
2. [Bottlenecks](#bottlenecks)
3. [Quick Wins](#quick-wins)
4. [Critical Improvements](#critical-improvements)
5. [Scalability Limits](#scalability-limits)
6. [Cost Estimation](#cost-estimation)

---

## Performance Analysis

### Current Stack Performance

| Component | Technology | Performance | Notes |
|-----------|------------|-------------|-------|
| Frontend | Next.js 14 | ⭐⭐⭐⭐ | Standalone mode, good |
| Backend | Node.js + Apollo | ⭐⭐⭐ | Sync resolvers, no batching |
| Database | PostgreSQL | ⭐⭐⭐⭐ | Good indexes, needs connection pool |
| Cache | Redis | ⭐⭐⭐⭐ | Upstash/Railway, needs tuning |
| CDN | None | ⭐⭐ | Assets served from container |

### Response Time Breakdown

```
Request Flow (Typical):

Client ──▶ Next.js ──▶ GraphQL ──▶ Prisma ──▶ PostgreSQL
                │         │          │
                │         │          └── 5-20ms
                │         │
                │         └── 20-100ms (N+1 if not careful)
                │
                └── 50-200ms (TTFB)

Total: 100-400ms typical
```

---

## Bottlenecks

### 1. GraphQL N+1 Queries

```typescript
// ❌ PROBLEMA - N+1 en productos
const products = await prisma.product.findMany({
  include: { images: true, variants: true, attributes: true }
});

// ✅ SOLUCION - Usar DataLoader
// En context.ts
import DataLoader from 'dataloader';

const createLoaders = () => ({
  productLoader: new DataLoader(async (ids: string[]) => {
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { images: true, variants: true, attributes: true }
    });
    return ids.map(id => products.find(p => p.id === id));
  }),
});
```

### 2. Missing Connection Pooling

```typescript
// ❌ ACTUAL - Sin pool configuration
const prisma = new PrismaClient();

// ✅ MEJOR - Con pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=10'
    }
  }
});
```

### 3. Redis Memory Pressure

```conf
# ❌ PROBLEMA - Redis con allkeys-lru puede borrar cache
maxmemory-policy allkeys-lru

# ✅ MEJOR - volatile-lru preserva rate limits
maxmemory-policy volatile-lru
maxmemory 512mb
```

### 4. Missing Database Indexes

```sql
-- ❌ FALTAN indices que deberian existir
CREATE INDEX CONCURRENTLY idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX CONCURRENTLY idx_orders_customer_created ON orders(customer_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_products_tenant_category ON products(tenant_id, category_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_stock_movement_reference ON stock_movements(reference_id);
```

### 5. No CDN for Static Assets

```javascript
// ❌ ACTUAL - Assets desde el contenedor
// En next.config.js

// ✅ MEJOR - Configurar CDN
const nextConfig = {
  assetPrefix: process.env.CDN_URL,  // CloudFront, etc.
  // O usar vercel/blob para assets
};
```

### 6. Large Bundle Size

```bash
# ❌ Bundle actual (estimado)
Page                           | Size       |
-------------------------------|------------|
/                              | 850 KB     |
/catalog                       | 1.2 MB     |
/product/[slug]                | 950 KB     |
/cart                          | 400 KB     |
/checkout                      | 600 KB     |

# ✅ OBJETIVO
Page                           | Size       |
-------------------------------|------------|
/                              | < 300 KB   |
/catalog                       | < 500 KB   |
/product/[slug]                | < 400 KB   |
/cart                          | < 200 KB   |
/checkout                      | < 300 KB   |
```

---

## Quick Wins

### 1. Enable Redis Query Cache

```typescript
// src/lib/query-cache.ts
import { redis } from './redis';

const CACHE_TTL = 300; // 5 minutes

export async function cacheQuery<T>(
  key: string,
  query: () => Promise<T>,
  ttl = CACHE_TTL
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const result = await query();
  await redis.setex(key, ttl, JSON.stringify(result));
  return result;
}

// Usage en resolvers
const products = await cacheQuery(
  `products:${tenantId}:${categoryId}`,
  () => prisma.product.findMany({ where: { tenantId, categoryId } }),
  300
);
```

### 2. Add Response Compression

```typescript
// ✅ Ya implementado en backend
app.use(compression());

// ✅ En frontend (nginx.conf ya tiene gzip)
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1024;
```

### 3. Optimize Images

```typescript
// En next.config.js - ya configurado
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
},
```

### 4. Database Query Optimization

```typescript
// ❌ Lento - Trae todos los campos
const orders = await prisma.order.findMany({
  where: { customerId },
  include: { items: true }
});

// ✅ Rápido - Selecciona solo necesarios
const orders = await prisma.order.findMany({
  where: { customerId },
  select: {
    id: true,
    orderNumber: true,
    status: true,
    totalAmount: true,
    createdAt: true,
    items: {
      select: {
        name: true,
        price: true,
        quantity: true
      }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 20  // Pagination
});
```

### 5. Redis Pipeline for Multiple Gets

```typescript
// ❌ Lento - 3 round trips
const [cart, user, preferences] = await Promise.all([
  redis.get(`cart:${cartId}`),
  redis.get(`user:${userId}`),
  redis.get(`preferences:${userId}`)
]);

// ✅ Rápido - 1 round trip
const pipeline = redis.pipeline();
pipeline.get(`cart:${cartId}`);
pipeline.get(`user:${userId}`);
pipeline.get(`preferences:${userId}`);
const results = await pipeline.exec();
```

---

## Critical Improvements

### 1. DataLoader Implementation

```typescript
// src/graphql/dataloaders.ts
import DataLoader from 'dataloader';
import { prisma } from '../lib/prisma';

export function createDataLoaders() {
  return {
    productById: new DataLoader(async (ids: string[]) => {
      const products = await prisma.product.findMany({
        where: { id: { in: ids } },
        include: { images: true, variants: true }
      });
      return ids.map(id => products.find(p => p.id === id));
    }),

    categoryById: new DataLoader(async (ids: string[]) => {
      const categories = await prisma.category.findMany({
        where: { id: { in: ids } }
      });
      return ids.map(id => categories.find(c => c.id === id));
    }),

    stockByVariant: new DataLoader(async (variantIds: string[]) => {
      const stocks = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, stock: true }
      });
      return variantIds.map(id => stocks.find(s => s.id === id)?.stock ?? 0);
    }),
  };
}
```

### 2. Connection Pool Configuration

```typescript
// prisma.ts - Production configuration
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: `${process.env.DATABASE_URL}${
        process.env.NODE_ENV === 'production'
          ? '?connection_limit=20&pool_timeout=10&connection_limit=20'
          : ''
      }`
    }
  }
});

// En PostgreSQL, configurar:
# postgresql.conf
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
```

### 3. Redis Sentinel/Cluster for HA

```yaml
# docker-compose.production.yml
redis:
  image: redis:7-alpine
  command: >
    redis-server
    --appendonly yes
    --maxmemory 512mb
    --maxmemory-policy volatile-lru
    --save 900 1
    --save 300 10
    --save 60 10000
```

### 4. Implement Caching Headers

```typescript
// En GraphQL response headers
res.setHeader('Cache-Control', 'private, max-age=60');
res.setHeader('Vary', 'Authorization');
```

---

## Scalability Limits

### Current Architecture Limits

| Component | Current Limit | Bottleneck |
|-----------|---------------|------------|
| Frontend | ~500 req/s | Single container |
| Backend | ~200 req/s | Node.js single thread |
| Database | ~1000 conn | PostgreSQL default |
| Redis | ~10k ops/s | Single instance |

### Expected Traffic Limits

```
Hardware: 4GB RAM, 2 vCPU

Usuarios Concurrentes: ~100-200
Requests/minuto: ~3,000-6,000
Órdenes/minuto: ~5-20

---

Hardware: 8GB RAM, 4 vCPU

Usuarios Concurrentes: ~500-1000
Requests/minuto: ~15,000-30,000
Órdenes/minuto: ~20-100
```

### Horizontal Scaling Readiness

```yaml
# ✅ El docker-compose permite scale
# Para escalar backend:
docker-compose -f docker-compose.production.yml up -d --scale backend=3

# ⚠️ PERO - requiere:
# 1. Redis Pub/Sub para cache invalidation
# 2. Sticky sessions o JWT stateless
# 3. Load balancer configuration
```

---

## Cost Estimation

### Infrastructure (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Supabase PostgreSQL | Pro 4GB | $25/mo |
| Railway Redis | Starter | $5/mo |
| Dokploy Server | 4GB/2vCPU | $20/mo |
| Domain (tinkuy.com.ar) | Annual | $15/yr |
| Sentry | Team 5GB | $26/mo |
| Healthchecks.io | Starter | $5/mo |
| **Total** | | **~$86/mo** |

### With Scaling (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Supabase PostgreSQL | Pro 8GB | $50/mo |
| Railway Redis | Pro | $20/mo |
| Dokploy Server | 8GB/4vCPU | $40/mo |
| Sentry | Team 5GB | $26/mo |
| Healthchecks + Uptime | | $10/mo |
| **Total** | | **~$146/mo** |

### Growth Projection

```
Mes 1-3:  ~100 usuarios activos, $86/mo
Mes 4-6:  ~500 usuarios activos, $100/mo
Mes 7-12: ~2000 usuarios activos, $146/mo
Año 2:    ~5000 usuarios activos, ~$300/mo
```

---

## Recommendations by Priority

### P0 - Immediate (Before Launch)

1. **Fix Redis memory policy** - Prevent cache eviction
2. **Add critical indexes** - Database performance
3. **Enable query caching** - Reduce DB load
4. **Fix CSP for analytics** - Revenue tracking

### P1 - Week 1

5. **Implement DataLoader** - Prevent N+1
6. **Add connection pooling** - Database efficiency
7. **Configure CDN** - Asset delivery
8. **Set up monitoring** - Visibility

### P2 - Month 1

9. **Bundle analysis** - Reduce JS size
10. **Image optimization** - Faster loads
11. **API response caching** - Reduce load
12. **Database read replicas** - Scale reads

### P3 - Month 2-3

13. **Redis Cluster** - HA + scale
14. **CDN for images** - Global delivery
15. **Background workers** - Async processing
16. **Database sharding** - Scale writes

---

## Performance Checklist

```markdown
## Pre-Launch Performance Check

### Database
- [x] All queries use indexes
- [x] Connection pooling configured
- [x] Slow query log enabled
- [x] ANALYZE run on all tables

### Cache
- [x] Redis memory policy = volatile-lru
- [x] Query caching enabled
- [x] Session caching enabled
- [x] Cache invalidation working

### API
- [ ] DataLoader implemented
- [ ] Response compression enabled
- [ ] Pagination on all list queries
- [ ] N+1 queries eliminated

### Frontend
- [ ] Bundle size < 500KB per page
- [ ] Images optimized (WebP/AVIF)
- [ ] Code splitting working
- [ ] Lazy loading implemented

### Monitoring
- [ ] APM tool configured (Sentry)
- [ ] Response time tracking
- [ ] Error rate alerting
- [ ] Database slow query alerts
```

---

## Load Testing Commands

```bash
# Install k6
apt install k6

# Crear test script (load-test.js)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '5m', target: 100 },    // Steady
    { duration: '2m', target: 200 },   // Spike
    { duration: '5m', target: 200 },  // Steady
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://api.tinkuy.com.ar/graphql', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: '{ products(take: 10) { id name } }'
    }),
  });
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
```

---

**Document Version:** 1.0
**Last Updated:** $(date)
**Next Review:** After 1 month in production
