'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductGridSkeleton } from '@/components/ProductGridSkeleton'
import { Product } from '@/types'

interface CatalogResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function CatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialCategory = searchParams.get('category') || ''
  const initialPage = parseInt(searchParams.get('page') || '1')

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(initialPage)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'rating'>('rating')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    is_organic: false,
    is_vegan: false,
    is_gluten_free: false,
    is_keto: false,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchProducts = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '24')

      if (selectedCategory) params.set('category', selectedCategory)
      if (debouncedSearch) params.set('search', debouncedSearch)

      if (filters.is_organic) params.set('is_organic', 'true')
      if (filters.is_vegan) params.set('is_vegan', 'true')
      if (filters.is_gluten_free) params.set('is_gluten_free', 'true')
      if (filters.is_keto) params.set('is_keto', 'true')

      if (sortBy === 'name') {
        params.set('sort', 'name')
        params.set('order', 'asc')
      } else if (sortBy === 'price-low') {
        params.set('sort', 'price')
        params.set('order', 'asc')
      } else if (sortBy === 'price-high') {
        params.set('sort', 'price')
        params.set('order', 'desc')
      } else if (sortBy === 'rating') {
        params.set('sort', 'rating')
        params.set('order', 'desc')
      }

      const res = await fetch(`/api/products/catalog?${params.toString()}`)
      const data: CatalogResponse = await res.json()

      setProducts(data.products)
      setTotal(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
      setCurrentPage(data.pagination.page)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, debouncedSearch, filters, sortBy])

  useEffect(() => {
    fetchProducts(1)
  }, [fetchProducts])

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory) params.set('category', selectedCategory)
    if (currentPage > 1) params.set('page', currentPage.toString())

    const newUrl = params.toString() ? `/catalog?${params.toString()}` : '/catalog'
    router.push(newUrl, { scroll: false })
  }, [selectedCategory, currentPage, router])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
              onChange={() => handleCategoryChange('')}
              className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
            />
            <span className="text-neutral-700">Todas</span>
          </label>
          {[
            { slug: 'frutos-secos', name: 'Frutos Secos' },
            { slug: 'semillas', name: 'Semillas' },
            { slug: 'harinas', name: 'Harinas' },
            { slug: 'proteinas', name: 'Proteínas' },
            { slug: 'snacks', name: 'Snacks' },
            { slug: 'sin-tacc', name: 'Sin TACC' },
            { slug: 'keto', name: 'Keto' },
            { slug: 'vegano', name: 'Vegano' },
            { slug: 'endulzantes', name: 'Endulzantes' },
            { slug: 'granolas', name: 'Granolas' },
            { slug: 'infusiones', name: 'Infusiones' },
            { slug: 'suplementos', name: 'Suplementos' },
          ].map((cat) => (
            <label key={cat.slug} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.slug}
                onChange={() => handleCategoryChange(cat.slug)}
                className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
              />
              <span className="text-neutral-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-neutral-900 mb-3">Dietas</h3>
        <div className="space-y-2">
          {[
            { key: 'is_organic', label: 'Orgánico', color: 'emerald' },
            { key: 'is_vegan', label: 'Vegano', color: 'green' },
            { key: 'is_gluten_free', label: 'Sin TACC', color: 'amber' },
            { key: 'is_keto', label: 'Keto', color: 'pink' },
          ].map((filter) => (
            <label key={filter.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters[filter.key as keyof typeof filters]}
                onChange={(e) => setFilters(prev => ({ ...prev, [filter.key]: e.target.checked }))}
                className={`w-4 h-4 rounded border-neutral-300 text-${filter.color}-600 focus:ring-${filter.color}-500`}
              />
              <span className="text-neutral-700">{filter.label}</span>
            </label>
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
            {loading ? 'Cargando...' : `${total} productos encontrados`}
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
                  <option value="rating">Más Vendidos</option>
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

            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
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
                    setFilters({ is_organic: false, is_vegan: false, is_gluten_free: false, is_keto: false })
                  }}
                  className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 border border-neutral-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium ${
                              currentPage === pageNum
                                ? 'bg-primary-600 text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 border border-neutral-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className="text-center text-sm text-neutral-500 mt-4">
                  Mostrando {(currentPage - 1) * 24 + 1}-{Math.min(currentPage * 24, total)} de {total} productos
                </p>
              </>
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