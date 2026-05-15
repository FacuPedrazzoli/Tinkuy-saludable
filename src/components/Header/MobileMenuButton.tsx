'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface MobileMenuButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <button
      ref={menuButtonRef}
      onClick={onClick}
      className="lg:hidden p-3 text-neutral-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      <div className="relative w-6 h-6">
        <span
          className={cn(
            'absolute left-0 w-6 h-0.5 bg-current rounded-full transition-all duration-300 ease-out',
            isOpen ? 'top-3 rotate-45' : 'top-1'
          )}
        />
        <span
          className={cn(
            'absolute left-0 top-3 w-6 h-0.5 bg-current rounded-full transition-all duration-300 ease-out',
            isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
          )}
        />
        <span
          className={cn(
            'absolute left-0 w-6 h-0.5 bg-current rounded-full transition-all duration-300 ease-out',
            isOpen ? 'top-3 -rotate-45' : 'top-5'
          )}
        />
      </div>
    </button>
  )
}
