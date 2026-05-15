import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CartItem } from '@/types'
import { WEIGHTS, STORAGE_KEYS } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'

export { WEIGHTS }
export type Weight = typeof WEIGHTS[number]

export function calculatePrice(basePrice: number, weight: Weight): number {
  return Math.round((basePrice * weight) / 100)
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean
  isSyncing: boolean
  lastSyncedAt: number | null
  addItem: (product: Product, quantity?: number, weight?: Weight) => void
  removeItem: (productId: string, weight: Weight) => void
  updateQuantity: (productId: string, quantity: number, weight: Weight) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (isOpen: boolean) => void
  setLoading: (isLoading: boolean) => void
  getTotal: () => number
  getItemCount: () => number
  syncWithBackend: () => Promise<void>
  mergeCart: (backendItems: CartItem[]) => void
}

let syncTimeout: NodeJS.Timeout | null = null

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,

      addItem: (product: Product, quantity = 1, weight: Weight = 250) => {
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

        if (syncTimeout) clearTimeout(syncTimeout)
        syncTimeout = setTimeout(() => {
          get().syncWithBackend()
        }, 500)
      },

      removeItem: (productId: string, weight: Weight) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.weight === weight)
          ),
        }))

        if (syncTimeout) clearTimeout(syncTimeout)
        syncTimeout = setTimeout(() => {
          get().syncWithBackend()
        }, 500)
      },

      updateQuantity: (productId: string, quantity: number, weight: Weight) => {
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

        if (syncTimeout) clearTimeout(syncTimeout)
        syncTimeout = setTimeout(() => {
          get().syncWithBackend()
        }, 300)
      },

      clearCart: () => set({ items: [], lastSyncedAt: Date.now() }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setCartOpen: (isOpen: boolean) => set({ isOpen }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      getTotal: () => {
        return get().items.reduce((sum, item) => {
          return sum + calculatePrice(item.product.price, item.weight as Weight) * item.quantity
        }, 0)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      syncWithBackend: async () => {
        const { isSyncing, items } = get()
        if (isSyncing) return

        set({ isSyncing: true })
        try {
          set({ lastSyncedAt: Date.now() })
        } catch (error) {
          console.error('Error syncing cart with backend:', error)
        } finally {
          set({ isSyncing: false })
        }
      },

      mergeCart: (backendItems: CartItem[]) => {
        const { items: localItems } = get()
        const mergedItems = [...localItems]

        for (const backendItem of backendItems) {
          const existingIndex = mergedItems.findIndex(
            localItem =>
              localItem.product.id === backendItem.product.id &&
              localItem.weight === backendItem.weight
          )

          if (existingIndex >= 0) {
            mergedItems[existingIndex] = {
              ...mergedItems[existingIndex],
              quantity: Math.max(mergedItems[existingIndex].quantity, backendItem.quantity)
            }
          } else {
            mergedItems.push(backendItem)
          }
        }

        set({ items: mergedItems, lastSyncedAt: Date.now() })
      },
    }),
    {
      name: STORAGE_KEYS.CART,
      partialize: (state) => ({ items: state.items }),
    }
  )
)

interface WishlistStore {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleItem: (product: Product) => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

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
    }),
    {
      name: STORAGE_KEYS.WISHLIST,
    }
  )
)

interface RecentlyViewedStore {
  products: Product[]
  addProduct: (product: Product) => void
  clearRecent: () => void
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product: Product) => {
        set((state) => {
          const filtered = state.products.filter((p) => p.id !== product.id)
          return { products: [product, ...filtered].slice(0, 8) }
        })
      },

      clearRecent: () => set({ products: [] }),
    }),
    {
      name: STORAGE_KEYS.RECENTLY_VIEWED,
    }
  )
)