'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const mobileMenuRef = useRef<HTMLDivElement>(null)

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
        </nav>
      </div>
    </div>
  )
}