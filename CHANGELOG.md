# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

---

## [1.0.0] — Lanzamiento inicial — 2025-01-15

### Seguridad

- HTTPS con nginx + Let's Encrypt
- GraphQL introspection OFF en producción
- Refresh token rotation
- Cookies encriptadas AES-256-CBC
- Rate limiting (login 5/15min, register 3/hora)
- Helmet.js headers
- CSRF token protection con comparación en tiempo constante
- HttpOnly cookies para auth tokens
- Session timeout (30 min inactivity, warning a 25 min)

### Features

- Catálogo con filtros y búsqueda
- Checkout completo con MercadoPago
- Programa de puntos/fidelización (Tinkuy)
- Newsletter con emails (Resend)
- Reviews de productos
- Recuperación de contraseña
- Carrito abandonado con emails
- Wishlist de productos
- Blog con artículos
- FAQ con secciones colapsables
- Testimonios de clientes
- Consentimiento de cookies
- Popup de intención de salida
- Búsqueda modal de productos

### Performance

- Server Components para SEO
- next/image optimizado
- ISR para páginas de producto
- Client-side filtering con caching
- Skeleton loading para product grid

### Páginas

- Home con hero, categorías, productos destacados
- Catálogo de productos con filtros
- Detalle de producto con galería y reviews
- Carrito de compras
- Checkout simulado (sin pagos reales inicialmente)
- Gestión de productos (admin)
- Gestión de pedidos (admin)
- Gestión de clientes (admin)
- Dashboard de métricas (admin)
- Login de admin
- Página de contacto
- Página About
- Términos y condiciones

### Componentes

- Header sticky con mega menú
- Footer completo
- CartDrawer deslizable
- Product cards con add-to-cart
- Product grid con loading skeleton
- Recently viewed products
- Newsletter subscription
- FAQ accordion
- Testimonials section
- Category showcase
- Cookie consent banner
- Exit intent popup
- Search modal
- Toast notifications
- Error boundary
- DevTools panel para desarrollo
- Admin image upload

### Datos

- 60+ productos realistas (frutos secos, semillas, harinas, proteínas, snacks)
- Categorías de productos
- Testimonios de clientes
- Posts de blog
- Órdenes mock
- FAQs
- Configuración del sitio

### Technical

- Next.js 14 con App Router
- TypeScript con tipado estricto
- Tailwind CSS con theme personalizado
- Zustand para estado global (carrito)
- Apollo Client para GraphQL
- Supabase SSR para autenticación
- Pothos GraphQL schema builder
- React Hook Form + Zod para formularios
- Prisma ORM
- Sharp para optimización de imágenes
- Vercel deployment
- Sitemap y robots.txt generation
- Web manifest para PWA
- Dark mode support

---

## Version History

- [1.0.0](#100--lanzamiento-inicial--2025-01-15) — Lanzamiento inicial — 2025-01-15
