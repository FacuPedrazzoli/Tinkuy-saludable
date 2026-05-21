export interface GraphQLProductImage {
  id: string
  url: string
  altText: string | null
  position: number
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
  brand: string | null
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

// Relay connection helpers
export interface PageInfo {
  hasNextPage: boolean
  endCursor: string | null
}

export interface GraphQLEdge<T> {
  node: T
}

export interface GraphQLConnection<T> {
  edges: GraphQLEdge<T>[]
  pageInfo: PageInfo
  totalCount: number
}

export interface GraphQLProductsResult {
  products: GraphQLConnection<GraphQLProduct>
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
  orders: GraphQLConnection<GraphQLOrder>
}

export interface GraphQLMyOrdersResult {
  myOrders: GraphQLConnection<GraphQLOrder>
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
  phone?: string | null
  totalOrders: number
  totalSpent: number
  createdAt?: string
}

export interface GraphQLCustomersResult {
  customers: GraphQLConnection<GraphQLCustomer>
}

// ── Bulk import / price management ──────────────────────────────────────────

export type InvoiceType = 'A' | 'B' | 'I' | 'NONE'
export type ProductSaleUnit = 'KG' | 'UNIT'
export type PriceUpdateMode = 'PERCENT_INCREASE' | 'FIXED_PRICE'

/** Fields added to Product by the new contract */
export interface GraphQLProductExtended extends GraphQLProduct {
  invoiceType: InvoiceType | null
  saleUnit: ProductSaleUnit | null
  // derived read-only fields (server-computed)
  clientKiloPrice: number | null
  clientPrice500g: number | null
  clientPrice250g: number | null
  clientPrice100g: number | null
  clientUnitPrice: number | null
}

export interface BulkProductInput {
  name: string
  category: string
  supplier?: string
  invoiceType?: InvoiceType
  saleUnit: ProductSaleUnit
  basePrice: number
}

export interface BulkImportError {
  row: number
  name: string | null
  message: string
}

export interface BulkImportResult {
  created: number
  updated: number
  skipped: number
  errors: BulkImportError[]
}

export interface BulkPriceUpdateInput {
  productIds: string[]
  mode: PriceUpdateMode
  value: number
}

export interface BulkPriceResult {
  updated: number
  errors: BulkImportError[]
}

export interface GraphQLSupplier {
  id: string
  name: string
}

export interface GraphQLSuppliersResult {
  suppliers: GraphQLSupplier[]
}

export interface GraphQLBulkImportResult {
  bulkImportProducts: BulkImportResult
}

export interface GraphQLBulkPriceResult {
  bulkUpdateProductPrices: BulkPriceResult
}
