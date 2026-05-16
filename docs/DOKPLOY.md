# Despliegue en Dokploy

## Repositorio 1: `back-tinkuy-saludable` (Backend)

### Configuración en Dokploy:

1. **Nuevo Proyecto** → Nombre: `tinkuy-backend`
2. **Deploy desde**: GitHub → Repositorio: `FacuPedrazzoli/Back-Tinkuy-Saludable`
3. **Branch**: `main`
4. **Tipo de Build**: `Docker`
5. **Puerto Expuesto**: `4000`

### Variables de Entorno (en Dokploy):

```env
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/tinkuy

# Redis
REDIS_URL=redis://HOST:6379

# JWT (generar con: openssl rand -hex 64)
JWT_SECRET=tu-jwt-secret-aqui-64-chars-minimo
JWT_REFRESH_SECRET=tu-refresh-secret-aqui-64-chars-minimo

# Admin
ADMIN_PASSWORD=TuPasswordAdminSeguro123!

# MercadoPago PRODUCCION
MP_ACCESS_TOKEN=APP_USR-xxxx
MP_PUBLIC_KEY=APP_USR-xxxx
MP_WEBHOOK_SECRET=xxxx
MP_NOTIFICATION_URL=https://tinkuy.com.ar/api/webhooks/mercadopago

# Email
RESEND_API_KEY=re_xxxx
EMAIL_FROM=hola@tinkuy.com.ar
EMAIL_FROM_NAME=Tinkuy

# Frontend
FRONTEND_URL=https://tinkuy.com.ar
CORS_ORIGIN=https://tinkuy.com.ar

# Rate Limiting
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX_REQUESTS=5
RATE_LIMIT_REGISTER_WINDOW_MS=3600000
RATE_LIMIT_REGISTER_MAX_REQUESTS=3

# Opcional
SENTRY_DSN=https://xxxx@sentry.io/xxxx
```

### Comandos:
- **Build**: `docker build -t tinkuy-backend .`
- **Start**: `docker-compose up -d`
- **Stop**: `docker-compose down`

---

## Repositorio 2: `tinkuy` (Frontend)

### Configuración en Dokploy:

1. **Nuevo Proyecto** → Nombre: `tinkuy-frontend`
2. **Deploy desde**: GitHub → Repositorio: `FacuPedrazzoli/Tinkuy-saludable`
3. **Branch**: `master`
4. **Tipo de Build**: `Docker`
5. **Puerto Expuesto**: `3000`

### Variables de Entorno (en Dokploy):

```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000

# GraphQL Backend URL
NEXT_PUBLIC_GRAPHQL_URL=https://api.tu-dominio.com/graphql

# Analytics
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXX
NEXT_PUBLIC_CLARITY_ID=xxxxxxxxxx

# MercadoPago
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxxx

# Opcional
SENTRY_DSN=https://xxxx@sentry.io/xxxx
NEXTAUTH_SECRET=tu-secret-aqui
NEXTAUTH_URL=https://tinkuy.com.ar
```

### Comandos:
- **Build**: `docker build -t tinkuy-frontend .`
- **Start**: `docker-compose up -d`
- **Stop**: `docker-compose down`

---

## Dominios (configurar en Dokploy):

| Servicio | Dominio | Tipo |
|----------|---------|------|
| Backend | `api.tinkuy.com.ar` | Backend API |
| Frontend | `tinkuy.com.ar` | Frontend Web |

---

## SSL / HTTPS:

### Opción 1: SSL de Dokploy (recomendado)
Dokploy puede gestionar SSL automáticamente con Let's Encrypt.
Solo activá "Enable SSL" y poné el dominio.

### Opción 2: Manual con nginx
1. Generar certificado:
```bash
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=tinkuy.com.ar"
```

2. Poner los archivos en `certs/`

3. En producción, usar Let's Encrypt:
```bash
certbot --nginx -d api.tinkuy.com.ar -d tinkuy.com.ar
```

---

## Verificación Post-Deploy:

```bash
# Backend health
curl https://api.tinkuy.com.ar/health

# GraphQL
curl -X POST https://api.tinkuy.com.ar/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'

# Frontend
curl https://tinkuy.com.ar
```

---

## Base de Datos (DB Externa):

Si usás una DB externa (Supabase, Railway, etc.):

1. La variable `DATABASE_URL` en el backend debe apuntar a tu DB externa:
```
DATABASE_URL=postgresql://user:pass@host:5432/tinkuy
```

2. No necesitas el servicio `postgres` en docker-compose.yml en ese caso.

3. Ejecutar migraciones:
```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
```

---

## Redis (DB Externa):

Si usás Redis externo (Upstash, Redis Cloud, etc.):

```
REDIS_URL=redis://default:password@host:6379
```

En ese caso, podés remover el servicio `redis` del docker-compose.yml.
