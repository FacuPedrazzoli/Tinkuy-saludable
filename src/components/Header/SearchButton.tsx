'use client'

import { cn } from '@/lib/utils'

interface SearchButtonProps {
  onClick: () => void
}

export function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-2 text-neutral-700 hover:text-primary-600 transition-colors'
      )}
      aria-label="Buscar productos (Cmd+K)"
    >
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  )
}
