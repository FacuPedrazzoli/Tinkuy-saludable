'use client'

import { formatPrice } from '@/lib/utils'

interface OrderTotalsProps {
  subtotal: number
  shippingCost?: number
}

export default function OrderTotals({ subtotal, shippingCost = 0 }: OrderTotalsProps) {
  return (
    <div className="border-t border-neutral-100 pt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Subtotal</span>
        <span className="font-medium">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">Envío</span>
        <span className="text-primary-600 font-medium">
          {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
        </span>
      </div>
      <div className="flex justify-between pt-2 border-t border-neutral-100">
        <span className="font-semibold text-neutral-900">Total</span>
        <span className="text-xl font-bold text-primary-600">
          {formatPrice(subtotal + shippingCost)}
        </span>
      </div>
    </div>
  )
}
