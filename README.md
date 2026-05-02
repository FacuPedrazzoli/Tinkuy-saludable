# Tinkuy - Dietética Premium

**Comer bien todos los días.**

E-commerce profesional de dietética premium construido con Next.js 14, TypeScript y Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

La app estará disponible en [http://localhost:3000](http://localhost:3000)

## Stack Técnico

| Tecnología | Propósito |
|------------|-----------|
| Next.js 14 | Framework (App Router) |
| TypeScript | Tipado estático |
| Tailwind CSS | Estilos utility-first |
| Zustand | Estado global (carrito) |
| Vercel | Deployment |

## Estructura del Proyecto

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Home
│   ├── catalog/              # Catálogo con filtros JS
│   ├── product/[slug]/       # Detalle de producto
│   ├── cart/                 # Carrito
│   ├── checkout/             # Checkout simulado
│   ├── contact/              # Formulario de contacto
│   ├── about/                # Nosotros
│   ├── blog/                 # Blog con posts
│   ├── faq/                  # Preguntas frecuentes
│   ├── login/                # Login admin
│   └── admin/                # Panel admin
│       ├── page.tsx          # Dashboard
│       ├── products/         # Gestión de productos
│       ├── orders/           # Gestión de pedidos
│       └── clients/          # Gestión de clientes
├── components/               # Componentes reutilizables
│   ├── Header.tsx            # Navbar sticky + mega menu
│   ├── Footer.tsx            # Footer completo
│   ├── Hero.tsx              # Hero section
│   ├── ProductCard.tsx        # Card de producto
│   ├── ProductGrid.tsx        # Grid de productos
│   ├── CartDrawer.tsx         # Drawer del carrito
│   ├── Newsletter.tsx        # Sección newsletter
│   ├── FAQSection.tsx        # FAQs colapsables
│   ├── TestimonialsSection.tsx
│   └── Toast.tsx             # Notificaciones
├── data/                     # Mock data (listo para DB)
│   ├── products.ts           # 60+ productos
│   ├── categories.ts         # Categorías
│   ├── testimonials.ts       # Testimonios
│   ├── blog.ts               # Posts del blog
│   ├── orders.ts             # Pedidos mock
│   ├── faqs.ts               # FAQs
│   └── siteConfig.ts         # Config del sitio
├── hooks/                    # Custom hooks
│   └── useValidation.ts
├── lib/                      # Utilidades
│   ├── store.ts              # Zustand stores
│   ├── utils.ts              # Helpers
│   └── rateLimit.ts
└── types/                    # TypeScript interfaces
    └── index.ts
```

## Scripts

```bash
npm run dev          # Desarrollo local
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # ESLint
npm run typecheck    # TypeScript check
```

## Deployment Vercel

### Opción 1: Git Integration
1. Push a GitHub
2. Importar en [vercel.com/import](https://vercel.com/import)
3. Deploy automático

### Opción 2: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Variables de Entorno
```bash
NEXT_PUBLIC_SITE_URL=https://tutienda.com
```

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Home con hero, categorías, productos destacados |
| `/catalog` | Catálogo con filtros, búsqueda, ordenamiento |
| `/product/[slug]` | Detalle de producto con galería, reviews, relacionados |
| `/cart` | Carrito completo |
| `/checkout` | Checkout simulado (sin pagos reales) |
| `/contact` | Formulario de contacto |
| `/about` | Historia de la empresa |
| `/blog` | Artículos de blog |
| `/faq` | Preguntas frecuentes |
| `/admin` | Dashboard admin |
| `/login` | Login admin |

## Características

- **60+ productos** realistas de dietética
- **Filtros client-side** por categoría y tags
- **Carrito persistente** con localStorage
- **Panel admin mock** con métricas
- **SEO completo** con metadata y OpenGraph
- **Responsive** mobile-first
- **Dark mode** preparado (clase `dark` en html)

## Datos Mock

Los datos están en `/src/data/` y son 100% realistas:

- Frutos secos (almendras, nueces, pistachos, castañas, etc.)
- Semillas (chía, lino, hemp, girasol, etc.)
- Harinas (de almendra, coco, avena, etc.)
- Proteínas (whey, plant-based)
- Snacks saludables
- Productos sin TACC, keto, veganos

## Futuro (Preparación para DB)

El proyecto está preparado para migrar a base de datos real:

1. Datos en `/src/data/` → API routes en `/src/app/api/`
2. Zustand store → Prisma + PostgreSQL
3. Mock orders → Sistema de pedidos real
4. Ver `FUTURE_DB_MIGRATION.md` para detalles

## Licencia

MIT