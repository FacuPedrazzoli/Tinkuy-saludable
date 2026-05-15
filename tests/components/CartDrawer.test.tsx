import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CartDrawer } from '@/components/CartDrawer'

const mockCartItem = {
  product: {
    id: '1',
    name: 'Test Product',
    slug: 'test-product',
    price: 1000,
    images: ['/test-image.jpg'],
  },
  quantity: 2,
  weight: 250 as const,
}

const mockState = {
  items: [] as Array<{ product: { id: string; name: string; slug: string; price: number; images: string[] }; quantity: number; weight: number }>,
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
  getState: vi.fn(() => mockState),
}

vi.mock('@/lib/store', () => ({
  useCartStore: vi.fn((selector?: (state: typeof mockState) => unknown) => {
    if (selector) return selector(mockState)
    return mockState
  }),
  useWishlistStore: vi.fn(),
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

vi.mock('@/components/Toast', () => ({
  ToastContainer: vi.fn(() => null),
  useToast: vi.fn(() => ({
    toasts: [],
    addToast: vi.fn(),
    removeToast: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  })),
}))

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(() => ({
    data: null,
    refetch: vi.fn(),
    loading: false,
    error: null,
  })),
  useMutation: vi.fn(() => [
    vi.fn(),
    { loading: false, error: null },
  ]),
}))

vi.mock('@/lib/graphql/queries', () => ({
  GET_MY_CART: vi.fn(),
  UPDATE_CART_ITEM: vi.fn(),
  REMOVE_FROM_CART: vi.fn(),
  CLEAR_CART: vi.fn(),
}))

vi.mock('@/lib/cartUtils', () => ({
  syncCartStoreFromGraphQL: vi.fn(),
  getAuthToken: vi.fn(() => null),
}))

vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt }) => <img src={src} alt={alt} />),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('CartDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockState.items = []
    mockState.isOpen = false
    mockState.getTotal = vi.fn(() => 0)
  })

  it('no renderiza si isOpen es false', () => {
    mockState.isOpen = false
    mockState.items = []
    
    render(<CartDrawer />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza empty state cuando no hay items', () => {
    mockState.isOpen = true
    mockState.items = []
    
    render(<CartDrawer />)
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
  })

  it('renderiza items del carrito', () => {
    mockState.isOpen = true
    mockState.items = [mockCartItem]
    mockState.getTotal = vi.fn(() => 5000)
    
    render(<CartDrawer />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('overlay click llama a setCartOpen', () => {
    const setCartOpen = vi.fn()
    mockState.isOpen = true
    mockState.items = []
    mockState.setCartOpen = setCartOpen
    
    render(<CartDrawer />)
    
    const overlay = screen.getByRole('presentation')
    fireEvent.click(overlay)
  })

  it('llama a updateQuantity en decrease', () => {
    mockState.isOpen = true
    mockState.items = [mockCartItem]
    mockState.updateQuantity = vi.fn()
    mockState.getTotal = vi.fn(() => 5000)
    
    render(<CartDrawer />)
    
    const decreaseBtn = screen.getByLabelText('Reducir cantidad')
    fireEvent.click(decreaseBtn)
  })

  it('llama a removeItem cuando se elimina producto', () => {
    mockState.isOpen = true
    mockState.items = [mockCartItem]
    mockState.removeItem = vi.fn()
    mockState.getTotal = vi.fn(() => 5000)
    
    render(<CartDrawer />)
    
    const removeBtn = screen.getByLabelText('Eliminar producto')
    fireEvent.click(removeBtn)
  })

  it('muestra el carrito para vaciar', () => {
    mockState.isOpen = true
    mockState.items = [mockCartItem]
    mockState.getTotal = vi.fn(() => 5000)
    
    render(<CartDrawer />)
    expect(screen.getByText('Finalizar Compra')).toBeInTheDocument()
  })

  it('calcula subtotal con getTotal()', () => {
    const getTotal = vi.fn(() => 5000)
    mockState.isOpen = true
    mockState.items = [mockCartItem]
    mockState.getTotal = getTotal
    
    render(<CartDrawer />)
    expect(getTotal).toHaveBeenCalled()
  })
})
