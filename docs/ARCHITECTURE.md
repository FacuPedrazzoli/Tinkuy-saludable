# Tinkuy Frontend Architecture

## Overview

Tinkuy is a Next.js 14 e-commerce frontend for a premium Argentine health food store (dietética). The application provides:

- **Public storefront**: Product catalog, shopping cart, wishlist, checkout
- **Admin dashboard**: Product management, order management, customer management, coupons
- **GraphQL API integration**: Communicates with a GraphQL backend for data
- **Multi-tenant architecture**: Supports role-based access (owner, admin, editor)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data Fetching | Apollo Client (GraphQL) |
| State Management | Zustand (cart, wishlist, hydration) + React Context (auth) |
| Auth | Supabase SSR + Cookie-based sessions |
| Form Handling | React Hook Form + Zod + @hookform/resolvers |
| Testing | Vitest + Testing Library |
| Image Processing | Sharp + browser-image-compression |

---

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (admin)/            # Route group for admin panel (shared layout)
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── clients/        # Client management pages
│   │   ├── orders/         # Order management pages
│   │   └── products/       # Product management pages
│   ├── admin/              # Standalone admin routes (login, layout)
│   ├── api/                # API routes (auth, webhooks)
│   ├── blog/               # Blog pages
│   ├── cart/               # Cart page
│   ├── catalog/            # Product catalog
│   ├── checkout/           # Checkout flow
│   ├── contact/            # Contact page
│   ├── faq/                # FAQ page
│   ├── login/              # Login page
│   ├── orders/             # Customer order history
│   ├── product/            # Product detail pages
│   ├── wishlist/           # Wishlist page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/             # Shared React components
│   ├── admin/             # Admin-specific components
│   ├── product/           # Product-related components
│   ├── Header.tsx         # Site header with nav
│   ├── Footer.tsx         # Site footer
│   ├── CartDrawer.tsx     # Slide-out cart panel
│   ├── Providers.tsx      # Context providers wrapper
│   └── ...
├── data/                  # Static data and configs
│   ├── siteConfig.ts      # Site-wide configuration
│   ├── products.ts        # Static product data
│   ├── categories.ts     # Category definitions
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── useAuth.tsx        # Authentication context
│   ├── ProtectedRoute.tsx # Route protection HOC
│   └── ...
├── lib/                   # Utilities and integrations
│   ├── graphql/           # Apollo Client setup
│   │   ├── provider.tsx   # ApolloProvider component
│   │   ├── queries.ts    # GraphQL query/mutation definitions
│   │   └── types.ts      # GraphQL-generated types
│   ├── supabase/          # Supabase auth integration
│   │   ├── client.ts     # Browser client
│   │   ├── server.ts     # Server-side client
│   │   └── middleware.ts # Session refresh
│   ├── store.ts           # Zustand stores (cart, wishlist)
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
    └── index.ts          # Core domain types
```

---

## State Management

### 1. Apollo Client (Server State)

Apollo Client manages all server-side data with caching:

```typescript
// src/lib/graphql/provider.tsx
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';

function createApolloClient() {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  });

  const authLink = setContext(async (_, { headers }) => {
    const token = localStorage.getItem('auth_token');
    return {
      headers: { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    };
  });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            products: { keyArgs: ['search', 'tagSlug', 'isVisible'], merge(existing, incoming) { ... } },
            orders: { keyArgs: ['status'], merge(existing, incoming) { ... } },
          },
        },
      },
    }),
  });
}
```

**Key Queries:**
- `GET_PRODUCTS` - Paginated product listing with search/filter
- `GET_PRODUCT` - Single product details
- `GET_CART`, `ADD_TO_CART`, `UPDATE_CART_ITEM`, `REMOVE_FROM_CART` - Cart operations
- `CHECKOUT` - Create MercadoPago payment preference
- `GET_ORDERS`, `GET_MY_ORDERS` - Order history
- `GET_ADMIN_METRICS` - Dashboard analytics

### 2. Zustand (Client State)

Zustand manages persistent client-side state with localStorage:

```typescript
// src/lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, weight = 250) => { ... },
      removeItem: (productId, weight) => { ... },
      updateQuantity: (productId, quantity, weight) => { ... },
      getTotal: () => { ... },
    }),
    { name: 'tinkuy-cart-storage', partialize: (state) => ({ items: state.items }) }
  )
);
```

**Stores:**

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `useCartStore` | Shopping cart items | `tinkuy-cart-storage` |
| `useWishlistStore` | Saved products | `tinkuy-wishlist-storage` |
| `useRecentlyViewedStore` | Recently viewed products (max 8) | `tinkuy-recently-viewed-storage` |
| `useHydrationStore` | Track SSR hydration completion | None |

### 3. React Context (Auth State)

```typescript
// src/hooks/useAuth.tsx
interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;  // 'owner' | 'admin' | 'editor'
  tenantId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshSession: () => void;
}
```

Auth state is stored in cookies (`auth_token`, `auth_user`) and checked every 60 seconds.

---

## Authentication Flow

### Admin Authentication

1. **Login**: POST to `/api/admin-auth` with email/password
2. **Server validates** credentials against GraphQL API
3. **On success**: Set `auth_token` and `auth_user` cookies
4. **Middleware** (`middleware.ts`) refreshes Supabase sessions on each request
5. **ProtectedRoute** component redirects unauthenticated users to `/login`

### Cookie Structure

```
auth_token: <jwt_token>
auth_user: <base64_encoded_json>{id, email, firstName, lastName, role, tenantId}
```

### Role-Based Access

| Role | Access |
|------|--------|
| `owner` | Full access |
| `admin` | Full access |
| `editor` | Limited to products/orders (no clients/coupons) |

### Session Management

- Session timeout: 25 minutes
- Warning shown at 20 minutes
- Auto-logout at 25 minutes + 5 minute grace period
- Activity detection (mousedown, keydown, scroll, touchstart)

---

## Key Components

### Providers

```typescript
// src/components/Providers.tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ApolloProvider>
          {children}
        </ApolloProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

