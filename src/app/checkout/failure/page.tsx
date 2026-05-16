'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { siteConfig } from '@/data/siteConfig'
import { useHydration } from '@/hooks/useHydration'

export default function CheckoutFailurePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const hydrated = useHydration()
  const [countdown, setCountdown] = useState(10)
  const hasCheckedCart = useRef(false)

  const error = searchParams.get('error')
  const status = searchParams.get('status')
  const collected = searchParams.get('collection_id')

  const items = useCartStore((state) => state.items)

  useEffect(() => {
    if (hydrated && !hasCheckedCart.current) {
      hasCheckedCart.current = true
    }
  }, [hydrated])

  useEffect(() => {
    if (hydrated && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [hydrated, countdown])

  const getErrorMessage = () => {
    if (error) {
      const errorMap: Record<string, { title: string; message: string }> = {
        'payment_cancelled': {
          title: 'Pago cancelado',
          message: 'El pago fue cancelado por vos. Podés reintentarlo cuando quieras.'
        },
        'payment_failed': {
          title: 'Error en el pago',
          message: 'No se pudo procesar el pago. Verificá los datos de tu tarjeta e intentá nuevamente.'
        },
        'expired_card': {
          title: 'Tarjeta vencida',
          message: 'La tarjeta ingresada está vencida. Probá con otra forma de pago.'
        },
        'insufficient_funds': {
          title: 'Fondos insuficientes',
          message: 'La tarjeta no tiene fondos suficientes. Probá con otra tarjeta.'
        },
        'card_error': {
          title: 'Error con la tarjeta',
          message: 'Hay un problema con tu tarjeta. Verificá los datos e intentá nuevamente.'
        },
      }
      return errorMap[error] || {
        title: 'El pago no se pudo procesar',
        message: 'Ocurrió un error inesperado. Por favor reintentá o probá con otra forma de pago.'
      }
    }
    return {
      title: 'El pago no se pudo procesar',
      message: 'Ocurrió un error durante el proceso de pago. No se realizó ningún cargo.'
    }
  }

  const errorInfo = getErrorMessage()
  const whatsappNumber = siteConfig.social.whatsapp?.replace('https://wa.me/', '') || '549'+siteConfig.phone.replace(/\D/g, '')

  if (!hydrated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center animate-fade-in">
          <div className="relative inline-flex mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-red-500 animate-scale"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-neutral-900 font-display mb-4">
            {errorInfo.title}
          </h1>
          <p className="text-lg text-neutral-600 mb-2">
            {errorInfo.message}
          </p>
          {collected && (
            <p className="text-sm text-neutral-500 mb-8">
              Referencia: <span className="font-mono text-neutral-700">{collected}</span>
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-neutral-100 p-6 sm:p-8 mt-8 animate-slide-up">
          {items.length > 0 ? (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="font-semibold text-neutral-900">Tu carrito está intacto</span>
              </div>
              <p className="text-sm text-neutral-600 mb-4">
                Los productos siguen en tu carrito. Podés reintentarlo cuando quieras.
              </p>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span>{items.length} producto{items.length !== 1 ? 's' : ''}</span>
                <span>·</span>
                <span>Carrito preservado</span>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-neutral-50 rounded-2xl">
              <p className="text-sm text-neutral-600">
                Tu carrito está vacío. Podés explorar nuestros productos y volver a intentar cuando quieras.
              </p>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <button
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors min-h-[48px]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar pago
            </button>

            <Link
              href="/catalog"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-cream-100 text-neutral-700 font-semibold rounded-xl hover:bg-cream-200 transition-colors min-h-[48px]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Seguir comprando
            </Link>

            <button
              onClick={() => router.push('/checkout?step=payment')}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:border-neutral-300 hover:bg-neutral-50 transition-colors min-h-[48px]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Cambiar medio de pago
            </button>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ¿Necesitás ayuda?
            </h3>
            <p className="text-sm text-red-700 mb-3">
              Si el problema persiste, contactanos y te ayudamos a resolverlo.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hola!%20Tuve%20un%20problema%20con%20mi%20pago.%20Mi%20referencia%20es%3A%20${collected || 'N/A'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors min-h-[44px]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href={`mailto:${siteConfig.email}?subject=Problema%20con%20pago&body=Olá!%20Tuve%20un%20problema%20con%20mi%20pago.%20Mi%20referencia%20es%3A%20${collected || 'N/A'}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-neutral-200 text-neutral-700 font-medium rounded-lg hover:bg-neutral-300 transition-colors min-h-[44px]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Enviar email
              </a>
            </div>
          </div>
        </div>

        {countdown > 0 && (
          <p className="text-center text-sm text-neutral-500 mt-6">
            Redirigiendo al carrito en <span className="font-medium text-neutral-700">{countdown}</span> segundos...
          </p>
        )}
      </div>
    </div>
  )
}