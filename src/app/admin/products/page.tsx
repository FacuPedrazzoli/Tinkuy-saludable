'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { ImageUploadZone, ImageGallery } from '@/components/admin/ImageUpload'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { ToastContainer, useToast } from '@/components/Toast'

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
}

interface ProductImage {
  url: string
  id?: string
  is_primary?: boolean
}

interface Category {
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

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-neutral-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-neutral-200 rounded" />
        <div className="h-4 w-1/2 bg-neutral-200 rounded" />
        <div className="flex justify-between">
          <div className="h-6 w-20 bg-neutral-200 rounded" />
          <div className="h-6 w-16 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<typeof emptyProduct | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [initialImageIds, setInitialImageIds] = useState<Set<string>>(new Set())
  const modalRef = useFocusTrap(showModal)
  const toast = useToast()

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (search) params.set('search', search)
      if (categoryFilter) params.set('category', categoryFilter)

      const res = await fetch(`/api/products?${params}`)
      if (!res.ok) throw new Error('Error fetching products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      setError('Error cargando productos')
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Error fetching categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const handleSave = async () => {
    if (!editingProduct) return

    const validationErrors: string[] = []
    if (!editingProduct.name.trim()) {
      validationErrors.push('El nombre del producto es requerido')
    }
    if (editingProduct.price <= 0) {
      validationErrors.push('El precio debe ser mayor a 0')
    }
    if (editingProduct.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(editingProduct.slug)) {
      validationErrors.push('El slug solo puede contener letras minúsculas, números y guiones (sin guiones consecutivos)')
    }

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      if (validationErrors[0].includes('nombre')) {
        const nameInput = document.getElementById('product-name')
        nameInput?.focus()
      } else if (validationErrors[0].includes('slug')) {
        const slugInput = document.getElementById('product-slug')
        slugInput?.focus()
      } else if (validationErrors[0].includes('precio')) {
        const priceInput = document.getElementById('product-price')
        priceInput?.focus()
      }
      return
    }

    if (saving) return
    setSaving(true)

    try {
      const url = editingProduct.id
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      const method = editingProduct.id ? 'PUT' : 'POST'

      const sanitizedData = {
        name: editingProduct.name.trim().replace(/<[^>]*>/g, ''),
        slug: editingProduct.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
        description: editingProduct.description?.trim().replace(/<[^>]*>/g, '') || null,
        short_description: editingProduct.short_description?.trim().replace(/<[^>]*>/g, '') || null,
        price: editingProduct.price,
        original_price: editingProduct.original_price || null,
        category_id: editingProduct.category_id || null,
        brand: editingProduct.brand?.trim().replace(/<[^>]*>/g, '') || null,
        ingredients: editingProduct.ingredients?.trim().replace(/<[^>]*>/g, '') || null,
        stock: editingProduct.stock,
        is_featured: editingProduct.is_featured,
        is_active: editingProduct.is_active,
        is_organic: editingProduct.is_organic,
        is_gluten_free: editingProduct.is_gluten_free,
        is_vegan: editingProduct.is_vegan,
        is_keto: editingProduct.is_keto,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData),
      })

      if (!res.ok) {
        const data = await res.json()
        const errorMessage = typeof data.error === 'string' ? data.error : 'Error saving product'

        throw new Error(errorMessage)
      }

      const savedProduct = await res.json()

      if (editingProduct.id) {
        const currentImageIds = new Set(productImages.map(img => img.id).filter(Boolean) as string[])
        const deletedImageIds = [...initialImageIds].filter(id => !currentImageIds.has(id))

        for (const imageId of deletedImageIds) {
          try {
            await fetch(`/api/products/images/${imageId}`, { method: 'DELETE' })
          } catch (err) {
            console.error('Error deleting image:', err)
          }
        }

        for (let i = 0; i < productImages.length; i++) {
          const img = productImages[i]
          if (!img.id) {
            await fetch('/api/products/images', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                product_id: editingProduct.id,
                url: img.url,
                is_primary: img.is_primary || i === 0,
                sort_order: i,
              }),
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
      const error = err as Error
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }
    if (editingProduct.price <= 0) {
      validationErrors.push('El precio debe ser mayor a 0')
    }
    if (editingProduct.slug && !/^[a-z0-9-]+$/.test(editingProduct.slug)) {
      validationErrors.push('El slug solo puede contener letras minúsculas, números y guiones')
    }

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      return
    }

    if (saving) return
    setSaving(true)

