'use client'

import { useState, useCallback, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import { cn } from '@/lib/utils'

const UPLOAD_URL = (process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000').replace('/graphql', '/upload')

interface UseImageUploadProps {
  onUploadComplete?: (url: string) => void
  onError?: (error: string) => void
}

interface CropConfig {
  maxWidth: number
  maxHeight: number
}

const QUALITY_PRESETS = [
  { label: 'Alta', value: 0.9, description: 'Mejor calidad, mayor tamaño' },
  { label: 'Media', value: 0.6, description: 'Buen balance' },
  { label: 'Baja', value: 0.3, description: 'Menor tamaño, calidad aceptable' },
]

const SIZE_PRESETS: { label: string; width: number; height: number }[] = [
  { label: '800x800', width: 800, height: 800 },
  { label: '600x600', width: 600, height: 600 },
  { label: '400x400', width: 400, height: 400 },
  { label: '1200x630', width: 1200, height: 630 },
]

function getCompressionOptions(crop: CropConfig) {
  return {
    maxSizeMB: 0.2,
    maxWidthOrHeight: Math.max(crop.maxWidth, crop.maxHeight),
    useWebWorker: true,
    fileType: 'image/webp' as const,
  }
}

export function useImageUpload({ onUploadComplete, onError }: UseImageUploadProps = {}) {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)

  const MAX_FILE_SIZE_MB = 10

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      onError?.(`El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE_MB}MB`)
      return null
    }

    setUploading(true)
    try {
      const compressedFile = await imageCompression(file, getCompressionOptions({ maxWidth: 1200, maxHeight: 1200 }))

      const formData = new FormData()
      formData.append('file', compressedFile)

      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error uploading image')
      }

      const data = await res.json()
      onUploadComplete?.(data.url)
      return data.url
    } catch (err) {
      const error = err as Error
      onError?.(error.message)
      return null
    } finally {
      setUploading(false)
    }
  }, [onUploadComplete, onError])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) {
      onError?.('Por favor, soltá solo archivos de imagen.')
      return
    }

    for (const file of files) {
      await uploadImage(file)
    }
  }, [uploadImage, onError])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    for (const file of files) {
      await uploadImage(file)
    }
    e.target.value = ''
  }, [uploadImage])

  return {
    uploading,
    dragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
  }
}

interface ImageUploadZoneProps {
  onUploadComplete?: (url: string) => void
  onError?: (error: string) => void
  className?: string
}

export function ImageUploadZone({ onUploadComplete, onError, className = '' }: ImageUploadZoneProps) {
  const [error, setError] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState(800)
  const [quality, setQuality] = useState(0.9)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploading, dragging, handleDragOver, handleDragLeave, handleDrop, handleFileSelect } = useImageUpload({
    onUploadComplete,
    onError: (errMsg) => {
      setError(errMsg)
      onError?.(errMsg)
      setTimeout(() => setError(null), 5000)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setShowOptions(true)
    }
    e.target.value = ''
  }

  const handleUploadWithOptions = async () => {
    if (!selectedFile) return

    setShowOptions(false)
    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: selectedSize,
      useWebWorker: true,
      fileType: 'image/webp' as const,
      initialQuality: quality,
    }

    try {
      const compressedFile = await imageCompression(selectedFile, options)
      const formData = new FormData()
      formData.append('file', compressedFile)

      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error uploading image')
      }

      const data = await res.json()
      onUploadComplete?.(data.url)
    } catch (err) {
      const error = err as Error
      setError(error.message)
      onError?.(error.message)
      setTimeout(() => setError(null), 5000)
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const cancelUpload = () => {
    setShowOptions(false)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
          dragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50',
          uploading ? 'opacity-50 pointer-events-none' : ''
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-3">
          {uploading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <svg className={cn('w-12 h-12 mx-auto', dragging ? 'text-primary-500' : 'text-neutral-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          <div>
            <p className="text-sm font-medium text-neutral-700">
              {uploading ? 'Subiendo...' : 'Arrastrá las imágenes aquí'}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              o hacé click para seleccionar
            </p>
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      {showOptions && previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-neutral-100">
              <h3 className="text-lg font-semibold text-neutral-900">Opciones de imagen</h3>
              <p className="text-sm text-neutral-500">Ajustá el tamaño y calidad antes de subir</p>
            </div>

            <div className="p-4 space-y-4">
              <div className="relative w-full h-48 bg-neutral-100 rounded-lg overflow-hidden">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tamaño máximo
                </label>
                <div className="flex flex-wrap gap-2">
                  {SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setSelectedSize(preset.width)}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg transition-colors',
                        selectedSize === preset.width
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Calidad: {Math.round(quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Bajo</span>
                  <span>Alto</span>
                </div>
              </div>

              <div className="text-xs text-neutral-500 bg-neutral-50 rounded-lg p-3">
                <p><strong>Tip:</strong> Las imágenes se comprimen automáticamente a WebP para optimizar el rendimiento.</p>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-100 flex gap-3">
              <button
                onClick={cancelUpload}
                className="flex-1 px-4 py-2.5 text-neutral-600 font-medium rounded-xl hover:bg-neutral-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadWithOptions}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                Subir imagen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export interface ProductImage {
  url: string
  id?: string
  is_primary?: boolean
}

interface ImageGalleryProps {
  images: ProductImage[]
  onSetPrimary?: (url: string) => void
  onDelete?: (url: string) => void
  onImageClick?: (url: string) => void
}

export function ImageGallery({ images, onSetPrimary, onDelete, onImageClick }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (images.length === 0) return null

  const handleImageClick = (url: string) => {
    if (onImageClick) {
      onImageClick(url)
    }
    setSelectedImage(url)
  }

  const closePreview = () => setSelectedImage(null)

  return (
    <>
      <div className="grid grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div key={img.url} className="relative group">
            <button
              type="button"
              onClick={() => handleImageClick(img.url)}
              className={cn(
                'w-full h-20 object-cover rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                idx === 0 ? 'ring-2 ring-primary-500' : ''
              )}
              aria-label={`Ver imagen ${idx + 1}: ${img.url}`}
            >
              <img
                src={img.url}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
              {idx !== 0 && onSetPrimary && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSetPrimary(img.url)
                  }}
                  className="p-1.5 bg-white rounded-lg hover:bg-neutral-100 transition-colors"
                  title="Fijar como principal"
                >
                  <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(img.url)
                  }}
                  className="p-1.5 bg-white rounded-lg hover:bg-red-50 transition-colors"
                  title="Eliminar imagen"
                >
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            {idx === 0 && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded">
                Principal
              </span>
            )}
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa de imagen"
        >
          <button
            onClick={closePreview}
            className="absolute top-4 right-4 p-2 text-white hover:text-neutral-300 transition-colors"
            aria-label="Cerrar vista previa"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-w-4xl max-h-[80vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Vista previa"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {onSetPrimary && images.findIndex(img => img.url === selectedImage) !== 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSetPrimary(selectedImage)
                  closePreview()
                }}
                className="px-4 py-2 bg-white text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Fijar como principal
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(selectedImage)
                  closePreview()
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
