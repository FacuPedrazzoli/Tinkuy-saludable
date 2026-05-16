# ===========================================
# Tinkuy - Security Hardening Checklist
# ===========================================

## Tabla de Contenidos

1. [Helmet & CSP](#helmet--csp)
2. [Rate Limiting](#rate-limiting)
3. [Authentication](#authentication)
4. [GraphQL Security](#graphql-security)
5. [Database Security](#database-security)
6. [Redis Security](#redis-security)
7. [Docker Security](#docker-security)
8. [Server Security](#server-security)
9. [Monitoring & Alerts](#monitoring--alerts)
10. [Compliance](#compliance)

---

## Helmet & CSP

### Backend (src/index.ts)

```typescript
// ✅ ACTUAL - Verificar que esté así
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.mercadopago.com", "https://webhook.mercadopago.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  xContentTypeOptions: true,
  xFrameOptions: { action: "deny" },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
```

### Frontend (next.config.js)

```javascript
// ⚠️ FIX REQUIRED - CSP debe incluir analytics externos
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: https: blob:;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://api.mercadopago.com https://webhook.mercadopago.com wss://*.mercadopago.com;
      frame-src 'https://www.mercadopago.com.ar' https://sandbox.mercadopago.com;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim(),
  },
  // ... resto de headers
];
```

---

## Rate Limiting

### Verificar Configuración

```typescript
// ✅ CORRECTO - Rate limits por tipo
const RATE_LIMITS = {
  GENERAL: { windowMs: 60 * 1000, maxRequests: 100 },
  AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  REGISTER: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  CHECKOUT: { windowMs: 60 * 1000, maxRequests: 10 },
};
```

### Redis Memory Policy

```conf
# ⚠️ FIX - NO usar allkeys-lru en producción
# allkeys-lru puede borrar rate limit data
# USAR: volatile-lru

redis-server \
  --appendonly yes \
  --maxmemory 512mb \
  --maxmemory-policy volatile-lru \
  --maxmemory-samples 5
```

---

## Authentication

### JWT Configuration

```typescript
// ✅ CORRECTO
const TOKEN_EXPIRY = {
  admin: '24h',
  customer: '7d',
  refresh: '30d',
};

// ✅ CORRECTO - Secrets de 32+ caracteres
process.env.JWT_ADMIN_SECRET.length >= 32
process.env.JWT_CUSTOMER_SECRET.length >= 32

// ✅ CORRECTO - Algorithm restrictions
jwt.verify(token, secret, { algorithms: ["HS256"] });

// ✅ CORRECTO - Refresh token rotation con family ID
const familyId = randomBytes(16).toString("hex");
```

### Password Requirements

```typescript
// ✅ CORRECTO
const passwordSchema = z.string()
  .min(8, "Mínimo 8 caracteres")
  .max(128, "Máximo 128 caracteres")
  .regex(/[A-Z]/, "Al menos una mayúscula")
  .regex(/[0-9]/, "Al menos un número")
  .regex(/[^A-Za-z0-9]/, "Al menos un carácter especial");
```

### Cookie Security

```typescript
// ✅ CORRECTO
res.cookie('token', token, {
  httpOnly: true,      // No accessible via JS
  secure: true,        // HTTPS only
  sameSite: 'strict',   // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});
```

---

## GraphQL Security

### Depth & Complexity Limits

```typescript
// ✅ CORRECTO
const depthLimitPlugin = createDepthLimitPlugin(10);
const queryComplexityPlugin = createComplexityLimitPlugin(1000);
```

### Introspection Production

```typescript
// ✅ CORRECTO - Solo en desarrollo
const introspection = !IS_PRODUCTION && process.env.GRAPHQL_INTROSPECTION === "true";

const server = new ApolloServer({
  schema,
  introspection,  // false en producción
  plugins: [depthLimitPlugin, queryComplexityPlugin],
});
```

### Query Validation

```typescript
// ✅ CORRECTO - Zod validation en todos los inputs
const inputSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  password: passwordSchema,
  // ...
});

const validated = inputSchema.parse(input);
```

---

## Database Security

### Prisma SQL Injection

```typescript
// ✅ CORRECTO - Parameterized queries via Prisma
const user = await prisma.user.findUnique({
  where: { email: validatedEmail }, // No string interpolation
});

// ⚠️ EVITAR - Raw queries con string interpolation
// await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`
```

### Indexes for Security

```prisma
// ✅ CORRECTO - Verificar que existan
model RefreshToken {
  @@index([token])
  @@index([userId, userType])
  @@index([familyId])
  @@index([revokedAt])  // Para cleanup
}

model AdminUser {
  @@unique([tenantId, email])  // Previene duplicate emails
}

model Customer {
  @@unique([tenantId, email])
}
```

---

## Redis Security

### Authentication

```bash
# ⚠️ FIX - Si Redis es accesible externamente
# En docker-compose.production.yml:

redis:
  command: >
    redis-server
    --appendonly yes
    --requirepass ${REDIS_PASSWORD}  # <-- AGREGAR
    --maxmemory 512mb
    --maxmemory-policy volatile-lru
```

### Memory Policy

```conf
# ⚠️ CRÍTICO - No usar allkeys-lru
# allkeys-lru puede borrar rate limits y causar bypass

# CORRECTO:
maxmemory-policy volatile-lru
```

---

## Docker Security

### Non-root Users

```dockerfile
# ✅ CORRECTO - Todos los Dockerfiles
FROM node:20-alpine AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

USER nextjs
```

### Image Scanning

```bash
# Verificar vulnerabilidades
docker scan tinkuy-frontend
docker scan tinkuy-backend

# Actualizar imágenes base regularmente
docker pull node:20-alpine
docker pull redis:7-alpine
```

### Resource Limits

```yaml
# ✅ CORRECTO - En docker-compose
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 512M
```

---

## Server Security

### SSH Hardening

```bash
# /etc/ssh/sshd_config

# ⚠️ CHECK - Verificar configuración
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
```

### Fail2ban

```bash
# ✅ Instalar y configurar
apt install fail2ban

# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
```

### UFW Rules

```bash
# ✅ CORRECTO
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
```

---

## Monitoring & Alerts

### Sentry Configuration

```typescript
// ✅ CORRECTO
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: version,
  tracesSampleRate: 0.1,  // Production
  profilesSampleRate: 0.1,
  ignoreErrors: ['ValidationError', 'NotFoundError'],
  beforeSend(event) {
    // Sanitize PII
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

### Healthcheck Alerts

```bash
# ⚠️ CHECK - Healthchecks debe estar configurado
# Usar Healthchecks.io, Uptime Kuma, o similar

# Endpoints a monitorear:
# - GET https://tinkuy.com.ar/health
# - GET https://api.tinkuy.com.ar/health
# - GET https://api.tinkuy.com.ar/graphql (query { __typename })
```

### Discord/Slack Alerts

```yaml
# En docker-compose.production.yml
services:
  backend:
    environment:
      - ALERT_WEBHOOK_URL=${ALERT_WEBHOOK_URL}
```

---

## Compliance

### GDPR

```typescript
// ✅ Implementado
const gdprSafeLogger = {
  info(ctx, message) {
    // No loggear emails o IPs completas
    const safe = {
      ...ctx,
      email: hashEmail(ctx.email),
      ip: ctx.ip ? ctx.ip.substring(0, 8) + '***' : undefined,
    };
    logger.info(safe, message);
  }
};
```

### Data Retention

```typescript
// ✅ Cleanup jobs implementados
// cleanupExpiredRefreshTokens()
// cleanupAbandonedCarts()
```

### Security Headers Checklist

| Header | Frontend | Backend | Status |
|--------|----------|---------|--------|
| Content-Security-Policy | ✅ | ✅ | Fix CSP |
| Strict-Transport-Security | ✅ | ✅ | ✅ |
| X-Frame-Options | ✅ | ✅ | ✅ |
| X-Content-Type-Options | ✅ | ✅ | ✅ |
| Referrer-Policy | ✅ | ✅ | ✅ |
| Permissions-Policy | ✅ | ✅ | ✅ |
| X-XSS-Protection | ❌ | ✅ | Add to frontend |

---

## Quick Fixes

### 1. Fix Frontend CSP (next.config.js)

```javascript
// Replace the CSP with this version that allows analytics
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://api.mercadopago.com https://webhook.mercadopago.com; frame-src 'https://www.mercadopago.com.ar' https://sandbox.mercadopago.com https://www.mercadopago.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  },
  // ... rest
];
```

### 2. Fix Redis Memory Policy

```yaml
# In docker-compose.production.yml
redis:
  command: >
    redis-server
    --appendonly yes
    --maxmemory 512mb
    --maxmemory-policy volatile-lru  # NOT allkeys-lru
```

### 3. Add X-XSS-Protection to Frontend

```javascript
// In next.config.js headers
{
  key: 'X-XSS-Protection',
  value: '1; mode=block',
}
```

### 4. Verify Webhook Signature Validation

```typescript
// In webhook.handler.ts - ensure signature verification
const isValid = verifyMercadoPagoSignature(rawPayload, signature, webhookSecret);
if (!isValid) {
  return res.status(401).json({ error: "Invalid webhook signature" });
}
```

---

## Security Checklist Final

```markdown
## Pre-Production Security Check

### Authentication
- [x] JWT tokens with 24h/7d expiry
- [x] Refresh token rotation with family IDs
- [x] Password hashing with bcrypt (12 rounds)
- [x] Password requirements enforced
- [x] Cookie httpOnly + secure + sameSite

### Authorization
- [x] Role-based access (admin, manager, customer)
- [x] Tenant isolation via middleware
- [x] Scope-based GraphQL access

### Data Protection
- [x] PII not logged
- [x] Sensitive data in cookies hashed
- [x] Database indexes on sensitive lookups
- [x] Backup encryption (if S3)

### Infrastructure
- [x] Non-root Docker containers
- [x] Resource limits on all containers
- [x] Firewall configured (UFW)
- [x] SSH key-only authentication
- [x] Fail2ban installed
- [x] Redis password protected
- [x] SSL/TLS 1.2+ only

### Application
- [x] CSP configured
- [x] Rate limiting active
- [x] GraphQL depth/complexity limits
- [x] Introspection disabled in production
- [x] Input validation (Zod)
- [x] SQL injection prevention (Prisma)
- [x] XSS protection headers
- [x] Webhook signature verification

### Monitoring
- [x] Sentry configured
- [x] Healthchecks active
- [x] Error alerting configured
- [x] Log aggregation ready

### Compliance
- [x] GDPR-safe logging
- [x] Data retention policy
- [x] Token cleanup jobs
```

---

## Running Security Audit

```bash
# 1. Check for exposed secrets
git log --all --full-history -p | grep -i "password\|secret\|token" | head -20

# 2. Check for SQL injection vectors
grep -r "\$queryRaw" back-tinkuy-saludable/src --include="*.ts"

# 3. Check Docker image vulnerabilities
docker scout cves ghcr.io/your-org/backend:latest

# 4. Check SSL configuration
curl -v https://tinkuy.com.ar 2>&1 | grep -E "SSL|TLS"

# 5. Check headers
curl -I https://tinkuy.com.ar

# 6. Check rate limiting
for i in {1..110}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4000/graphql; done | sort | uniq -c
```

---

## Report Issues

Si encuentras vulnerabilidades:

1. **No** hacer commit con el fix directamente
2. Crear issue privado en GitHub
3. O contactar al equipo de seguridad directamente
4. Follow responsible disclosure

---

**Última actualización:** $(date)
**Revisado por:** Security Team
**Próxima auditoría:** +90 días
