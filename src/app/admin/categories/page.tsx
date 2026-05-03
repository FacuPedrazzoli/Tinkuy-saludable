'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { slugify } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  product_count: number
  sort_order: number
  is_active: boolean
}

const emptyCategory = {
  id: undefined as string | undefined,
  name: '',
  slug: '',
  description: '',
  image_url: '',
  parent_id: null as string | null,
  is_active: true,
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<typeof emptyCategory | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Error fetching categories')
      const data = await res.json()
      setCategories((data.categories || []).sort((a: Category, b: Category) => a.sort_order - b.sort_order))
    } catch (err) {
      setError('Error cargando categorías')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSave = async () => {
    if (!editingCategory) return
    setSaving(true)

    try {
      const url = editingCategory.id
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories'
      const method = editingCategory.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error saving category')
      }

      setShowModal(false)
      setEditingCategory(null)
      fetchCategories()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error deleting category')
      fetchCategories()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const openEdit = (category: Category) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      parent_id: category.parent_id,
      is_active: category.is_active,
    })
    setShowModal(true)
  }

  const openNew = () => {
    setEditingCategory({ ...emptyCategory })
    setShowModal(true)
  }

  const handleNameChange = (name: string) => {
    if (editingCategory && !editingCategory.id) {
      setEditingCategory({
        ...editingCategory,
        name,
        slug: slugify(name),
      })
    } else if (editingCategory) {
      setEditingCategory({ ...editingCategory, name })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCategory || !e.target.files?.[0]) return

    setUploadingImage(true)
    const file = e.target.files[0]

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'categories')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Error uploading image')

      const data = await res.json()
      setEditingCategory({ ...editingCategory, image_url: data.url })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleReorder = async (categories: Category[]) => {
    setCategories(categories)

    try {
      await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: categories.map((c, i) => ({ id: c.id, sort_order: i }))
        }),
      })
    } catch (err) {
      console.error('Error reordering:', err)
    }
  }

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newCategories = [...categories]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newCategories.length) return

    const temp = newCategories[index]
    newCategories[index] = newCategories[targetIndex]
    newCategories[targetIndex] = temp

    handleReorder(newCategories)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Categorías</h1>
          <p className="text-neutral-500 mt-1">{categories.length} categorías</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-500/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={fetchCategories} className="mt-2 text-primary-600 hover:underline">
            Reintentar
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No hay categorías</h3>
          <p className="text-neutral-500 mb-6">Empezá creando tu primera categoría</p>
          <button onClick={openNew} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
            Crear Categoría
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 w-16">Orden</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Categoría</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Slug</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Productos</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Estado</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.map((category, index) => (
                <tr key={category.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveCategory(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30"
                        aria-label="Mover arriba"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveCategory(index, 'down')}
                        disabled={index === categories.length - 1}
                        className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30"
                        aria-label="Mover abajo"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {category.image_url ? (
                        <img src={category.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium text-neutral-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{category.slug}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                      {category.product_count}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {category.is_active ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full font-medium">Activa</span>
                    ) : (
                      <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-sm rounded-full font-medium">Inactiva</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(category)}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        aria-label="Editar"
                      >
                        <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Eliminar"
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

      {showModal && editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">
                {editingCategory.id ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-neutral-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Imagen</label>
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-24 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
                    {editingCategory.image_url ? (
                      <img src={editingCategory.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="category-image-upload"
                    />
                    <label
                      htmlFor="category-image-upload"
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors',
                        uploadingImage && 'opacity-50 cursor-wait'
                      )}
                    >
                      {uploadingImage ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Subir imagen
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría padre</label>
                <select
                  value={editingCategory.parent_id || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, parent_id: e.target.value || null })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                >
                  <option value="">Sin categoría padre</option>
                  {categories
                    .filter(c => c.id !== editingCategory.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingCategory.is_active}
                  onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-neutral-700">Categoría activa</span>
              </label>
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
                disabled={saving || !editingCategory.name}
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