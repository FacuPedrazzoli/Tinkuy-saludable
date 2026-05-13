'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { useCartStore, useWishlistStore, WEIGHTS, Weight, calculatePrice } from '@/lib/store'
import { useState, useEffect, useRef } from 'react'
import { validateProductImage } from '@/lib/productImages'

interface ProductCardProps {
  product: Product
  className?: string
  priority?: boolean
}

export function ProductCard({ product, className, priority }: ProductCardProps) {
  const [selectedWeight, setSelectedWeight] = useState<Weight>(250)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCartStore()
  const { isInWishlist, toggleItem } = useWishlistStore()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const inWishlist = isInWishlist(product.id)

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
  const hasTags = product.glutenFree || product.vegan || product.keto

  const productImage = validateProductImage(
    product.images?.[0],
    product.category,
    product.subcategory
  )

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    addItem(product, 1, selectedWeight)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsAdding(false)
    }, 500)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product)
  }

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-primary-200 transition-all duration-300 shadow-card hover:shadow-card-hover group ${className || ''}`}>
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative bg-gradient-to-br from-cream-50 to-cream-100 overflow-hidden h-52">
          <Image
            src={productImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
          />
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors z-10"
            aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <svg
              className={`w-4 h-4 transition-colors ${inWishlist ? 'text-secondary-400 fill-current' : 'text-neutral-400'}`}
              fill={inWishlist ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {discount > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-secondary-400 text-white text-xs font-semibold rounded-md">
              -{discount}%
            </span>
          )}
        </div>
        <div className="p-3.5">
          {hasTags && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {product.glutenFree && (
                <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  Sin TACC
                </span>
              )}
              {product.vegan && (
                <span className="text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                  Vegano
                </span>
              )}
              {product.keto && (
                <span className="text-xs text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded">
                  Keto
                </span>
              )}
            </div>
          )}
          <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1 text-sm">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-xl font-bold text-neutral-900 font-mono">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-neutral-500">/ 100g</span>
            {product.originalPrice && (
              <span className="text-sm text-neutral-400 line-through ml-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex gap-1.5 mb-3 sm:hidden">
            {[250, 500].map((weight) => (
              <button
                key={weight}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedWeight(weight as Weight)
                }}
                className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all min-h-[44px] ${
                  selectedWeight === weight
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-cream-100 text-neutral-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                {weight}g
              </button>
            ))}
          </div>
          <div className="hidden sm:flex gap-1.5 mb-3">
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
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm text-neutral-500">Total:</span>
            <span className="text-lg font-bold text-primary-600 font-mono">
              {formatPrice(currentPrice)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : isAdding
                ? 'bg-emerald-500 text-white shadow-button'
                : 'bg-secondary-500 text-white hover:bg-secondary-600 shadow-button hover:shadow-button-hover active:scale-[0.98]'
            }`}
          >
            {isOutOfStock ? 'Sin Stock' : isAdding ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-scale-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Agregado
              </span>
            ) : 'Agregar al Carrito'}
          </button>
        </div>
      </Link>
    </div>
  )
}