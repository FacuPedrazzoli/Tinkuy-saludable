'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useCartStore, WEIGHTS, type Weight, calculatePrice } from '@/lib/store'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Product } from '@/types'
import { validateProductImage } from '@/lib/productImages'

interface ProductActionsProps {
  product: Product
}

export function ProductActions({ product }: ProductActionsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedWeight, setSelectedWeight] = useState<Weight>(250)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStickyVisible, setIsStickyVisible] = useState(false)
  const { addItem } = useCartStore()
  const addToCartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStickyVisible(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    )

    if (addToCartRef.current) {
      observer.observe(addToCartRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleAddToCart = useCallback(() => {
    setIsAdding(true)
    addItem(product, quantity, selectedWeight)
    setTimeout(() => setIsAdding(false), 500)
  }, [addItem, product, quantity, selectedWeight])

  const productImage = validateProductImage(
    product.images[0],
    product.category,
    product.subcategory
  )

  const currentPrice = useMemo(() => calculatePrice(product.price, selectedWeight), [product.price, selectedWeight])
  const discount = useMemo(() => product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0, [product.originalPrice, product.price])
  const isLowStock = product.stock > 0 && product.stock < 20

  return (
    <>
      <div className="space-y-4">
        <div
            className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-neutral-100 cursor-zoom-in"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onClick={() => setIsModalOpen(true)}
          >
            <Image
              src={selectedImage === 0 ? productImage : product.images[selectedImage]}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              placeholder="empty"
              unoptimized={productImage.includes('supabase') || productImage.includes('unsplash')}
            />
          {product.promo && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-primary-600 text-white text-sm font-bold rounded-full">
              {product.promo}
            </span>
          )}
        </div>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
          {product.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                'relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all min-w-[44px] min-h-[44px]',
                selectedImage === index
                  ? 'border-primary-600 ring-2 ring-primary-600/20'
                  : 'border-neutral-100 hover:border-neutral-200'
              )}
            >
              <Image
                src={index === 0 ? productImage : image}
                alt={`${product.name} - Imagen ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                placeholder="empty"
                unoptimized={productImage.includes('supabase') || productImage.includes('unsplash')}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.organic && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Orgánico
              </span>
            )}
            {product.glutenFree && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                Sin Gluten
              </span>
            )}
            {product.vegan && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                Vegano
              </span>
            )}
            {product.keto && (
              <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                Keto
              </span>
            )}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 font-display mb-2">
            {product.name}
          </h1>
          <p className="text-lg text-neutral-600">{product.shortDescription}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={cn(
                  'w-5 h-5',
                  star <= Math.round(product.rating) ? 'text-amber-400' : 'text-neutral-300'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-neutral-600">
            {product.rating} ({product.reviews} reseñas)
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-neutral-900 font-mono">{formatPrice(currentPrice)}</span>
          {product.originalPrice && (
            <>
              <span className="text-xl text-neutral-400 line-through">
                {formatPrice(calculatePrice(product.originalPrice, selectedWeight))}
              </span>
              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm font-bold rounded-lg">
                {discount}% OFF
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-neutral-500">Precio por 100g</p>

        <div className="border-t border-b border-neutral-100 py-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-3">
              Presentación
            </label>
            <div className="flex flex-wrap gap-2">
              {WEIGHTS.map((weight) => (
                <button
                  key={weight}
                  onClick={() => setSelectedWeight(weight)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 font-medium transition-all',
                    selectedWeight === weight
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  )}
                >
                  {weight}g
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-3">
              Cantidad
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-11 h-11 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors"
                aria-label="Reducir cantidad"
              >
                <span className="text-lg">−</span>
              </button>
              <span className="w-12 text-center font-medium text-neutral-900" aria-label={`Cantidad: ${quantity}`}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-11 h-11 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors"
                aria-label="Aumentar cantidad"
              >
                <span className="text-lg">+</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3" ref={addToCartRef}>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={cn(
                'flex-1 px-6 py-4 font-bold rounded-xl transition-colors flex items-center justify-center gap-2',
                isAdding
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              )}
            >
              {isAdding ? (
                <>
                  <svg className="w-5 h-5 animate-scale-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Agregado
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Agregar al Carrito
                </>
              )}
            </button>
          </div>

          <div
            className={cn(
              'fixed bottom-[72px] left-0 right-0 z-40 bg-white border-t border-neutral-100 shadow-lg transition-transform duration-300 md:hidden safe-area-bottom',
              isStickyVisible ? 'translate-y-0' : 'translate-y-full'
            )}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{product.name}</p>
                <p className="text-lg font-bold text-primary-600 font-mono">
                  {formatPrice(currentPrice)}
                </p>
              </div>

              <div className="flex gap-2">
                {( [250, 500] as Weight[]).map((weight) => (
                  <button
                    key={weight}
                    onClick={() => setSelectedWeight(weight)}
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
                disabled={isAdding || product.stock === 0}
                className={cn(
                  'px-6 py-3 rounded-xl font-bold text-sm transition-all min-h-[44px]',
                  product.stock === 0
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : isAdding
                    ? 'bg-emerald-500 text-white'
                    : 'bg-secondary-500 text-white hover:bg-secondary-600'
                )}
              >
                {product.stock === 0 ? 'Sin Stock' : isAdding ? '✓' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>

        {isLowStock && (
          <p className="text-sm text-amber-600 font-medium">
            Solo quedan {product.stock} unidades
          </p>
        )}

        {product.brand && (
          <p className="text-sm text-neutral-500">
            Marca: <span className="font-medium text-neutral-900">{product.brand}</span>
          </p>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          role="dialog"
          aria-modal="true"
          aria-label="Zoom de imagen"
          onClick={() => setIsModalOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsModalOpen(false)
            }
          }}
          ref={(el) => {
            if (el) {
              el.focus()
            }
          }}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
            onClick={() => setIsModalOpen(false)}
            aria-label="Cerrar visor de imagen"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative w-full max-w-4xl aspect-square" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage === 0 ? productImage : product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
              placeholder="empty"
              unoptimized={productImage.includes('supabase') || productImage.includes('unsplash')}
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" role="group" aria-label="Miniaturas">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  'w-16 h-16 rounded-lg overflow-hidden border-2',
                  selectedImage === index ? 'border-white' : 'border-transparent'
                )}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <Image
                  src={index === 0 ? productImage : image}
                  alt={`${product.name} - Miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  placeholder="empty"
                  unoptimized={productImage.includes('supabase') || productImage.includes('unsplash')}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}