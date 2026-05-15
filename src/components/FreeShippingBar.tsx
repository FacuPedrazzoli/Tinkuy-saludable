'use client'

import { useMemo } from 'react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'

interface FreeShippingBarProps {
  className?: string
}

export function FreeShippingBar({ className }: FreeShippingBarProps) {
  const getTotal = useCartStore((state) => state.getTotal)
  const total = getTotal()

  const { remaining, percentage, isFreeShipping } = useMemo(() => {
    const remainingAmount = Math.max(0, FREE_SHIPPING_THRESHOLD - total)
    const pct = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)
    return {
      remaining: remainingAmount,
      percentage: pct,
      isFreeShipping: total >= FREE_SHIPPING_THRESHOLD,
    }
  }, [total])

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {isFreeShipping ? (
        <div className="flex items-center gap-2 text-green-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">¡Envío gratis!</span>
        </div>
      ) : (
        <p className="text-sm text-neutral-600">
          Comprá <span className="font-semibold text-neutral-900">{formatPrice(remaining)}</span> más para obtener envío gratis
        </p>
      )}

      <div className="relative w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out ${
            isFreeShipping ? 'bg-green-500' : 'bg-primary-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-neutral-500">
        <span>{formatPrice(total)}</span>
        <span>{formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
      </div>
    </div>
  )
}
