# Frontend-Backend Connection Documentation

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TINKUY STACK                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────┐         ┌─────────────────────────────────┐  │
│   │   FRONTEND (Next.js)    │         │     BACKEND (GraphQL Server)    │  │
│   │   localhost:3000        │         │     localhost:4000               │  │
│   │                         │         │                                 │  │
│   │  ┌─────────────────┐  │   HTTP   │  ┌─────────────────────────────┐│  │
│   │  │  Apollo Client  │───────────────│▶│    Apollo Server             ││  │
│   │  └─────────────────┘  │  /graphql │  │    - GraphQL Schema         ││  │
│   │  ┌─────────────────┐  │         │  │    - Resolvers               ││  │
│   │  │  Zustand Store  │  │         │  │    - Context (auth, tenant)   ││  │
│   │  │  (Cart State)   │  │         │  └─────────────────────────────┘│  │
│   │  └─────────────────┘  │         │              │                   │  │
│   │  ┌─────────────────┐  │         │              ▼                   │  │
│   │  │  Auth Provider  │  │         │  ┌─────────────────────────────┐│  │
│   │  │  (React Context)│  │         │  │     Modules (Logic)         ││  │
│   │  └─────────────────┘  │         │  │  - auth/  - cart/          ││  │
│   │         │             │         │  │  - checkout/ - orders/     ││  │
│   │         ▼             │         │  │  - catalog/  - tenants/    ││  │
│   │  ┌─────────────────┐  │         │  └─────────────────────────────┘│  │
│   │  │  localStorage   │  │         │              │                   │  │
│   │  │  - auth_token   │  │         │              ▼                   │  │
│   │  │  Cookies:      │  │         │  ┌─────────────────────────────┐│  │
│   │  │  - auth_token  │  │         │  │      Data Layer            ││  │
│   │  │  - auth_user   │  │         │  │  ┌─────────┐  ┌─────────┐  ││  │
│   │  └─────────────────┘  │         │  │  │Prisma  │  │  Redis  │  ││  │
│   └─────────────────────────┘         │  │  │(Postgres│  │ (Cache) │  ││  │
│                                       │  │  └─────────┘  └─────────┘  ││  │
│   ┌─────────────────────────┐         │  └─────────────────────────────┘│  │
│   │   MercadoPago           │         └─────────────────────────────────┘  │
│   │   (Payment Provider)    │                       │                     │
│   │        ▲                │                       │ Webhook             │
│   │        │                │                       ◀────────────────────  │
│   └────────┼─────────────────┘                       │                     │
│            │                                        │                     │
│            ▼                                        ▼                     │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                     PAYMENT FLOW (async)                            │  │
│   │  1. Frontend calls checkout mutation                                 │  │
│   │  2. Backend creates MercadoPago preference                           │  │
│   │  3. Frontend redirects to MercadoPago                                │  │
│   │  4. User pays on MercadoPago                                         │  │
│   │  5. MercadoPago calls backend webhook                                │  │
│   │  6. Backend creates order, clears cart                               │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. GraphQL over HTTP Explained

### Request Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         GRAPHQL REQUEST FLOW                             │
└──────────────────────────────────────────────────────────────────────────┘

1. Frontend                          2. Apollo Client                  3. Backend
   ┌─────────────┐                      ┌──────────────┐                  ┌──────────────┐
   │ React/Next │                      │ add Authorization              │ Apollo       │
   │ Component  │                      │ header with JWT                │ Server       │
   │             │                      │                                 │              │
   │ useQuery/   │──useMutation()──▶│ from localStorage──▶│ POST /graphql  │
   │             │                      │                                 │              │
   │             │◀──Apollo Cache◀──│ return data + update◀│ JSON Response│
   │             │                      │ cache                           │              │
   └─────────────┘                      └──────────────────────────────────┘
```

### GraphQL Request Format

```typescript
// Mutation: Customer Login
POST http://localhost:4000/graphql
Content-Type: application/json

{
  "query": `
    mutation CustomerLogin($input: CustomerLoginInput!) {
      customerLogin(input: $input) {
        token
        customer {
          id
          email
          firstName
          lastName
        }
      }
    }
  `,
  "variables": {
    "input": {
      "email": "user@example.com",
      "password": "password123",
      "tenantId": "tenant-uuid"
    }
  }
}
```

### Apollo Client Setup (Frontend)

```typescript
// src/lib/graphql/provider.tsx
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

function createApolloClient() {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  });

  // Attach JWT token to every request
  const authLink = setContext(async (_, { headers }) => {
    const token = localStorage.getItem('auth_token');
    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  // Handle GraphQL errors (including auth errors)
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.extensions?.code === 'UNAUTHENTICATED') {
          // Clear auth cookies on 401
          document.cookie = 'auth_token=; path=/; max-age=0';
          document.cookie = 'auth_user=; path=/; max-age=0';
          window.dispatchEvent(new Event('auth_error'));
        }
      }
    }
  });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });
}
```

### Backend GraphQL Context

```typescript
// src/graphql/context.ts
export async function createContext({ req }: { req: Request }): Promise<Context> {
  // 1. Extract token from Authorization header
  const token = extractToken(req); // Bearer <token>

  // 2. Verify token and build user context
  let user: UserContext | null = null;
  if (token) {
    try {
      const payload = await verifyToken(token);
      user = buildUserContext(payload);
    } catch (err) {
      user = null; // Invalid token
    }
  }

  // 3. Extract tenant ID (from token or header)
  const headerTenantId = req.headers["x-tenant-id"] as string | undefined;
  let tenantId: string | null = null;

  if (user) {
    tenantId = user.tenantId; // Prefer token's tenant
  } else {
    tenantId = headerTenantId ?? getTenantId() ?? null; // Fall back to header
  }

  return { req, user, tenantId, stockLoader };
}
```

---

## 2. Authentication End-to-End Flow

### Login Flow (Customer)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER LOGIN FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

1. User enters email/password
          │
          ▼
2. Frontend calls GraphQL mutation
   ┌────────────────────────────────────────────────────────┐
   │ POST /graphql                                          │
   │ {                                                      │
   │   "query": "mutation CustomerLogin($input:...) {...}", │
   │   "variables": { "input": { email, password, tenantId } }│
   │ }                                                      │
   └────────────────────────────────────────────────────────┘
          │
          ▼
3. Backend validates credentials
   ┌────────────────────────────────────────────────────────┐
   │ auth/service.ts: customerLogin()                       │
   │  - Find customer by tenantId + email                   │
   │  - Compare bcrypt hash                                │
   │  - Return JWT token                                   │
   └────────────────────────────────────────────────────────┘
          │
          ▼
4. Backend returns token + user data
   ┌────────────────────────────────────────────────────────┐
   │ {                                                      │
   │   "data": {                                           │
   │     "customerLogin": {                                │
   │       "token": "eyJhbGciOiJIUzI1NiIs...",            │
   │       "customer": { id, email, firstName, lastName }  │
   │     }                                                  │
   │   }                                                    │
   │ }                                                      │
   └────────────────────────────────────────────────────────┘
          │
          ▼
5. Frontend stores token + user
   ┌────────────────────────────────────────────────────────┐
   │ localStorage.setItem('auth_token', token)              │
   │ Cookies: auth_token=<token>; auth_user=<user JSON>    │
   └────────────────────────────────────────────────────────┘
          │
          ▼
6. Subsequent requests include token
   ┌────────────────────────────────────────────────────────┐
   │ Authorization: Bearer eyJhbGciOiJIUzI1NiIs...         │
   └────────────────────────────────────────────────────────┘
```

