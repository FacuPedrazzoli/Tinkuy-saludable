'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TIMEOUTS } from '@/lib/constants'

interface ExitIntentPopupProps {
  discountCode?: string
  discountPercent?: number
}

export function ExitIntentPopup({
  discountCode = 'BIENVENIDO10',
  discountPercent = 10
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true)
      }
    }, TIMEOUTS.EXIT_INTENT)

    return () => clearTimeout(timer)
  }, [isDismissed])

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isDismissed && !isVisible) {
        setIsVisible(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [isDismissed, isVisible])

  if (!isVisible || isDismissed) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="exit-popup-title">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => setIsDismissed(true)}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
          aria-label="Cerrar popup de descuento"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>

          <h3 id="exit-popup-title" className="text-2xl font-bold text-neutral-900 font-display mb-2">
            ¡Espera! No te vayas todavía
          </h3>
          <p className="text-neutral-600 mb-6">
            Obtén un <span className="text-primary-600 font-bold">{discountPercent}%</span> de descuento en tu primera compra
          </p>

          <div className="bg-neutral-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-neutral-500 mb-1">Código de descuento:</p>
            <p className="text-2xl font-bold text-primary-600 font-mono">{discountCode}</p>
          </div>

          <Link
            href="/catalog"
            className="block w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors mb-3"
          >
            Ver Productos
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-neutral-500 text-sm hover:text-neutral-700"
          >
            No, gracias
          </button>
        </div>
      </div>
    </div>
  )
}