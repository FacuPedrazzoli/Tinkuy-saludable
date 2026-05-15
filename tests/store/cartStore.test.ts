import { describe, it, expect, beforeEach, vi } from 'vitest'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CartItem } from '@/types'

vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware')
  return {
    ...actual,
    persist: vi.fn((creator) => {
      return creator
    }),
  }
})

const createCartStore = (initialState?: Partial<{ items: CartItem[]; isOpen: boolean; isLoading: boolean }>) => {
  return create((set, get) => ({
    items: initialState?.items ?? [],
    isOpen: initialState?.isOpen ?? false,
    isLoading: initialState?.isLoading ?? false,

    addItem: (product: Product, quantity = 1, weight = 250) => {
      set((state) => {
        const existingItem = state.items.find(
          (item) => item.product.id === product.id && item.weight === weight
        )
        if (existingItem) {
          return {
            items: state.items.map((item) =>
              item.product.id === product.id && item.weight === weight
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          }
        }
        return { items: [...state.items, { product, quantity, weight }] }
      })
    },

    removeItem: (productId: string, weight: number) => {
      set((state) => ({
        items: state.items.filter(
          (item) => !(item.product.id === productId && item.weight === weight)
        ),
      }))
    },

    updateQuantity: (productId: string, quantity: number, weight: number) => {
      if (quantity <= 0) {
        get().removeItem(productId, weight)
        return
      }
      set((state) => ({
        items: state.items.map((item) =>
          item.product.id === productId && item.weight === weight
            ? { ...item, quantity }
            : item
        ),
      }))
    },

    clearCart: () => set({ items: [] }),

    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

    setCartOpen: (isOpen: boolean) => set({ isOpen }),

    setLoading: (isLoading: boolean) => set({ isLoading }),

    getTotal: () => {
      return get().items.reduce((sum, item) => {
        return sum + Math.round((item.product.price * item.weight) / 100) * item.quantity
      }, 0)
    },

    getItemCount: () => {
      return get().items.reduce((sum, item) => sum + item.quantity, 0)
    },
  }))
}

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Test Product',
  slug: 'test-product',
  description: 'Description',
  shortDescription: 'Short',
  price: 1000,
  category: 'test',
  tags: [],
  images: [],
  stock: 10,
  rating: 4.5,
  reviews: 10,
  featured: false,
  organic: false,
  glutenFree: true,
  vegan: true,
  keto: true,
  createdAt: '2024-01-01',
}

const mockProduct2: Product = {
  ...mockProduct,
  id: 'prod-2',
  name: 'Second Product',
  price: 2000,
}

describe('useCartStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('addItem', () => {
    it('should add a new product to the cart', () => {
      const store = createCartStore()

      store.getState().addItem(mockProduct, 1, 250)

      const items = store.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].product.id).toBe('prod-1')
      expect(items[0].quantity).toBe(1)
      expect(items[0].weight).toBe(250)
    })

    it('should increment quantity when adding an existing product with same weight', () => {
      const store = createCartStore()

      store.getState().addItem(mockProduct, 1, 250)
      store.getState().addItem(mockProduct, 2, 250)

      const items = store.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(3)
    })

    it('should add as separate item when same product has different weight', () => {
      const store = createCartStore()

      store.getState().addItem(mockProduct, 1, 250)
      store.getState().addItem(mockProduct, 1, 500)

      const items = store.getState().items
      expect(items).toHaveLength(2)
    })
  })

  describe('removeItem', () => {
    it('should remove a product from the cart', () => {
      const store = createCartStore({
        items: [{ product: mockProduct, quantity: 2, weight: 250 }],
      })

      store.getState().removeItem('prod-1', 250)

      expect(store.getState().items).toHaveLength(0)
    })

    it('should only remove the specific weight variant', () => {
      const store = createCartStore({
        items: [
          { product: mockProduct, quantity: 2, weight: 250 },
          { product: mockProduct, quantity: 3, weight: 500 },
        ],
      })

      store.getState().removeItem('prod-1', 250)

      const items = store.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].weight).toBe(500)
    })
  })

  describe('updateQuantity', () => {
    it('should update quantity when value is valid', () => {
      const store = createCartStore({
        items: [{ product: mockProduct, quantity: 2, weight: 250 }],
      })

      store.getState().updateQuantity('prod-1', 5, 250)

      expect(store.getState().items[0].quantity).toBe(5)
    })

    it('should remove item when quantity is 0', () => {
      const store = createCartStore({
        items: [{ product: mockProduct, quantity: 2, weight: 250 }],
      })

      store.getState().updateQuantity('prod-1', 0, 250)

      expect(store.getState().items).toHaveLength(0)
    })

    it('should remove item when quantity is negative', () => {
      const store = createCartStore({
        items: [{ product: mockProduct, quantity: 2, weight: 250 }],
      })

      store.getState().updateQuantity('prod-1', -1, 250)

      expect(store.getState().items).toHaveLength(0)
    })
  })

  describe('clearCart', () => {
    it('should remove all items from the cart', () => {
      const store = createCartStore({
        items: [
          { product: mockProduct, quantity: 2, weight: 250 },
          { product: mockProduct2, quantity: 1, weight: 500 },
        ],
      })

      store.getState().clearCart()

      expect(store.getState().items).toHaveLength(0)
    })
  })

  describe('toggleCart', () => {
    it('should toggle isOpen from false to true', () => {
      const store = createCartStore({ isOpen: false })

      store.getState().toggleCart()

      expect(store.getState().isOpen).toBe(true)
    })

    it('should toggle isOpen from true to false', () => {
      const store = createCartStore({ isOpen: true })

      store.getState().toggleCart()

      expect(store.getState().isOpen).toBe(false)
    })
  })

  describe('getTotal', () => {
    it('should calculate total correctly', () => {
      const store = createCartStore({
        items: [
          { product: mockProduct, quantity: 1, weight: 250 },
          { product: mockProduct2, quantity: 2, weight: 500 },
        ],
      })

      const total = store.getState().getTotal()
      expect(total).toBe(22500)
    })

    it('should return 0 for empty cart', () => {
      const store = createCartStore()

      expect(store.getState().getTotal()).toBe(0)
    })

    it('should account for quantity multiplier', () => {
      const store = createCartStore({
        items: [{ product: mockProduct, quantity: 3, weight: 250 }],
      })

      const total = store.getState().getTotal()
      expect(total).toBe(7500)
    })
  })

  describe('getItemCount', () => {
    it('should return total item count', () => {
      const store = createCartStore({
        items: [
          { product: mockProduct, quantity: 2, weight: 250 },
          { product: mockProduct2, quantity: 3, weight: 500 },
        ],
      })

      expect(store.getState().getItemCount()).toBe(5)
    })

    it('should return 0 for empty cart', () => {
      const store = createCartStore()

      expect(store.getState().getItemCount()).toBe(0)
    })
  })

  describe('persist middleware with corrupted localStorage', () => {
    it('should handle corrupted localStorage gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')

      getItemSpy.mockImplementationOnce(() => {
        throw new Error('Corrupted localStorage')
      })

      expect(() => createCartStore()).not.toThrow()

      getItemSpy.mockRestore()
    })

    it('should handle invalid JSON in localStorage', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')

      getItemSpy.mockImplementationOnce(() => {
        localStorage.setItem('test', 'invalid-json')
        return 'invalid-json'
      })

      expect(() => createCartStore()).not.toThrow()

      getItemSpy.mockRestore()
    })
  })
})
