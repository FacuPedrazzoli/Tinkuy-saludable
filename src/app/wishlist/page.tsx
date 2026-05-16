'use client'

import { useWishlistStore } from '@/lib/store'
import { useHydration } from '@/hooks/useHydration'
import { ProductCard } from '@/components/ProductCard'
import Link from 'next/link'

export default function WishlistPage() {
  const hydrated = useHydration()
  const items = useWishlistStore((state) => state.items)

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 font-display mb-2">
              Mi Lista de Deseos
            </h1>
          </div>
          <div className="animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-80" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 font-display mb-2">
            Mi Lista de Deseos
          </h1>
          <p className="text-neutral-600">
            {items.length === 0
              ? 'Tu lista está vacía'
              : `${items.length} producto${items.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-neutral-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Tu lista de deseos está vacía
            </h3>
            <p className="text-neutral-600 mb-6">
              Guardá los productos que te gusten para comprarlos después
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}