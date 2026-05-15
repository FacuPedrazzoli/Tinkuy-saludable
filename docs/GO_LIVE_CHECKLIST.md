# Go-Live Checklist — Tinkuy

## 1. Testing en Sandbox (Pre-Producción)

### MercadoPago Sandbox
- [ ] Compra sandbox completa → email de confirmación llega
- [ ] Pago rechazado → stock se libera correctamente
- [ ] Pago pendiente → instrucciones claras mostradas al usuario
- [ ] Webhook sandbox recibido y procesado

### Backend
- [ ] `/health` responde 200 con `status: "ok"`
- [ ] Database: `"database": "connected"`
- [ ] Redis: `"redis": "connected"`
- [ ] GraphQL responde correctamente

### Frontend
- [ ] Homepage carga sin errores
- [ ] Carrito funciona (agregar, quitar, actualizar)
- [ ] Checkout completa flujo sandbox
- [ ] Emails transactional (verificar spam también)

---

## 2. Switch a Producción

### Variables de Entorno — Backend
- [ ] `MP_ACCESS_TOKEN` = token de producción MercadoPago
- [ ] `MP_WEBHOOK_SECRET` = secret de producción
- [ ] `MP_MODE=production`
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` = URL de producción (https://tinkuy.com.ar)

### Variables de Entorno — Frontend
- [ ] `NEXT_PUBLIC_GRAPHQL_URL` = https://api.tinkuy.com.ar/graphql
- [ ] `NEXT_PUBLIC_SITE_URL` = https://tinkuy.com.ar
- [ ] `NEXT_PUBLIC_MP_PUBLIC_KEY` = key de producción

### Docker/Deploy
- [ ] `docker-compose -f docker-compose.production.yml up -d`
- [ ] Verificar que todos los servicios estén corriendo
- [ ] Backend reiniciado y respondiendo

---

## 3. DNS y SSL

- [ ] DNS apunta al servidor/Vercel/Railway
- [ ] SSL activo (candado verde en navegador)
- [ ] HTTP → HTTPS redirect configurado
- [ ] HSTS activo (Strict-Transport-Security)
- [ ] Certificado SSL válido (no expirado)

---

## 4. Base de Datos

- [ ] `npx prisma migrate deploy` ejecutado
- [ ] `npx prisma db seed` ejecutado (si aplica)
- [ ] Productos cargados en catálogo
- [ ] Admin puede loguearse en /admin
- [ ] Categorías configuradas
- [ ] Métodos de envío activos

---

## 5. Webhooks

### MercadoPago
- [ ] Webhook URL verificada en panel MP: `https://api.tinkuy.com.ar/webhooks/mercadopago`
- [ ] Permisos configurados: `payment`, `merchant_order`
- [ ] Webhook secreto configurado

---

## 6. Primera Compra Real

### Test con $1 peso
- [ ] Compra test con $1 peso real
- [ ] Email de confirmación llega (verificar inbox y spam)
- [ ] Orden aparece en `/admin/orders`
- [ ] Stock descontado correctamente
- [ ] Pago visible en panel de MercadoPago

### Flujo Completo
- [ ] Creación de cuenta funciona
- [ ] Login/logout funciona
- [ ] Recuperación de contraseña (email llega)
- [ ] Checkout completo sin errores

---

## 7. Monitoreo

### Sentry
- [ ] DSN configurado en frontend y backend
- [ ] `traces_sample_rate` configurado (0.1 recomendado)
- [ ] Sentry recibe eventos (probar forzando un error test)
- [ ] Alertas configuradas para errores críticos

### Uptime
- [ ] UptimeRobot configurado (cada 5 min mínimo)
- [ ] Monitoreo de `https://api.tinkuy.com.ar/health`
- [ ] Monitoreo de `https://tinkuy.com.ar`
- [ ] Alertas por email configuradas

### SEO y Search
- [ ] Google Search Console verificado
- [ ] Sitemap generado y enviado
- [ ] Robots.txt configurado

### Analytics
- [ ] GA4 configurado y eventos en tiempo real visibles
- [ ] FB Pixel instalado y verificado con Pixel Helper
- [ ] Clarity configurado para recordings

---

## 8. Post-Lanzamiento (Días 1-7)

### Diario
- [ ] Revisar Sentry por nuevos errores
- [ ] Revisar GA4: usuarios en tiempo real, eventos de compra
- [ ] Revisar métricas de conversión

### Semanal (Día 7)
- [ ] Backup de DB realizado
- [ ] Revisar logs de errores
- [ ] Verificar stock y catálogo
- [ ] Revisar feedback de usuarios

### Mensual
- [ ] Rotar secrets (JWT, API keys)
- [ ] Actualizar dependencias
- [ ] Revisar performance con Core Web Vitals
- [ ] Backup automático configurado y verificado

---

## 9. Checklist Rápido de Verificación

Ejecutar `scripts/verify-production.sh` para verificar:

```bash
# Verificación automática
./scripts/verify-production.sh

# Verifica:
# ✓ /health del backend (200, DB, Redis OK)
# ✓ Frontend respondiendo
# ✓ SSL válido
# ✓ GraphQL respondiendo
```

---

## 10. Contactos de Emergencia

| Servicio | Contacto |
|----------|----------|
| Hosting (Vercel/Railway) | [配置] |
| Dominio (DNS) | [配置] |
| MercadoPago Soporte | soporte@mercadopago.com |
| Supabase Soporte | [配置] |

---

## Notas

- Antes de hacer la primera compra real, verificar que el webhook de MP esté funcionando
- Tener Terminal abierta con `tail -f logs/production.log` durante el primer día
- Guardar credenciales en password manager, nunca en el código
- El ambiente sandbox de MP NO sirve para probar pagos reales

---

*Última actualización: 2026-05-15*
