# README_AGENT.md

**Para agentes IA: Guía de entrada al proyecto Tinkuy**

## Proyecto

**Tinkuy** - E-commerce de dietética premium
- Stack: Next.js 14, TypeScript, Tailwind CSS, Zustand, Supabase
- Ubicación: `C:\Users\FacuPedrazzoli\Workspaces\tinkuy`
- Repo: Git

## Workflow para Agentes

### 1. Orientación Inicial
```
1. Leer este archivo (README_AGENT.md)
2. Revisar .ai/ARCHITECTURE.md para contexto técnico
3. Consultar docs/SUPABASE_MIGRATION.md para integración DB
4. Revisar .ai/ROADMAP.md para estado actual
5. Revisar TASKS.md para tareas pendientes
```

### 2. Reglas de Código (CRÍTICAS)

1. **TypeScript strict** - NO usar `any` nunca
2. **Componentes** - Solo funcionales con hooks
3. **CSS** - Solo Tailwind, sin CSS modules ni styled-components
4. **Imports** - Usar alias `@/` (ej: `@/components`, `@/lib/supabase`)
5. **Nomenclatura** - camelCase archivos, PascalCase componentes

### 3. Convenciones de Archivos

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Componentes | PascalCase.tsx | `ProductCard.tsx` |
| Hooks | useCamelCase.ts | `useAuth.ts` |
| Utils | utils.ts o lib/utils.ts | - |
| API Routes | route.ts | `api/products/route.ts` |
| Pages | page.tsx | - |
| Layouts | layout.tsx | - |

### 4. Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: cambios de estilo
refactor: refactorización
test: tests
chore: mantenimiento
```

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev          # Desarrollo (localhost:3000)
npm run build        # Build producción
npm run typecheck    # Verificar tipos TS
npm run lint         # ESLint
```

## Estructura Clave

```
src/
├── app/                    # Rutas (App Router)
│   ├── page.tsx           # Home
│   ├── catalog/           # Catálogo
│   ├── product/[slug]/    # Detalle producto
│   ├── cart/              # Carrito
│   ├── checkout/          # Checkout (conecta a Supabase)
│   ├── admin/             # Admin panel (CRUD real)
│   ├── login/             # Login (Supabase Auth)
│   └── api/               # API routes
│       ├── products/      # CRUD productos
│       ├── orders/        # CRUD pedidos
│       ├── categories/    # CRUD categorías
│       ├── customers/     # Lista clientes
│       └── admin/         # Métricas dashboard
├── components/             # Componentes reutilizables
├── lib/
│   ├── supabase/          # Supabase client, types, middleware
│   ├── store.ts           # Zustand (carrito)
│   └── utils.ts           # Helpers
├── types/                  # Interfaces TypeScript
└── data/                   # Mock data (backwards compatible)
```

## Backend (Supabase)

### Schema
- 20+ tablas en `supabase/schema.sql`
- Row Level Security (RLS) habilitado
- Triggers para updated_at automático

### Tablas Principales
- `users` - Admin users (Supabase Auth)
- `customers` - Clientes ecommerce
- `products` - Catálogo
- `orders` - Pedidos
- `order_items` - Items de pedido

### Auth
- Login con email/password via Supabase Auth
- Roles: owner, admin, editor
- Middleware protege `/admin/*`

## API Routes

Todas las rutas en `/api/`:
- **GET/POST** `/api/products` - Lista/crea productos
- **GET/PUT/DELETE** `/api/products/[id]` - CRUD producto
- **GET/POST** `/api/orders` - Lista/crea pedidos
- **GET/PATCH** `/api/orders/[id]` - Detalle/actualiza estado
- **GET** `/api/admin/metrics` - Métricas dashboard

## Estado de la App

- [x] Build compila sin errores
- [x] 60+ productos realistas
- [x] Carrito con localStorage (Zustand)
- [x] Filtros client-side
- [x] **Admin panel con CRUD real (Supabase)**
- [x] **Checkout conecta a Supabase**
- [x] **Auth con Supabase Auth**
- [x] SEO con metadata API
- [x] Dark mode preparado
- [x] Métricas dashboard reales
- [ ] Tests E2E (pendiente)
- [ ] MercadoPago (pendiente)

## Variables de Entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

## Contacto con Humano

Para cambios significativos (>10 líneas) o decisiones arquitecturales, **pedir confirmación antes de proceder**.

## Notas Importantes

- No usar emojis en código ni comentarios
- No agregar comentarios innecesarios
- Mantener código limpio y reusable
- Priorizar performance (lazy loading, code splitting)
- Accesibilidad: usar ARIA cuando corresponda
- Validar inputs con Zod

## Archivos de Referencia

| Archivo | Propósito |
|---------|-----------|
| `.ai/ARCHITECTURE.md` | Diagrama de arquitectura |
| `.ai/ROADMAP.md` | Roadmap técnico |
| `docs/SUPABASE_MIGRATION.md` | Setup de Supabase |
| `supabase/schema.sql` | Schema completo de DB |
| `.ai/COMPONENT_RULES.md` | Reglas para componentes |

---

**Última actualización:** Mayo 2026