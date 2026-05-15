'use client'

import { useState, useCallback } from 'react'
import imageCompression from 'browser-image-compression'

interface UseImageUploadProps {
  onUploadComplete?: (url: string) => void
  onError?: (error: string) => void
}

const compressionOptions = {
  maxSizeMB: 0.2,
  maxWidthOrHeight: 800,
  useWebWorker: true,
  fileType: 'image/webp' as const,
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
      const compressedFile = await imageCompression(file, compressionOptions)

      const formData = new FormData()
      formData.append('file', compressedFile)

      const res = await fetch('/api/upload', {
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
  const { uploading, dragging, handleDragOver, handleDragLeave, handleDrop, handleFileSelect } = useImageUpload({
    onUploadComplete,
    onError: (errMsg) => {
      setError(errMsg)
      onError?.(errMsg)
      setTimeout(() => setError(null), 5000)
    },
  })

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
        ${dragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'}
        ${uploading ? 'opacity-50 pointer-events-none' : ''}
        ${className}
      `}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
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
          <svg className={`w-12 h-12 mx-auto ${dragging ? 'text-primary-500' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  )
}

interface ProductImage {
  url: string
  id?: string
  is_primary?: boolean
}

interface ImageGalleryProps {
  images: ProductImage[]
  onSetPrimary?: (url: string) => void
  onDelete?: (url: string) => void
}

export function ImageGallery({ images, onSetPrimary, onDelete }: ImageGalleryProps) {
  if (images.length === 0) return null

  return (
    <div className="grid grid-cols-4 gap-3">
      {images.map((img, idx) => (
        <div key={img.url} className="relative group">
          <img
            src={img.url}
            alt={`Imagen ${idx + 1}`}
            className={`w-full h-20 object-cover rounded-lg ${idx === 0 ? 'ring-2 ring-primary-500' : ''}`}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
            {idx !== 0 && onSetPrimary && (
              <button
                type="button"
                onClick={() => onSetPrimary(img.url)}
                className="p-1 bg-white rounded text-xs"
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
                onClick={() => onDelete(img.url)}
                className="p-1 bg-white rounded text-xs"
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
  )
}