**Order matters**: ErrorBoundary wraps everything, AuthProvider provides auth context, ApolloProvider enables GraphQL.

### CartDrawer

Slide-out panel showing cart contents with:
- Item list with quantity/weight controls
- Price calculation based on weight (100g, 250g, 500g, 1000g)
- Total calculation
- Checkout button

Loaded dynamically with `ssr: false` to prevent hydration issues.

### Header

Site-wide navigation with:
- Logo and site name
- Main navigation links
- Search trigger
- Wishlist count
- Cart count (from Zustand store)

---

## Pages (App Directory)

### Public Storefront

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, featured products, testimonials |
| `/catalog` | Product listing with filters and search |
| `/product/[slug]` | Product detail page |
| `/cart` | Full cart page |
| `/checkout` | Multi-step checkout (cart → customer info → payment) |
| `/wishlist` | Saved products |
| `/orders` | Order history (authenticated) |
| `/about` | About page |
| `/faq` | FAQ page |
| `/contact` | Contact form |
| `/blog` | Blog listing |
| `/login` | Customer login |

### Admin Dashboard (`/admin`)

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard with metrics, recent orders, top products |
| `/admin/products` | Product CRUD list |
| `/admin/products/[id]` | Edit product |
| `/admin/categories` | Category management |
| `/admin/orders` | Order list with status filters |
| `/admin/orders/[id]` | Order detail |
| `/admin/clients` | Customer list |
| `/admin/coupons` | Coupon management |

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin-auth` | POST | Admin login |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/csrf` | GET | CSRF token for forms |

---

## Styling (Tailwind CSS)

### Custom Theme

```javascript
// tailwind.config.js
colors: {
  primary: { 50: '#f4f7f0', ..., 900: '#24281a' },  // Green (sage)
  secondary: { ... },  // Coral/red accents
  cream: { 50: '#FDFCFA', ..., 500: '#D4C4A0' },
  sage: { ... },  // Alias for primary
}
```

### Typography

```javascript
fontFamily: {
  sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
  display: ['var(--font-playfair)', 'Georgia', 'serif'],
}
```

### Animations

```javascript
animation: {
  'fade-in': 'fadeIn 0.5s ease-out',
  'slide-up': 'slideUp 0.5s ease-out',
  'float': 'float 6s ease-in-out infinite',
}
```

---

## Key Libraries

### Apollo Client (`@apollo/client`)

GraphQL client with:
- HTTP link for API communication
- Auth link for token injection
- Error link for handling UNAUTHENTICATED errors
- InMemoryCache with field policies for pagination

### Supabase SSR (`@supabase/ssr`)

Server-side Supabase integration for session management:
- `createBrowserClient` - For client components
- `createServerClient` - For server components
- Middleware integration for session refresh

### React Hook Form (`react-hook-form`)

Form handling with:
- Zod validation via `@hookform/resolvers`
- Schema-based validation

### Zod (`zod`)

Schema validation for forms and API responses.

### Zustand (`zustand`)

Lightweight state management with:
- `persist` middleware for localStorage
- Separate stores for cart, wishlist, recently viewed

### Image Processing

- `sharp` - Server-side image optimization
- `browser-image-compression` - Client-side image compression

---

## Data Flow Example: Add to Cart

```
User clicks "Add to Cart"
    ↓
Component calls useCartStore.addItem(product, quantity, weight)
    ↓
Zustand updates items array, persists to localStorage
    ↓
CartDrawer re-renders with new count
Header re-renders with new cart badge
    ↓
(If user is logged in)
Optional: Apollo mutation to sync with server cart
```

## Data Flow Example: Admin Login

```
User submits login form
    ↓
POST /api/admin-auth with credentials
    ↓
Server calls GraphQL adminLogin mutation
    ↓
On success: Set auth_token and auth_user cookies
    ↓
Redirect to /admin
    ↓
ProtectedRoute checks auth via useAuth()
    ↓
ApolloProvider includes token in Authorization header
```

---

## Environment Variables

```bash
# GraphQL
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Site
NEXT_PUBLIC_SITE_URL=https://tinkuy.com
```

---

## Testing

- **Framework**: Vitest
- **Testing Library**: @testing-library/react, @testing-library/jest-dom
- **Coverage**: @vitest/coverage-v8

```bash
npm run test        # Run tests once
npm run test:watch  # Watch mode
npm run typecheck   # TypeScript check
npm run lint        # ESLint
```
