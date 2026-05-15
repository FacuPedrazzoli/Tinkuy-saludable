import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/ProductCard'

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
  useWishlistStore: vi.fn((selector?: (state: typeof mockState) => unknown) => {
    if (selector) return selector(mockState)
    return mockState
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

  it('displays gluten free tag for gluten free products', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Sin TACC')).toBeInTheDocument()
  })

  it('renders add to cart button', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Agregar al Carrito')).toBeInTheDocument()
  })

  it('shows out of stock when product stock is zero', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)
    expect(screen.getByText('Sin Stock')).toBeInTheDocument()
  })
})
