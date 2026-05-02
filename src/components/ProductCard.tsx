'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { useCartStore, WEIGHTS, Weight, calculatePrice } from '@/lib/store'
import { useState, useEffect, useRef } from 'react'
import { useToast } from './Toast'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedWeight, setSelectedWeight] = useState<Weight>(250)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCartStore()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0

  const currentPrice = calculatePrice(product.price, selectedWeight)
  const isOutOfStock = product.stock === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    addItem(product, 1, selectedWeight)
    showToast(`${product.name} agregado al carrito`, 'success')
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsAdding(false)
    }, 500)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-primary-100 hover:border-primary-300 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary-500/10">
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative bg-cream-100 overflow-hidden h-44">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.featured && (
              <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-md">
                Destacado
              </span>
            )}
            {discount > 0 && (
              <span className="px-2 py-0.5 bg-secondary-400 text-white text-xs font-semibold rounded-md">
                -{discount}%
              </span>
            )}
            {product.promo && !discount && (
              <span className="px-2 py-0.5 bg-sage-500 text-white text-xs font-semibold rounded-md">
                {product.promo}
              </span>
            )}
          </div>
          {product.organic && (
            <div className="absolute top-2 right-2 w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 2A2 2 0 002 4v14a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H5zm0 2h10v2H5V4zm0 4h10v2H5V8zm0 4h7v2H5v-2z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
        </div>
        <div className="p-3.5">
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {product.glutenFree && (
              <span className="text-xs text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                Sin TACC
              </span>
            )}
            {product.vegan && (
              <span className="text-xs text-sage-600 bg-sage-50 px-1.5 py-0.5 rounded">
                Vegano
              </span>
            )}
            {product.keto && (
              <span className="text-xs text-secondary-600 bg-secondary-50 px-1.5 py-0.5 rounded">
                Keto
              </span>
            )}
          </div>
          <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1 text-sm">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-primary-600">
                {formatPrice(currentPrice)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-neutral-400 line-through">
                  {formatPrice(calculatePrice(product.originalPrice, selectedWeight))}
                </span>
              )}
            </div>
            <span className="text-xs text-neutral-400">x{selectedWeight}g</span>
          </div>

          <div className="flex gap-1.5 mb-3">
            {WEIGHTS.map((weight) => (
              <button
                key={weight}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedWeight(weight)
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedWeight === weight
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-cream-100 text-neutral-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                {weight}g
              </button>
            ))}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isOutOfStock
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : isAdding
                ? 'bg-green-500 text-white'
                : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md'
            }`}
          >
            {isOutOfStock ? 'Sin Stock' : isAdding ? '¡Agregado!' : 'Agregar al Carrito'}
          </button>
        </div>
      </Link>
    </div>
  )
}