    try {
      const url = editingProduct.id
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      const method = editingProduct.id ? 'PUT' : 'POST'

      const sanitizedData = {
        name: editingProduct.name.trim().replace(/<[^>]*>/g, ''),
        slug: editingProduct.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description: editingProduct.description?.trim().replace(/<[^>]*>/g, '') || null,
        short_description: editingProduct.short_description?.trim().replace(/<[^>]*>/g, '') || null,
        price: editingProduct.price,
        original_price: editingProduct.original_price || null,
        category_id: editingProduct.category_id || null,
        brand: editingProduct.brand?.trim().replace(/<[^>]*>/g, '') || null,
        ingredients: editingProduct.ingredients?.trim().replace(/<[^>]*>/g, '') || null,
        stock: editingProduct.stock,
        is_featured: editingProduct.is_featured,
        is_active: editingProduct.is_active,
        is_organic: editingProduct.is_organic,
        is_gluten_free: editingProduct.is_gluten_free,
        is_vegan: editingProduct.is_vegan,
        is_keto: editingProduct.is_keto,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData),
      })

      if (!res.ok) {
        const data = await res.json()
        const errorMessage = typeof data.error === 'string' ? data.error : 'Error saving product'
        throw new Error(errorMessage)
      }

      const savedProduct = await res.json()

      if (editingProduct.id) {
        const currentImageIds = new Set(productImages.map(img => img.id).filter(Boolean) as string[])
        const deletedImageIds = [...initialImageIds].filter(id => !currentImageIds.has(id))

        for (const imageId of deletedImageIds) {
          try {
            const deleteRes = await fetch(`/api/products/images/${imageId}`, { method: 'DELETE' })
            if (!deleteRes.ok) {
              const errorData = await deleteRes.json().catch(() => ({}))
              throw new Error(errorData.error || 'Error deleting image')
            }
          } catch (err) {
            const error = err as Error
            toast.error(`Error al eliminar imagen: ${error.message}`)
            console.error('Error deleting image:', err)
          }
        }

        for (let i = 0; i < productImages.length; i++) {
          const img = productImages[i]
          if (!img.id) {
            try {
              const uploadRes = await fetch('/api/products/images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  product_id: editingProduct.id,
                  url: img.url,
                  is_primary: img.is_primary || i === 0,
                  sort_order: i,
                }),
              })
              if (!uploadRes.ok) {
                const errorData = await uploadRes.json().catch(() => ({}))
                throw new Error(errorData.error || 'Error uploading image')
              }
            } catch (err) {
              const error = err as Error
              toast.error(`Error al subir imagen: ${error.message}`)
              console.error('Error uploading image:', err)
            }
          }
        }
      }

      setShowModal(false)
      setEditingProduct(null)
      setProductImages([])
      setInitialImageIds(new Set())
      fetchProducts()
    } catch (err) {
      const error = err as Error
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error deleting product')
      fetchProducts()
    } catch (err) {
      const error = err as Error
      toast.error(error.message)
    }
  }

  const openEdit = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`)
      if (!res.ok) throw new Error('Error fetching product')
      const fullProduct = await res.json()

      const images = (fullProduct.product_images || []).map((img: { url: string; id: string; is_primary: boolean }) => ({
        url: img.url,
        id: img.id,
        is_primary: img.is_primary,
      }))

      setEditingProduct({
        id: fullProduct.id,
        name: fullProduct.name,
        slug: fullProduct.slug,
        description: fullProduct.description || '',
        short_description: fullProduct.short_description || '',
        price: fullProduct.price,
        original_price: fullProduct.original_price,
        category_id: fullProduct.category_id || '',
        brand: fullProduct.brand || '',
        tags: fullProduct.tags || [],
        ingredients: fullProduct.ingredients || '',
        stock: fullProduct.stock,
        is_featured: fullProduct.is_featured || false,
        is_active: fullProduct.is_active !== false,
        is_organic: fullProduct.is_organic || false,
        is_gluten_free: fullProduct.is_gluten_free || false,
        is_vegan: fullProduct.is_vegan || false,
        is_keto: fullProduct.is_keto || false,
        weight_options: fullProduct.weight_options || [100, 250, 500, 1000],
      })
      setProductImages(images)
      setInitialImageIds(new Set(images.map((img: { id?: string }) => img.id).filter(Boolean) as string[]))
      setShowModal(true)
    } catch (err) {
      console.error('Error opening edit:', err)
      toast.error('Error al cargar el producto')
    }
  }

  const openNew = () => {
    setEditingProduct({ ...emptyProduct })
    setProductImages([])
    setInitialImageIds(new Set())
    setShowModal(true)
  }

  const handleImageUpload = (url: string) => {
    setProductImages(prev => [...prev, { url, is_primary: prev.length === 0 }])
  }

  const handleSetPrimary = (url: string) => {
    setProductImages(prev => prev.map(img => ({
      ...img,
      is_primary: img.url === url,
    })))
  }

  const handleDeleteImage = async (url: string) => {
    const image = productImages.find(img => img.url === url)
    if (image?.id) {
      try {
        const res = await fetch(`/api/products/images/${image.id}`, { method: 'DELETE' })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || 'Error deleting image')
        }
      } catch (err) {
        const error = err as Error
        toast.error(`Error al eliminar imagen: ${error.message}`)
        console.error('Error deleting image:', err)
      }
    }
    setProductImages(prev => prev.filter(img => img.url !== url))
  }

  const getStockBg = (stock: number) => {
    if (stock >= 100) return 'bg-emerald-100 text-emerald-700'
    if (stock >= 50) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Productos</h1>
          <p className="text-neutral-500 mt-1">{products.length} productos</p>
        </div>
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

      <div className="bg-white rounded-2xl border border-neutral-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 rounded-xl transition-colors ${viewMode === 'table' ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchProducts} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
            Reintentar
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No hay productos</h3>
          <p className="text-neutral-500 mb-6">Empezá agregando tu primer producto</p>
          <button onClick={openNew} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
            Agregar Producto
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-lg hover:border-neutral-200 transition-all group">
              <div className="relative h-48 bg-gradient-to-br from-neutral-100 to-neutral-50 flex items-center justify-center">
                {product.product_images?.[0]?.url ? (
                  <Image src={product.product_images[0].url} alt={product.name} fill className="object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 bg-white rounded-lg shadow-md hover:bg-neutral-100"
                  >
                    <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {!product.is_active && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-lg">
                    Inactivo
                  </span>
                )}
                {product.is_featured && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-lg">
                    Destacado
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-neutral-900 truncate">{product.name}</h3>
                <p className="text-sm text-neutral-500 truncate">{product.categories?.name || product.brand || 'Sin categoría'}</p>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-lg font-bold text-neutral-900">{formatPrice(product.price)}</p>
                    {product.original_price && product.original_price > product.price && (
                      <p className="text-xs text-neutral-400 line-through">{formatPrice(product.original_price)}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStockBg(product.stock)}`}>
                    {product.stock.toLocaleString('es-AR')} uds.
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Producto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Categoría</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Precio</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Estado</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 flex-shrink-0 overflow-hidden relative">
                      {product.product_images?.[0]?.url && (
                        <Image src={product.product_images[0].url} alt={product.name} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{product.name}</p>
                      <p className="text-xs text-neutral-500">{product.brand || 'Sin marca'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {product.categories?.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-neutral-900">{formatPrice(product.price)}</p>
                    {product.original_price && product.original_price > product.price && (
                      <p className="text-xs text-neutral-400 line-through">{formatPrice(product.original_price)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-neutral-900">{product.stock.toLocaleString('es-AR')} uds.</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {!product.is_active && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-medium">Inactivo</span>}
                      {product.is_featured && <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-lg font-medium">Destacado</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
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

      {showModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" ref={modalRef}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">
                {editingProduct.id ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Precio *</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Precio Anterior</label>
                  <input
                    type="number"
                    value={editingProduct.original_price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, original_price: parseFloat(e.target.value) || null })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Stock (unidades)</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría</label>
                <select
                  value={editingProduct.category_id}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción Corta</label>
                <input
                  type="text"
                  value={editingProduct.short_description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Breve descripción para cards"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">Activo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">Destacado</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_organic}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_organic: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">Orgánico</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_vegan}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_vegan: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">Vegano</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_gluten_free}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_gluten_free: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">Sin Gluten</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_keto}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_keto: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">Keto</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Imágenes del Producto</label>
                <ImageUploadZone onUploadComplete={handleImageUpload} className="mb-3" />
                {productImages.length > 0 && (
                  <ImageGallery
                    images={productImages}
                    onSetPrimary={handleSetPrimary}
                    onDelete={handleDeleteImage}
                  />
                )}
              </div>
            </div>
            <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
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
