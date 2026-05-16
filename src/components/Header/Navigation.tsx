'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CategoryDropdown } from './CategoryDropdown'
import { cn } from '@/lib/utils'

interface NavigationProps {
  isCategoryOpen: boolean
  onCategoryOpenChange: (open: boolean) => void
}

export function Navigation({ isCategoryOpen, onCategoryOpenChange }: NavigationProps) {
  const pathname = usePathname()

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
    </nav>
  )
}