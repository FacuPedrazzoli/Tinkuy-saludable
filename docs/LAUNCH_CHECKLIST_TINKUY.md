# LAUNCH CHECKLIST FINAL — TINKUY
## Meta: 5.8/10 → 8.5/10 en 4 semanas

---

## RESUMEN DE ENTREGABLES POR AGENTE

| Agente | Entregables | Estado |
|--------|-------------|--------|
| Project Manager | Backlog + Diagrama dependencias + Matriz riesgos | ✅ Completado |
| Security Engineer | nginx.conf + GraphQL introspection + Refresh tokens + Cookie encryption + Script rotación | ✅ Completado |
| UI/UX Designer | tailwind.config.js + Tipografía + Button.tsx + ProductCard + Hero + BottomNav fix | ✅ Completado |
| Senior Frontend | checkout/success + failure + pending + register + logout + error messages + cart sync + wishlist | ✅ Completado |
| Senior Backend | GraphQL introspection + Refresh tokens + Productos a DB + Cart sync + Std responses + Rate limiting | ✅ Completado |
| DBA | schema.prisma completo + Migraciones + Seed + Índices + Query optimizada | ✅ Completado |
| QA Engineer | Testing plan + E2E tests + Unit tests + Concurrency tests + Bug report + Checklist regresión | ✅ Completado |
| DevOps | nginx.conf + Dockerfiles + docker-compose + .env examples + CI/CD + Backup script + Guía Railway | ✅ Completado |
| Ecommerce Specialist | Webhook MP + GA4 + FB Pixel + Reviews + Newsletter + Shipping calc + Loyalty | ✅ Completado |
| Copywriter | Hero + Propuesta valor + Microcopy + Error messages + CTAs + Emails + Meta tags | ✅ Completado |

---

## CHECKLIST FINAL DE LANZAMIENTO

### 🔴 CRÍTICO — Antes del primer usuario real

| Ítem | Agente | Estado | Fecha límite | Notas |
|------|--------|--------|--------------|-------|
| Página /checkout/success | Frontend Dev | ✅ | Sprint 1 | Creada |
| Página /checkout/failure | Frontend Dev | ✅ | Sprint 1 | Creada |
| Página /checkout/pending | Frontend Dev | ✅ | Sprint 1 | Creada |
| Página /register para clientes | Frontend Dev | ✅ | Sprint 1 | Creada con validación Zod |
| HTTPS configurado en nginx | DevOps | ✅ | Sprint 1 | TLS 1.2/1.3 + redirect 301 |
| Introspección GraphQL OFF en prod | Backend Dev | ✅ | Sprint 1 | `introspection: NODE_ENV !== 'production'` |
| Logout funcional | Frontend Dev | ✅ | Sprint 1 | useAuth.tsx + RevokeToken mutation |
| Login con JWT | Frontend Dev | ✅ | Sprint 1 | Verificado con el equipo |
| Refresh token rotation | Backend Dev | ✅ | Sprint 1 | Modelo RefreshToken en Prisma |
| Cookie encryption AES-256 | Security Engineer | ✅ | Sprint 1 | Web Crypto API en useAuth.tsx |
| Script rotación de secretos | Security Engineer | ✅ | Sprint 1 | scripts/rotate-secrets.sh |
| Migraciones Prisma aplicadas | DBA | ✅ | Sprint 1 | 11 migraciones en orden |
| Schema.prisma actualizado | DBA | ✅ | Sprint 1 | RefreshToken, Review, Loyalty, etc. |

---

### 🟠 IMPORTANTE — Antes del lanzamiento público

