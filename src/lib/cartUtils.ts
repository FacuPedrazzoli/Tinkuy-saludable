'use client'

import { useCartStore, Weight } from '@/lib/store'
import { Product } from '@/types'

export interface GraphQLCartItem {
  productId: string
  variantId: string | null
  name: string
  price: number
  quantity: number
  weight?: number
  imageUrl: string | null
}

export interface GraphQLCart {
  id: string
  items: GraphQLCartItem[]
  totalItems: number
  totalAmount: number
}

function createProductFromGraphQLItem(item: GraphQLCartItem): Product {
  return {
    id: item.productId,
    name: item.name,
    slug: '',
    description: '',
    shortDescription: '',
    price: item.price,
    originalPrice: undefined,
    category: '',
    subcategory: undefined,
    subcategories: undefined,
    tags: [],
    images: item.imageUrl ? [item.imageUrl] : [],
    ingredients: undefined,
    benefits: undefined,
    nutritionalInfo: undefined,
    stock: 0,
    rating: 0,
    reviews: 0,
    featured: false,
    promo: undefined,
    brand: undefined,
    organic: false,
    glutenFree: false,
    vegan: false,
    keto: false,
    createdAt: new Date().toISOString(),
  }
}

export function syncCartStoreFromGraphQL(cart: GraphQLCart | undefined, options?: { merge?: boolean }) {
  const store = useCartStore.getState()
  if (!cart || cart.items.length === 0) {
    if (!options?.merge) {
      store.clearCart()
    }
    return
  }

  const { items: graphqlItems } = cart
  const existingItems = store.items

  if (options?.merge) {
    const newItems = [...existingItems]
    graphqlItems.forEach((item) => {
      const existingIndex = newItems.findIndex(
        (ei) => ei.product.id === item.productId && ei.weight === (item.weight as Weight || 250)
      )
      if (existingIndex >= 0) {
        newItems[existingIndex] = { ...newItems[existingIndex], quantity: item.quantity }
      } else {
        newItems.push({
          product: createProductFromGraphQLItem(item),
          quantity: item.quantity,
          weight: (item.weight as Weight) || 250,
        })
      }
    })
    store.setLoading(false)
    return
  }

  const newItems = graphqlItems.map((item) => {
    const existing = existingItems.find(
      (ei) => ei.product.id === item.productId
    )
    if (existing) {
      return { ...existing, quantity: item.quantity }
    }
    return {
      product: createProductFromGraphQLItem(item),
      quantity: item.quantity,
      weight: (item.weight as Weight) || 250,
    }
  })
  useCartStore.setState({ items: newItems, isLoading: false })
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(c => c.trim().startsWith('auth_token='))
  return tokenCookie ? tokenCookie.split('=')[1] : null
}
