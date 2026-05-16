'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCartStore, useWishlistStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { useHydration } from '@/hooks/useHydration'
import { useAuth } from '@/hooks/useAuth'
import { siteConfig } from '@/data/siteConfig'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const hydrated = useHydration()
  const clearCart = useCartStore((state) => state.clearCart)
  const { user } = useAuth()
  const hasCleared = useRef(false)

  const orderId = searchParams.get('order_id') || searchParams.get('preference_id')
  const amount = searchParams.get('amount')
  const paymentMethod = searchParams.get('payment_method')

  useEffect(() => {
    if (hydrated && !hasCleared.current) {
      hasCleared.current = true
      clearCart()
    }
  }, [hydrated, clearCart])

  const orderNumber = orderId
    ? `TNK-${orderId.slice(0, 8).toUpperCase()}`
    : `TNK-${Date.now().toString(36).toUpperCase()}`

  if (!hydrated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center animate-fade-in">
          <div className="relative inline-flex">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-8">
              <svg
                className="w-16 h-16 text-primary-600 animate-scale"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-secondary-400 rounded-full flex items-center justify-center animate-bounce-subtle">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-neutral-900 font-display mb-4">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-lg text-neutral-600 mb-2">
            Tu pedido fue recibido y está siendo procesado.
          </p>
          {user?.email && (
            <p className="text-sm text-neutral-500 mb-8">
              Te enviamos un email a <span className="font-medium text-neutral-700">{user.email}</span> con los detalles.
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-neutral-100 p-6 sm:p-8 mt-8 animate-slide-up">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-100">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Número de Orden</p>
              <p className="text-2xl font-bold text-neutral-900 font-mono">{orderNumber}</p>
            </div>
            <div className="text-right">
              {amount && (
                <>
                  <p className="text-sm text-neutral-500 mb-1">Total Pagado</p>
                  <p className="text-2xl font-bold text-primary-600">{formatPrice(parseFloat(amount))}</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4 p-4 bg-primary-50 rounded-2xl">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-neutral-900">Confirmamos tu pedido</p>
                <p className="text-sm text-neutral-600">Recibirás un email con la confirmación y seguimiento.</p>
              </div>
            </div>

            {paymentMethod === 'mercadopago' && (
              <div className="flex items-start gap-4 p-4 bg-cream-100 rounded-2xl">
                <div className="w-10 h-10 bg-cream-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Pago con Mercado Pago</p>
                  <p className="text-sm text-neutral-600">La acreditación puede demorar entre 1 y 2 días hábiles.</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-neutral-50 rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ¿Qué sigue?
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">1.</span>
                Recibirás un email de confirmación con los detalles del pedido.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">2.</span>
                Te notificaremos cuando tu pedido esté listo para envío.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">3.</span>
                Podés hacer seguimiento en la sección "Mis Pedidos".
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/orders"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors min-h-[48px]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Ver mis pedidos
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
              href={`https://wa.me/549${siteConfig.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              WhatsApp
            </a>
            {' '}o email a{' '}
            <a href={`mailto:${siteConfig.email}`} className="text-primary-600 hover:text-primary-700 font-medium">
              {siteConfig.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}