| Ítem | Agente | Estado | Fecha límite | Notas |
|------|--------|--------|--------------|-------|
| Paleta eco-friendly aplicada | UI/UX Designer | ✅ | Sprint 2 | Verde musgo #4A7C59, tierra #8B6355 |
| Tipografía: Plus Jakarta Sans | UI/UX Designer | ✅ | Sprint 2 | Reemplazó Inter |
| Botón CTA en verde musgo | UI/UX Designer | ✅ | Sprint 2 | ProductCard, CartDrawer, Hero |
| Hover effects ProductCard | UI/UX Designer | ✅ | Sprint 2 | Sombras verdes suaves |
| Hero section mejorada | UI/UX Designer | ✅ | Sprint 2 | Gradiente cream + SVG decorativos |
| Fix BottomNav badge "99+" | UI/UX Designer | ✅ | Sprint 2 | `cartCount > 99 ? '99+' : cartCount` |
| Carrito sincronizado con backend | Frontend Dev | ✅ | Sprint 2 | syncWithBackend() + mergeCart() |
| Mensajes de error traducidos | Frontend Dev | ✅ | Sprint 2 | Mapa de traducción en checkout |
| Filtros de precio en catálogo | Frontend Dev | ✅ | Sprint 2 | PriceFilter component |
| Wishlist accesible en nav | Frontend Dev | ✅ | Sprint 2 | Header + MobileMenu |
| Rate limiting reforzado | Backend Dev | ✅ | Sprint 2 | Login: 5/15min, Register: 3/hr |
| Webhook MercadoPago completo | Ecommerce Specialist | ✅ | Sprint 2 | Verificación firma + idempotencia |
| Newsletter funcional | Ecommerce Specialist | ✅ | Sprint 2 | Mutation subscribeToNewsletter |
| Reviews de clientes | Ecommerce Specialist | ✅ | Sprint 3 | createReview + approveReview |
| Google Analytics 4 + Enhanced Ecommerce | Ecommerce Specialist | ✅ | Sprint 3 | src/lib/analytics.ts |
| Facebook Pixel | Ecommerce Specialist | ✅ | Sprint 3 | src/lib/pixel.ts |
| Seed con 40+ productos | DBA | ✅ | Sprint 1 | 8 categorías, 3 users, 5 orders |
| Dockerfiles creados | DevOps | ✅ | Sprint 1 | Frontend + Backend multi-stage |
| docker-compose.yml | DevOps | ✅ | Sprint 1 | Postgres + Redis + Front + Back |
| CI/CD Pipeline | DevOps | ✅ | Sprint 2 | GitHub Actions: lint → test → deploy |
| Testing suite completa | QA Engineer | ✅ | Sprint 2 | E2E + Unit + Integration + Concurrency |
| Bug report actualizado | QA Engineer | ✅ | Sprint 2 | 15 bugs documentados |
| CHECKLIST DE REGRESIÓN | QA Engineer | ✅ | Sprint 2 | 15 min pre-deploy |

---

### 🟡 DESEABLE — Primer mes post-lanzamiento

| Ítem | Agente | Estado | Fecha límite | Notas |
|------|--------|--------|--------------|-------|
| Popup 10% off primera compra | Frontend Dev | 🔄 En desarrollo | Sprint 3 | Cookie para 1x por sesión |
| Cupones personales automáticos | Backend Dev | 🔄 En desarrollo | Sprint 3 | BIENVENIDO10, cumpleaños, etc. |
| Calculadora de envío Andreani | Ecommerce Specialist | ✅ | Sprint 4 | getShippingQuotes() |
| Calculadora de envío Correo Arg | Ecommerce Specialist | 🔄 Pendiente | Sprint 4 | API integration |
| Pago Fácil | Ecommerce Specialist | 🔄 Pendiente | Sprint 4 | generar reference |
| Rapipago | Ecommerce Specialist | 🔄 Pendiente | Sprint 4 | same flow |
| Programa de puntos/fidelización | Ecommerce Specialist | ✅ | Sprint 4 | earnPoints + redeemPoints |
| Email bienvenida | Copywriter | ✅ | Sprint 1 | "¡Bienvenido/a a Tinkuy!" |
| Email confirmación compra | Copywriter | ✅ | Sprint 1 | Order #%d confirmado |
| Email carrito abandonado | Copywriter | ✅ | Sprint 1 | 24hs post-abandono |
| Hotjar configurado | Ecommerce Specialist | 🔄 Pendiente | Sprint 4 | Heatmaps + recordings |
| Documentación completa | Todos | 🔄 En progreso | Sprint 4 | README + API docs |

---

## ARCHIVOS CREADOS/MODIFICADOS POR PROYECTO

### tinkuy/ (Frontend)

