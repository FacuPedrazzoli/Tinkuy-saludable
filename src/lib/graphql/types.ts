export interface GraphQLProductImage {
  id: string
  url: string
  altText: string | null
  sortOrder: number
}

export interface GraphQLProductTag {
  tag: {
    id: string
    name: string
    slug: string
  }
}

export interface GraphQLProductVariant {
  id: string
  sku: string
  name: string
  price: string
  isActive: boolean
}

export interface GraphQLProduct {
  id: string
  name: string
  slug: string
  description: string | null
  sku: string | null
  isActive: boolean
  isVisible: boolean
  basePrice: string
  createdAt: string
  updatedAt: string
  variants: GraphQLProductVariant[]
  images: GraphQLProductImage[]
  tags: GraphQLProductTag[]
}

export interface GraphQLCartItem {
  productId: string
  variantId: string | null
  name: string
  price: string
  quantity: number
  imageUrl: string | null
}

export interface GraphQLCart {
  id: string
  items: GraphQLCartItem[]
  totalItems: number
  totalAmount: string
}

export interface GraphQLOrderItem {
  id: string
  name: string
  price: string
  quantity: number
  total: string
}

export interface GraphQLOrder {
  id: string
  status: string
  paymentStatus: string
  totalAmount: string
  guestEmail: string | null
  createdAt: string
  items: GraphQLOrderItem[]
}

export interface GraphQLProductsResult {
  products: {
    items: GraphQLProduct[]
    count: number
  }
}

export interface GraphQLAdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  tenantId: string | null
}

export interface GraphQLTag {
  id: string
  name: string
  slug: string
}

export interface GraphQLCategory {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: string | null
  productCount: number
  sortOrder: number
  isActive: boolean
}

export interface GraphQLCategoriesResult {
  categories: GraphQLCategory[]
}

export interface GraphQLGuestOrdersResult {
  guestOrders: GraphQLOrder[]
}

export interface GraphQLProductResult {
  product: GraphQLProduct | null
}

export interface GraphQLCartResult {
  cart: GraphQLCart | null
}

export interface GraphQLMyCartResult {
  myCart: GraphQLCart | null
}

export interface GraphQLOrdersResult {
  orders: {
    items: GraphQLOrder[]
    count: number
  }
}

export interface GraphQLMyOrdersResult {
  myOrders: GraphQLOrder[]
}

export interface GraphQLOrderResult {
  order: GraphQLOrder | null
}

export interface GraphQLCoupon {
  id: string
  code: string
  description: string | null
  discountType: string
  discountValue: number
  minPurchase: number
  maxUses: number | null
  usesCount: number
  startsAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

export interface GraphQLCouponsResult {
  coupons: GraphQLCoupon[]
}

export interface GraphQLCustomer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  totalOrders: number
  totalSpent: number
  createdAt: string
}

export interface GraphQLCustomersResult {
  customers: GraphQLCustomer[]
}
