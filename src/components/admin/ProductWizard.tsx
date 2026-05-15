'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ProductImage } from '@/components/admin/ImageUpload'
import { ImageUploadZone, ImageGallery } from '@/components/admin/ImageUpload'

interface ProductFormData {
  id?: string
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

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductWizardProps {
  initialData?: ProductFormData
  categories: Category[]
  productImages: ProductImage[]
  onSave: (data: ProductFormData, images: ProductImage[]) => Promise<void>
  onCancel: () => void
  onImageUpload: (url: string) => void
  onImageDelete: (url: string) => void
  onSetPrimary: (url: string) => void
  saving: boolean
}

const STEPS = [
  { id: 1, label: 'Básico', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 2, label: 'Precio', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 3, label: 'Descripción', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 4, label: 'Atributos', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { id: 5, label: 'Imágenes', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 6, label: 'Revisar', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
]

export function ProductWizard({
  initialData,
  categories,
  productImages,
  onSave,
  onCancel,
  onImageUpload,
  onImageDelete,
  onSetPrimary,
  saving,
}: ProductWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
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
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es requerido'
      }
      if (formData.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
        newErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones'
      }
    }

    if (step === 2) {
      if (formData.price <= 0) {
        newErrors.price = 'El precio debe ser mayor a 0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSave = async () => {
    if (validateStep(currentStep)) {
      await onSave(formData, productImages)
    }
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    setFormData((prev) => ({ ...prev, slug }))
  }

  const updateField = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-neutral-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900">
            {initialData?.id ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-neutral-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  currentStep === step.id
                    ? 'bg-primary-100 text-primary-700'
                    : currentStep > step.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                )}
              >
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                  currentStep === step.id
                    ? 'bg-primary-600 text-white'
                    : currentStep > step.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-300 text-white'
                )}>
                  {currentStep > step.id ? '✓' : step.id}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  'w-8 h-0.5 mx-1',
                  currentStep > step.id ? 'bg-emerald-400' : 'bg-neutral-200'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Información Básica</h3>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre del producto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                onBlur={generateSlug}
                className={cn(
                  'w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none',
                  errors.name ? 'border-red-500' : 'border-neutral-200'
                )}
                placeholder="Ej: Almendras Crudas Orgánicas"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Slug (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className={cn(
                    'flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none',
                    errors.slug ? 'border-red-500' : 'border-neutral-200'
                  )}
                  placeholder="almendras-crudas-organicas"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="px-4 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Generar
                </button>
              </div>
              {errors.slug && <p className="text-sm text-red-600 mt-1">{errors.slug}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => updateField('brand', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Ej: Tinkuy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Categoría
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => updateField('category_id', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Precio y Stock</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Precio por 100g *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                    className={cn(
                      'w-full pl-8 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none',
                      errors.price ? 'border-red-500' : 'border-neutral-200'
                    )}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Precio anterior
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                  <input
                    type="number"
                    value={formData.original_price || ''}
                    onChange={(e) => updateField('original_price', parseFloat(e.target.value) || null)}
                    className="w-full pl-8 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Opcional"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Stock (unidades disponibles)
              </label>
              <input
                type="number"
                value={formData.stock || ''}
                onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="0"
                min="0"
              />
            </div>

            {formData.original_price && formData.price < formData.original_price && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-emerald-700 font-medium">
                  Descuento: {Math.round((1 - formData.price / formData.original_price) * 100)}% OFF
                </p>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Descripción del Producto</h3>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Descripción corta
              </label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => updateField('short_description', e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Breve descripción para cards y resultados de búsqueda"
                maxLength={160}
              />
              <p className="text-xs text-neutral-500 mt-1">{formData.short_description.length}/160 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Descripción completa
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                placeholder="Describe el producto en detalle..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Ingredientes
              </label>
              <textarea
                value={formData.ingredients}
                onChange={(e) => updateField('ingredients', e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                placeholder="Lista de ingredientes separados por coma"
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Atributos del Producto</h3>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_organic}
                  onChange={(e) => updateField('is_organic', e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-neutral-900">Orgánico</p>
                  <p className="text-xs text-neutral-500">Producto certificado orgánico</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_vegan}
                  onChange={(e) => updateField('is_vegan', e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-neutral-900">Vegano</p>
                  <p className="text-xs text-neutral-500">Sin productos de origen animal</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_gluten_free}
                  onChange={(e) => updateField('is_gluten_free', e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-neutral-900">Sin TACC</p>
                  <p className="text-xs text-neutral-500">Libre de gluten</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl cursor-pointer hover:bg-neutral-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_keto}
                  onChange={(e) => updateField('is_keto', e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-neutral-900">Keto</p>
                  <p className="text-xs text-neutral-500">Apto para dieta keto</p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
              <label className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => updateField('is_featured', e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <p className="font-medium text-neutral-900">Producto Destacado</p>
                  <p className="text-xs text-neutral-500">Aparece en首页</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium text-neutral-900">Producto Activo</p>
                  <p className="text-xs text-neutral-500">Visible en la tienda</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Imágenes del Producto</h3>

            <ImageUploadZone onUploadComplete={onImageUpload} />

            {productImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-neutral-700 mb-2">
                  Imágenes cargadas ({productImages.length})
                </p>
                <ImageGallery
                  images={productImages}
                  onSetPrimary={onSetPrimary}
                  onDelete={onImageDelete}
                />
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-700 text-sm">
                <strong>Tip:</strong> La primera imagen se mostrará como imagen principal. Hacé click en el icono de estrella para cambiar la imagen principal.
              </p>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Revisar y Guardar</h3>

            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                <h4 className="font-semibold text-neutral-900">{formData.name || 'Sin nombre'}</h4>
                {formData.brand && <p className="text-sm text-neutral-500">Marca: {formData.brand}</p>}
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500">Precio</p>
                    <p className="font-semibold text-neutral-900">
                      ${formData.price.toFixed(2)} <span className="text-neutral-400">/ 100g</span>
                    </p>
                    {formData.original_price && (
                      <p className="text-sm text-neutral-400 line-through">
                        ${formData.original_price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-neutral-500">Stock</p>
                    <p className="font-semibold text-neutral-900">{formData.stock} unidades</p>
                  </div>
                </div>

                {formData.short_description && (
                  <div>
                    <p className="text-neutral-500 text-sm">Descripción corta</p>
                    <p className="text-neutral-700">{formData.short_description}</p>
                  </div>
                )}

                <div>
                  <p className="text-neutral-500 text-sm">Atributos</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.is_organic && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Orgánico</span>}
                    {formData.is_vegan && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Vegano</span>}
                    {formData.is_gluten_free && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Sin TACC</span>}
                    {formData.is_keto && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Keto</span>}
                    {formData.is_featured && <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">Destacado</span>}
                    {!formData.is_active && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Inactivo</span>}
                  </div>
                </div>

                <div>
                  <p className="text-neutral-500 text-sm">Imágenes</p>
                  <p className="text-neutral-700">{productImages.length} imagen(es)</p>
                </div>
              </div>
            </div>

            {!formData.name && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">
                  El nombre del producto es requerido para poder guardarlo.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100 p-4 flex justify-between">
        <button
          onClick={currentStep === 1 ? onCancel : handleBack}
          className="px-6 py-2.5 text-neutral-600 font-medium rounded-xl hover:bg-neutral-100 transition-colors"
        >
          {currentStep === 1 ? 'Cancelar' : '← Volver'}
        </button>

        <div className="flex gap-3">
          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              Continuar →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving || !formData.name}
              className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : '✓ Guardar Producto'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}