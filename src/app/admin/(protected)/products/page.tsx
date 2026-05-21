'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useQuery, useMutation } from '@apollo/client/react'
import { formatPrice } from '@/lib/utils'
import { ImageUploadZone, ImageGallery } from '@/components/admin/ImageUpload'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { ToastContainer, useToast } from '@/components/Toast'
import BulkUploadPanel from '@/components/admin/BulkUploadPanel'
import BulkPriceActionBar from '@/components/admin/BulkPriceActionBar'
import {
  GET_ADMIN_PRODUCTS,
  GET_TAGS_FOR_ADMIN,
  GET_CATEGORIES,
  GET_SUPPLIERS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  CREATE_IMAGE,
  DELETE_IMAGE,
} from '@/lib/graphql/queries'
import {
  GraphQLProductsResult,
  GraphQLProductExtended,
  GraphQLTag,
  GraphQLCategory,
  GraphQLSuppliersResult,
  BulkPriceResult,
} from '@/lib/graphql/types'

// ── Local types ───────────────────────────────────────────────────────────────

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  original_price: number | null
  stock: number
  is_featured: boolean
  is_active: boolean
  is_organic: boolean
  is_gluten_free: boolean
  is_vegan: boolean
  is_keto: boolean
  brand: string | null
  category_id: string | null
  categories?: { name: string }
  product_images?: { id: string; url: string; is_primary: boolean }[]
  // new fields
  invoiceType?: string | null
  saleUnit?: string | null
  clientKiloPrice?: number | null
  clientPrice500g?: number | null
  clientPrice250g?: number | null
  clientPrice100g?: number | null
  clientUnitPrice?: number | null
}

interface ProductImage {
  url: string
  id?: string
  is_primary?: boolean
}

interface Tag {
  id: string
  name: string
  slug: string
}

interface ProductFormData {
  id: string | undefined
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  original_price: number | null
  category_id: string
  brand: string
  tags: string[]
  ingredients: string
  stock: number
  is_featured: boolean
  is_active: boolean
  is_organic: boolean
  is_gluten_free: boolean
  is_vegan: boolean
  is_keto: boolean
  weight_options: number[]
}

const emptyProduct: ProductFormData = {
  id: undefined,
  name: '',
  slug: '',
  description: '',
  short_description: '',
  price: 0,
  original_price: null,
  category_id: '',
  brand: '',
  tags: [],
  ingredients: '',
  stock: 0,
  is_featured: false,
  is_active: true,
  is_organic: false,
  is_gluten_free: false,
  is_vegan: false,
  is_keto: false,
  weight_options: [100, 250, 500, 1000],
}

// ── Derived-price display ─────────────────────────────────────────────────────

