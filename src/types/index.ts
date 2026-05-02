export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  category: string
  subcategory?: string
  subcategories?: string[]
  tags: string[]
  images: string[]
  ingredients?: string
  benefits?: string[]
  nutritionalInfo?: {
    servingSize: string
    calories: number
    protein: string
    carbs: string
    fat: string
    fiber?: string
  }
  stock: number
  rating: number
  reviews: number
  featured: boolean
  promo?: string
  brand?: string
  organic: boolean
  glutenFree: boolean
  vegan: boolean
  keto: boolean
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  subcategories?: string[]
  productCount: number
}

export interface Testimonial {
  id: string
  name: string
  avatar: string
  rating: number
  comment: string
  productId?: string
  date: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  image: string
  category: string
  author: string
  date: string
  readTime: number
}

export interface CartItem {
  product: Product
  quantity: number
  weight: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  customer: {
    name: string
    email: string
    phone: string
    address: string
  }
  createdAt: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  since: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export interface SiteConfig {
  name: string
  slogan: string
  description: string
  email: string
  phone: string
  address: string
  social: {
    instagram?: string
    facebook?: string
    twitter?: string
    whatsapp?: string
  }
}