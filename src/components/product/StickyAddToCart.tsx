'use client'

import { useState, useEffect, useRef } from 'react'
import { useCartStore, type Weight, calculatePrice } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Product } from '@/types'

interface StickyAddToCartProps {
  product: Product
  selectedWeight: Weight
  onWeightChange: (weight: Weight) => void
}

export function StickyAddToCart({ product, selectedWeight, onWeightChange }: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const isOutOfStock = product.stock === 0
  const currentPrice = calculatePrice(product.price, selectedWeight)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-100px 0px 0px 0px' }
    )

    if (buttonRef.current) {
      observer.observe(buttonRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleAddToCart = () => {
    if (isOutOfStock || isAdding) return
    setIsAdding(true)
    addItem(product, 1, selectedWeight)
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    <>
      <div
        ref={buttonRef}
        className="absolute pointer-events-none"
        style={{ bottom: '100px' }}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed bottom-[72px] left-0 right-0 z-40 bg-white border-t border-neutral-100 shadow-lg transition-transform duration-300 md:hidden safe-area-bottom',
          isVisible ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">{product.name}</p>
            <p className="text-lg font-bold text-primary-600 font-sans">
              {formatPrice(currentPrice)}
            </p>
          </div>

          <div className="flex gap-2">
            {[250, 500].map((weight) => (
              <button
                key={weight}
                onClick={() => onWeightChange(weight as Weight)}
                className={cn(
                  'px-3 py-2 text-xs font-medium rounded-lg transition-all min-h-[44px] min-w-[44px]',
                  selectedWeight === weight
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                )}
                aria-pressed={selectedWeight === weight}
              >
                {weight}g
              </button>
            ))}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={cn(
              'px-6 py-3 rounded-xl font-bold text-sm transition-all min-h-[44px]',
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : isAdding
                ? 'bg-emerald-500 text-white'
                : 'bg-secondary-500 text-white hover:bg-secondary-600'
            )}
          >
            {isOutOfStock ? 'Sin Stock' : isAdding ? '✓' : 'Agregar'}
          </button>
        </div>
      </div>
    </>
  )
}