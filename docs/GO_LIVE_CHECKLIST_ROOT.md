# ===========================================
# Tinkuy - Go-Live Validation Checklist
# ===========================================

## Tabla de Contenidos

1. [Pre-Deploy](#pre-deploy)
2. [Deploy](#deploy)
3. [Post-Deploy](#post-deploy)
4. [Monitoreo](#monitoreo)
5. [Incident Response](#incident-response)
6. [Rollback](#rollback)
7. [Primeras 24hs](#primeras-24hs)
8. [Primera Semana](#primera-semana)

---

## PRE-DEPLOY

### 1. Code Freeze

```bash
# Fecha y hora de code freeze: _______________
# Freeze hasta: _______________

# Verificar que no haya PRs pendientes
gh pr list --state open --base main

# Verificar que tests pasen
npm test
```

### 2. Variables de Entorno

```bash
# Frontend (.env.production)
[ ] NEXT_PUBLIC_SITE_URL=https://tinkuy.com.ar
[ ] NEXT_PUBLIC_GRAPHQL_URL=https://api.tinkuy.com.ar/graphql
[ ] NEXT_PUBLIC_GA4_ID configurado
[ ] NEXT_PUBLIC_FB_PIXEL_ID configurado
[ ] NEXT_PUBLIC_CLARITY_ID configurado
[ ] SENTRY_DSN configurado

# Backend (.env.production)
[ ] DATABASE_URL configurado (Supabase)
[ ] REDIS_URL configurado
[ ] JWT_ADMIN_SECRET (32+ chars)
[ ] JWT_CUSTOMER_SECRET (32+ chars)
[ ] MP_ACCESS_TOKEN (producción, no TEST-)
[ ] MP_WEBHOOK_SECRET configurado
[ ] RESEND_API_KEY configurado
[ ] FRONTEND_URL=https://tinkuy.com.ar
[ ] SENTRY_DSN configurado
```

### 3. Docker Images

```bash
# Build local para verificar
cd tinkuy && docker build -t tinkuy-frontend:test .
cd ../back-tinkuy-saludable && docker build -t tinkuy-backend:test .

# Verificar que no haya errores de build
```

### 4. Base de Datos

```bash
# Verificar migraciones pendientes
npx prisma migrate status

# Si hay migraciones pendientes:
npx prisma migrate deploy

# Verificar seed data si es necesario
npx prisma db seed
```

### 5. SSL Certificate

```bash
# Verificar que el dominio apunte correctamente
dig tinkuy.com.ar
dig api.tinkuy.com.ar

# Verificar certificados (después del deploy)
curl -I https://tinkuy.com.ar
curl -I https://api.tinkuy.com.ar
```

### 6. Webhook MercadoPago

```bash
# Verificar que las URLs estén configuradas en MP Dashboard:
# https://www.mercadopago.com.ar/settings/webhooks

# URLs necesarias:
# Production: https://api.tinkuy.com.ar/webhooks/mercadopago
```

### 7. Backup Verificado

```bash
# Ejecutar backup manual
./scripts/backup.sh

# Verificar que el backup se creó
ls -lh /backups/db/

# Verificar que Restore funciona (en staging si hay)
```

---

## DEPLOY

### 1. Pre-Deploy Backup

```bash
# Crear backup completo antes de deploy
./scripts/backup-before-deploy.sh

#输出:
# Backup: /opt/tinkuy/backups/db/db_backup_20240115_030000.dump.gz
# Redis: /opt/tinkuy/backups/redis/redis_backup_20240115_030000.aof.gz
```

### 2. Deploy Backend

```bash
# Opción A: Via Dokploy UI
# 1. Ir a Dokploy Dashboard
# 2. Seleccionar proyecto backend
# 3. Click "Deploy"
# 4. Seleccionar branch: main
# 5. Click "Deploy Now"

# Opción B: Via GitHub Actions
git push origin main
# Automáticamente trigger el workflow de deploy

# Opción C: Via CLI
curl -X POST "$DOKPLOY_WEBHOOK_BACKEND" \
  -H "Content-Type: application/json" \
  -d '{"ref": "main", "sha": "'$(git rev-parse HEAD)'"}'
```

### 3. Deploy Frontend

```bash
# Esperar 2 minutos después de backend
# Luego deployar frontend

curl -X POST "$DOKPLOY_WEBHOOK_FRONTEND" \
  -H "Content-Type: application/json" \
  -d '{"ref": "main", "sha": "'$(git rev-parse HEAD)'"}'
```

### 4. Verificar Containers

```bash
# En el servidor
ssh root@server

# Ver estado de containers
docker ps

# Ver logs de backend
docker logs -f tinkuy-backend --tail=100

# Ver logs de frontend
docker logs -f tinkuy-frontend --tail=100
```

---

## POST-DEPLOY

### 1. Health Checks

```bash
# Frontend
curl -f -s http://localhost:3000/health
# Esperado: {"status":"ok","timestamp":"..."}

curl -f -s https://tinkuy.com.ar/health

# Backend
curl -f -s http://localhost:4000/health
# Esperado: {"status":"ok","database":"connected","redis":"connected",...}

curl -f -s https://api.tinkuy.com.ar/health

# GraphQL
curl -f -s -X POST https://api.tinkuy.com.ar/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

### 2. SSL Verification

```bash
# Verificar certificados
echo | openssl s_client -connect tinkuy.com.ar:443 -servername tinkuy.com.ar 2>/dev/null | openssl x509 -noout -dates

# Verificar HSTS
curl -I https://tinkuy.com.ar 2>/dev/null | grep -i strict-transport

# Verificar CSP headers
curl -I https://tinkuy.com.ar 2>/dev/null | grep -i content-security-policy
```

### 3. Authentication Test

```bash
# Test login
curl -X POST https://api.tinkuy.com.ar/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(email: \"test@test.com\", password: \"Test123!\") { token } }"}'

# Verificar que cookie se establece
curl -v -X POST https://api.tinkuy.com.ar/graphql ... 2>&1 | grep set-cookie
```

### 4. GraphQL Tests

```bash
# Test productos
curl -X POST https://api.tinkuy.com.ar/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ products(take: 10) { id name basePrice } }"}'

# Test categorías
curl -X POST https://api.tinkuy.com.ar/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ categories { id name slug } }"}'

# Test crear orden (test mode)
curl -X POST https://api.tinkuy.com.ar/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createCheckout(input: {...}) { id preferenceId } }"}'
```

### 5. Payment Flow Test

```bash
# Test MercadoPago en sandbox
# 1. Ir a tinkuy.com.ar
# 2. Agregar producto al carrito
# 3. Proceder al checkout
# 4. Seleccionar pago con MercadoPago
# 5. Verificar que redirect funciona

# Test con tarjeta sandbox de MP
# Tarjeta: 5031 7557 3453 0604
# Vencimiento: 11/25
# CVV: 123
```

### 6. Email Test

```bash
# Verificar que emails se envían
# 1. Registrarse como nuevo usuario
# 2. Verificar inbox

# Ver logs de email
docker logs tinkuy-backend | grep -i email
docker logs tinkuy-backend | grep -i sent
```

### 7. Sentry Verification

```bash
# 1. Ir a https://sentry.io
# 2. Verificar que errors están llegando
# 3. Verificar que performance está trackeando
# 4. Verificar releases

# Forzar un error de prueba
curl -X POST https://api.tinkuy.com.ar/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ thisFieldDoesNotExist }"}'
```

---

## MONITOREO

### 1. Uptime Checks

```bash
# Verificar que healthchecks están verdes
# https://healthchecks.io/projects/.../checks/

# Checks activos:
# ✓ Tinkuy Frontend /health
# ✓ Tinkuy Backend /health
# ✓ Tinkuy GraphQL /graphql
```

### 2. Resource Usage

```bash
# Verificar uso de recursos
docker stats --no-stream

# Output esperado:
# CONTAINER           CPU %   MEM USAGE / LIMIT
# tinkuy-frontend     5.23%   450MiB / 2GiB
# tinkuy-backend      12.45%  380MiB / 2GiB
# tinkuy-redis        1.23%   45MiB / 512MiB
```

### 3. Database Connections

```bash
# Verificar conexiones
docker exec tinkuy-postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Máximo recomendado: 80% de max_connections
docker exec tinkuy-postgres psql -U postgres -c "SHOW max_connections;"
```

### 4. Redis Memory

```bash
# Verificar uso de memoria
docker exec tinkuy-redis redis-cli info memory | grep used_memory_human

# Verificar keys
docker exec tinkuy-redis redis-cli dbsize
```

---

## INCIDENT RESPONSE

### Si algo falla:

```bash
# 1. Identificar el problema
docker logs tinkuy-backend --tail=200
docker logs tinkuy-frontend --tail=200
docker stats

# 2. Si es urgente, hacer rollback
./scripts/rollback-strategy.sh quick-rollback backend previous

# 3. Notificar
# - Discord: #incidents
# - Actualizar status page

# 4. Investigar
# - Revisar logs
# - Revisar Sentry
# - Revisar healthchecks

# 5. Resolver
# - Fix si es rápido
# - O rollback definitivo

# 6. Post-mortem
# - Documentar
# - Actualizar runbook
```

---

## ROLLBACK

### Quick Rollback (30 segundos)

```bash
# En el servidor
ssh root@server

# Rollback backend
./rollback.sh backend previous

# Rollback frontend
./rollback.sh frontend previous

# Verificar
curl http://localhost:4000/health
curl http://localhost:3000/health
```

### Full Rollback (5 minutos)

```bash
# Rollback completo del sistema
./full-rollback.sh previous

# Verificar todo
curl https://api.tinkuy.com.ar/health
curl https://tinkuy.com.ar/health
```

### Database Rollback

```bash
# ⚠️ SOLO si es necesario
# Puede causar pérdida de datos

# Listar backups disponibles
ls -lh /opt/tinkuy/backups/db/

# Ejecutar rollback
./rollback-database.sh db_backup_20240115_030000.dump.gz

# Verificar
docker exec tinkuy-postgres psql -U postgres -c "SELECT count(*) FROM orders;"
```

---

## PRIMERAS 24HS

### Minuto 0-5
- [ ] Healthchecks todos verdes
- [ ] SSL verificado
- [ ] Login funciona
- [ ] Carrito funciona

### Minuto 5-15
- [ ] Checkout completo funciona
- [ ] MercadoPago redirect funciona
- [ ] Email de confirmación llega

### Minuto 15-60
- [ ] Primera orden procesada correctamente
- [ ] No hay errores en Sentry
- [ ] Logs sin errores nuevos
- [ ] Performance aceptable (<2s TTFB)

### Hora 1-6
- [ ] Monitorear error rate < 1%
- [ ] Monitorear latency p99 < 3s
- [ ] Primeras órdenes reales procesadas

### Hora 6-24
- [ ] Backup automático ejecutado
- [ ] Sin memory leaks
- [ ] Sin conexiones DB acumuladas
- [ ] Redis estable

---

## PRIMERA SEMANA

### Día 1-2
- [ ] Monitorear cada hora
- [ ] Verificar healthchecks cada 6 horas
- [ ] Revisar Sentry errores
- [ ] Verificar logs

### Día 3-5
- [ ] Primera revisión de performance
- [ ] Verificar que backup funciona
- [ ] Test de rollback
- [ ] Actualizar monitoring si hay gaps

### Día 6-7
- [ ] Análisis de métricas
- [ ] Optimizaciones si necesarias
- [ ] Revisión de security logs
- [ ] Documentar lecciones aprendidas

### Checklist Semanal

```bash
# Verificaciones semanales:
docker stats                           # Recursos OK?
docker logs --since=24h | grep -i error | wc -l  # Errores < 10?
curl -s http://localhost:4000/health  # Backend healthy?
curl -s http://localhost:3000/health  # Frontend healthy?
ls -lh /opt/tinkuy/backups/db/        # Backups existen?
docker exec tinkuy-redis redis-cli dbsize  # Keys < 10000?
```

---

## COMANDOS ÚTILES

```bash
# ===========================================
# COMANDOS DE VERIFICACIÓN
# ===========================================

# Health checks
curl -f -s https://tinkuy.com.ar/health && echo "✓ Frontend OK"
curl -f -s https://api.tinkuy.com.ar/health && echo "✓ Backend OK"

# SSL check
curl -I https://tinkuy.com.ar 2>/dev/null | grep -E "HTTP|Strict-Transport"

# GraphQL introspection (debe dar error en producción)
curl -X POST https://api.tinkuy.com.ar/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' | grep error && echo "✓ Introspection blocked" || echo "✗ Introspection enabled!"

# Rate limiting test
for i in {1..110}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4000/graphql; done | sort | uniq -c

# Database check
docker exec tinkuy-postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('tinkuy'));"

# Redis check
docker exec tinkuy-redis redis-cli info | grep -E "used_memory_human|connected_clients|total_commands_processed"

# Container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Recent errors
docker logs --since 1h tinkuy-backend 2>&1 | grep -iE "error|warn|fatal" | tail -20

# Quick performance test
time curl -s -o /dev/null https://api.tinkuy.com.ar/graphql \
  -X POST -H "Content-Type: application/json" \
  -d '{"query":"{ products(take: 10) { id name } }"}'
```

---

## SIGN-OFF

```markdown
## Go-Live Approval

### Deploy completado por: _______________ @ ___________
### Fecha/Hora: _______________

### Verificación Firmada:

- [ ] Health checks funcionando
- [ ] SSL certificado activo
- [ ] Login/Auth funcionando
- [ ] Carrito funcional
- [ ] Checkout con MercadoPago funcional
- [ ] Emails enviando
- [ ] Sentry recibiendo errores
- [ ] Backups configurados
- [ ] Monitoreo activo

### Comentarios:

_______________________________________________

### Aprobado para producción:
☐ YES - LISTO
☐ NO - BLOQUEANTES RESTANTES: _______________
```

---

**Document Version:** 1.0
**Fecha última actualización:** $(date)
**Próxima revisión:** Después de go-live
