import '@testing-library/jest-dom'
import { vi } from 'vitest'

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

vi.mock('@/lib/store', () => {
  const state = {
    items: [],
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

  const wishlistState = {
    items: [] as Array<{ id: string }>,
    toggleItem: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    isInWishlist: vi.fn(() => false),
  }

  const hydrationState = {
    isHydrated: true,
    isCartHydrated: true,
    isWishlistHydrated: true,
    isRecentlyViewedHydrated: true,
  }

  return {
    useCartStore: vi.fn(() => state),
    useWishlistStore: vi.fn(() => wishlistState),
    useHydrationStore: vi.fn(() => hydrationState),
    useRecentlyViewedStore: vi.fn(() => ({
      products: [],
      addProduct: vi.fn(),
      clearRecent: vi.fn(),
    })),
    WEIGHTS: [100, 250, 500, 1000],
    calculatePrice: vi.fn((price: number) => price),
  }
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

window.scrollTo = vi.fn()

global.fetch = vi.fn()
