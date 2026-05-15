import { Product, CartItem, Order } from '@/types'
import {
  GraphQLProduct,
  GraphQLCartItem,
  GraphQLOrder,
  GraphQLOrderItem,
} from './types'

export function parsePrice(price: string | number): number {
  if (typeof price === 'number') return price
  return parseFloat(price) || 0
}

export function adaptProduct(
  graphqlProduct: GraphQLProduct,
  options: {
    category?: string
    isOrganic?: boolean
    isVegan?: boolean
    isGlutenFree?: boolean
    isKeto?: boolean
  } = {}
): Product {
  return {
    id: graphqlProduct.id,
    name: graphqlProduct.name,
    slug: graphqlProduct.slug,
    description: graphqlProduct.description || '',
    shortDescription: graphqlProduct.description?.substring(0, 100) || '',
    price: parsePrice(graphqlProduct.basePrice),
    originalPrice: undefined,
    category: options.category || '',
    subcategory: undefined,
    subcategories: undefined,
    tags: (graphqlProduct.tags || []).map((t) => t?.tag?.name).filter(Boolean),
    images: (graphqlProduct.images || []).map((img) => img?.url).filter(Boolean),
    ingredients: undefined,
    benefits: undefined,
    nutritionalInfo: undefined,
    stock: 100,
    rating: 4.5,
    reviews: 10,
    featured: false,
    promo: undefined,
    brand: undefined,
    organic: options.isOrganic || false,
    glutenFree: options.isGlutenFree || false,
    vegan: options.isVegan || false,
    keto: options.isKeto || false,
    createdAt: graphqlProduct.createdAt,
  }
}

export function adaptCartItem(graphqlItem: GraphQLCartItem): CartItem {
  const price = parsePrice(graphqlItem.price)
  return {
    product: {
      id: graphqlItem.productId,
      name: graphqlItem.name,
      slug: '',
      description: '',
      shortDescription: '',
      price,
      category: '',
      tags: [],
      images: graphqlItem.imageUrl ? [graphqlItem.imageUrl] : [],
      stock: 100,
      rating: 0,
      reviews: 0,
      featured: false,
      organic: false,
      glutenFree: false,
      vegan: false,
      keto: false,
      createdAt: new Date().toISOString(),
    },
    quantity: graphqlItem.quantity ?? 1,
    weight: 250,
  }
}

export function adaptOrderItem(graphqlItem: GraphQLOrderItem): {
  id: string
  name: string
  price: number
  quantity: number
  total: number
} {
  return {
    id: graphqlItem.id,
    name: graphqlItem.name,
    price: parsePrice(graphqlItem.price),
    quantity: graphqlItem.quantity,
    total: parsePrice(graphqlItem.total),
  }
}

export function adaptOrder(graphqlOrder: GraphQLOrder): Order {
  return {
    id: graphqlOrder.id,
    items: (graphqlOrder.items || []).map((item) => ({
      product: {
        id: item?.id || '',
        name: item?.name || '',
        slug: '',
        description: '',
        shortDescription: '',
        price: parsePrice(item?.price || 0),
        category: '',
        tags: [],
        images: [],
        stock: 0,
        rating: 0,
        reviews: 0,
        featured: false,
        organic: false,
        glutenFree: false,
        vegan: false,
        keto: false,
        createdAt: graphqlOrder.createdAt,
      },
      quantity: item?.quantity ?? 1,
      weight: 0,
    })),
    total: parsePrice(graphqlOrder.totalAmount),
    status: mapOrderStatus(graphqlOrder.status),
    customer: {
      name: '',
      email: graphqlOrder.guestEmail || '',
      phone: '',
      address: '',
    },
    createdAt: graphqlOrder.createdAt,
  }
}

function mapOrderStatus(
  status: string
): 'pending' | 'confirmed' | 'shipped' | 'delivered' {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'processing':
      return 'confirmed'
    case 'shipped':
    case 'dispatched':
      return 'shipped'
    case 'delivered':
    case 'completed':
      return 'delivered'
    default:
      return 'pending'
  }
}
