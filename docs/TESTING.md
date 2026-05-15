# Testing Guide - Tinkuy Frontend

## Test Framework

- **Vitest** - Test runner and assertion library
- **@testing-library/react** - React component testing
- **@testing-library/jest-dom** - DOM assertion matchers
- **jsdom** - Browser environment for Node.js

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run with coverage report
npx vitest run --coverage
```

## Test Directory Structure

```
tests/
├── setup.ts              # Global test setup and mocks
├── components/           # Component tests
│   ├── ProductCard.test.tsx
│   └── Header.test.tsx
└── hooks/                # Hook tests
    └── useAuth.test.ts
```

- Tests live in a top-level `tests/` directory (not inside `src/`)
- Mirror the structure of what you're testing (e.g., `tests/components/Header.test.tsx` tests `src/components/Header.tsx`)

## Writing Component Tests

### Basic Component Test

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/ProductCard'

const mockProduct = {
  id: '1',
  name: 'Test Product',
  slug: 'test-product',
  price: 1000,
  category: 'snacks',
  subcategory: 'nuts',
  stock: 10,
  glutenFree: true,
  vegan: false,
  keto: false,
  images: ['/test-image.jpg'],
}

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getAllByText('$ 1.000')).toHaveLength(2)
  })
})
```

### Mocking Zustand Stores

Components using global stores need mocks:

```tsx
const mockState = {
  items: [] as Array<{ id: string }>,
  isOpen: false,
  isLoading: false,
  toggleCart: vi.fn(),
  addItem: vi.fn(),
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  setCartOpen: vi.fn(),
  setLoading: vi.fn(),
  getTotal: vi.fn(() => 0),
  getItemCount: vi.fn(() => 0),
}

vi.mock('@/lib/store', () => ({
  useCartStore: vi.fn((selector?: (state: typeof mockState) => unknown) => {
    if (selector) return selector(mockState)
    return mockState
  }),
  useWishlistStore: vi.fn(() => ({
    items: [],
    toggleItem: vi.fn(),
    isInWishlist: vi.fn(() => false),
  })),
  useHydrationStore: vi.fn(() => ({
    isHydrated: true,
    isCartHydrated: true,
    isWishlistHydrated: true,
    isRecentlyViewedHydrated: true,
  })),
  useRecentlyViewedStore: vi.fn(() => ({
    products: [],
    addProduct: vi.fn(),
    clearRecent: vi.fn(),
  })),
  WEIGHTS: [100, 250, 500, 1000],
  calculatePrice: vi.fn((price: number) => price),
}))
```

## Writing Hook Tests with AuthProvider

Use a wrapper function to wrap hooks with the provider:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'

const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  tenantId: 'tenant-1',
}

const createWrapper = () => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(AuthProvider, null, children)
  }
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.cookie = ''
    global.fetch = vi.fn()
  })

  it('provides initial loading state', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('returns user from cookie when auth_token exists', () => {
    document.cookie = 'auth_token=valid-token'
    document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(mockUser))}`

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('logout clears user and cookies', async () => {
    document.cookie = 'auth_token=valid-token'
    document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(mockUser))}`

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

## Common Mock Patterns

### Mocking next/navigation

Already configured in `tests/setup.ts`:

```tsx
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```

### Mocking fetch

```tsx
global.fetch = vi.fn()

// In your test:
;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: 'test' }),
})
```

### Mocking window.matchMedia

Already configured in `tests/setup.ts`:

```tsx
window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))
```

### Testing Error Boundaries

```tsx
it('throws error when used outside AuthProvider', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const throwsError = () => {
    const { result } = renderHook(() => useAuth())
    result.current
  }
  expect(throwsError).toThrow('useAuth must be used within an AuthProvider')
  consoleSpy.mockRestore()
})
```

## Current Test Status

```
Test Files  3 passed (3)
     Tests  14 passed (14)
```

### Test Coverage

| File | Tests |
|------|-------|
| `tests/components/ProductCard.test.tsx` | 5 tests |
| `tests/components/Header.test.tsx` | 4 tests |
| `tests/hooks/useAuth.test.ts` | 5 tests |

## Key Conventions

1. **`beforeEach` with `vi.clearAllMocks()`** - Always clear mocks between tests
2. **Use `screen` queries** - Prefer `screen.getByText()` over destructured `getByText`
3. **Use `user-event`** for user interactions when needed (click, type, etc.)
4. **Mock at the module level** with `vi.mock()` for consistent behavior
5. **Wrap hooks with providers** using a `createWrapper` function
6. **Use `act()`** when testing state changes from async operations