### Code Examples

**Frontend Login Mutation:**

```typescript
// src/lib/graphql/queries.ts
export const CUSTOMER_LOGIN = gql`
  mutation CustomerLogin($input: CustomerLoginInput!) {
    customerLogin(input: $input) {
      token
      customer {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

// Usage in component
const [login] = useMutation(CUSTOMER_LOGIN);

await login({
  variables: {
    input: {
      email: 'user@example.com',
      password: 'password123',
      tenantId: 'my-tenant-id'
    }
  }
});
```

**Backend Login Handler:**

```typescript
// src/modules/auth/service.ts
export async function customerLogin(input: {
  email: string;
  password: string;
  tenantId: string;
}) {
  // 1. Find customer
  const customer = await prisma.customer.findUnique({
    where: { tenantId_email: { tenantId: input.tenantId, email: input.email } },
  });

  if (!customer || !customer.isActive) {
    throw new AuthenticationError("Invalid credentials");
  }

  // 2. Verify password
  const valid = await bcrypt.compare(input.password, customer.password);
  if (!valid) {
    throw new AuthenticationError("Invalid credentials");
  }

  // 3. Create JWT payload
  const payload: CustomerTokenPayload = {
    sub: customer.id,
    role: "customer",
    tenantId: customer.tenantId,
  };

  // 4. Return signed token
  return {
    token: signCustomerToken(payload), // JWT signed with customer secret
    customer: { id, email, firstName, lastName }
  };
}
```

### JWT Token Structure

```typescript
// Admin Token (24h expiry)
interface AdminTokenPayload {
  sub: string;        // adminUserId
  role: "admin" | "manager";
  tenantId: string;
  branchId?: string;
}

// Customer Token (7d expiry)
interface CustomerTokenPayload {
  sub: string;        // customerId
  role: "customer";
  tenantId: string;
}
```

### Subsequent Authenticated Requests

```typescript
// Every GraphQL request after login:
POST /graphql
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "query": "query GetMyOrders { myOrders { ... } }"
}

// Backend extracts and validates token in context.ts
// If valid, ctx.user contains the user context
// If invalid/expired, ctx.user is null
```

### Logout Flow

```typescript
// Frontend calls logout API
await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

// API clears cookies
// Frontend also clears localStorage
localStorage.removeItem('auth_token');
```

---

## 3. Cart and Checkout Flow

### Cart Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CART DATA FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐    ┌─────────────────────────────────────┐
│      FRONTEND (Zustand)         │    │      BACKEND (Redis/Postgres)        │
│                                 │    │                                     │
│  useCartStore (Zustand)         │    │  Cart Keys:                         │
│  ┌───────────────────────────┐  │    │  - cart:${tenantId}:${cartId}       │
│  │ items: CartItem[]         │  │    │    (guest cart)                      │
│  │ isOpen: boolean           │  │    │  - cart:${tenantId}:user:${userId}  │
│  │ isLoading: boolean        │  │    │    (authenticated cart)             │
│  └───────────────────────────┘  │    │                                     │
│            │                     │    │  Redis TTL: 24 hours                │
│            │ sync                │    │  Fallback: LRU memory cache         │
│            ▼                     │    │                                     │
│  syncCartStoreFromGraphQL()      │    │                                     │
│                                 │    │                                     │
└─────────────────────────────────┘    └─────────────────────────────────────┘

Cart Operations:
1. addToCart()    → GraphQL mutation → Backend adds item to Redis
2. updateQuantity() → GraphQL mutation → Backend updates Redis
3. removeFromCart() → GraphQL mutation → Backend removes from Redis
4. clearCart()    → GraphQL mutation → Backend deletes from Redis
```

### Adding Item to Cart

```typescript
// Frontend: User clicks "Add to Cart"
const product = { id: 'prod-123', name: 'Organic Honey', price: 1500 };

// 1. Update local Zustand store immediately (optimistic)
useCartStore.getState().addItem(product, 1, 250);

// 2. Sync to backend via GraphQL
const [addToCart] = useMutation(ADD_TO_CART);
await addToCart({
  variables: {
    input: {
      cartId: guestCartId,  // UUID for guests, userId for authenticated
      productId: 'prod-123',
      name: 'Organic Honey',
      price: 1500,
      quantity: 1,
      weight: 250
    }
  }
});
```

### Backend Cart Storage

```typescript
// src/modules/cart/service.ts

// Cart stored in Redis with key format
function cartKey(cartId: string, tenantId: string): string {
  return `cart:${tenantId}:${cartId}`;  // e.g., cart:tenant-abc:cart-uuid
}

function userCartKey(userId: string, tenantId: string): string {
  return `cart:${tenantId}:user:${userId}`;  // e.g., cart:tenant-abc:user:user-123
}

// Redis structure
// cart:tenant-abc:cart-uuid = {
//   "id": "cart-uuid",
//   "items": [
//     { "productId": "prod-123", "name": "Organic Honey", "price": 1500, "quantity": 1, ... }
//   ],
//   "totalItems": 1,
//   "totalAmount": 1500
// }
```

### Checkout Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CHECKOUT FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

1. User reviews cart
          │
          ▼
2. Frontend calls checkout mutation
   ┌──────────────────────────────────────────────────────────────┐
   │ mutation Checkout($input: CheckoutInput!) {                  │
   │   checkout(input: $input) {                                 │
   │     preferenceId, initPoint, sandboxInitPoint, totalAmount  │
   │   }                                                         │
   │ }                                                           │
   └──────────────────────────────────────────────────────────────┘
          │
          ▼
3. Backend creates MercadoPago preference
   ┌──────────────────────────────────────────────────────────────┐
   │ checkout/service.ts: createCheckout()                        │
   │ - Validate cart items & prices                               │
   │ - Validate stock availability                                │
   │ - Create MercadoPago preference                             │
   │ - Store cart snapshot for webhook                           │
   └──────────────────────────────────────────────────────────────┘
          │
          ▼
4. Backend returns payment URL
   ┌──────────────────────────────────────────────────────────────┐
   │ {                                                            │
   │   "data": {                                                  │
   │     "checkout": {                                            │
   │       "preferenceId": "123456789",                          │
   │       "initPoint": "https://www.mercadopago.com/...",       │
   │       "sandboxInitPoint": "https://sandbox.mercadopago/..."│
   │     }                                                        │
   │   }                                                          │
   │ }                                                            │
   └──────────────────────────────────────────────────────────────┘
          │
          ▼
5. Frontend redirects user to MercadoPago
   window.location.href = initPoint;

6. User completes payment on MercadoPago
          │
          ▼
7. MercadoPago redirects back to frontend
   GET /checkout/success?payment_id=123456789
          │
          ▼
8. MercadoPago sends webhook to backend (async)
   POST /webhooks/mercadopago
          │
          ▼
9. Backend processes payment
   ┌──────────────────────────────────────────────────────────────┐
   │ webhook.handler.ts: processWebhookWithTimeout()              │
   │ - Verify webhook signature                                    │
   │ - Check payment status                                        │
   │ - Create order in database                                   │
   │ - Clear cart                                                 │
   └──────────────────────────────────────────────────────────────┘
```

### Checkout Code

```typescript
// Frontend checkout call
const [checkout] = useMutation(CHECKOUT);

const result = await checkout({
  variables: {
    input: {
      cartId: 'cart-uuid-or-user-id',
      branchId: 'branch-uuid',
      guestEmail: 'guest@example.com'  // for guest checkout
    }
  }
});

// Redirect to MercadoPago
if (result.data?.checkout.initPoint) {
  window.location.href = result.data.checkout.initPoint;
}
```

```typescript
// Backend checkout mutation
builder.mutationField("checkout", (t) =>
  t.field({
    type: CheckoutResult,
    args: { input: t.arg({ type: CheckoutInput, required: true }) },
    authScopes: { public: true },  // Public - guests can checkout
    resolve: async (_parent, { input }, ctx) => {
      // 1. Get cart (guest or user)
      const cart = isUserCart
        ? await getUserCart(input.cartId, tenantId)
        : await getGuestCart(input.cartId, tenantId);

      // 2. Validate stock
      const stockCheck = await validateCartStock(cart, branchId, tenantId);
      if (!stockCheck.valid) throw new ValidationError(stockCheck.errors.join("; "));

      // 3. Create MercadoPago preference
      const preference = await createPreference({
        items: cart.items.map(item => ({
          id: item.variantId ?? item.productId,
          title: item.name,
          unit_price: item.price,
          quantity: item.quantity,
        })),
        external_reference: `${tenantId}:${branchId}:${cartId}:${isUserCart ? "user" : "guest"}:${customerId}`,
        notification_url: webhookUrl,
        back_urls: {
          success: `${frontendUrl}/checkout/success`,
          failure: `${frontendUrl}/checkout/failure`,
          pending: `${frontendUrl}/checkout/pending`,
        },
      });

      // 4. Store validated cart snapshot (for webhook)
      await storeValidatedCartSnapshot(cart, tenantId, branchId, preference.id);

      return preference;
    },
  })
);
```

---

## 4. MercadoPago Webhook Integration

### Webhook Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MERCADOPAGO WEBHOOK FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐                                              ┌─────────────┐
│ MercadoPago │                                              │   Backend    │
│   Server    │                                              │   /webhooks  │
└─────────────┘                                              └─────────────┘
       │                                                             │
       │  POST /webhooks/mercadopago                                 │
       │  Content-Type: application/json                             │
       │  x-signature: t=123456789,v1=abc123...                      │
       │                                                             │
       │  {                                                         │
       │    "type": "payment",                                      │
       │    "data": { "id": "payment-123" }                         │
       │  }                                                         │
       │───────────────────────────────────────────────────────────▶│
       │                                                             │
       │                                                             │ 1. Verify signature
       │                                                             │    HMAC-SHA256
       │                                                             │
       │                                                             │ 2. Check if already
       │                                                             │    processed (idempotency)
       │                                                             │
       │                                                             │ 3. Fetch payment from
       │                                                             │    MercadoPago API
       │                                                             │
       │                                                             │ 4. If approved:
       │                                                             │    - Create order
       │                                                             │    - Clear cart
       │                                                             │
       │◀───────────────────────────────────────────────────────────│
       │  200 OK                                                    │
       │                                                             │
       └─────────────────────────────────────────────────────────────

External Reference Format:
${tenantId}:${branchId}:${cartId}:${cartType}:${customerId}
Example: "tenant-abc:branch-123:cart-xyz:guest:"

Cart Type: "user" or "guest"
```

### Webhook Handler Code

```typescript
// src/modules/checkout/webhook.handler.ts

async function processWebhookWithTimeout(req: Request, res: Response) {
  // 1. Verify signature
  const signature = req.headers["x-signature"] as string;
  const isValid = verifyMercadoPagoSignature(rawPayload, signature, MP_WEBHOOK_SECRET);

  if (!isValid) {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  const { type, data } = payload;

  if (type !== "payment") {
    return res.status(400).json({ error: "Only payment events are supported" });
  }

  // 2. Idempotency check
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { source_eventId: { source: "mercadopago", eventId: paymentId } },
  });

  if (existingEvent?.processed) {
    return res.status(200).json({ message: "Already processed" });
  }

  // 3. Fetch payment details from MercadoPago
  const mpPayment = await fetchPaymentFromMP(paymentId);

  // 4. Process if approved
  if (mpPayment.status === "approved") {
    await processApprovedPayment(payload, mpPayment);
  }

  return res.status(200).json({ received: true });
}

async function processApprovedPayment(payload: any, mpPayment: any) {
  // Parse external reference to get cart info
  const [tenantId, branchId, cartId, cartType, customerId] =
    mpPayment.external_reference.split(":");

  // Get stored cart snapshot
  const snapshot = await getValidatedCartSnapshot(preferenceId, tenantId);

  // Create order
  await createOrderFromCheckout({
    tenantId,
    branchId,
    customerId: cartType === "user" ? customerId : undefined,
    guestEmail: mpPayment.payer?.email,
    paymentId,
    preferenceId,
    items: snapshot.cart.items,
    totalAmount: snapshot.cart.totalAmount,
  });

  // Clear cart
  await clearCart(cartId, tenantId, cartType === "user");
  await clearValidatedCartSnapshot(preferenceId, tenantId);
}
```

---

## 5. Tenant Isolation

### How Tenant Isolation Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TENANT ISOLATION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

1. Request arrives at backend
          │
          ▼
2. Extract tenant ID (priority order):
   ┌──────────────────────────────────────────────────────────────┐
   │  a) From JWT token's tenantId claim (authenticated users)    │
   │  b) From x-tenant-id HTTP header (guest requests)            │
   │  c) From AsyncLocalStorage (set by middleware)                │
   └──────────────────────────────────────────────────────────────┘
          │
          ▼
