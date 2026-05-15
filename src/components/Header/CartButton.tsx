'use client'

import { cn } from '@/lib/utils'

interface CartButtonProps {
  itemCount: number
  onClick: () => void
}

export function CartButton({ itemCount, onClick }: CartButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-2 text-neutral-700 hover:text-primary-600 transition-colors'
      )}
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
  )
}
