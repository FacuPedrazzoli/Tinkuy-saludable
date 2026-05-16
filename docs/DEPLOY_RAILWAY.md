# Deploy en Railway - Tinkuy

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Vercel        │────▶│   Railway       │────▶│   Supabase      │
│   (Frontend)    │     │   (Backend)     │     │   (PostgreSQL)  │
│   Next.js 14   │     │   Node+GraphQL  │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
   Cloudflare              Upstash Redis
   (CDN + DNS)             (Cache + Sessions)
```

## Frontend (Vercel - Recomendado)

### Paso 1: Conectar repo en Vercel

1. Ir a [vercel.com](https://vercel.com)
2. New Project → Import from GitHub
3. Seleccionar repositorio `tinkuy`
4. Framework: Next.js
5. Root directory: `tinkuy`

### Paso 2: Environment Variables

```bash
NEXT_PUBLIC_GRAPHQL_URL=https://api.tinkuy.railway.app/graphql
NEXT_PUBLIC_SITE_URL=https://tinkuy.com.ar
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxx
```

### Paso 3: Dominio personalizado

1. Settings → Domains → Agregar `tinkuy.com.ar`
2. En tu registrador DNS configurar:
   - A record `@` → Vercel IP (ver en Settings → Domains)
   - CNAME `www` → `cname.vercel-dns.com`

## Backend (Railway)

### Paso 1: Crear proyecto

1. Ir a [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Seleccionar repositorio `Back-Tinkuy-Saludable`
4. Root directory: `Back-Tinkuy-Saludable`

### Paso 2: Agregar plugins

1. PostgreSQL (o usar Supabase existente)
2. Redis (opcional, o usar Upstash)

### Paso 3: Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/tinkuy

# Redis
REDIS_URL=redis://redis:6379
# O si usas Upstash:
# UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
# UPSTASH_REDIS_REST_TOKEN=xxx

# Auth
JWT_ADMIN_SECRET=generar-32-caracteres-minimo
JWT_CUSTOMER_SECRET=generar-32-caracteres-minimo

# MercadoPago
MP_ACCESS_TOKEN=TEST-xxx
MP_PUBLIC_KEY=APP_USR-xxx
MP_WEBHOOK_SECRET=whsec_xxx

# Frontend
FRONTEND_URL=https://tinkuy.com.ar

# Environment
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
```

### Paso 4: Start command

```bash
npm run start
```

### Paso 5: Health check

- Path: `/health`
- Interval: 30s
- Timeout: 10s

### Paso 6: Networking

1. Settings → Networking → Generate Public Domain
2. Anotar la URL: `https://api.tinkuy.railway.app`
3. Usar esta URL en Vercel como `NEXT_PUBLIC_GRAPHQL_URL`

## Supabase (Base de datos externa)

### Paso 1: Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. New project
3. Esperar aprovisionamiento de PostgreSQL

### Paso 2: Obtener connection string

Settings → Connection Pooling → Connection String → URI

```bash
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Paso 3: Configurar en Railway

Copiar el URI en `DATABASE_URL` en Railway

### Paso 4: Ejecutar migraciones

```bash
# Desde tu maquina local
npx prisma migrate deploy

# O usar SQL en Supabase Dashboard
```

## Upstash Redis (Cache/Sessions)

### Paso 1: Crear cuenta

1. Ir a [upstash.com](https://upstash.com)
2. New Redis → Region cercana a Railway
3. Anotar REST URL y Token

### Paso 2: Configurar en Railway

```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

## Dominio personalizado (Opcional)

### Vercel (ya configurado arriba)

### Railway

Settings → Domains → Add Domain

```bash
# DNS en tu registrador
CNAME api.tinkuy.com.ar -> railway.app
```

## SSL

- Vercel: Automatico
- Railway: Automatico con Let's Encrypt
- Cloudflare: Full SSL/TLS

## Monitoreo

### Sentry

1. Crear proyecto en [sentry.io](https://sentry.io)
2. Agregar DSN en:
   - Frontend (Vercel): `NEXT_PUBLIC_SENTRY_DSN`
   - Backend (Railway): `SENTRY_DSN`

### Logs

- Railway: Built-in log viewer
- Vercel: Dashboard → Deployment → Logs

## Crontab para backups (opcional)

```bash
# En tu servidor de backups o una VM
0 2 * * * /app/scripts/backup.sh >> /var/log/backup.log 2>&1
```

## Troubleshooting

### Error: Connection refused backend

1. Verificar que Railway tenga el puerto correcto (4000)
2. Verificar `NEXT_PUBLIC_GRAPHQL_URL` en Vercel
3. Chequear health check en Railway

### Error: CORS

1. Verificar `FRONTEND_URL` en backend
2. Debe ser la URL exacta incluyendo https://

### Error: Database connection

1. Verificar `DATABASE_URL` formato correcto
2. Verificar IP whitelisting en Supabase (Settings → Networking)
3. Usar Connection Pooling URL de Supabase

### Error: Prisma migrations

```bash
# Forzar reset en desarrollo (CUIDADO!)
npx prisma migrate reset --force
```

## Scripts utiles

```bash
# Ver logs en Railway
railway logs -t

# Restart service
railway up

# Open shell
railway run sh
```
