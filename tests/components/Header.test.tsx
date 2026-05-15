import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/Header'

const mockState = {
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

const mockWishlistState = {
  items: [] as Array<{ id: string }>,
  toggleItem: vi.fn(),
  addItem: vi.fn(),
  removeItem: vi.fn(),
  isInWishlist: vi.fn(() => false),
}

vi.mock('@/lib/store', () => ({
  useCartStore: vi.fn((selector?: (state: typeof mockState) => unknown) => {
    if (selector) return selector(mockState)
    return mockState
  }),
  useWishlistStore: vi.fn((selector?: (state: typeof mockWishlistState) => unknown) => {
    if (selector) return selector(mockWishlistState)
    return mockWishlistState
  }),
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

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders logo and navigation links', () => {
    render(<Header />)
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Tienda')).toBeInTheDocument()
    expect(screen.getByText('Nosotros')).toBeInTheDocument()
  })

  it('has a link to homepage', () => {
    render(<Header />)
    const logoLink = screen.getByRole('link', { name: /tinkuy/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('has search button', () => {
    render(<Header />)
    expect(screen.getByLabelText(/Buscar productos/i)).toBeInTheDocument()
  })

  it('has cart button', () => {
    render(<Header />)
    expect(screen.getByLabelText(/Carrito de compras/i)).toBeInTheDocument()
  })
})
