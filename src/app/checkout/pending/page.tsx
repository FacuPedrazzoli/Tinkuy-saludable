'use client'

export const metadata = {
  title: 'Pago Pendiente | Tinkuy',
  description: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
}

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useHydration } from '@/hooks/useHydration'
import { useAuth } from '@/hooks/useAuth'

export default function CheckoutPendingPage() {
  const searchParams = useSearchParams()
  const hydrated = useHydration()
  const { user } = useAuth()
  const hasCheckedCart = useRef(false)

  const preferenceId = searchParams.get('preference_id')
  const paymentMethod = searchParams.get('payment_method')
  const externalReference = searchParams.get('external_reference')

  useEffect(() => {
    if (hydrated && !hasCheckedCart.current) {
      hasCheckedCart.current = true
    }
  }, [hydrated])

  const orderNumber = preferenceId
    ? `TNK-${preferenceId.slice(0, 8).toUpperCase()}`
    : externalReference
    ? `TNK-${externalReference.slice(0, 8).toUpperCase()}`
    : `TNK-${Date.now().toString(36).toUpperCase()}`

  const isMercadoPago = paymentMethod === 'mercadopago' || paymentMethod === 'pix'

  if (!hydrated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center animate-fade-in">
          <div className="relative inline-flex mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-amber-600 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-neutral-900 font-display mb-4">
            Pago en Proceso
          </h1>
          <p className="text-lg text-neutral-600 mb-2">
            Tu pago está siendo procesado.
          </p>
          <p className="text-sm text-neutral-500 mb-8">
            No te preocupes, tu pedido está reservado y se confirmará cuando recibamos la notificación del pago.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-neutral-100 p-6 sm:p-8 mt-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-100">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Número de Orden</p>
              <p className="text-2xl font-bold text-neutral-900 font-mono">{orderNumber}</p>
            </div>
            <div className="px-4 py-2 bg-amber-50 rounded-full">
              <span className="text-sm font-semibold text-amber-700">Pendiente</span>
            </div>
          </div>

          {isMercadoPago && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 mb-6">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Esperando confirmación de Mercado Pago
              </h3>
              <div className="space-y-3 text-sm text-amber-800">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 text-amber-800 font-bold text-xs">1</span>
                  <p>La acreditación puede demorar entre <strong>1 y 2 días hábiles</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 text-amber-800 font-bold text-xs">2</span>
                  <p>Recibirás un email cuando el pago sea confirmado.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 text-amber-800 font-bold text-xs">3</span>
                  <p>Podés verificar el estado en cualquier momento desde "Mis Pedidos".</p>
                </div>
              </div>
            </div>
          )}

          {!isMercadoPago && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Información importante
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  Tu pedido está siendo procesado.
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  Recibirás un email de confirmación cuando se acredite el pago.
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  El tiempo de aprobación depende del medio de pago elegido.
                </li>
              </ul>
            </div>
          )}

          <div className="bg-neutral-50 rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              ¿Qué pasó?
            </h3>
            <p className="text-sm text-neutral-600">
              Al elegir Mercado Pago como medio de pago, el proceso tiene estas etapas:
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Inicio</span>
              </div>
              <div className="flex-1 h-0.5 bg-neutral-200 mx-2">
                <div className="h-full bg-emerald-500 w-1/2"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center mb-1 animate-pulse">
                  ?
                </div>
                <span>Procesando</span>
              </div>
              <div className="flex-1 h-0.5 bg-neutral-200 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-neutral-200 text-neutral-400 rounded-full flex items-center justify-center mb-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>Listo</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/orders"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors min-h-[48px]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Ver estado del pedido
            </Link>
            <Link
              href="/catalog"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-cream-100 text-neutral-700 font-semibold rounded-xl hover:bg-cream-200 transition-colors min-h-[48px]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Seguir comprando
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500">
            ¿Tenés alguna pregunta? Contactanos por{' '}
            <a
              href="https://wa.me/5491152540950"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}