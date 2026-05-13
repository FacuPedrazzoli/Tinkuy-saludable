'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRecentlyViewedStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { validateProductImage } from '@/lib/productImages'

export function RecentlyViewed() {
  const { products } = useRecentlyViewedStore()

  if (products.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-neutral-900 font-display mb-6">
        Vistos Recientemente
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.slice(0, 4).map((product) => {
          const productImage = validateProductImage(
            product.images[0],
            product.category,
            product.subcategory
          )

          return (
            <Link
              key={product.id}
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
        })}
      </div>
    </section>
  )
}