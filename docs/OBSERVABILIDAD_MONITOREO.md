# ===========================================
# Tinkuy - Observabilidad y Monitoreo
# ===========================================

## Tabla de Contenidos

1. [Logging Strategy](#logging-strategy)
2. [Health Endpoints](#health-endpoints)
3. [Metrics](#metrics)
4. [Sentry Integration](#sentry-integration)
5. [Alerting](#alerting)
6. [Dashboards](#dashboards)
7. [Incident Response](#incident-response)

---

## Logging Strategy

### Structured Logging (Backend)

```typescript
// src/lib/logger.ts
import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'tinkuy-api' },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? winston.format.combine(winston.format.colorize(), winston.format.simple())
        : logFormat,
    }),
    new winston.transports.File({
      filename: '/app/logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: '/app/logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// PII-safe logging helper
export const logSafe = (ctx: any, message: string) => {
  const safe = {
    ...ctx,
    email: ctx.email ? hashEmail(ctx.email) : undefined,
    ip: ctx.ip ? ctx.ip.substring(0, 8) + '***' : undefined,
    userAgent: ctx.userAgent,
    timestamp: new Date().toISOString(),
  };
  logger.info(safe, message);
};
```

### Request Logging

```typescript
// src/lib/request-logger.ts
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = crypto.randomUUID();
  req.headers['x-request-id'] = requestId;

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      tenantId: (req as any).tenantId,
    }, 'HTTP Request');
  });

  next();
};
```

### GraphQL Logging

```typescript
// En GraphQL resolvers
const resolvers = {
  Query: {
    products: async (_parent, args, ctx) => {
      const start = Date.now();
      const result = await prisma.product.findMany(args);
      const duration = Date.now() - start;

      logger.debug({
        operation: 'products',
        duration,
        count: result.length,
        tenantId: ctx.tenantId,
      }, 'GraphQL Query');

      return result;
    },
  },
};
```

---

## Health Endpoints

### Backend Health Check

```typescript
// GET /health - Detailed health check
app.get('/health', async (_req, res) => {
  const checks = {
    database: false,
    redis: false,
  };

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (err) {
    logger.error({ err, component: 'health' }, 'Database health check failed');
  }

  // Redis check
  try {
    const pong = await redis.ping();
    checks.redis = pong === 'PONG';
  } catch (err) {
    logger.error({ err, component: 'health' }, 'Redis health check failed');
  }

  const allHealthy = Object.values(checks).every(v => v);
  const status = allHealthy ? 'ok' : 'degraded';
  const httpStatus = allHealthy ? 200 : 503;

  res.status(httpStatus).json({
    status,
    checks,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version,
  });
});

// GET /ready - Readiness probe
app.get('/ready', async (_req, res) => {
  const isReady = await checkReadiness();
  res.status(isReady ? 200 : 503).json({ ready: isReady });
});

// GET /live - Liveness probe
app.get('/live', (_req, res) => {
  res.status(200).json({ alive: true });
});
```

### Frontend Health

```typescript
// src/app/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
```

---

## Metrics

### Backend Metrics

```typescript
// src/lib/metrics.ts
import { Histogram, Counter, Gauge } from 'prom-client';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.5, 1, 5],
});

const graphqlQueryDuration = new Histogram({
  name: 'graphql_query_duration_seconds',
  help: 'Duration of GraphQL queries',
  labelNames: ['operation', 'operationType'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['type'],
});

const orderCount = new Counter({
  name: 'orders_total',
  help: 'Total number of orders',
  labelNames: ['status', 'paymentStatus'],
});

const paymentAmount = new Counter({
  name: 'payment_amount_total',
  help: 'Total payment amount processed',
  labelNames: ['currency'],
});

const webhookFailures = new Counter({
  name: 'webhook_failures_total',
  help: 'Total webhook processing failures',
  labelNames: ['source', 'type'],
});

export { httpRequestDuration, graphqlQueryDuration, activeConnections, orderCount, paymentAmount, webhookFailures };
```

### Prometheus Endpoint

```typescript
// GET /metrics
import client from 'prom-client';

app.get('/metrics', async (_req, res) => {
  try {
    const registery = client.register;
    res.set('Content-Type', registery.contentType);
    res.end(await registery.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});
```

---

## Sentry Integration

### Backend

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/node';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.npm_package_version,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    ignoreErrors: ['ValidationError', 'NotFoundError', 'AuthenticationError'],
    beforeSend(event) {
      // Sanitize
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      // Remove stack trace from production
      if (process.env.NODE_ENV === 'production') {
        event.exception?.values?.forEach(exception => {
          exception.stacktrace = undefined;
        });
      }
      return event;
    },
  });
}

export const sentryHandlers = {
  requestHandler() {
    return Sentry.Handlers.requestHandler({
      transaction: 'request',
    });
  },
  errorHandler() {
    return Sentry.Handlers.errorHandler({
      shouldHandleError: (err) => {
        // Ignore certain errors
        if (err.message === 'Not authenticated') return false;
        return true;
      },
    });
  },
};
```

### Frontend

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    // Sanitize user data
    if (event.user) {
      event.user.email = undefined;
      event.user.ip_address = undefined;
    }
    return event;
  },
});

export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    contexts: context,
  });
};
```

---

## Alerting

### Healthchecks.io

```bash
# curl commands to register checks

# Frontend health
curl -X POST "https://hc.api/checks/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Tinkuy Frontend", "url": "https://tinkuy.com.ar/health", "tags": ["production", "frontend"]}'

# Backend health
curl -X POST "https://hc.api/checks/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Tinkuy Backend", "url": "https://api.tinkuy.com.ar/health", "tags": ["production", "backend"]}'

# GraphQL
curl -X POST "https://hc.api/checks/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Tinkuy GraphQL", "url": "https://api.tinkuy.com.ar/graphql", "tags": ["production", "graphql"]}'
```

### Discord Alerts

```typescript
// src/lib/alerts.ts
interface AlertPayload {
  title: string;
  description: string;
  color: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: string;
}

export async function sendDiscordAlert(payload: AlertPayload) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const body = {
    embeds: [{
      title: payload.title,
      description: payload.description,
      color: payload.color,
      fields: payload.fields,
      footer: { text: payload.footer || 'Tinkuy Alert' },
      timestamp: new Date().toISOString(),
    }],
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Usage examples
export const alerts = {
  deploymentStarted: () => sendDiscordAlert({
    title: '🚀 Deployment Started',
    description: `Deploying ${process.env.GIT_SHA?.substring(0, 7)} to production`,
    color: 0x3498db,
  }),

  deploymentFailed: (error: string) => sendDiscordAlert({
    title: '❌ Deployment Failed',
    description: error,
    color: 0xe74c3c,
  }),

  highErrorRate: (rate: number) => sendDiscordAlert({
    title: '⚠️ High Error Rate',
    description: `Error rate is ${rate}% (threshold: 5%)`,
    color: 0xf39c12,
  }),

  webhookFailure: (source: string) => sendDiscordAlert({
    title: '🔴 Webhook Failure',
    description: `Failed to process ${source} webhook`,
    color: 0xe74c3c,
  }),
};
```

### Alert Rules

```yaml
# Alertas配置的 yml o json
alerts:
  - name: high_error_rate
    condition: error_rate > 0.05  # 5%
    window: 5m
    severity: critical
    notify: discord, email

  - name: high_latency
    condition: p99_latency > 2000  # 2s
    window: 5m
    severity: warning
    notify: discord

  - name: webhook_failure
    condition: webhook_failures > 10
    window: 1m
    severity: critical
    notify: discord, email

  - name: database_down
    condition: database_healthy == false
    window: 1m
    severity: critical
    notify: discord, sms

  - name: redis_down
    condition: redis_healthy == false
    window: 1m
    severity: warning
    notify: discord

  - name: disk_space_low
    condition: disk_usage_percent > 85
    window: 5m
    severity: warning
    notify: discord

  - name: memory_high
    condition: memory_usage_percent > 90
    window: 5m
    severity: critical
    notify: discord
```

---

## Dashboards

### Grafana Dashboard JSON

```json
{
  "dashboard": {
    "title": "Tinkuy Production",
    "tags": ["tinkuy", "production"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          { "expr": "rate(http_requests_total[5m])" }
        ],
        "grid": { "x": 0, "y": 0, "w": 12, "h": 8 }
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          { "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])" }
        ],
        "grid": { "x": 12, "y": 0, "w": 12, "h": 8 }
      },
      {
        "title": "Latency (p99)",
        "type": "graph",
        "targets": [
          { "expr": "histogram_quantile(0.99, http_request_duration_bucket)" }
        ],
        "grid": { "x": 0, "y": 8, "w": 12, "h": 8 }
      },
      {
        "title": "Orders",
        "type": "stat",
        "targets": [
          { "expr": "increase(orders_total[24h])" }
        ],
        "grid": { "x": 12, "y": 8, "w": 6, "h": 4 }
      },
      {
        "title": "Active Connections",
        "type": "stat",
        "targets": [
          { "expr": "active_connections" }
        ],
        "grid": { "x": 18, "y": 8, "w": 6, "h": 4 }
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          { "expr": "container_memory_usage_bytes" }
        ],
        "grid": { "x": 0, "y": 16, "w": 12, "h": 8 }
      },
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          { "expr": "rate(container_cpu_usage_seconds_total[5m])" }
        ],
        "grid": { "x": 12, "y": 16, "w": 12, "h": 8 }
      }
    ]
  }
}
```

### Key Metrics to Track

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| error_rate | % of 5xx responses | > 5% |
| p99_latency | 99th percentile response time | > 2s |
| request_rate | Requests per second | < 1 or > 1000 |
| orders_total | Total orders processed | sudden drop |
| webhook_failures | Failed webhook processing | > 10/min |
| db_connections | Active DB connections | > 80% of max |
| redis_memory | Redis memory usage | > 80% |
| container_restarts | Container restart count | > 3 |

---

## Incident Response

### Mini Runbook

```markdown
## Incidente: Backend Down

1. **Detectar** (30s)
   - Healthchecks.io alerta
   - Uptime Kuma alerta
   - Usuario reporta en Discord

2. **Evaluar** (2min)
   - Check: docker ps -a | grep backend
   - Check: docker logs tinkuy-backend --tail=50
   - Check: docker stats

3. **Mitigar** (5min)
   ```bash
   # Restart container
   docker restart tinkuy-backend

   # If that fails, rebuild
   docker-compose -f docker-compose.production.yml up -d --force-recreate backend

   # Check logs
   docker logs -f tinkuy-backend
   ```

4. **Resolver**
   - Verify /health returns 200
   - Verify /metrics shows data
   - Notify in #incidents channel

5. **Post-mortem**
   - Document root cause
   - Add monitoring if gap found
   - Update runbook if needed

---

## Incidente: Alta Latencia

1. **Detectar**
   - Grafana p99 > 2s
   - Users complaining

2. **Evaluar**
   - Check DB query times
   - Check Redis latency
   - Check external dependencies (MercadoPago)

3. **Mitigar**
   ```bash
   # Check slow queries
   docker exec tinkuy-postgres psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 seconds';"

   # Check Redis
   docker exec tinkuy-redis redis-cli info stats | grep -E "cmd|latency"

   # Scale if needed
   docker-compose -f docker-compose.production.yml up -d --scale backend=2
   ```

---

## Incidente: Webhook MercadoPago Fallando

1. **Detectar**
   - Sentry alerta de errores en webhook
   - Orders no se crean

2. **Evaluar**
   - Check MP dashboard for webhook delivery
   - Check logs for signature errors

3. **Mitigar**
   ```bash
   # Check webhook logs
   docker logs tinkuy-backend | grep -i webhook

   # Verify MP webhook secret
   grep MP_WEBHOOK_SECRET /opt/tinkuy/backend.env

   # Replay webhook from MP dashboard if needed
   ```

4. **Resolver**
   - Manually reconcile payments if needed
   - Verify orders created correctly
```

---

## Monitoring Stack

```
┌─────────────────────────────────────────────────────────┐
│                    MONITORING STACK                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │  Prometheus  │───▶│   Grafana    │    │  Alert    │ │
│  │  (Metrics)   │    │  (Dashboard) │    │  Manager  │ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│         │                                       │       │
│         ▼                                       ▼       │
│  ┌──────────────┐                      ┌─────────────┐ │
│  │  exporters   │                      │  Discord/   │ │
│  │  (node,     │                      │  Slack/     │ │
│  │   docker)   │                      │  Email      │ │
│  └──────────────┘                      └─────────────┘ │
│         │                                       │       │
│         ▼                                       ▼       │
│  ┌──────────────────────────────────────────────────┐ │
│  │              SERVICES                            │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐           │ │
│  │  │Frontend │  │ Backend │  │  Redis  │           │ │
│  │  └─────────┘  └─────────┘  └─────────┘           │ │
│  └──────────────────────────────────────────────────┘ │
│                        │                               │
│                        ▼                               │
│              ┌─────────────────┐                      │
│              │  Healthchecks   │                      │
│              │     .io         │                      │
│              │  (Uptime)       │                      │
│              └─────────────────┘                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Useful Commands

```bash
# View real-time logs
docker logs -f tinkuy-backend --tail=100 --since=5m

# Check resource usage
docker stats --no-stream

# Check health
curl -s http://localhost:4000/health | jq
curl -s http://localhost:3000/health | jq

# Check metrics
curl -s http://localhost:4000/metrics | head -50

# Check database connections
docker exec tinkuy-postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check Redis info
docker exec tinkuy-redis redis-cli info | grep -E "used_memory_human|connected_clients"

# Tail error logs
tail -f /var/log/tinkuy/error.log

# Check container restart history
docker inspect tinkuy-backend | jq '.[0].State.RestartCount'
```
