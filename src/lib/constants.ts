// Timeouts (en ms)
export const TIMEOUTS = {
  SESSION_CHECK: 60 * 1000,        // 1 minuto
  TOAST_DURATION: 5 * 1000,        // 5 segundos
  SEARCH_DEBOUNCE: 300,             // 300ms
  CATEGORY_MENU: 150,               // 150ms
  EXIT_INTENT: 15 * 1000,           // 15 segundos
  ADD_TO_CART: 500,                 // 500ms
  SESSION_WARNING: 25 * 60 * 1000,   // 25 minutos
  SESSION_TIMEOUT: 30 * 60 * 1000,  // 30 minutos
} as const

// Weights (en gramos)
export const WEIGHTS = [100, 250, 500, 1000] as const

// Storage keys
export const STORAGE_KEYS = {
  CART: 'tinkuy-cart-storage',
  WISHLIST: 'tinkuy-wishlist-storage',
  RECENTLY_VIEWED: 'tinkuy-recently-viewed-storage',
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 24,
  MAX_PAGE_SIZE: 100,
} as const

// Misc
export const ORDER_PREFIX = 'TNK-'
export const COUNTRY = 'Argentina'
export const LOCALE = 'es-AR'
export const CURRENCY = 'ARS'

// Shipping
export const FREE_SHIPPING_THRESHOLD = 15000 // $15.000 ARS
export const LOW_STOCK_THRESHOLD = 5
