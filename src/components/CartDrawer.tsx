'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useCartStore, calculatePrice, Weight } from '@/lib/store'
import { useHydration } from '@/hooks/useHydration'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client/react'
import { GET_MY_CART, UPDATE_CART_ITEM, REMOVE_FROM_CART, CLEAR_CART } from '@/lib/graphql/queries'
import { syncCartStoreFromGraphQL, getAuthToken, type GraphQLCart, type GraphQLCartItem } from '@/lib/cartUtils'
import { ToastContainer, useToast } from '@/components/Toast'
import { CartSkeleton } from '@/components/checkout/CartSkeleton'
import { FreeShippingBar } from '@/components/FreeShippingBar'

interface AddToCartInput {
  productId: string
  variantId?: string
  quantity: number
}

interface UpdateCartItemInput {
  productId: string
  variantId?: string
  quantity: number
}

export function CartDrawer() {
  const [token, setToken] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const hydrated = useHydration()
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const toast = useToast()

  const { data: cartData, refetch: refetchCart, loading: cartLoading, error: cartError } = useQuery<{ myCart: GraphQLCart }>(GET_MY_CART, {
    skip: !token,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (cartError) {
      console.error('Cart query error:', cartError);
    }
  }, [cartError]);

  useEffect(() => {
    setToken(getAuthToken())
  }, [])

  useEffect(() => {
    if (cartData?.myCart) {
      syncCartStoreFromGraphQL(cartData.myCart as GraphQLCart)
    }
  }, [cartData])

  const [updateCartItemMutation, { loading: updateLoading }] = useMutation<{ updateCartItem: GraphQLCart }, { cartId: string, input: UpdateCartItemInput }>(UPDATE_CART_ITEM, {
    onError: (error) => {
      console.error('Failed to update cart item:', error);
    },
  });
  const [removeFromCartMutation, { loading: removeLoading }] = useMutation<{ removeFromCart: GraphQLCart }, { cartId: string, productId: string, variantId?: string }>(REMOVE_FROM_CART, {
    onError: (error) => {
      console.error('Failed to remove from cart:', error);
    },
  });
  const [clearCartMutation, { loading: clearLoading }] = useMutation<{ clearCart: boolean }, { cartId: string }>(CLEAR_CART, {
    onError: (error) => {
      console.error('Failed to clear cart:', error);
    },
  });

  const handleUpdateQuantity = useCallback(async (productId: string, quantity: number, weight: Weight) => {
    const previousItems = useCartStore.getState().items
    updateQuantity(productId, quantity, weight)
    if (!token) return
    try {
      await updateCartItemMutation({
        variables: {
          cartId: cartData?.myCart?.id || '',
          input: { productId, quantity, variantId: undefined },
        },
      })
      refetchCart()
    } catch (error) {
      console.error('Failed to update cart item:', error)
      useCartStore.setState({ items: previousItems })
      toast.error('Error al actualizar el producto. Intentalo de nuevo.')
    }
  }, [token, cartData?.myCart?.id, updateQuantity, updateCartItemMutation, refetchCart, toast])

  const handleRemoveItem = useCallback(async (productId: string, weight: Weight) => {
    const previousItems = useCartStore.getState().items
    const item = items.find((i) => i.product.id === productId && i.weight === weight)
    removeItem(productId, weight)
    if (!token || !item) return
    try {
      setRemovingId(`${productId}-${weight}`)
      await removeFromCartMutation({
        variables: {
          cartId: cartData?.myCart?.id || '',
          productId,
          variantId: undefined,
        },
      })
      refetchCart()
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      toast.error('Error al eliminar el producto del carrito.')
      useCartStore.setState({ items: previousItems })
    } finally {
      setRemovingId(null)
    }
  }, [removeItem, token, removeFromCartMutation, cartData, refetchCart, items, toast])

  const handleClearCart = useCallback(async () => {
    clearCart()
    if (!token) return
    try {
      await clearCartMutation({
        variables: {
          cartId: cartData?.myCart?.id || '',
        },
      })
      refetchCart()
      toast.success('Carrito vaciado correctamente.')
    } catch (error) {
      console.error('Failed to clear cart:', error)
      toast.error('Error al vaciar el carrito. Intentalo de nuevo.')
    }
  }, [clearCart, token, clearCartMutation, cartData, refetchCart, toast])

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      previousActiveElement.current?.focus()
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div className="fixed inset-0 z-50" role="presentation">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
          aria-hidden="true"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-title"
          className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-slide-right"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 id="cart-title" className="text-xl font-bold font-display">Tu Carrito</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 text-neutral-600 hover:text-neutral-800 transition-colors"
                aria-label="Cerrar carrito"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {items.length === 0 && !cartLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <svg className="w-24 h-24 text-neutral-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-neutral-600 text-center mb-6">Tu carrito está vacío</p>
                <Link
                  href="/catalog"
                  onClick={() => setCartOpen(false)}
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Explorar Productos
                </Link>
              </div>
            ) : cartLoading && items.length === 0 ? (
              <div className="flex-1 overflow-y-auto p-6">
                <CartSkeleton count={3} />
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.weight}`} className="flex gap-4 p-4 bg-neutral-50 rounded-xl">
                      <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                        <Image
                          src={item.product.images[0] || '/placeholder.png'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-900 text-sm line-clamp-2 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-primary-600 font-semibold">
                          {formatPrice(calculatePrice(item.product.price, item.weight as Weight))} / {item.weight}g
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-neutral-200 rounded-lg">
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1, item.weight as Weight)}
                              className="w-11 h-11 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors"
                              aria-label="Reducir cantidad"
                            >
                              <span className="text-lg">−</span>
                            </button>
                            <span className="w-10 text-center text-sm font-medium" aria-label={`Cantidad: ${item.quantity}`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1, item.weight as Weight)}
                              className="w-11 h-11 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors"
                              aria-label="Aumentar cantidad"
                            >
                              <span className="text-lg">+</span>
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product.id, item.weight as Weight)}
                            disabled={removingId === `${item.product.id}-${item.weight}`}
                            className="flex items-center justify-center w-11 h-11 text-neutral-500 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-red-50"
                            aria-label="Eliminar producto"
                          >
                            {removingId === `${item.product.id}-${item.weight}` ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-100 p-6 space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-bold text-primary-600">{formatPrice(getTotal())}</span>
                  </div>

                  <FreeShippingBar />
                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="block w-full py-4 bg-primary-600 text-white font-semibold text-center rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Finalizar Compra
                  </Link>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="block w-full py-3 text-neutral-600 font-medium text-center hover:text-primary-600 transition-colors"
                  >
                    Continuar Comprando
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
