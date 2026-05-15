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

const createRecentlyViewedStore = (initialProducts: Product[] = []) => {
  return create((set) => ({
    products: initialProducts,

    addProduct: (product: Product) => {
      set((state) => {
        const filtered = state.products.filter((p) => p.id !== product.id)
        return { products: [product, ...filtered].slice(0, 8) }
      })
    },

    clearRecent: () => set({ products: [] }),
  }))
}

const createMockProduct = (id: string): Product => ({
  id,
  name: `Product ${id}`,
  slug: `product-${id}`,
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
})

describe('useRecentlyViewedStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('addProduct', () => {
    it('should add a product to recently viewed', () => {
      const store = createRecentlyViewedStore()
      const product = createMockProduct('prod-1')

      store.getState().addProduct(product)

      expect(store.getState().products).toHaveLength(1)
      expect(store.getState().products[0].id).toBe('prod-1')
    })

    it('should limit to 8 products', () => {
      const store = createRecentlyViewedStore()

      for (let i = 1; i <= 10; i++) {
        store.getState().addProduct(createMockProduct(`prod-${i}`))
      }

      expect(store.getState().products).toHaveLength(8)
    })

    it('should keep most recently viewed first', () => {
      const store = createRecentlyViewedStore()

      store.getState().addProduct(createMockProduct('prod-1'))
      store.getState().addProduct(createMockProduct('prod-2'))
      store.getState().addProduct(createMockProduct('prod-3'))

      const products = store.getState().products
      expect(products[0].id).toBe('prod-3')
      expect(products[1].id).toBe('prod-2')
      expect(products[2].id).toBe('prod-1')
    })

    it('should move duplicate product to the beginning', () => {
      const store = createRecentlyViewedStore([
        createMockProduct('prod-1'),
        createMockProduct('prod-2'),
        createMockProduct('prod-3'),
      ])

      store.getState().addProduct(createMockProduct('prod-1'))

      const products = store.getState().products
      expect(products[0].id).toBe('prod-1')
      expect(products[1].id).toBe('prod-2')
      expect(products[2].id).toBe('prod-3')
      expect(products).toHaveLength(3)
    })

    it('should replace old duplicate when at limit', () => {
      const products = Array.from({ length: 8 }, (_, i) => createMockProduct(`prod-${i + 1}`))
      const store = createRecentlyViewedStore(products)

      store.getState().addProduct(createMockProduct('prod-1'))

      const result = store.getState().products
      expect(result).toHaveLength(8)
      expect(result[0].id).toBe('prod-1')
      expect(result[7].id).toBe('prod-8')
    })
  })

  describe('clearRecent', () => {
    it('should remove all recently viewed products', () => {
      const store = createRecentlyViewedStore({
        products: [
          createMockProduct('prod-1'),
          createMockProduct('prod-2'),
          createMockProduct('prod-3'),
        ],
      })

      store.getState().clearRecent()

      expect(store.getState().products).toHaveLength(0)
    })

    it('should handle clearing empty store', () => {
      const store = createRecentlyViewedStore()

      expect(() => store.getState().clearRecent()).not.toThrow()
    })
  })
})