3. Store tenant in AsyncLocalStorage for the request lifecycle
   ┌──────────────────────────────────────────────────────────────┐
   │  tenantStorage.run({ tenantId }, () => {                     │
   │    // All async operations here share the same tenantId       │
   │    resolve();                                                 │
   │  });                                                          │
   └──────────────────────────────────────────────────────────────┘
          │
          ▼
4. All database queries include tenantId filter
   ┌──────────────────────────────────────────────────────────────┐
   │  // Every Prisma query includes tenantId                     │
   │  prisma.product.findMany({                                   │
   │    where: { tenantId: context.tenantId, ... }                │
   │  });                                                         │
   │                                                              │
   │  prisma.customer.findUnique({                                │
   │    where: { tenantId_email: { tenantId, email } }            │
   │  });                                                         │
   └──────────────────────────────────────────────────────────────┘
          │
          ▼
5. Cart keys are prefixed with tenantId
   ┌──────────────────────────────────────────────────────────────┐
   │  cart:tenant-abc:cart-uuid  (guest cart)                    │
   │  cart:tenant-abc:user:user-123  (user cart)                 │
   └──────────────────────────────────────────────────────────────┘
```

### Tenant Context Implementation

```typescript
// src/lib/tenant-context.ts
import { AsyncLocalStorage } from "async_hooks";

