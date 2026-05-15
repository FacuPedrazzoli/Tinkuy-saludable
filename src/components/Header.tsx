'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useCartStore, useWishlistStore, useHydrationStore } from '@/lib/store'
import { categories } from '@/data/categories'
import { siteConfig } from '@/data/siteConfig'
import { cn } from '@/lib/utils'
import { SearchModal } from './SearchModal'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const isHydrated = useHydrationStore((state) => state.isHydrated)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const items = useCartStore((state) => state.items)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = useWishlistStore((state) => state.items.length)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
        menuButtonRef.current?.focus()
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
      }
      if (e.key === 'Tab' && isMobileMenuOpen && mobileMenuRef.current) {
        const focusableElements = mobileMenuRef.current.querySelectorAll<HTMLElement>('a, button')
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen, isSearchOpen])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      const firstFocusable = mobileMenuRef.current?.querySelector<HTMLElement>('a, button')
      firstFocusable?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    return () => {
      if (categoryTimeoutRef.current) {
        clearTimeout(categoryTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
          isScrolled
            ? 'bg-white/98 backdrop-blur-md shadow-card border-neutral-100'
            : 'bg-white border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-tinkuy.png"
                alt={siteConfig.name}
                width={160}
                height={50}
                className="h-8 w-auto sm:h-10 lg:h-12"
                priority
              />
            </Link>

            <nav className="hidden lg:flex items-center space-x-8" aria-label="Navegación principal">
              <Link
                href="/"
                className="text-neutral-700 hover:text-primary-600 transition-colors font-medium"
              >
                Inicio
              </Link>
              <div
                className="relative"
                onMouseEnter={() => {
                  if (categoryTimeoutRef.current) {
                    clearTimeout(categoryTimeoutRef.current)
                    categoryTimeoutRef.current = null
                  }
                  setIsCategoryOpen(true)
                }}
                onMouseLeave={() => {
                  categoryTimeoutRef.current = setTimeout(() => {
                    setIsCategoryOpen(false)
                  }, 150)
                }}
              >
                <button
                  className="text-neutral-700 hover:text-primary-600 transition-colors font-medium flex items-center space-x-1"
                  aria-haspopup="true"
                  aria-expanded={isCategoryOpen}
                  aria-controls="category-menu"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setIsCategoryOpen(!isCategoryOpen)
                    }
                  }}
                >
                  <span>Categorías</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isCategoryOpen && (
                  <div
                    id="category-menu"
                    role="menu"
                    aria-label="Categorías"
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 animate-slide-down"
                  >
                    {categories.slice(0, 8).map((category) => (
                      <Link
                        key={category.id}
                        href={`/catalog?category=${category.slug}`}
                        role="menuitem"
                        className="flex items-center px-4 py-3 hover:bg-neutral-50 transition-colors"
                      >
                        <span className="text-neutral-700 hover:text-primary-600">
                          {category.name}
                        </span>
                      </Link>
                    ))}
                    <Link
                      href="/catalog"
                      role="menuitem"
                      className="flex items-center px-4 py-3 text-primary-600 font-medium border-t border-neutral-100 mt-2"
                    >
                      Ver todas las categorías
                    </Link>
                  </div>
                )}
              </div>
              <Link
                href="/catalog"
                className="text-neutral-700 hover:text-primary-600 transition-colors font-medium"
              >
                Tienda
              </Link>
              <Link
                href="/about"
                className="text-neutral-700 hover:text-primary-600 transition-colors font-medium"
              >
                Nosotros
              </Link>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-neutral-700 hover:text-primary-600 transition-colors"
                aria-label="Buscar productos (Cmd+K)"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <Link
                href="/wishlist"
                className="p-2 text-neutral-700 hover:text-primary-600 transition-colors relative"
                aria-label={`Lista de deseos, ${wishlistCount} productos`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={toggleCart}
                className="relative p-2 text-neutral-700 hover:text-primary-600 transition-colors"
                aria-label={`Carrito de compras, ${itemCount} productos`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              <button
                ref={menuButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-3 text-neutral-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className="lg:hidden bg-white border-t border-neutral-100 animate-slide-down"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-neutral-900">Menú</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Cerrar menú"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-2" aria-label="Menú móvil">
                <Link href="/" className="block py-3 text-neutral-700 font-medium hover:text-primary-600 hover:bg-neutral-50 px-4 rounded-lg transition-colors">
                  Inicio
                </Link>
                <Link href="/catalog" className="block py-3 text-neutral-700 font-medium hover:text-primary-600 hover:bg-neutral-50 px-4 rounded-lg transition-colors">
                  Tienda
                </Link>
                <Link href="/about" className="block py-3 text-neutral-700 font-medium hover:text-primary-600 hover:bg-neutral-50 px-4 rounded-lg transition-colors">
                  Nosotros
                </Link>
                <Link href="/contact" className="block py-3 text-neutral-700 font-medium hover:text-primary-600 hover:bg-neutral-50 px-4 rounded-lg transition-colors">
                  Contacto
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}