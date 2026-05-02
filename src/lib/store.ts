import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CartItem } from '@/types'

export const WEIGHTS = [100, 250, 500, 1000] as const
export type Weight = typeof WEIGHTS[number]

export function calculatePrice(basePrice: number, weight: Weight): number {
  return Math.round((basePrice * weight) / 250)
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, quantity?: number, weight?: Weight) => void
  removeItem: (productId: string, weight: number) => void
  updateQuantity: (productId: string, quantity: number, weight: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (isOpen: boolean) => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

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

      getTotal: () => {
        return get().items.reduce((sum, item) => {
          return sum + calculatePrice(item.product.price, item.weight as Weight) * item.quantity
        }, 0)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'tinkuy-cart',
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
        const isIn = get().isInWishlist(product.id)
        if (isIn) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },
    }),
    {
      name: 'tinkuy-wishlist',
    }
  )
)