interface TenantContext {
  tenantId: string | null;
}

const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function getTenantId(): string | null {
  const store = tenantStorage.getStore();
  return store?.tenantId ?? null;
}

export async function runWithTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
  return tenantStorage.run({ tenantId }, fn);
}

// Backend middleware sets tenant from JWT or header
// src/index.ts
app.use((req, _res, next) => {
  let tenantId: string | null = null;

  const auth = req.headers.authorization;
  if (auth) {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, secret) as { tenantId?: string };
    if (decoded?.tenantId) {
      tenantId = decoded.tenantId;
    }
  }

  if (!tenantId) {
    tenantId = req.headers["x-tenant-id"] as string;
  }

  if (tenantId) {
    runWithTenantSync(tenantId, next);
  } else {
    next();
  }
});
```

### Tenant Isolation Guarantees

1. **Database Level**: Every table has a `tenantId` column. All queries filter by it.
2. **Cache Level**: Redis keys include tenantId prefix.
3. **Auth Level**: JWT tokens contain tenantId, verified on every request.
4. **API Level**: The `x-tenant-id` header allows tenant-specific access for guests.

---

## 6. Cookie vs localStorage for Auth

### Storage Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTH STORAGE COMPARISON                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┬───────────────────────────────────────────────────────┐
│      localStorage   │  Purpose: GraphQL API calls                            │
│                     │  Key: auth_token                                      │
│  ┌───────────────┐  │  ┌───────────────────────────────────────────────┐  │
│  │ auth_token    │  │  │ Why localStorage?                              │  │
│  │ (JWT string)  │  │  │ - Apollo Client reads it for every request    │  │
│  └───────────────┘  │  │ - Accessible by JavaScript (no httpOnly)     │  │
│                     │  │ - Survives page refresh                        │  │
│                     │  │ - No automatic sending with HTTP requests     │  │
│                     │  └───────────────────────────────────────────────┘  │
│                     │                                                       │
│                     │  ┌───────────────────────────────────────────────┐  │
│                     │  │ Apollo Client Auth Link:                      │  │
│                     │  │ const authLink = setContext(async (_, ctx) => {│  │
│                     │  │   const token = localStorage.getItem('auth_token');│
│                     │  │   return { headers: { Authorization: `Bearer ${token}` }};│
│                     │  │ });                                            │  │
│                     │  └───────────────────────────────────────────────┘  │
├─────────────────────┼───────────────────────────────────────────────────────┤
│      Cookies        │  Purpose: SSR session, middleware auth check         │
│                     │  Keys: auth_token, auth_user                          │
│  ┌───────────────┐  │  ┌───────────────────────────────────────────────┐  │
│  │ auth_token    │  │  │ Why Cookies?                                   │  │
│  │ auth_user     │  │  │ - Next.js middleware can read them             │  │
│  │ (JSON)        │  │  │ - Sent automatically with server-side requests │  │
│  └───────────────┘  │  │ - Can be httpOnly for extra security           │  │
│                     │  │ - Used for SSR session validation               │  │
│                     │  └───────────────────────────────────────────────┘  │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION DATA FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

1. LOGIN
   GraphQL Mutation                          Response Handler
   ┌────────────────────┐                    ┌────────────────────────────────┐
   │ customerLogin()    │──────────────────▶│ 1. Store in localStorage      │
   │                   │                    │    localStorage.setItem(       │
   │                   │                    │      'auth_token', token)      │
   │                   │                    │                                │
   │                   │                    │ 2. Set auth cookies (SSR)      │
   │                   │                    │    response.cookies.set({     │
   │                   │                    │      name: 'auth_token',      │
   │                   │                    │      value: token, ...         │
   │                   │                    │    });                        │
   │                   │                    │    response.cookies.set({     │
   │                   │                    │      name: 'auth_user',        │
   │                   │                    │      value: JSON.stringify(user)│
   └────────────────────┘                    └────────────────────────────────┘

2. SUBSEQUENT REQUESTS (GraphQL)
   Apollo Client                     Backend
   ┌────────────────────┐           ┌────────────────────────────────────────┐
   │ authLink reads     │           │ context.ts:                            │
   │ localStorage.getItem─────────▶ │ extractToken(req)                       │
   │ ('auth_token')     │  Bearer   │ - Authorization: Bearer <token>        │
   │                    │  Header   │ verifyToken(token) → user context     │
   └────────────────────┘           └────────────────────────────────────────┘

3. SSR/AUTH CHECKS (middleware.ts)
   Next.js Middleware              useAuth() Hook
   ┌────────────────────┐          ┌────────────────────────────────────────┐
   │ read cookies       │          │ AuthProvider:                           │
   │ auth_token         │─────────▶│ checkSession() {                        │
   │ auth_user          │  Cookie  │   const token = getCookieValue(        │
   │                    │  Header  │     'auth_token');                     │
   │                    │          │   const user = getCookieValue(         │
   │                    │          │     'auth_user');                       │
   └────────────────────┘          │   setUser(parse(user));                 │
                                   └────────────────────────────────────────┘

4. LOGOUT
   ┌────────────────────────────────────────────────────────────────────────┐
   │ 1. Fetch /api/auth/logout (cookies sent automatically)                │
   │ 2. Server clears cookies                                               │
   │ 3. Frontend clears localStorage                                        │
   │    localStorage.removeItem('auth_token');                             │
   │ 4. Apollo Client error link clears cookies on 401                     │
   └────────────────────────────────────────────────────────────────────────┘
```

