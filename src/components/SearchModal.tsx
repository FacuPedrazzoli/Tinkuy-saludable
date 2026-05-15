'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      inputRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setQuery('')
      setDebouncedQuery('')
      setResults([])
      setSelectedIndex(-1)
      previousActiveElement.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => {
      clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }

    const fetchResults = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/catalog?search=${encodeURIComponent(debouncedQuery)}&limit=6`)
        const data = await res.json()
        setResults(data.products || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      const product = results[selectedIndex]
      if (product) {
        router.push(`/product/${product.slug}`)
        onClose()
      }
    }
  }, [results, selectedIndex, router, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-x-4 top-[15%] mx-auto max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-down">
          <div className="flex items-center border-b border-neutral-100 px-4">
            <svg className="w-5 h-5 text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar productos..."
              className="flex-1 px-4 py-4 text-lg outline-none placeholder:text-neutral-400"
              aria-label="Buscar productos"
            />
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600"
              aria-label="Cerrar búsqueda"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="p-8 text-center text-neutral-500">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}

            {!loading && debouncedQuery && results.length === 0 && (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-neutral-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-neutral-500">No se encontraron resultados</p>
                <p className="text-sm text-neutral-400 mt-1">Intentá con otros términos</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <ul className="py-2" role="listbox" aria-label={`${results.length} resultados encontrados`}>
                {results.map((product, index) => (
                  <li key={product.id}>
                    <button
                      onClick={() => {
                        router.push(`/product/${product.slug}`)
                        onClose()
                      }}
                      className={cn(
                        'w-full flex items-center gap-4 px-4 py-3 hover:bg-neutral-50 transition-colors text-left',
                        selectedIndex === index && 'bg-neutral-50'
                      )}
                      role="option"
                      aria-selected={selectedIndex === index}
                      aria-label={`${product.name}, ${product.category}`}
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 bg-cream-100 rounded-lg overflow-hidden">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 line-clamp-1">{product.name}</h4>
                        <p className="text-sm text-neutral-500">{product.category}</p>
                        <p className="text-primary-600 font-semibold font-mono">{formatPrice(product.price)} <span className="text-neutral-400 text-xs font-normal">por 100g</span></p>
                      </div>
                      <svg className="w-5 h-5 text-neutral-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!loading && results.length > 0 && (
              <div className="p-3 border-t border-neutral-100 bg-neutral-50">
                <button
                  onClick={() => {
                    router.push(`/catalog?search=${encodeURIComponent(debouncedQuery)}`)
                    onClose()
                  }}
                  className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Ver todos los resultados para "{debouncedQuery}"
                </button>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-neutral-200 font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-neutral-200 font-mono">↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-neutral-200 font-mono">Enter</kbd>
                seleccionar
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-neutral-200 font-mono">Esc</kbd>
              cerrar
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}