```
src/
├── app/
│   ├── checkout/
│   │   ├── success/page.tsx          ✅ NUEVO
│   │   ├── failure/page.tsx          ✅ NUEVO
│   │   └── pending/page.tsx          ✅ NUEVO
│   ├── register/page.tsx             ✅ NUEVO
│   └── orders/page.tsx               ✅ NUEVO
├── components/
│   ├── ui/
│   │   └── Button.tsx               ✅ NUEVO
│   ├── BottomNav.tsx                ✅ MODIFICADO (bug fix)
│   ├── ProductCard.tsx               ✅ MODIFICADO (hover + colors)
│   └── Hero.tsx                      ✅ MODIFICADO (nuevo diseño)
├── hooks/
│   └── useAuth.tsx                  ✅ MODIFICADO (logout + cookie encryption)
├── lib/
│   ├── analytics.ts                  ✅ NUEVO (GA4)
│   ├── pixel.ts                     ✅ NUEVO (FB Pixel)
│   ├── graphql/
│   │   └── queries.ts                ✅ MODIFICADO (REVOKE_TOKEN)
│   └── store.ts                     ✅ MODIFICADO (syncWithBackend + mergeCart)
├── i18n/
│   └── es.json                      ✅ MODIFICADO (errores traducidos)
tailwind.config.js                    ✅ MODIFICADO (nueva paleta)
Dockerfile                           ✅ NUEVO
.env.example                         ✅ NUEVO
```

### Back-Tinkuy-Saludable/ (Backend)

```
src/
├── graphql/
│   ├── builder.ts                   ✅ MODIFICADO (introspection OFF)
│   └── plugins/
│       ├── depth-limit.ts            ✅ NUEVO
│       └── complexity.ts             ✅ NUEVO
├── modules/
│   ├── auth/
│   │   ├── resolver.ts              ✅ MODIFICADO (refresh tokens)
│   │   └── service.ts                ✅ MODIFICADO (rotation logic)
│   ├── cart/
│   │   ├── resolver.ts              ✅ MODIFICADO (sync mutations)
│   │   └── service.ts                ✅ MODIFICADO (addToCart, etc.)
│   ├── checkout/
│   │   ├── webhook.handler.ts       ✅ MODIFICADO (idempotencia)
│   │   └── service.ts                ✅ MODIFICADO (processApprovedPayment)
│   ├── reviews/
│   │   └── resolver.ts               ✅ NUEVO
│   ├── newsletter/
│   │   └── resolver.ts               ✅ NUEVO
│   └── loyalty/
│       ├── resolver.ts               ✅ NUEVO
│       └── service.ts                ✅ NUEVO
├── lib/
│   ├── errors/
│   │   └── index.ts                  ✅ NUEVO (error handler centralizado)
│   ├── graphql/
│   │   └── response.ts               ✅ NUEVO (GQLResponse wrapper)
│   ├── rateLimit.ts                  ✅ MODIFICADO (límites reforzados)
│   └── validation.ts                  ✅ MODIFICADO
├── index.ts                          ✅ MODIFICADO
nginx/
└── nginx.conf                        ✅ NUEVO
Dockerfile                            ✅ NUEVO
.env.example                          ✅ NUEVO
scripts/
└── rotate-secrets.sh                 ✅ NUEVO
docs/
└── SECURITY.md                       ✅ NUEVO
```

---

## COMANDOS DE POST-DEPLOY

```bash
# 1. Generar cliente Prisma
cd Back-Tinkuy-Saludable
npx prisma generate

# 2. Aplicar migraciones
npx prisma db push

# 3. Rotar secretos (OBLIGATORIO antes de producción)
./scripts/rotate-secrets.sh

# 4. Build Docker images
docker-compose build

# 5. Deploy
docker-compose up -d

# 6. Verificar HTTPS
curl -I https://tinkuy.com.ar

# 7. Verificar GraphQL introspection OFF
curl -X POST -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' \
  https://api.tinkuy.com.ar/graphql
# Debería retornar 403

# 8. Run tests
npm run test
npm run test:e2e
```

---

## SIGN-OFF CHECKLIST

| Rol | Responsable | Fecha | Firma |
|-----|-------------|-------|-------|
| Security Lead | | | |
| Frontend Tech Lead | | | |
| Backend Tech Lead | | | |
| QA Lead | | | |
| DevOps Lead | | | |
| Product Owner | | | |

---

## ROADMAP POST-LANZAMIENTO (Mes 2-3)

| Feature | Prioridad | Estimación |
|---------|-----------|------------|
| App móvil (React Native) | MEDIA | 8 semanas |
| Programa de afiliados | BAJA | 4 semanas |
| Blog SEO optimizado | MEDIA | 3 semanas |
| Suscripción/membresía | BAJA | 6 semanas |
| Chat en vivo (WhatsApp) | ALTA | 1 semana |

---

*Documento generado: $(date)*
*Versión: 1.0*
*Estado: LISTO PARA LANZAMIENTO*
