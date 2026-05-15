'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  wishlistCount: number
}

export function WishlistButton({ wishlistCount }: WishlistButtonProps) {
  return (
    <Link
      href="/wishlist"
      className={cn(
        'p-2 text-neutral-700 hover:text-primary-600 transition-colors relative'
      )}
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
  )
}
