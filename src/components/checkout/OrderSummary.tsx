'use client'

import Image from 'next/image'
import { CartItem } from '@/types'
import { formatPrice } from '@/lib/utils'
import { calculatePrice, Weight } from '@/lib/store'
import { OrderSummarySkeleton } from './CartSkeleton'

interface OrderSummaryProps {
  items: CartItem[]
  getTotal: () => number
  isLoading?: boolean
}

export default function OrderSummary({ items, getTotal, isLoading }: OrderSummaryProps) {
  if (isLoading) {
    return <OrderSummarySkeleton />
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-100 sticky top-24">
      <h3 className="font-semibold text-neutral-900 mb-4">Tu Pedido</h3>
      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={`${item.product.id}-${item.weight}`} className="flex gap-3">
            <div className="relative w-14 h-14 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                {item.product.name}
              </p>
              <p className="text-xs text-neutral-500">
                {item.quantity}x{item.weight}g
              </p>
            </div>
            <p className="text-sm font-medium text-neutral-900">
              {formatPrice(calculatePrice(item.product.price, item.weight as Weight) * item.quantity)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