function DerivedPrices({ product }: { product: Product }) {
  if (!product.saleUnit) return null

  if (product.saleUnit === 'KG') {
    return (
      <div className="mt-2 space-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
        {product.clientKiloPrice != null && (
          <p>Precio x kilo: <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatPrice(product.clientKiloPrice)}</span></p>
        )}
        {product.clientPrice500g != null && (
          <p>x 500g: <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatPrice(product.clientPrice500g)}</span></p>
        )}
        {product.clientPrice250g != null && (
          <p>x 250g: <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatPrice(product.clientPrice250g)}</span></p>
        )}
        {product.clientPrice100g != null && (
          <p>x 100g: <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatPrice(product.clientPrice100g)}</span></p>
        )}
      </div>
    )
  }

  if (product.saleUnit === 'UNIT' && product.clientUnitPrice != null) {
    return (
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        <p>Precio x unidad: <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatPrice(product.clientUnitPrice)}</span></p>
      </div>
    )
  }

  return null
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-neutral-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="flex justify-between">
          <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<typeof emptyProduct | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [initialImageIds, setInitialImageIds] = useState<Set<string>>(new Set())
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  // multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const modalRef = useFocusTrap(showModal)
  const toast = useToast()

  // ── Queries ─────────────────────────────────────────────────────────────────

  const { data: productsData, refetch: refetchProducts, loading: productsLoading, error: productsError } =
    useQuery<GraphQLProductsResult>(GET_ADMIN_PRODUCTS, {
      variables: {
        first: 100,
        search: search || undefined,
        tagSlug: undefined, // kept for compat — we now use categoryId/supplierId
        categoryId: categoryFilter || undefined,
        supplierId: supplierFilter || undefined,
      },
    })

  const { data: tagsData } = useQuery<{ tags: GraphQLTag[] }>(GET_TAGS_FOR_ADMIN)

  const { data: categoriesData } = useQuery<{ categories: GraphQLCategory[] }>(GET_CATEGORIES)

  const { data: suppliersData } = useQuery<GraphQLSuppliersResult>(GET_SUPPLIERS)

  // ── Data adaptation ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (productsData?.products?.edges) {
      const adapted = (productsData.products.edges.map((e) => e.node) as GraphQLProductExtended[]).map(
        (p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          short_description: null,
          price: parseFloat(String(p.basePrice)) || 0,
          original_price: null,
          stock: 0,
          is_featured: false,
          is_active: p.isActive,
          is_organic: false,
          is_gluten_free: false,
          is_vegan: false,
          is_keto: false,
          brand: (p as { brand?: string | null }).brand || null,
          category_id: null,
          categories: undefined,
          product_images: p.images?.map((img) => ({
            id: img.id,
            url: img.url,
            is_primary: false,
          })),
          // new server-computed fields
          invoiceType: p.invoiceType ?? null,
          saleUnit: p.saleUnit ?? null,
          clientKiloPrice: p.clientKiloPrice ?? null,
          clientPrice500g: p.clientPrice500g ?? null,
          clientPrice250g: p.clientPrice250g ?? null,
          clientPrice100g: p.clientPrice100g ?? null,
          clientUnitPrice: p.clientUnitPrice ?? null,
        })
      ) as Product[]
      setProducts(adapted)
      setLoading(false)
    }
    if (!productsLoading) {
      setLoading(false)
    }
    if (productsError) {
      setError(productsError.message)
    }
  }, [productsData, productsLoading, productsError])

  useEffect(() => {
    if (tagsData?.tags) {
      setTags(
        tagsData.tags
          .filter((t): t is GraphQLTag => t !== null && t !== undefined)
          .map((t) => ({ id: t.id, name: t.name, slug: t.slug }))
      )
    }
  }, [tagsData])

  const fetchProducts = useCallback(() => {
    refetchProducts()
  }, [refetchProducts])

  // ── Mutations ────────────────────────────────────────────────────────────────

  const [createProduct] = useMutation(CREATE_PRODUCT)
  const [updateProduct] = useMutation(UPDATE_PRODUCT)
  const [deleteProduct] = useMutation(DELETE_PRODUCT)
  const [createImage] = useMutation(CREATE_IMAGE)
  const [deleteImage] = useMutation(DELETE_IMAGE)

  // ── CRUD handlers ────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!editingProduct) return

    const validationErrors: string[] = []
    if (!editingProduct.name.trim()) validationErrors.push('El nombre del producto es requerido')
    if (editingProduct.price <= 0) validationErrors.push('El precio debe ser mayor a 0')
    if (editingProduct.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(editingProduct.slug))
      validationErrors.push('El slug solo puede contener letras minúsculas, números y guiones')

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      return
    }
    if (saving) return
    setSaving(true)

    try {
      const createInput = {
        name: editingProduct.name.trim().replace(/<[^>]*>/g, ''),
        slug: editingProduct.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
        description: editingProduct.description?.trim().replace(/<[^>]*>/g, '') || null,
        sku: null,
        basePrice: editingProduct.price,
        tagIds: [],
        supplierIds: [],
      }

      const updateInput = {
        name: editingProduct.name.trim().replace(/<[^>]*>/g, ''),
        slug: editingProduct.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
        description: editingProduct.description?.trim().replace(/<[^>]*>/g, '') || null,
        sku: null,
        basePrice: editingProduct.price,
        isActive: editingProduct.is_active,
        isVisible: true,
        tagIds: [],
      }

      let savedProduct: GraphQLProductExtended | undefined
      if (editingProduct.id) {
        const result = await updateProduct({ variables: { id: editingProduct.id, input: updateInput } })
        savedProduct = (result.data as { updateProduct?: GraphQLProductExtended })?.updateProduct
      } else {
        const result = await createProduct({ variables: { input: createInput } })
        savedProduct = (result.data as { createProduct?: GraphQLProductExtended })?.createProduct
      }

      if (!savedProduct) throw new Error('Error saving product')

      if (editingProduct.id) {
        const currentImageIds = new Set(productImages.map((img) => img.id).filter(Boolean) as string[])
        const deletedImageIds = [...initialImageIds].filter((id) => !currentImageIds.has(id))
        for (const imageId of deletedImageIds) {
          try { await deleteImage({ variables: { id: imageId } }) } catch {}
        }
        for (let i = 0; i < productImages.length; i++) {
          const img = productImages[i]
          if (!img.id) {
            await createImage({
              variables: { input: { productId: editingProduct.id, url: img.url, altText: null, position: i } },
            })
          }
        }
      }

      setShowModal(false)
      setEditingProduct(null)
      setProductImages([])
      setInitialImageIds(new Set())
      fetchProducts()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      await deleteProduct({ variables: { id } })
      setSelectedIds((prev) => { const s = new Set(prev); s.delete(id); return s })
      fetchProducts()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  const openEdit = (product: Product) => {
    const images = (product.product_images || []).map((img) => ({
      url: img.url,
      id: img.id,
      is_primary: img.is_primary,
    }))
    setEditingProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      short_description: product.short_description || '',
      price: product.price,
      original_price: product.original_price,
      category_id: product.category_id || '',
      brand: product.brand || '',
      tags: [],
      ingredients: '',
      stock: product.stock,
      is_featured: product.is_featured,
      is_active: product.is_active,
      is_organic: product.is_organic,
      is_gluten_free: product.is_gluten_free,
      is_vegan: product.is_vegan,
      is_keto: product.is_keto,
      weight_options: [100, 250, 500, 1000],
    })
    setProductImages(images)
    setInitialImageIds(new Set(images.map((img) => img.id).filter(Boolean) as string[]))
    setShowModal(true)
  }

  const openNew = () => {
    setEditingProduct({ ...emptyProduct })
    setProductImages([])
    setInitialImageIds(new Set())
    setShowModal(true)
  }

  // ── Selection helpers ────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)))
    }
  }

  const handleBulkPriceSuccess = (result: BulkPriceResult) => {
    if (result.errors.length > 0) {
      toast.error(`Precios actualizados con ${result.errors.length} error(es). Revisá la consola.`)
    } else {
      toast.success(`Precios actualizados correctamente (${result.updated} producto${result.updated !== 1 ? 's' : ''})`)
    }
    fetchProducts()
  }

  // ── Image handlers ───────────────────────────────────────────────────────────

  const handleImageUpload = (url: string) => {
    setProductImages((prev) => [...prev, { url, is_primary: prev.length === 0 }])
  }

  const handleSetPrimary = (url: string) => {
    setProductImages((prev) => prev.map((img) => ({ ...img, is_primary: img.url === url })))
  }

  const handleDeleteImage = async (url: string) => {
    const image = productImages.find((img) => img.url === url)
    if (image?.id) {
      try { await deleteImage({ variables: { id: image.id } }) } catch (err) {
        toast.error(`Error al eliminar imagen: ${(err as Error).message}`)
      }
    }
    setProductImages((prev) => prev.filter((img) => img.url !== url))
  }

  const getStockBg = (stock: number) => {
    if (stock >= 100) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
    if (stock >= 50) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }

  const allSelected = products.length > 0 && selectedIds.size === products.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < products.length

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Productos</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">{products.length} productos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBulkUpload((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors font-medium text-sm border ${showBulkUpload ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/20 dark:border-primary-700 dark:text-primary-300' : 'border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Carga masiva
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-500/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Bulk upload panel */}
      {showBulkUpload && (
        <BulkUploadPanel
          onImportComplete={() => {
            fetchProducts()
            toast.success('Importación completada')
          }}
        />
      )}

      {/* Bulk price action bar */}
      <BulkPriceActionBar
        selectedIds={[...selectedIds]}
        onClearSelection={() => setSelectedIds(new Set())}
        onSuccess={handleBulkPriceSuccess}
      />

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white transition-all"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
          >
            <option value="">Todas las categorías</option>
            {categoriesData?.categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Supplier filter */}
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-4 py-2.5 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
          >
            <option value="">Todos los proveedores</option>
            {suppliersData?.suppliers?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}
              aria-label="Vista en grilla"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 rounded-xl transition-colors ${viewMode === 'table' ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}
              aria-label="Vista en tabla"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Product list */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchProducts} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors">
            Reintentar
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No hay productos</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">Empezá agregando tu primer producto</p>
          <button onClick={openNew} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
            Agregar Producto
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-4">
          {/* Grid selection toolbar */}
          <div className="flex items-center gap-3 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected }}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                aria-label="Seleccionar todos"
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {selectedIds.size > 0
                  ? `${selectedIds.size} seleccionado${selectedIds.size !== 1 ? 's' : ''}`
                  : 'Seleccionar todo'}
              </span>
            </label>
            {selectedIds.size > 0 && (
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                Limpiar selección
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white dark:bg-neutral-800 rounded-2xl border overflow-hidden hover:shadow-lg dark:hover:shadow-xl transition-all group relative ${selectedIds.has(product.id) ? 'border-primary-400 ring-2 ring-primary-300 dark:ring-primary-700' : 'border-neutral-100 dark:border-neutral-700 hover:border-neutral-200 dark:hover:border-neutral-600'}`}
            >
              {/* Checkbox */}
              <label className="absolute top-3 left-3 z-10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.has(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 bg-white shadow"
                  aria-label={`Seleccionar ${product.name}`}
                />
              </label>

              <div className="relative h-48 bg-gradient-to-br from-neutral-100 to-neutral-50 flex items-center justify-center">
                {product.product_images?.[0]?.url ? (
                  <Image src={product.product_images[0].url} alt={product.name} fill className="object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(product)} className="p-2 bg-white rounded-lg shadow-md hover:bg-neutral-100">
                    <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50">
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {!product.is_active && (
                  <span className="absolute bottom-3 left-3 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-lg">Inactivo</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{product.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{product.categories?.name || product.brand || 'Sin categoría'}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">{formatPrice(product.price)}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStockBg(product.stock)}`}>
                    {product.stock.toLocaleString('es-AR')} uds.
                  </span>
                </div>
                <DerivedPrices product={product} />
                {product.invoiceType && product.invoiceType !== 'NONE' && (
                  <span className="mt-2 inline-block px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-xs rounded">
                    Factura {product.invoiceType}
                  </span>
                )}
              </div>
            </div>
          ))}
          </div>
        </div>
      ) : (
        /* Table view */
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    aria-label="Seleccionar todos"
                  />
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">Producto</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">Categoría</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">Precio base</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">Precios cliente</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">Unidad</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">Factura</th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">Estado</th>
                <th className="px-4 py-4 text-right text-sm font-semibold text-neutral-900 dark:text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors ${selectedIds.has(product.id) ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      aria-label={`Seleccionar ${product.name}`}
                    />
                  </td>
                  <td className="px-4 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex-shrink-0 overflow-hidden relative">
                      {product.product_images?.[0]?.url && (
                        <Image src={product.product_images[0].url} alt={product.name} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{product.brand || 'Sin marca'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-600 dark:text-neutral-300">
                    {product.categories?.name || '—'}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-neutral-900 dark:text-white">{formatPrice(product.price)}</p>
                  </td>
                  <td className="px-4 py-4 text-xs text-neutral-500 dark:text-neutral-400 space-y-0.5">
                    {product.saleUnit === 'KG' ? (
                      <>
                        {product.clientKiloPrice != null && <p>x kilo: {formatPrice(product.clientKiloPrice)}</p>}
                        {product.clientPrice500g != null && <p>500g: {formatPrice(product.clientPrice500g)}</p>}
                        {product.clientPrice250g != null && <p>250g: {formatPrice(product.clientPrice250g)}</p>}
                        {product.clientPrice100g != null && <p>100g: {formatPrice(product.clientPrice100g)}</p>}
                      </>
                    ) : product.saleUnit === 'UNIT' && product.clientUnitPrice != null ? (
                      <p>x unidad: {formatPrice(product.clientUnitPrice)}</p>
                    ) : (
                      <span className="text-neutral-300 dark:text-neutral-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-600 dark:text-neutral-300">
                    {product.saleUnit === 'KG' ? 'Kg' : product.saleUnit === 'UNIT' ? 'Unidad' : '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-neutral-600 dark:text-neutral-300">
                    {product.invoiceType && product.invoiceType !== 'NONE' ? product.invoiceType : '—'}
                  </td>
                  <td className="px-4 py-4">
                    {!product.is_active && (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-lg font-medium">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(product)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / New modal */}
      {showModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" ref={modalRef}>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {editingProduct.id ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg">
                <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nombre *</label>
                <input
                  id="product-name"
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Slug</label>
                <input
                  id="product-slug"
                  type="text"
                  value={editingProduct.slug}
                  onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Precio base *</label>
                <input
                  id="product-price"
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Descripción</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                />
              </div>
              {editingProduct.id && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Activo</span>
                </label>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Imágenes del Producto</label>
                <ImageUploadZone onUploadComplete={handleImageUpload} className="mb-3" />
                {productImages.length > 0 && (
                  <ImageGallery images={productImages} onSetPrimary={handleSetPrimary} onDelete={handleDeleteImage} />
                )}
              </div>
            </div>
            <div className="p-6 border-t border-neutral-100 dark:border-neutral-700 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingProduct.name || editingProduct.price <= 0}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
