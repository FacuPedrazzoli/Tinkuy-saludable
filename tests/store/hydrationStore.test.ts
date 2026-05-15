import { describe, it, expect, beforeEach, vi } from 'vitest'
import { create } from 'zustand'

const createHydrationStore = () => {
  return create((set) => ({
    isHydrated: false,
    isCartHydrated: false,
    isWishlistHydrated: false,
    isRecentlyViewedHydrated: false,

    setCartHydrated: (value: boolean) =>
      set((state) => ({
        isCartHydrated: value,
        isHydrated: state.isWishlistHydrated && state.isRecentlyViewedHydrated && value,
      })),

    setWishlistHydrated: (value: boolean) =>
      set((state) => ({
        isWishlistHydrated: value,
        isHydrated: state.isCartHydrated && state.isRecentlyViewedHydrated && value,
      })),

    setRecentlyViewedHydrated: (value: boolean) =>
      set((state) => ({
        isRecentlyViewedHydrated: value,
        isHydrated: state.isCartHydrated && state.isWishlistHydrated && value,
      })),

    setAllHydrated: () =>
      set({
        isHydrated: true,
        isCartHydrated: true,
        isWishlistHydrated: true,
        isRecentlyViewedHydrated: true,
      }),
  }))
}

describe('useHydrationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have all hydration flags as false initially', () => {
      const store = createHydrationStore()

      expect(store.getState().isHydrated).toBe(false)
      expect(store.getState().isCartHydrated).toBe(false)
      expect(store.getState().isWishlistHydrated).toBe(false)
      expect(store.getState().isRecentlyViewedHydrated).toBe(false)
    })
  })

  describe('setCartHydrated', () => {
    it('should set isCartHydrated to true', () => {
      const store = createHydrationStore()

      store.getState().setCartHydrated(true)

      expect(store.getState().isCartHydrated).toBe(true)
    })

    it('should set isCartHydrated to false', () => {
      const store = createHydrationStore()
      store.getState().setCartHydrated(true)

      store.getState().setCartHydrated(false)

      expect(store.getState().isCartHydrated).toBe(false)
    })

    it('should set isHydrated to true when all other stores are hydrated', () => {
      const store = createHydrationStore()

      store.getState().setCartHydrated(true)
      store.getState().setWishlistHydrated(true)
      store.getState().setRecentlyViewedHydrated(true)

      expect(store.getState().isHydrated).toBe(true)
    })

    it('should not set isHydrated if other stores are not yet hydrated', () => {
      const store = createHydrationStore()

      store.getState().setCartHydrated(true)

      expect(store.getState().isHydrated).toBe(false)
    })

    it('should recalculate isHydrated when cart hydration changes', () => {
      const store = createHydrationStore()
      store.getState().setWishlistHydrated(true)
      store.getState().setRecentlyViewedHydrated(true)

      store.getState().setCartHydrated(true)
      expect(store.getState().isHydrated).toBe(true)

      store.getState().setCartHydrated(false)
      expect(store.getState().isHydrated).toBe(false)
    })
  })

  describe('setWishlistHydrated', () => {
    it('should set isWishlistHydrated to true', () => {
      const store = createHydrationStore()

      store.getState().setWishlistHydrated(true)

      expect(store.getState().isWishlistHydrated).toBe(true)
    })

    it('should set isWishlistHydrated to false', () => {
      const store = createHydrationStore()
      store.getState().setWishlistHydrated(true)

      store.getState().setWishlistHydrated(false)

      expect(store.getState().isWishlistHydrated).toBe(false)
    })

    it('should set isHydrated to true when all other stores are hydrated', () => {
      const store = createHydrationStore()

      store.getState().setCartHydrated(true)
      store.getState().setWishlistHydrated(true)
      store.getState().setRecentlyViewedHydrated(true)

      expect(store.getState().isHydrated).toBe(true)
    })

    it('should recalculate isHydrated when wishlist hydration changes', () => {
      const store = createHydrationStore()
      store.getState().setCartHydrated(true)
      store.getState().setRecentlyViewedHydrated(true)

      store.getState().setWishlistHydrated(true)
      expect(store.getState().isHydrated).toBe(true)

      store.getState().setWishlistHydrated(false)
      expect(store.getState().isHydrated).toBe(false)
    })
  })

  describe('setRecentlyViewedHydrated', () => {
    it('should set isRecentlyViewedHydrated to true', () => {
      const store = createHydrationStore()

      store.getState().setRecentlyViewedHydrated(true)

      expect(store.getState().isRecentlyViewedHydrated).toBe(true)
    })

    it('should set isRecentlyViewedHydrated to false', () => {
      const store = createHydrationStore()
      store.getState().setRecentlyViewedHydrated(true)

      store.getState().setRecentlyViewedHydrated(false)

      expect(store.getState().isRecentlyViewedHydrated).toBe(false)
    })

    it('should set isHydrated to true when all other stores are hydrated', () => {
      const store = createHydrationStore()

      store.getState().setCartHydrated(true)
      store.getState().setWishlistHydrated(true)
      store.getState().setRecentlyViewedHydrated(true)

      expect(store.getState().isHydrated).toBe(true)
    })

    it('should recalculate isHydrated when recently viewed hydration changes', () => {
      const store = createHydrationStore()
      store.getState().setCartHydrated(true)
      store.getState().setWishlistHydrated(true)

      store.getState().setRecentlyViewedHydrated(true)
      expect(store.getState().isHydrated).toBe(true)

      store.getState().setRecentlyViewedHydrated(false)
      expect(store.getState().isHydrated).toBe(false)
    })
  })

  describe('setAllHydrated', () => {
    it('should set all hydration flags to true', () => {
      const store = createHydrationStore()

      store.getState().setAllHydrated()

      expect(store.getState().isHydrated).toBe(true)
      expect(store.getState().isCartHydrated).toBe(true)
      expect(store.getState().isWishlistHydrated).toBe(true)
      expect(store.getState().isRecentlyViewedHydrated).toBe(true)
    })

    it('should override all previous hydration states', () => {
      const store = createHydrationStore()

      store.getState().setCartHydrated(true)
      store.getState().setAllHydrated()

      expect(store.getState().isCartHydrated).toBe(true)
      expect(store.getState().isWishlistHydrated).toBe(true)
      expect(store.getState().isRecentlyViewedHydrated).toBe(true)
      expect(store.getState().isHydrated).toBe(true)
    })
  })

  describe('hydration dependency logic', () => {
    it('should require all three stores to be hydrated for isHydrated to be true', () => {
      const store = createHydrationStore()

      store.getState().setCartHydrated(true)
      store.getState().setWishlistHydrated(true)
      expect(store.getState().isHydrated).toBe(false)

      store.getState().setRecentlyViewedHydrated(true)
      expect(store.getState().isHydrated).toBe(true)

      store.getState().setRecentlyViewedHydrated(false)
      expect(store.getState().isHydrated).toBe(false)

      store.getState().setRecentlyViewedHydrated(true)
      store.getState().setWishlistHydrated(false)
      expect(store.getState().isHydrated).toBe(false)
    })

    it('should handle hydration in different orders', () => {
      const order1 = createHydrationStore()
      order1.getState().setRecentlyViewedHydrated(true)
      order1.getState().setCartHydrated(true)
      order1.getState().setWishlistHydrated(true)
      expect(order1.getState().isHydrated).toBe(true)

      const order2 = createHydrationStore()
      order2.getState().setWishlistHydrated(true)
      order2.getState().setRecentlyViewedHydrated(true)
      order2.getState().setCartHydrated(true)
      expect(order2.getState().isHydrated).toBe(true)

      const order3 = createHydrationStore()
      order3.getState().setCartHydrated(true)
      order3.getState().setRecentlyViewedHydrated(true)
      order3.getState().setWishlistHydrated(true)
      expect(order3.getState().isHydrated).toBe(true)
    })
  })
})
