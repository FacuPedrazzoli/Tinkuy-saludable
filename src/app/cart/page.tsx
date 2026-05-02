'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore, calculatePrice, Weight } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-32 h-32 text-neutral-200 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h1 className="text-2xl font-bold text-neutral-900 font-display mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-neutral-600 mb-8">
            Agregá productos para comenzar tu compra.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            Ver Productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 font-display mb-8">
          Carrito de Compras
        </h1>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4 p-4 bg-white rounded-xl border border-neutral-100">
              <div className="relative w-24 h-24 flex-shrink-0 bg-neutral-50 rounded-lg overflow-hidden">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.product.slug}`} className="font-semibold text-neutral-900 hover:text-primary-600 transition-colors line-clamp-1">
                  {item.product.name}
                </Link>
                <p className="text-primary-600 font-semibold mt-1">
                  {formatPrice(calculatePrice(item.product.price, item.weight as Weight))} / {item.weight}g
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border border-neutral-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.weight)}
                      className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-700"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.weight)}
                      className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-700"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.weight)}
                    className="text-neutral-400 hover:text-red-500 transition-colors text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-900">
                  {formatPrice(calculatePrice(item.product.price, item.weight as Weight) * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-medium text-neutral-600">Subtotal</span>
            <span className="text-2xl font-bold text-primary-600">{formatPrice(getTotal())}</span>
          </div>
          <p className="text-sm text-neutral-500 mb-6">
            El costo de envío se calcula al finalizar la compra.
          </p>
          <Link
            href="/checkout"
            className="block w-full py-4 bg-primary-600 text-white font-semibold text-center rounded-xl hover:bg-primary-700 transition-colors"
          >
            Finalizar Compra
          </Link>
          <Link
            href="/catalog"
            className="block w-full py-3 text-neutral-600 font-medium text-center mt-3 hover:text-primary-600 transition-colors"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  )
}