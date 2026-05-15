# Bug Report - Tinkuy

## Tabla de Bugs

| Bug ID | Descripción | Severidad | Estado | Sprint | Archivo | Pasos para reproducir | Resultado esperado |
|--------|-------------|-----------|--------|--------|---------|----------------------|-------------------|
| B-01 | Falta página /checkout/success | CRÍTICO | TODO | Sprint 1 | src/app/checkout/success/page.tsx | 1. Completar checkout<br>2. Pago exitoso | Mostrar confirmación con número de orden |
| B-02 | Falta página /checkout/failure | CRÍTICO | TODO | Sprint 1 | src/app/checkout/failure/page.tsx | 1. Checkout<br>2. Tarjeta inválida | Mostrar error, botón reintentar, carrito intacto |
| B-03 | Falta página /checkout/pending | CRÍTICO | TODO | Sprint 1 | src/app/checkout/pending/page.tsx | 1. Checkout<br>2. Pago efectivo | Mostrar instrucciones de pago |
| B-04 | No existe registro clientes | CRÍTICO | TODO | Sprint 1 | src/app/register/page.tsx | 1. Ir a /register | Formulario de registro funcional |
| B-05 | Sin logout funcional | ALTO | TODO | Sprint 1 | src/hooks/useAuth.tsx | 1. Login<br>2. Click cerrar sesión | Sesión cerrada, redirige a /login |
| B-06 | Mensajes error no-actionables | ALTO | TODO | Sprint 2 | src/app/checkout/page.tsx | 1. Checkout con datos inválidos | Mensajes específicos por campo |
| B-07 | Carrito no sincroniza con backend | ALTO | TODO | Sprint 2 | src/lib/store.ts | 1. Agregar item en desktop<br>2. Login en mobile | Carrito sincronizado |
| B-08 | BottomNav badge "9+" incorrecto | MENOR | TODO | Sprint 2 | src/components/BottomNav.tsx | 1. Agregar 10+ items al carrito | Badge muestra número real o "9+" |
| B-09 | Rate limiting no implementado | ALTO | TODO | Sprint 1 | src/lib/rateLimit.ts | 1. 6 intentos login fallidos | Bloqueo por 15 min |
| B-10 | Sin validación stock en backend | CRÍTICO | TODO | Sprint 1 | src/app/api/checkout/route.ts | 1. POST /api/checkout con stock superado | Error 400 con mensaje claro |
| B-11 | Cupones no validan fecha expiración | ALTO | TODO | Sprint 2 | src/lib/coupons.ts | 1. Aplicar cupón EXPIRED2024 | Mensaje "Este cupón ya venció" |
| B-12 | Wishlist no persiste en backend | MEDIO | TODO | Sprint 2 | src/lib/wishlist.ts | 1. Agregar a wishlist<br>2. Clear localStorage | Wishlist en backend |
| B-13 | Sesión expira sin refresh token | ALTO | TODO | Sprint 3 | src/hooks/useAuth.tsx | 1. Login<br>2. Esperar 15 min | Token refrescado automáticamente |
| B-14 | Responsive checkout雪山 iPhone SE | MEDIO | TODO | Sprint 2 | src/app/checkout/** | 1. Viewport 375px<br>2. Checkout completo | UI adaptativa funciona |
| B-15 | MercadoPago sandbox no funciona | CRÍTICO | TODO | Sprint 1 | src/components/payment/MercadoPago.tsx | 1. Seleccionar MercadoPago<br>2. Pagar | Sandbox captura pago |

## Distribución por Severidad

```
CRÍTICO : 5 bugs (B-01, B-02, B-03, B-04, B-10)
ALTO    : 6 bugs (B-05, B-06, B-07, B-09, B-11, B-13)
MEDIO   : 2 bugs (B-12, B-14)
MENOR   : 1 bug  (B-08)
```

## Distribución por Sprint

```
Sprint 1 : 8 bugs (B-01, B-02, B-03, B-04, B-05, B-09, B-10, B-15)
Sprint 2 : 5 bugs (B-06, B-07, B-08, B-11, B-14)
Sprint 3 : 1 bug  (B-13)
```

## Bugs Bloqueantes para Deploy

1. **B-01, B-02, B-03** - Páginas de checkout son críticas
2. **B-04** - Registro es requerido para flujo completo
3. **B-10** - Validación de stock es crítica para inventario
4. **B-15** - MercadoPago es el唯一 método de pago

## Notas

- Todos los bugs con severidad CRÍTICO deben resolverse antes de cualquier release
- Bugs ALTO deben resolverse antes de pasar a producción
- Bugs MENOR pueden resolverce en próximas sprint
