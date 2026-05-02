'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductGridSkeleton } from '@/components/ProductGridSkeleton'
import { products } from '@/data/products'
import { categories } from '@/data/categories'

function CatalogContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || ''

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'popularity'>('popularity')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory)
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'popularity':
        result.sort((a, b) => b.reviews - a.reviews)
        break
    }

    return result
  }, [selectedCategory, search, sortBy])

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Categorías</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === ''}
              onChange={() => setSelectedCategory('')}
              className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
            />
            <span className="text-neutral-700">Todas</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.slug}
                onChange={() => setSelectedCategory(cat.slug)}
                className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
              />
              <span className="text-neutral-700">{cat.name}</span>
              <span className="text-xs text-neutral-400">({cat.productCount})</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Dietas</h3>
        <div className="flex flex-wrap gap-2">
          {['vegano', 'keto', 'sin-tacc', 'organico'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearch(tag)}
              className="px-3 py-1 text-sm bg-neutral-100 text-neutral-700 rounded-full hover:bg-primary-100 hover:text-primary-700 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 font-display mb-2">
            Nuestra Tienda
          </h1>
          <p className="text-neutral-600">
            {filteredProducts.length} productos encontrados
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white p-6 rounded-2xl border border-neutral-100">
              <FilterSidebar />
            </div>
          </aside>

          <div className="flex-1">
            <div className="bg-white p-4 rounded-xl border border-neutral-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-auto flex-1 max-w-md">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtros
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-4 py-2.5 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                >
                  <option value="popularity">Más Vendidos</option>
                  <option value="name">Nombre A-Z</option>
                  <option value="price-low">Menor Precio</option>
                  <option value="price-high">Mayor Precio</option>
                </select>
              </div>
            </div>

            {filtersOpen && (
              <div className="lg:hidden bg-white p-6 rounded-xl border border-neutral-100 mb-6 animate-slide-down">
                <FilterSidebar />
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-24 h-24 text-neutral-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-neutral-600 mb-6">
                  Intentá con otros términos de búsqueda o ajustá los filtros.
                </p>
                <button
                  onClick={() => {
                    setSearch('')
                    setSelectedCategory('')
                  }}
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-10 bg-neutral-200 rounded animate-pulse w-64 mb-2" />
            <div className="h-5 bg-neutral-200 rounded animate-pulse w-32" />
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white p-6 rounded-2xl border border-neutral-100 space-y-4">
                <div className="h-6 bg-neutral-200 rounded animate-pulse" />
                <div className="space-y-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-4 bg-neutral-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </aside>
            <div className="flex-1">
              <div className="bg-white p-4 rounded-xl border border-neutral-100 mb-6">
                <div className="flex gap-4">
                  <div className="h-10 bg-neutral-200 rounded animate-pulse flex-1 max-w-md" />
                  <div className="h-10 bg-neutral-200 rounded animate-pulse w-32" />
                </div>
              </div>
              <ProductGridSkeleton count={8} />
            </div>
          </div>
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  )
}