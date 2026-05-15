'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types'
import { useRecentlyViewedStore } from '@/lib/store'
import { useHydration } from '@/hooks/useHydration'
import { formatPrice } from '@/lib/utils'
import { validateProductImage } from '@/lib/productImages'
import { useMemo } from 'react'

function RecentlyViewedItem({ product }: { product: Product }) {
  const productImage = useMemo(() => validateProductImage(
    product.images[0],
    product.category,
    product.subcategory
  ), [product.images, product.category, product.subcategory])

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-white rounded-xl border border-neutral-100 overflow-hidden hover:shadow-card transition-shadow"
    >
      <div className="relative aspect-square bg-neutral-50">
        <Image
          src={productImage}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-neutral-900 text-sm line-clamp-1 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-primary-600 font-semibold mt-1">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  )
}

export function RecentlyViewed() {
  const hydrated = useHydration()
  const products = useRecentlyViewedStore((state) => state.products)

  const displayedProducts = useMemo(() => products.slice(0, 4), [products])

  if (!hydrated || displayedProducts.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-neutral-900 font-display mb-6">
        Vistos Recientemente
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayedProducts.map((product) => (
          <RecentlyViewedItem key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}