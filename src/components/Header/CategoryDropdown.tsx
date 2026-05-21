'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_CATEGORIES } from '@/lib/graphql/queries'
import { GraphQLCategoriesResult, GraphQLCategory } from '@/lib/graphql/types'
import { cn } from '@/lib/utils'

interface CategoryDropdownProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryDropdown({ isOpen, onOpenChange }: CategoryDropdownProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { data } = useQuery<GraphQLCategoriesResult>(GET_CATEGORIES)
  const categories: GraphQLCategory[] = (data?.categories ?? [])
    .filter((c) => c.isActive)
    .slice(0, 8)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    onOpenChange(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onOpenChange(false)
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpenChange(!isOpen)
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="text-neutral-700 hover:text-primary-600 transition-colors font-medium flex items-center space-x-1"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="category-menu"
        onClick={() => onOpenChange(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        <span>Categorías</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div
          id="category-menu"
          role="menu"
          aria-label="Categorías"
          className={cn(
            'absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 animate-slide-down'
          )}
        >
          {categories.length === 0 && (
            <span className="block px-4 py-3 text-sm text-neutral-400">
              No hay categorías disponibles
            </span>
          )}
          {categories.map((category) => (
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
  )
}