### Auth Error Handling

```typescript
// Apollo Client error link handles auth errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Handle UNAUTHENTICATED errors
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        // Clear localStorage
        localStorage.removeItem('auth_token');

        // Clear cookies
        document.cookie = 'auth_token=; path=/; max-age=0';
        document.cookie = 'auth_user=; path=/; max-age=0';

        // Dispatch event for components to react
        window.dispatchEvent(new Event('auth_error'));
      }
    }
  }

  if (networkError) {
    if (networkError.statusCode === 401) {
      // Same cleanup as above
    }
  }
});
```

### Security Considerations

| Aspect | localStorage | Cookies |
|--------|--------------|---------|
| XSS Risk | Vulnerable to XSS attacks reading token | Can be httpOnly (not in this app) |
| CSRF Risk | Not vulnerable | Vulnerable (mitigated with CSRF tokens) |
| Automatic Send | No - must read and attach manually | Yes - sent with every request |
| SSR Access | No - only client-side | Yes - accessible in middleware |
| Size Limit | ~5-10MB | ~4KB per cookie |

This app uses a hybrid approach:
- **localStorage**: Token for GraphQL (via Apollo Client)
- **Cookies**: Token + user data for SSR session and middleware auth checks

---

## Quick Reference: Environment Variables

### Frontend (.env.local)

```bash
# GraphQL Backend
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Backend (.env)

```bash
# JWT Secrets
JWT_ADMIN_SECRET="admin-secret-min-32-chars-long-enough"
JWT_CUSTOMER_SECRET="customer-secret-min-32-chars-long-enough"

# MercadoPago
MP_ACCESS_TOKEN="TEST-xxxx..."
MP_WEBHOOK_SECRET="whsec_..."
MP_MODE="test"

# Frontend URL (for CORS and webhooks)
FRONTEND_URL="http://localhost:3000"

# Server
PORT=4000
```

---

## Common Debugging Tips

1. **GraphQL Requests Failing**: Check browser Network tab for GraphQL POST requests and responses
2. **Auth Issues**: Verify token in localStorage matches what's in cookie
3. **Cart Not Syncing**: Check if tenantId is consistent between frontend and backend
4. **Webhook Failures**: Check backend logs at `/webhooks/mercadopago` endpoint
5. **CORS Errors**: Verify `FRONTEND_URL` in backend matches actual frontend URL
