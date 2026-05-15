'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useWishlistStore } from '@/lib/store'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated, user, logout } = useAuth()
  const wishlistCount = useWishlistStore((state) => state.items.length)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
      if (e.key === 'Tab' && isOpen && mobileMenuRef.current) {
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
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const firstFocusable = mobileMenuRef.current?.querySelector<HTMLElement>('a, button')
      firstFocusable?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={mobileMenuRef}
      id="mobile-menu"
      className={cn(
        'lg:hidden bg-white border-t border-neutral-100 animate-slide-down'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium text-neutral-900">Menú</span>
          <button
            onClick={onClose}
            className="p-3 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Cerrar menú"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="space-y-2" aria-label="Menú móvil">
          <Link
            href="/"
            onClick={onClose}
            className={cn(
              'block py-3 min-h-[44px] font-medium px-4 rounded-lg transition-colors flex items-center',
              pathname === '/' ? 'bg-primary-50 text-primary-600' : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
            )}
          >
            Inicio
          </Link>
          <Link
            href="/catalog"
            onClick={onClose}
            className={cn(
              'block py-3 min-h-[44px] font-medium px-4 rounded-lg transition-colors flex items-center',
              pathname === '/catalog' ? 'bg-primary-50 text-primary-600' : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
            )}
          >
            Tienda
          </Link>
          <Link
            href="/about"
            onClick={onClose}
            className={cn(
              'block py-3 min-h-[44px] font-medium px-4 rounded-lg transition-colors flex items-center',
              pathname === '/about' ? 'bg-primary-50 text-primary-600' : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
            )}
          >
            Nosotros
          </Link>
          <Link
            href="/contact"
            onClick={onClose}
            className={cn(
              'block py-3 min-h-[44px] font-medium px-4 rounded-lg transition-colors flex items-center',
              pathname === '/contact' ? 'bg-primary-50 text-primary-600' : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-600'
            )}
          >
            Contacto
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex items-center gap-3 p-3 min-h-[44px]"
          >
            <svg className="w-5 h-5 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-neutral-700 font-medium">Mi Wishlist</span>
            {wishlistCount > 0 && (
              <span className="ml-auto px-2 py-0.5 bg-secondary-500 text-white text-xs font-bold rounded-full">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </Link>

          <div className="border-t border-neutral-100 my-2 pt-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/orders"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 min-h-[44px]"
                >
                  <svg className="w-5 h-5 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-neutral-700 font-medium">Mis Pedidos</span>
                </Link>
                <div className="flex items-center gap-3 p-3 text-neutral-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm">{user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-3 min-h-[44px] w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Cerrar sesión</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors min-h-[48px]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Ingresar
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}