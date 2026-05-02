'use client'

import { useCartStore, calculatePrice, Weight } from '@/lib/store'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { useEffect } from 'react'

export function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, getTotal } = useCartStore()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
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
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-slide-down"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-neutral-100">
            <h2 id="cart-title" className="text-xl font-bold font-display">Tu Carrito</h2>
            <button
              onClick={() => setCartOpen(false)}
              className="p-2 text-neutral-500 hover:text-neutral-700 transition-colors"
              aria-label="Cerrar carrito"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <svg className="w-24 h-24 text-neutral-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-neutral-500 text-center mb-6">Tu carrito está vacío</p>
              <Link
                href="/catalog"
                onClick={() => setCartOpen(false)}
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Explorar Productos
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.weight}`} className="flex gap-4 p-4 bg-neutral-50 rounded-xl">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                      <Image
                        src={item.product.images[0]}
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
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.weight)}
                            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-700"
                            aria-label="Reducir cantidad"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-medium" aria-label={`Cantidad: ${item.quantity}`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.weight)}
                            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-700"
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id, item.weight)}
                          className="text-neutral-400 hover:text-red-500 transition-colors"
                          aria-label="Eliminar producto"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
                <p className="text-sm text-neutral-500">
                  El costo de envío se calcula al checkout
                </p>
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
  )
}