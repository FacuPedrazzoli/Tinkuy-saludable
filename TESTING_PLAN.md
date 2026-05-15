# Plan de Testing - Tinkuy

## Tabla de Casos de Test

| ID | Escenario | Pasos | Resultado esperado | Prioridad | Sprint |
|----|-----------|-------|-------------------|-----------|--------|
| TC-01 | Registro cliente nuevo | 1. Navegar a /register<br>2. Completar: nombre, apellido, email válido, password "Test123!", confirmar password<br>3. Click en "Crear cuenta" | Redirect a /, mensaje "¡Bienvenido/a [nombre]!" | ALTA | Sprint 1 |
| TC-02 | Login credenciales válidas (admin) | 1. Navegar a /login<br>2. Ingresar admin@tinkuy.com / Admin123!<br>3. Click "Iniciar sesión" | JWT en cookie, redirect a /admin | ALTA | Sprint 1 |
| TC-03 | Login credenciales inválidas | 1. Navegar a /login<br>2. Ingresar wrong@email.com / wrongpass<br>3. Click "Iniciar sesión" | Mensaje "Credenciales incorrectas" (no dice "usuario no existe") | ALTA | Sprint 1 |
| TC-04 | Flujo completo compra guest | 1. Navegar a catálogo<br>2. Seleccionar producto → Agregar al carrito<br>3. Checkout → Contacto (nombre, email, teléfono)<br>4. Shipping (dirección)<br>5. Payment → Tarjeta sandbox MercadoPago<br>6. Confirmar | Redirect a /checkout/success, orden creada, email enviado | CRÍTICO | Sprint 1 |
| TC-05 | Flujo completo compra logueado | 1. Login como usuario existente<br>2. Repetir flujo de TC-04<br>3. Verificar persistencia del carrito | Carrito persiste, checkout pre-rellena datos del usuario | ALTA | Sprint 2 |
| TC-06 | Pago fallido → /failure | 1. Checkout → Payment<br>2. Usar tarjeta inválida en sandbox | Redirect a /failure, carrito intacto, mensaje de error | CRÍTICO | Sprint 1 |
| TC-07 | Pago pendiente → /pending | 1. Checkout → Payment<br>2. Seleccionar pago en efectivo (Pago Fácil) | Redirect a /pending con instrucciones de pago | CRÍTICO | Sprint 1 |
| TC-08 | Carrito persiste entre dispositivos | 1. Login en desktop<br>2. Agregar producto al carrito<br>3. En mobile, login con mismo usuario<br>4. Verificar carrito | Carrito tiene el producto agregado | ALTA | Sprint 2 |
| TC-09 | Stock validation | 1. Seleccionar producto con stock=3<br>2. Intentar agregar 5 unidades<br>3. Intentar comprar | Error "Solo hay 3 disponibles", no permite superar stock | ALTA | Sprint 1 |
| TC-10 | Cupón válido | 1. Agregar producto al carrito<br>2. Ir a checkout<br>3. Ingresar cupón "BIENVENIDO10"<br>4. Verificar descuento | 10% descuento aplicado al total | MEDIA | Sprint 2 |
| TC-11 | Cupón inválido | 1. En checkout, ingresar cupón "EXPIRED2024" | Mensaje "Este cupón ya venció" | MEDIA | Sprint 2 |
| TC-12 | Wishlist | 1. Navegar a producto<br>2. Click en corazón (wishlist)<br>3. Ir a /wishlist | Producto aparece en la lista | MEDIA | Sprint 2 |
| TC-13 | Responsive mobile checkout | 1. Configurar viewport iPhone SE (375px)<br>2. Completar checkout completo | Todos los pasos funcionales, UI adaptativa | ALTA | Sprint 2 |
| TC-14 | Refresh token rotation | 1. Login<br>2. Esperar 15 min sin cerrar sesión<br>3. Realizar acción en la app | Token refrescado automáticamente, sesión continua | ALTA | Sprint 3 |
| TC-15 | Rate limiting login | 1. Intentar login con credenciales inválidas 6 veces en 15 min | "Demasiados intentos. Probá en 15 minutos." | ALTA | Sprint 1 |

## Estrategia de Testing

### Unit Tests (Vitest)
- Stores (cart, wishlist, auth)
- Utilidades (calculatePrice, cupones, validaciones)
- Componentes UI individuales

### Integration Tests (Vitest + Prisma)
- Stock validation
- Concurrencia en compras
- Merge de carritos guest/auth

### E2E Tests (Playwright)
- Flujo completo de compra
- Autenticación (registro, login, logout)
- Checkout completo
- Responsive design

### Test Coverage Goals
- Mínimo 70% coverage en código de dominio
- 100% coverage en lógica de carrito y checkout
- E2E cubre los flujos críticos de usuario

## Entornos de Testing

| Entorno | URL | Base de Datos | Notas |
|---------|-----|---------------|-------|
| Local | http://localhost:3000 | SQLite local | Desarrollo |
| Staging | https://staging.tinkuy.com | PostgreSQL staging | Pre-production |
| Production | https://tinkuy.com | PostgreSQL prod | No testear directamente |

## CI/CD Pipeline

```
1. Push a branch → Lint + Typecheck + Unit Tests
2. PR → E2E Tests en staging
3. Merge a main → Deploy a staging
4. Tag vX.Y.Z → Deploy a producción
```
