# Frontend-Backend Integration Documentation

This document describes how the Tinkuy frontend (Next.js) connects to the GraphQL backend.

## Table of Contents

1. [Apollo Client Setup](#apollo-client-setup)
2. [Environment Variables](#environment-variables)
3. [Authentication Flow](#authentication-flow)
4. [CSRF Token Handling](#csrf-token-handling)
5. [Key GraphQL Operations](#key-graphql-operations)
6. [Example API Calls](#example-api-calls)

---

## Apollo Client Setup

The frontend uses [Apollo Client](https://www.apollographql.com/docs/react/) for GraphQL communication.

### Provider Configuration

The Apollo Client is configured in `src/lib/graphql/provider.tsx`:

```tsx
// src/lib/graphql/provider.tsx
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

function createApolloClient() {
  // HTTP Link - connects to GraphQL endpoint
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  });

  // Auth Link - attaches JWT token to every request
  const authLink = setContext(async (_, { headers }) => {
    if (typeof window === 'undefined') {
      return { headers };
    }
    const token = localStorage.getItem('auth_token');
    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  // Error Link - handles GraphQL and network errors
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        console.error(`[GraphQL Error]:`, err.message);
        // Handle UNAUTHENTICATED errors (token expired/invalid)
        if (err.extensions?.code === 'UNAUTHENTICATED') {
          document.cookie = 'auth_token=; path=/; max-age=0';
          document.cookie = 'auth_user=; path=/; max-age=0';
          window.dispatchEvent(new Event('auth_error'));
        }
      }
    }
    if (networkError?.statusCode === 401) {
      // Clear auth cookies on 401
      document.cookie = 'auth_token=; path=/; max-age=0';
      document.cookie = 'auth_user=; path=/; max-age=0';
      window.dispatchEvent(new Event('auth_error'));
    }
  });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]), // Order matters: error -> auth -> http
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            products: {
              keyArgs: ['search', 'tagSlug', 'isVisible'],
              merge(existing, incoming, { args }) {
                // Pagination: append new items to existing
                if (!args?.skip || args.skip === 0) return incoming;
                return { ...incoming, items: [...(existing?.items || []), ...(incoming?.items || [])] };
              },
            },
          },
        },
      },
    }),
  });
}

export function ApolloProvider({ children }) {
  const client = useMemo(() => createApolloClient(), []);
  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}
```

### Provider Hierarchy

Providers are set up in `src/components/Providers.tsx`:

```tsx
// src/components/Providers.tsx
export function Providers({ children }) {
  return (
    <ErrorBoundary>
      <AuthProvider>        {/* Auth context for user state */}
        <ApolloProvider>   {/* GraphQL client */}
          {children}
        </ApolloProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

---

## Environment Variables

### Required Variables

Create a `.env.local` file based on `.env.example`:

```env
# Frontend URL (used for sitemaps, SEO)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# GraphQL Backend Endpoint
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

### Variable Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Your frontend URL for SEO/sitemaps | `http://localhost:3000` |
| `NEXT_PUBLIC_GRAPHQL_URL` | GraphQL backend endpoint | `http://localhost:4000/graphql` |

---

## Authentication Flow

### Token Storage

The JWT token is stored in two places:

1. **localStorage** (`auth_token`) - Used by Apollo Client for API requests
2. **Cookies** (`auth_token`, `auth_user`) - Used for SSR and admin auth

```tsx
// Token is stored on login
localStorage.setItem('auth_token', response.token);
document.cookie = `auth_user=${JSON.stringify(userData)}; path=/; max-age=86400`;
```

### Token Sending in Requests

Apollo Client automatically attaches the token to every GraphQL request via the `authLink`:

```tsx
const authLink = setContext(async (_, { headers }) => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});
```

This sends requests like:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Auth Context (`useAuth` hook)

The `useAuth` hook in `src/hooks/useAuth.tsx` provides authentication state:

```tsx
// src/hooks/useAuth.tsx
interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshSession: () => void;
}

// Usage in a component
function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (isAuthenticated) {
    return <div>Welcome, {user.firstName}!</div>;
  }
}
```

### Logout Flow

```tsx
const logout = useCallback(async () => {
  // 1. Call backend logout endpoint
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  
  // 2. Clear local storage
  document.cookie = 'auth_token=; path=/; max-age=0';
  document.cookie = 'auth_user=; path=/; max-age=0';
  localStorage.removeItem('auth_token');
  
  // 3. Update state
  setUser(null);
}, []);
```

---

## CSRF Token Handling

CSRF protection is implemented in `src/lib/csrf.ts`.

### How It Works

1. **Generation**: Server generates a CSRF token on login
2. **Storage**: Token stored in an HttpOnly cookie (`csrf_token`)
3. **Validation**: Client sends token in `x-csrf-token` header

### Server-Side Functions

```tsx
// src/lib/csrf.ts

// Generate a random CSRF token
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

// Set CSRF cookie
export function setCSRFCookie(token: string) {
  cookies().set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

// Validate token from request
export function validateCSRF(request: NextRequest): boolean {
  const cookieToken = cookies().get('csrf_token')?.value;
  const headerToken = request.headers.get('x-csrf-token');
  
  if (!cookieToken || !headerToken) return false;
  
  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) return false;
  
  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }
  return result === 0;
}
```

### Client-Side Usage

For internal API routes (admin auth, etc.), the CSRF validation is automatic via `validateCSRF(request)`. External GraphQL requests use the JWT token for authentication instead.

---

## Key GraphQL Operations

All GraphQL operations are defined in `src/lib/graphql/queries.ts`.

### Authentication Mutations

```graphql
# Customer Login
mutation CustomerLogin($input: CustomerLoginInput!) {
  customerLogin(input: $input) {
    token
    customer { id email firstName lastName }
  }
}

# Customer Register
mutation CustomerRegister($input: CustomerRegisterInput!) {
  customerRegister(input: $input) {
    token
    customer { id email firstName lastName }
  }
}

# Admin Login
mutation AdminLogin($input: AdminLoginInput!) {
  adminLogin(input: $input) {
    token
    user { id email firstName lastName role tenantId }
  }
}
```

### Product Queries

```graphql
# Get products with pagination and filtering
query GetProducts($search: String, $tagSlug: String, $isVisible: Boolean, $take: Int, $skip: Int) {
  products(search: $search, tagSlug: $tagSlug, isVisible: $isVisible, take: $take, skip: $skip) {
    items { id name slug description basePrice images { url altText } variants { name price } }
    count
  }
}

# Get single product
query GetProduct($id: String!) {
  product(id: $id) { id name slug description basePrice }
}
```

### Cart Operations

```graphql
# Get user's cart
query GetMyCart {
  myCart {
    id
    items { productId variantId name price quantity imageUrl }
    totalItems
    totalAmount
  }
}

# Add item to cart
mutation AddToCart($input: AddToCartInput!) {
  addToCart(input: $input) {
    id items { name price quantity } totalAmount
  }
}

# Checkout
mutation Checkout($input: CheckoutInput!) {
  checkout(input: $input) {
    preferenceId
    initPoint
    totalAmount
  }
}
```

### Order Queries

```graphql
# Get user's orders
query GetMyOrders {
  myOrders {
    id status paymentStatus totalAmount createdAt
    items { id name price quantity total }
  }
}

# Get order by ID
query GetOrder($id: String!) {
  order(id: $id) {
    id status paymentStatus totalAmount guestEmail createdAt
    items { id name price quantity total }
  }
}
```

### Admin Operations

```graphql
# Admin metrics dashboard
query GetAdminMetrics {
  adminMetrics {
    totalOrders pendingOrders totalCustomers totalProducts
    revenueToday revenueThisMonth avgOrderValue
    ordersByStatus { status count }
    ordersByPayment { paymentStatus count }
  }
}

# Create product
mutation CreateProduct($input: CreateProductInput!) {
  createProduct(input: $input) {
    id name slug description sku basePrice isActive isVisible
  }
}

# Update order status
mutation UpdateOrderStatus($id: String!, $input: UpdateOrderStatusInput!) {
  updateOrderStatus(id: $id, input: $input) {
    id status paymentStatus
  }
}
```

---

## Example API Calls

### Using Apollo Client (GraphQL)

```tsx
// src/app/catalog/CatalogClient.tsx
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/lib/graphql/queries';
import { adaptProduct } from '@/lib/graphql/adapters';

function ProductCatalog() {
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { isVisible: true, take: 12, skip: 0 },
    fetchPolicy: 'cache-first',
  });

  if (loading) return <ProductGridSkeleton />;
  if (error) return <div>Error loading products</div>;

  const products = data?.products?.items?.map(adaptProduct) || [];

  return <ProductGrid products={products} />;
}
```

### Using Apollo Client (Mutations)

```tsx
import { useMutation } from '@apollo/client';
import { ADD_TO_CART, GET_MY_CART } from '@/lib/graphql/queries';

function AddToCartButton({ productId, variantId }) {
  const [addToCart, { loading }] = useMutation(ADD_TO_CART, {
    refetchQueries: [{ query: GET_MY_CART }], // Refresh cart after add
    awaitRefetchQueries: true,
  });

  const handleAdd = async () => {
    try {
      await addToCart({
        variables: {
          input: { productId, variantId, quantity: 1 }
        }
      });
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <button onClick={handleAdd} disabled={loading}>
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

### Using Native Fetch (REST API)

```tsx
// Admin login using fetch (not GraphQL)
async function login(email: string, password: string) {
  const res = await fetch('/api/admin-auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': getCSRFToken(), // CSRF token from cookie
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Include cookies
  });

  if (!res.ok) {
    throw new Error('Login failed');
  }

  const data = await res.json();
  
  // Store token for Apollo Client
  localStorage.setItem('auth_token', data.session.access_token);
  
  return data;
}
```

### Using the Auth Hook

```tsx
// src/components/Header.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/catalog">Catalog</Link>
        <Link href="/cart">Cart</Link>
        
        {isAuthenticated ? (
          <>
            <span>Hello, {user.firstName}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│                    (Next.js + Apollo)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │ AuthProvider │    │ApolloProvider│    │  useAuth()  │    │
│  │  (Cookies)   │    │ (localStorage)│   │   Hook      │    │
│  └──────┬──────┘    └──────┬──────┘    └─────────────┘    │
│         │                  │                               │
│         │                  │                               │
│         ▼                  ▼                               │
│  ┌─────────────────────────────────────────────┐           │
│  │              Apollo Client                  │           │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │           │
│  │  │errorLink │→│ authLink │→│ httpLink │    │           │
│  │  │(errors)  │ │(Bearer) │ │(GraphQL) │    │           │
│  │  └──────────┘ └──────────┘ └──────────┘    │           │
│  └─────────────────────────────────────────────┘           │
│                          │                                 │
└──────────────────────────┼─────────────────────────────────┘
                           │ HTTP + JWT
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│                  (GraphQL + Node.js)                         │
│                   localhost:4000/graphql                     │
└─────────────────────────────────────────────────────────────┘
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/graphql/provider.tsx` | Apollo Client configuration |
| `src/lib/graphql/queries.ts` | All GraphQL query/mutation definitions |
| `src/lib/graphql/types.ts` | TypeScript types for GraphQL responses |
| `src/lib/graphql/adapters.ts` | Transform GraphQL data to app models |
| `src/lib/csrf.ts` | CSRF token generation/validation |
| `src/hooks/useAuth.tsx` | Authentication context and hook |
| `src/components/Providers.tsx` | Provider composition |
| `.env.example` | Environment variables template |
