'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_MY_ORDERS } from '@/lib/graphql/queries'
import { useAuth } from '@/hooks/useAuth'
import { useHydration } from '@/hooks/useHydration'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  total: number
}

interface Order {
  id: string
  status: string
  paymentStatus: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; dot: string }> = {
  pending: { label: 'Pendiente', color: 'text-amber-700', bgColor: 'bg-amber-50', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmado', color: 'text-blue-700', bgColor: 'bg-blue-50', dot: 'bg-blue-500' },
  preparing: { label: 'Preparando', color: 'text-purple-700', bgColor: 'bg-purple-50', dot: 'bg-purple-500' },
  shipped: { label: 'Enviado', color: 'text-indigo-700', bgColor: 'bg-indigo-50', dot: 'bg-indigo-500' },
  delivered: { label: 'Entregado', color: 'text-emerald-700', bgColor: 'bg-emerald-50', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-50', dot: 'bg-red-500' },
}

const paymentConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pendiente', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  paid: { label: 'Pagado', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  failed: { label: 'Fallido', color: 'text-red-700', bgColor: 'bg-red-50' },
  refunded: { label: 'Reintegrado', color: 'text-blue-700', bgColor: 'bg-blue-50' },
}

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const hydrated = useHydration()
  const [orders, setOrders] = useState<Order[]>([])

  const { data, loading, error, refetch } = useQuery(GET_MY_ORDERS, {
    skip: !isAuthenticated,
  })

  useEffect(() => {
    const ordersData = data as { myOrders?: Order[] } | undefined
    if (ordersData?.myOrders) {
      setOrders(ordersData.myOrders)
    }
  }, [data])

  useEffect(() => {
    if (hydrated && !authLoading && !isAuthenticated) {
      router.push('/login?redirect=/orders')
    }
  }, [hydrated, authLoading, isAuthenticated, router])

  if (!hydrated || authLoading) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-neutral-200 rounded"></div>
            <div className="h-4 w-32 bg-neutral-200 rounded"></div>
            <div className="space-y-4 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-neutral-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Error al cargar los pedidos</h2>
            <p className="text-neutral-600 mb-6">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 font-display mb-2">
            Mis Pedidos
          </h1>
          <p className="text-neutral-600">
            {loading ? 'Cargando...' : `${orders.length} pedido${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-6 w-32 bg-neutral-200 rounded"></div>
                  <div className="h-6 w-24 bg-neutral-200 rounded-full"></div>
                </div>
                <div className="h-4 w-48 bg-neutral-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-100">
            <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">No tenés pedidos todavía</h2>
            <p className="text-neutral-600 mb-6">Cuando hagas tu primera compra, aparecerá aquí.</p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-neutral-100 p-6 hover:shadow-card transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-bold text-neutral-900 text-lg">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig[order.status]?.bgColor} ${statusConfig[order.status]?.color}`}>
                      <span className={`w-2 h-2 rounded-full ${statusConfig[order.status]?.dot}`}></span>
                      {statusConfig[order.status]?.label || order.status}
                    </span>
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${paymentConfig[order.paymentStatus]?.bgColor} ${paymentConfig[order.paymentStatus]?.color}`}>
                      {paymentConfig[order.paymentStatus]?.label || order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-neutral-500">{order.items.length} producto{order.items.length !== 1 ? 's' : ''}</span>
                    <span className="text-xl font-bold text-primary-600">{formatPrice(order.totalAmount)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item) => (
                      <span key={item.id} className="text-sm text-neutral-600 bg-cream-50 px-2 py-1 rounded">
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-sm text-neutral-500">+{order.items.length - 3} más</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}