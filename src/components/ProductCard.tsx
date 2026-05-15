'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { useCartStore, useWishlistStore, WEIGHTS, Weight, calculatePrice } from '@/lib/store'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { validateProductImage } from '@/lib/productImages'
import { useHydration } from '@/hooks/useHydration'

interface ProductCardProps {
  product: Product
  className?: string
  priority?: boolean
}

export function ProductCard({ product, className, priority }: ProductCardProps) {
  const [selectedWeight, setSelectedWeight] = useState<Weight>(250)
  const [isAdding, setIsAdding] = useState(false)
  const hydrated = useHydration()
  const addItem = useCartStore((state) => state.addItem)
  const wishlistItems = useWishlistStore((state) => state.items)
  const toggleItem = useWishlistStore((state) => state.toggleItem)
  const inWishlist = useMemo(() => wishlistItems.some((p) => p.id === product.id), [wishlistItems, product.id])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const discount = useMemo(() =>
    product.originalPrice
      ? calculateDiscount(product.originalPrice, product.price)
      : 0,
    [product.originalPrice, product.price]
  )

  const currentPrice = useMemo(() =>
    calculatePrice(product.price, selectedWeight),
    [product.price, selectedWeight]
  )
  const isOutOfStock = product.stock === 0
  const hasTags = product.glutenFree || product.vegan || product.keto

  const productImage = useMemo(() =>
    validateProductImage(
      product.images?.[0],
      product.category,
      product.subcategory
    ),
    [product.images, product.category, product.subcategory]
  )

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    addItem(product, 1, selectedWeight)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsAdding(false)
    }, 1500)
  }, [addItem, product, selectedWeight])

  const handleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product)
  }, [toggleItem, product])

  return (
    <div className={`group bg-white rounded-2xl overflow-hidden border border-neutral-100 transition-all duration-200 shadow-card hover:shadow-[0_8px_30px_rgba(74,124,89,0.12)] hover:-translate-y-0.5 hover:border-primary-200 ${className || ''}`}>
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative bg-gradient-to-br from-cream-50 to-cream-100 overflow-hidden aspect-square">
          <Image
            src={productImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
            placeholder="empty"
            unoptimized={productImage.includes('supabase') || productImage.includes('unsplash')}
          />

          {discount > 0 && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary-500 text-white text-xs font-bold rounded-lg shadow-sm">
              -{discount}%
            </span>
          )}

          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md transition-all duration-300 hover:scale-110 ${
              inWishlist ? 'text-primary-500' : 'text-neutral-400 hover:text-primary-500'
            }`}
            aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <svg
              className="w-5 h-5 transition-transform duration-300"
              fill={inWishlist ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="px-4 py-2 bg-neutral-900 text-white text-sm font-semibold rounded-lg">Sin Stock</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="min-h-[28px] flex flex-wrap gap-1.5 content-start">
            {hasTags ? (
              <>
                {product.glutenFree && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Sin TACC
                  </span>
                )}
                {product.vegan && (
                  <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                    Vegano
                  </span>
                )}
                {product.keto && (
                  <span className="text-[10px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                    Keto
                  </span>
                )}
              </>
            ) : null}
          </div>

          <h3 className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-2 text-sm leading-tight min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-neutral-900">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-neutral-400">/ 100g</span>
            {product.originalPrice && (
              <span className="text-sm text-neutral-400 line-through ml-auto">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="hidden sm:block" role="group" aria-label="Seleccionar peso">
            <div className="flex gap-1.5">
              {WEIGHTS.map((weight) => (
                <button
                  key={weight}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedWeight(weight)
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 min-h-[40px] ${
                    selectedWeight === weight
                      ? 'bg-neutral-900 text-white shadow-md'
                      : 'bg-cream-100 text-neutral-600 hover:bg-cream-200'
                  }`}
                  aria-pressed={selectedWeight === weight}
                  aria-label={`${weight} gramos`}
                >
                  {weight}g
                </button>
              ))}
            </div>
          </div>

          <div className="sm:hidden" role="group" aria-label="Seleccionar peso">
            <div className="flex gap-1.5">
              {[250, 500].map((weight) => (
                <button
                  key={weight}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedWeight(weight as Weight)
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 min-h-[40px] ${
                    selectedWeight === weight
                      ? 'bg-neutral-900 text-white shadow-md'
                      : 'bg-cream-100 text-neutral-600 hover:bg-cream-200'
                  }`}
                  aria-pressed={selectedWeight === weight}
                  aria-label={`${weight} gramos`}
                >
                  {weight}g
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-neutral-500">Total:</span>
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(currentPrice)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 min-h-[48px] ${
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : isAdding
                ? 'bg-emerald-500 text-white shadow-lg scale-[1.02]'
                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg active:scale-[0.98]'
            }`}
          >
            {isOutOfStock ? 'Sin Stock' : isAdding ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Agregado
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar al Carrito
              </span>
            )}
          </button>
        </div>
      </Link>
    </div>
  )
}