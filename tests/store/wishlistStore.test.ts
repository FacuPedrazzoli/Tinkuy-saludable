import { describe, it, expect, beforeEach, vi } from 'vitest'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'

vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware')
  return {
    ...actual,
    persist: vi.fn((creator) => {
      return creator
    }),
  }
})

const createWishlistStore = (initialItems: Product[] = []) => {
  return create((set, get) => ({
    items: initialItems,

    addItem: (product: Product) => {
      set((state) => {
        if (state.items.find((p) => p.id === product.id)) {
          return state
        }
        return { items: [...state.items, product] }
      })
    },

    removeItem: (productId: string) => {
      set((state) => ({
        items: state.items.filter((p) => p.id !== productId),
      }))
    },

    isInWishlist: (productId: string) => {
      return !!get().items.find((p) => p.id === productId)
    },

    toggleItem: (product: Product) => {
      set((state) => {
        const exists = state.items.find((p) => p.id === product.id)
        if (exists) {
          return { items: state.items.filter((p) => p.id !== product.id) }
        }
        return { items: [...state.items, product] }
      })
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
}

describe('useWishlistStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('addItem', () => {
    it('should add a product to the wishlist', () => {
      const store = createWishlistStore()

      store.getState().addItem(mockProduct)

      expect(store.getState().items).toHaveLength(1)
      expect(store.getState().items[0].id).toBe('prod-1')
    })

    it('should not duplicate items', () => {
      const store = createWishlistStore([mockProduct])

      store.getState().addItem(mockProduct)

      expect(store.getState().items).toHaveLength(1)
    })

    it('should allow different products', () => {
      const store = createWishlistStore([mockProduct])

      store.getState().addItem(mockProduct2)

      expect(store.getState().items).toHaveLength(2)
    })
  })

  describe('removeItem', () => {
    it('should remove a product from the wishlist', () => {
      const store = createWishlistStore([mockProduct, mockProduct2])

      store.getState().removeItem('prod-1')

      const items = store.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe('prod-2')
    })

    it('should handle removing non-existent item gracefully', () => {
      const store = createWishlistStore([mockProduct])

      store.getState().removeItem('non-existent')

      expect(store.getState().items).toHaveLength(1)
    })
  })

  describe('isInWishlist', () => {
    it('should return true if product is in wishlist', () => {
      const store = createWishlistStore([mockProduct])

      expect(store.getState().isInWishlist('prod-1')).toBe(true)
    })

    it('should return false if product is not in wishlist', () => {
      const store = createWishlistStore([mockProduct])

      expect(store.getState().isInWishlist('prod-2')).toBe(false)
    })

    it('should return false for empty wishlist', () => {
      const store = createWishlistStore()

      expect(store.getState().isInWishlist('prod-1')).toBe(false)
    })
  })

  describe('toggleItem', () => {
    it('should add item if not in wishlist', () => {
      const store = createWishlistStore()

      store.getState().toggleItem(mockProduct)

      expect(store.getState().items).toHaveLength(1)
      expect(store.getState().isInWishlist('prod-1')).toBe(true)
    })

    it('should remove item if already in wishlist', () => {
      const store = createWishlistStore([mockProduct])

      store.getState().toggleItem(mockProduct)

      expect(store.getState().items).toHaveLength(0)
      expect(store.getState().isInWishlist('prod-1')).toBe(false)
    })

    it('should toggle correctly between add and remove', () => {
      const store = createWishlistStore()

      expect(store.getState().isInWishlist('prod-1')).toBe(false)

      store.getState().toggleItem(mockProduct)
      expect(store.getState().isInWishlist('prod-1')).toBe(true)

      store.getState().toggleItem(mockProduct)
      expect(store.getState().isInWishlist('prod-1')).toBe(false)
    })
  })
})
