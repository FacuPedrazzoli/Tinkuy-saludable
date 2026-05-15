# Tinkuy Frontend Key Files Reference

Quick reference for debugging the Tinkuy frontend application.

## File Reference Table

| Category | File | Purpose | Key Exports |
|----------|------|---------|-------------|
| **Apollo Client** | `src/lib/graphql/provider.tsx` | GraphQL client setup with auth, caching, and error handling | `ApolloProvider`, `getApolloClient()`, `createApolloClient()` |
| **Apollo Queries** | `src/lib/graphql/queries.ts` | All GraphQL query/mutation definitions | `GET_PRODUCTS`, `GET_PRODUCT`, `ADMIN_LOGIN`, `CUSTOMER_LOGIN`, `ADD_TO_CART`, `CHECKOUT`, `GET_ORDERS`, `GET_ADMIN_METRICS` |
| **Apollo Types** | `src/lib/graphql/types.ts` | GraphQL type definitions | GraphQL schema types |
| **Auth Hook** | `src/hooks/useAuth.tsx` | Authentication state management | `AuthProvider`, `useAuth()` |
| **CSRF Utility** | `src/lib/csrf.ts` | CSRF token generation and validation | `generateCSRFToken()`, `setCSRFCookie()`, `validateCSRF()`, `csrfError()` |
| **Store** | `src/lib/store.ts` | Zustand state management (cart, wishlist, recently viewed) | `useCartStore`, `useWishlistStore`, `useRecentlyViewedStore`, `useHydrationStore` |
| **Login Page** | `src/app/login/page.tsx` | Admin authentication entry point | `AdminLoginPage` (default export) |
| **Product Display** | `src/components/product/ProductPageContent.tsx` | Product page layout with recently viewed | `ProductPageContent` |
| **Recently Viewed** | `src/components/product/RecentlyViewed.tsx` | Recently viewed products carousel | `RecentlyViewed` |
| **Protected Route** | `src/hooks/ProtectedRoute.tsx` | Route guard for authenticated users | `ProtectedRoute` |
| **Providers** | `src/components/Providers.tsx` | Context providers wrapper | `Providers` (wraps ApolloProvider, AuthProvider) |

---

## Apollo Client Setup (`src/lib/graphql/provider.tsx`)

**Purpose:** Configures Apollo Client with auth headers, error handling, and cache policies.

**Key Configuration:**
- **HTTP Link:** Connects to `NEXT_PUBLIC_GRAPHQL_URL` (default: `http://localhost:4000/graphql`)
- **Auth Link:** Reads `auth_token` from localStorage and adds `Authorization: Bearer <token>` header
- **Error Link:** Handles `UNAUTHENTICATED` errors by clearing auth cookies and dispatching `auth_error` event
- **Cache:** InMemoryCache with merge policies for `products`, `orders` (pagination), `categories`, `coupons`, `customers`

**Key Exports:**
```typescript
export function ApolloProvider({ children }: { children: React.ReactNode })  // Context provider
export function getApolloClient()  // Returns new ApolloClient instance
```

---

## Auth Hook (`src/hooks/useAuth.tsx`)

**Purpose:** React Context for authentication state. Manages user session via cookies.

**AuthContextType:**
```typescript
interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  tenantId: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshSession: () => void
}
```

**Session Refresh:** Polls every 60 seconds via `setInterval(checkSession, 60000)`

**Logout Flow:** POSTs to `/api/auth/logout`, then clears `auth_token` and `auth_user` cookies.

**Key Exports:**
```typescript
export function AuthProvider({ children }: { children: ReactNode })  // Context provider
export function useAuth()  // Hook - throws if not within AuthProvider
```

---

## CSRF Utility (`src/lib/csrf.ts`)

**Purpose:** Server-side CSRF protection using double-submit cookie pattern.

**Token Generation:** 32 random bytes encoded as hex (64 characters)

**Cookie Settings:** `HttpOnly`, `Secure` (production), `SameSite=Strict`, 24h max age

**Validation:** Compares cookie value with `x-csrf-token` header using constant-time comparison (no timing attacks)

**Key Exports:**
```typescript
export function generateCSRFToken(): string
export function setCSRFCookie(token: string): { headers: { 'Set-Cookie': string } }
export function validateCSRF(request: NextRequest): boolean
export function csrfError(): Response  // Returns 403 JSON response
```

---

## ProductPageContent (`src/components/product/ProductPageContent.tsx`)

**Purpose:** Wrapper component for product pages that tracks view history.

**Behavior:** Calls `addProduct(product)` when product ID changes (triggers on view).

**Key Exports:**
```typescript
export function ProductPageContent({ product, relatedProducts }: ProductPageContentProps)
```

---

## RecentlyViewed (`src/components/product/RecentlyViewed.tsx`)

**Purpose:** Displays last 4 viewed products. Reads from `useRecentlyViewedStore`.

**Store Behavior:** Keeps up to 8 products, most recent first, persisted to localStorage as `tinkuy-recently-viewed-storage`.

**Key Exports:**
```typescript
export function RecentlyViewed()  // Renders null if not hydrated or no products
```

---

## Login Page (`src/app/login/page.tsx`)

**Purpose:** Admin login form. Authenticates via `/api/admin-auth` endpoint.

**Form Behavior:**
- Email/password with basic validation
- Input sanitization (strips HTML, max 254 chars)
- On success: redirects to `/admin` with router.push + refresh

**Key Exports:**
```typescript
export default function AdminLoginPage()  // Page component
```

---

## Key Directory Structure

```
src/
├── app/
│   ├── login/page.tsx           # Login page
│   ├── admin/                   # Admin dashboard
│   └── api/auth/               # Auth API routes
├── components/
│   ├── product/
│   │   ├── ProductPageContent.tsx
│   │   ├── RecentlyViewed.tsx
│   │   └── RecentlyViewedSection.tsx
│   ├── Providers.tsx            # Wraps Apollo + Auth providers
│   ├── Header.tsx, Footer.tsx
│   └── admin/                   # Admin-specific components
├── hooks/
│   ├── useAuth.tsx              # Auth context + hook
│   └── ProtectedRoute.tsx       # Route guard
└── lib/
    ├── graphql/
    │   ├── provider.tsx         # Apollo setup
    │   ├── queries.ts           # All GQL queries/mutations
    │   ├── types.ts             # TypeScript types
    │   └── adapters.ts
    ├── csrf.ts                  # CSRF utilities
    ├── store.ts                 # Zustand stores
    └── utils.ts                 # Helpers (formatPrice, etc.)
```

---

## Common Debugging Scenarios

**Auth issues:** Check `src/hooks/useAuth.tsx` - verify cookies `auth_token` and `auth_user` are set.

**GraphQL errors:** Check `src/lib/graphql/provider.tsx` errorLink - dispatches `auth_error` event on 401.

**Recently viewed not showing:** Check `src/lib/store.ts` `useRecentlyViewedStore` - ensure `isHydrated` is true and products array has items.

**CSRF validation failing:** Check `src/lib/csrf.ts` - ensure `x-csrf-token` header matches cookie, check `validateCSRF()` constant-time comparison.
