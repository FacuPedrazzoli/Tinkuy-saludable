'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'all')
    setIsVisible(false)
  }

  const acceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential')
    setIsVisible(false)
  }

  if (!mounted || !isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-neutral-200 shadow-2xl" role="region" aria-label="Consentimiento de cookies">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
              Respetamos tu privacidad
            </h3>
            <p className="text-neutral-600 text-sm">
              Utilizamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra{' '}
              <Link href="/politica-de-privacidad" className="text-primary-600 hover:underline">
                política de privacidad
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center gap-3" role="group" aria-label="Opciones de cookies">
            <button
              onClick={acceptEssential}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
              aria-label="Aceptar solo cookies esenciales"
            >
              Solo esenciales
            </button>
            <button
              onClick={acceptAll}
              className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
              aria-label="Aceptar todas las cookies"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
