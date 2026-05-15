'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CategoryDropdown } from './CategoryDropdown'
import { useAuth } from '@/hooks/useAuth'
import { useWishlistStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface NavigationProps {
  isCategoryOpen: boolean
  onCategoryOpenChange: (open: boolean) => void
}

export function Navigation({ isCategoryOpen, onCategoryOpenChange }: NavigationProps) {
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuth()
  const wishlistCount = useWishlistStore((state) => state.items.length)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="hidden lg:flex items-center space-x-8" aria-label="Navegación principal">
      <Link
        href="/"
        className={cn(
          'transition-colors font-medium',
          pathname === '/' ? 'text-primary-600' : 'text-neutral-700 hover:text-primary-600'
        )}
      >
        Inicio
      </Link>
      <CategoryDropdown
        isOpen={isCategoryOpen}
        onOpenChange={onCategoryOpenChange}
      />
      <Link
        href="/catalog"
        className={cn(
          'transition-colors font-medium',
          pathname === '/catalog' ? 'text-primary-600' : 'text-neutral-700 hover:text-primary-600'
        )}
      >
        Tienda
      </Link>
      <Link
        href="/about"
        className={cn(
          'transition-colors font-medium',
          pathname === '/about' ? 'text-primary-600' : 'text-neutral-700 hover:text-primary-600'
        )}
      >
        Nosotros
      </Link>

      <Link
        href="/wishlist"
        className="relative p-2 text-neutral-700 hover:text-primary-600 transition-colors"
        aria-label={`Mi Wishlist${wishlistCount > 0 ? `, ${wishlistCount} productos` : ''}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {wishlistCount > 9 ? '9+' : wishlistCount}
          </span>
        )}
      </Link>

      {isAuthenticated ? (
        <div className="relative group">
          <button className="flex items-center gap-2 p-2 text-neutral-700 hover:text-primary-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium text-sm">
              {user?.firstName || 'Mi Cuenta'}
            </span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="bg-white rounded-xl shadow-lg border border-neutral-100 py-2 min-w-[180px]">
              <Link
                href="/orders"
                className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-cream-50 hover:text-primary-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Mis Pedidos
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-cream-50 hover:text-primary-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Mi Wishlist
              </Link>
              <div className="border-t border-neutral-100 my-2"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Ingresar
        </Link>
      )}
    </nav>
  )
}