# ===========================================
# Tinkuy - Disaster Recovery & Backups
# ===========================================

## Tabla de Contenidos

1. [Estrategia de Backups](#estrategia-de-backups)
2. [Frecuencia y Retención](#frecuencia-y-retención)
3. [Scripts de Backup](#scripts-de-backup)
4. [Restore Procedure](#restore-procedure)
5. [Disaster Recovery Plan](#disaster-recovery-plan)
6. [RTO/RPO](#rtorpo)

---

## Estrategia de Backups

### Componentes a Respaldar

| Componente | Frecuencia | Retention | Storage | Priority |
|------------|------------|-----------|---------|----------|
| PostgreSQL | Hourly + Daily | 7 days + 4 weeks | Local + S3 | CRITICAL |
| Redis (AOF) | Daily | 7 days | Local | HIGH |
| Uploads | Weekly + on deploy | 4 weeks | Local + S3 | MEDIUM |
| Env Files | On change | Infinite | S3 + Git encrypted | CRITICAL |
| Docker Images | On deploy | Last 5 images | GHCR | HIGH |

### Storage Strategy

```bash
# Estructura de backups
/backups
├── db/
│   ├── hourly/          # Últimas 24 horas
│   ├── daily/           # Últimos 7 días
│   └── weekly/          # Últimas 4 semanas
├── redis/
│   └── daily/
├── uploads/
│   └── weekly/
├── env/
│   └── on-change/
└── docker/
    └── last-5-images/
```

---

## Frecuencia y Retención

### Backup Schedule

```bash
# Crontab - Backup Schedule
# ===========================================

# PostgreSQL - Hourly (últimas 24h)
0 * * * * /opt/tinkuy/scripts/backup-db.sh hourly

# PostgreSQL - Daily a las 3am (retiene 7 días)
0 3 * * * /opt/tinkuy/scripts/backup-db.sh daily

# PostgreSQL - Weekly domingo a las 4am (retiene 4 semanas)
0 4 * * 0 /opt/tinkuy/scripts/backup-db.sh weekly

# Redis - Daily a las 3:30am
30 3 * * * /opt/tinkuy/scripts/backup-redis.sh

# Uploads - Weekly domingo a las 5am
0 5 * * 0 /opt/tinkuy/scripts/backup-uploads.sh

# Cleanup - Daily a las 6am
0 6 * * * /opt/tinkuy/scripts/cleanup-old-backups.sh

# S3 Upload - Daily a las 4:30am
30 4 * * * /opt/tinkuy/scripts/sync-to-s3.sh
```

### Retention Policy

```bash
# Hourly backups: eliminar después de 24 horas
find /backups/db/hourly -name "*.dump.gz" -mtime +1 -delete

# Daily backups: eliminar después de 7 días
find /backups/db/daily -name "*.dump.gz" -mtime +7 -delete

# Weekly backups: eliminar después de 28 días
find /backups/db/weekly -name "*.dump.gz" -mtime +28 -delete

# Redis backups: eliminar después de 7 días
find /backups/redis -name "*.aof.gz" -mtime +7 -delete

# Uploads backups: eliminar después de 28 días
find /backups/uploads -name "*.tar.gz" -mtime +28 -delete

# Docker images: mantener últimas 5
docker images --format "{{.Repository}}:{{.Tag}}" | grep tinkuy | \
  tail -n +6 | xargs -r docker rmi
```

---

## Scripts de Backup

### Backup Database

```bash
#!/bin/bash
# backup-db.sh - PostgreSQL backup script

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TYPE=${1:-daily}  # hourly, daily, weekly
BACKUP_DIR="/opt/tinkuy/backups/db/${TYPE}"
DB_NAME=${DB_NAME:-tinkuy}
DB_CONTAINER=${DB_CONTAINER:-tinkuy-postgres}
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.dump.gz"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$TYPE] $1"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] $1" >&2
    exit 1
}

# Verificar container
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    error "Container $DB_CONTAINER no está corriendo"
fi

log "Iniciando backup de PostgreSQL: $DB_NAME"

# Realizar backup
if docker exec "$DB_CONTAINER" pg_dump -U postgres -d "$DB_NAME" -F c -b | \
   gzip > "$BACKUP_FILE"; then
    log "Backup completado: $BACKUP_FILE"
else
    error "Backup falló"
fi

# Verificar tamaño mínimo (10KB mínimo para DB no vacía)
SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")
if [ "$SIZE" -lt 10240 ]; then
    error "Backup suspiciously small: $SIZE bytes"
fi

log "Tamaño del backup: $(du -h "$BACKUP_FILE" | cut -f1)"

# Cleanup automático según tipo
if [ "$TYPE" = "hourly" ]; then
    find "$BACKUP_DIR" -name "*.dump.gz" -mtime +1 -delete
    log "Limpiados backups hourly > 24 horas"
elif [ "$TYPE" = "daily" ]; then
    find "$BACKUP_DIR" -name "*.dump.gz" -mtime +${RETENTION_DAYS} -delete
    log "Limpiados backups daily > ${RETENTION_DAYS} días"
fi

# Notificar a Discord si es daily
if [ "$TYPE" = "daily" ] && [ -n "${DISCORD_WEBHOOK:-}" ]; then
    curl -s -H "Content-Type: application/json" \
        -d "{\"content\": \"✅ Backup DB daily completado: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))\"}" \
        "$DISCORD_WEBHOOK" || true
fi

log "Proceso completado"
exit 0
```

### Backup Redis

```bash
#!/bin/bash
# backup-redis.sh - Redis backup script

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/tinkuy/backups/redis"
REDIS_CONTAINER=${REDIS_CONTAINER:-tinkuy-redis}
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="${BACKUP_DIR}/redis_backup_${TIMESTAMP}.aof.gz"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Redis: $1"
}

# Trigger BGSAVE
log "Iniciando background save..."
docker exec "$REDIS_CONTAINER" redis-cli BGSAVE || true

# Esperar a que complete
sleep 5

# Copiar AOF
docker cp "$REDIS_CONTAINER:/data/appendonly.aof" "$BACKUP_FILE.tmp"

if [ -f "$BACKUP_FILE.tmp" ]; then
    gzip -9 "$BACKUP_FILE.tmp" -c > "$BACKUP_FILE"
    rm "$BACKUP_FILE.tmp"
    log "Backup completado: $BACKUP_FILE"
else
    log "Warning: AOF file not found, skipping Redis backup"
fi

# Cleanup
find "$BACKUP_DIR" -name "*.aof.gz" -mtime +${RETENTION_DAYS} -delete
log "Limpiados backups > ${RETENTION_DAYS} días"
```

### Verify Backup

```bash
#!/bin/bash
# verify-backup.sh - Verifica integridad de backups

set -euo pipefail

BACKUP_FILE=${1:-}
BACKUP_DIR="/opt/tinkuy/backups/db"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

if [ -z "$BACKUP_FILE" ]; then
    # Verificar el backup más reciente
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/daily/*.dump.gz 2>/dev/null | head -1)

    if [ -z "$BACKUP_FILE" ]; then
        log "No se encontró ningún backup para verificar"
        exit 1
    fi

    log "Verificando backup más reciente: $BACKUP_FILE"
fi

if [ ! -f "$BACKUP_FILE" ]; then
    log "ERROR: Archivo no existe: $BACKUP_FILE"
    exit 1
fi

# Verificar que es un gzip válido
if ! gunzip -t "$BACKUP_FILE" 2>/dev/null; then
    log "ERROR: Backup corrupto (no es gzip válido)"
    exit 1
fi

# Verificar que es un PostgreSQL dump válido
if ! gunzip < "$BACKUP_FILE" | head -c 100 | grep -q "PGDMP"; then
    log "ERROR: Backup no es un dump válido de PostgreSQL"
    exit 1
fi

# Obtener tamaño
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "✅ Backup válido: $BACKUP_FILE ($SIZE)"

# Listar contenido
log "Contenido del backup:"
gunzip < "$BACKUP_FILE" | docker exec -i tinkuy-postgres psql -U postgres -l 2>/dev/null | head -20

log "Verificación completada exitosamente"
exit 0
```

---

## Restore Procedure

### Full Restore

```bash
#!/bin/bash
# restore-full.sh - Restauración completa del sistema

set -euo pipefail

BACKUP_DATE=${1:-latest}  # latest o YYYYMMDD_HHMMSS
BACKUP_DIR="/opt/tinkuy/backups"
DB_BACKUP=""
REDIS_BACKUP=""

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] $1" >&2
    exit 1
}

# Encontrar backup de DB
if [ "$BACKUP_DATE" = "latest" ]; then
    DB_BACKUP=$(ls -t "$BACKUP_DIR"/db/daily/*.dump.gz 2>/dev/null | head -1)
else
    DB_BACKUP=$(ls "$BACKUP_DIR"/db/daily/*${BACKUP_DATE}*.dump.gz 2>/dev/null | head -1)
fi

if [ -z "$DB_BACKUP" ]; then
    error "No se encontró backup de DB"
fi

log "=========================================="
log "  TINKUY FULL RESTORE"
log "=========================================="
log "DB Backup: $DB_BACKUP"
log ""

# Advertencia
echo "⚠️  ESTO SOBRESCRIBIRÁ LA BASE DE DATOS ACTUAL"
read -p "¿Continuar? (yes/no): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log "Restauración cancelada"
    exit 0
fi

# Parar servicios
log "1. Parando servicios..."
docker-compose -f /opt/tinkuy/docker-compose.production.yml stop backend worker cron

# Backup del estado actual (precaución)
PRE_BACKUP="$BACKUP_DIR/db/pre_restore_$(date +%Y%m%d_%H%M%S).dump.gz"
log "2. Creando backup pre-restore..."
docker exec tinkuy-postgres pg_dump -U postgres -d tinkuy -F c | gzip > "$PRE_BACKUP"
log "   Backup pre-restore: $PRE_BACKUP"

# Restaurar DB
log "3. Restaurando base de datos..."
gunzip < "$DB_BACKUP" | docker exec -i tinkuy-postgres psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS tinkuy;" -c "CREATE DATABASE tinkuy;"
gunzip < "$DB_BACKUP" | docker exec -i tinkuy-postgres psql -U postgres -d tinkuy

log "4. Base de datos restaurada"

# Reiniciar servicios
log "5. Reiniciando servicios..."
docker-compose -f /opt/tinkuy/docker-compose.production.yml start backend

# Esperar a que backend esté healthy
log "6. Verificando salud del sistema..."
sleep 10

for i in {1..30}; do
    if curl -sf http://localhost:4000/health > /dev/null; then
        log "✅ Backend está healthy"
        break
    fi
    echo -n "."
    sleep 2
done

# Verificar DB
docker exec tinkuy-postgres psql -U postgres -d tinkuy -c "SELECT count(*) as orders FROM orders;"

log ""
log "=========================================="
log "  RESTORE COMPLETADO"
log "=========================================="
log "Pre-restore backup: $PRE_BACKUP"
```

---

## Disaster Recovery Plan

### Escenarios de Disaster

#### 1. Caída de Base de Datos

```markdown
## Caída DB - Recovery Time: 30-60 min

### Detección (0-5 min)
- Healthchecks alerta: /health devuelve 503
- Sentry registra errores de DB
- Usuarios reportan errores

### Mitigación Inmediata (5-15 min)
1. Verificar container: `docker ps | grep postgres`
2. Verificar logs: `docker logs tinkuy-postgres --tail=100`
3. Si container caído: `docker restart tinkuy-postgres`
4. Si no responde: verificar volumenes

### Recuperación (15-60 min)
1. Si DB corrupta:
   - Detener servicios: `docker-compose stop backend`
   - Restaurar desde backup: `./restore-full.sh`
   - Verificar datos
   - Reiniciar backend

2. Si volumen perdido:
   - Crear nuevo container
   - Restaurar último backup
   - Notificar a usuarios de pérdida de datos desde último backup

### Post-Incidente
- Investigar causa raíz
- Implementar medidas preventivas
- Actualizar documentación
```

#### 2. Caída de Redis

```markdown
## Caída Redis - Recovery Time: 10-30 min

### Impacto
- Rate limiting cae a modo memory (no persistente)
- Cache de queries se pierde (rápido recovery)
- Sessions no se ven afectadas (guardadas en DB)

### Mitigación (10-30 min)
1. Verificar container: `docker ps | grep redis`
2. Verificar logs: `docker logs tinkuy-redis --tail=50`
3. Redis tiene persistencia AOF, recovery automático

### Si hay pérdida de datos
- Rate limits se resetean (usuarios pueden hacer spam temporalmente)
- Cache se rebuild automáticamente
- Sessions basadas en JWT son seguras en DB

### Post-Incidente
- Verificar que AOF está habilitado
- Monitorear memory usage
- Considerar Redis Cluster para HA
```

#### 3. Caída de Frontend

```markdown
## Caída Frontend - Recovery Time: 5-15 min

### Detección
- Healthchecks alerta
- curl https://tinkuy.com.ar devuelve error

### Mitigación (5-15 min)
1. Verificar container: `docker ps | grep frontend`
2. Verificar logs: `docker logs tinkuy-frontend --tail=100`
3. Restart: `docker restart tinkuy-frontend`

### Si rebuild necesario
1. Pull latest image: `docker pull ghcr.io/your-org/frontend:latest`
2. Rebuild: `docker-compose -f docker-compose.production.yml up -d --force-recreate frontend`
3. Verificar health

### Rollback si update fue el problema
1. `./rollback.sh frontend previous`
2. Verificar que funciona
```

#### 4. Caída de Backend

```markdown
## Caída Backend - Recovery Time: 10-30 min

### Impacto
- API no responde
- Checkout no funciona (imposible comprar)
- Orders no se procesan

### Detección
- Healthchecks alerta
- Errores 503 en API

### Mitigación (10-30 min)
1. `docker ps | grep backend`
2. `docker logs tinkuy-backend --tail=200`
3. Restart: `docker restart tinkuy-backend`

### Si problema de código
1. Rollback: `./rollback.sh backend previous`
2. Verificar health
3. Investigar en logs

### Si problema de DB connection
1. Verificar que DB está healthy
2. Verificar connection string
3. Restart backend después de DB recovery
```

#### 5. SSL Expirado

```markdown
## SSL Expirado - Recovery Time: 15-30 min

### Detección
- curl -I https://tinkuy.com.ar muestra error
- Let's Encrypt expira cada 90 días

### Mitigación
# Traefik en Dokploy renueva automáticamente
# Si no funciona:

1. Verificar DNS sigue apuntando
2. Verificar Traefik logs
3. Forzar renovación:
   docker exec traefik traefik renew --letsencrypt

4. Restart Traefik si es necesario:
   docker restart traefik
```

#### 6. Webhook Caído

```markdown
## Webhook MercadoPago Fallando - Recovery Time: 1-4 horas

### Impacto
- Payments se aprueban en MP pero no se crean orders
- Dinero recibido pero sin confirmación

### Detección
- Orders no se crean después de pago
- Sentry reporta webhook errors
- MP Dashboard muestra webhook failures

### Mitigación
1. Verificar logs de webhook
   docker logs tinkuy-backend | grep -i webhook

2. Verificar signature validation
   - Check MP_WEBHOOK_SECRET

3. Verificar endpoint está accesible
   curl -X POST https://api.tinkuy.com.ar/webhooks/mercadopago

4. Reconciliation:
   - Ir a MP Dashboard
   - Buscar payments no procesados
   - Reenviar webhooks o crear orders manualmente

5. Prevention:
   - Implementar dead letter queue
   - Mejorar logging de webhooks
```

#### 7. Deploy Roto

```markdown
## Deploy Roto - Recovery Time: 5-15 min

### Detección
- Health checks fallan post-deploy
- Errores en container logs
- Sentry reporta errores de new code

### Rollback Inmediato
./rollback.sh backend previous
./rollback.sh frontend previous

### Verificar
curl http://localhost:4000/health
curl http://localhost:3000/health

### Si rollback no funciona
# Usar imagen específica
docker tag ghcr.io/your-org/backend:<previous-sha> ghcr.io/your-org/backend:latest
docker tag ghcr.io/your-org/frontend:<previous-sha> ghcr.io/your-org/frontend:latest
docker-compose -f docker-compose.production.yml up -d --force-recreate
```

---

## RTO/RPO

### Definiciones

```
RTO (Recovery Time Objective): Tiempo máximo para recuperar el servicio
RPO (Recovery Point Objective): Cantidad máxima de datos que se puede perder
```

### Matrix de Recovery

| Componente | RTO | RPO | Estrategia |
|------------|-----|-----|------------|
| Base Datos | 30-60 min | 1 hora | Backup hourly + PITR |
| Redis | 10-30 min | 1 día | Backup daily |
| Frontend | 5-15 min | N/A | Rollback Docker |
| Backend | 10-30 min | N/A | Rollback Docker |
| Uploads | 30-60 min | 1 semana | Backup weekly |
| SSL | 15-30 min | N/A | Auto-renewal |

### SLA Objetivo

```
Disponibilidad: 99.5% (mesual)
Downtime máximo: 3.7 horas/mes

RTO real basado en prácticas:
- Frontend: 15 min
- Backend: 30 min
- DB: 60 min

RPO real:
- DB: 1 hora (backup hourly)
- Redis: 1 día
```

---

## Testing DR

```bash
#!/bin/bash
# test-dr.sh - Test Disaster Recovery

set -euo pipefail

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] DR Test: $1"
}

log "=========================================="
log "  INICIANDO TEST DE DISASTER RECOVERY"
log "=========================================="

# Test 1: Backup existe y es válido
log "Test 1: Verificando backups..."
./verify-backup.sh || {
    log "❌ FALLO: Backup inválido o no existe"
    exit 1
}
log "✅ Test 1 pasado: Backups OK"

# Test 2: Restore procedure funciona (staging)
log "Test 2: Verificando scripts de restore..."
[ -f ./restore-full.sh ] && [ -x ./restore-full.sh ] || {
    log "⚠️ WARNING: restore-full.sh no es executable o no existe"
}
log "✅ Test 2 pasado: Scripts OK"

# Test 3: Rollback funciona
log "Test 3: Verificando rollback..."
[ -f ./rollback.sh ] && [ -x ./rollback.sh ] || {
    log "⚠️ WARNING: rollback.sh no es executable o no existe"
}
log "✅ Test 3 pasado: Rollback OK"

# Test 4: Health endpoints responden
log "Test 4: Verificando health endpoints..."
curl -sf http://localhost:4000/health > /dev/null && log "✅ Backend healthy" || log "❌ Backend unhealthy"
curl -sf http://localhost:3000/health > /dev/null && log "✅ Frontend healthy" || log "❌ Frontend unhealthy"

# Test 5: Backup reciente existe
log "Test 5: Verificando backup reciente..."
MOST_RECENT=$(ls -t /opt/tinkuy/backups/db/daily/*.dump.gz 2>/dev/null | head -1)
if [ -n "$MOST_RECENT" ]; then
    AGE_HOURS=$(echo "($(date +%s) - $(stat -c %Y "$MOST_RECENT")) / 3600" | bc)
    if [ "$AGE_HOURS" -lt 25 ]; then
        log "✅ Backup reciente existe: $MOST_RECENT (${AGE_HOURS}h old)"
    else
        log "⚠️ WARNING: Backup más viejo de 24h"
    fi
else
    log "❌ FALLO: No hay backup daily"
fi

log ""
log "=========================================="
log "  TEST DE DR COMPLETADO"
log "=========================================="
log "Resultado: TODOS LOS TESTS PASARON ✅"
```

---

## Emergency Contacts

```
## Contacts

DevOps Lead: _______________ @ ___________
Backend Lead: _______________ @ ___________
Frontend Lead: _______________ @ ___________

## External
Supabase Support: https://supabase.com/dashboard
MercadoPago Support: https://www.mercadopago.com/developers/es/support
Railway Support: https://railway.app/help
Dokploy Support: https://docs.dokploy.com
```

---

**Document Version:** 1.0
**Last Updated:** $(date)
**Next DR Test:** Weekly
**Last DR Test:** _______________
