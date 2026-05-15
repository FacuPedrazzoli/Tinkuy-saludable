'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { GET_GUEST_ORDERS } from '@/lib/graphql/queries'
import { GraphQLGuestOrdersResult } from '@/lib/graphql/types'

interface OrderStatus {
  status: string
  description: string
  date: string
}

interface OrderItem {
  id: string
  name: string
  price: string
  quantity: number
  total: string
}

interface GuestOrder {
  id: string
  status: string
  paymentStatus: string
  totalAmount: string
  guestEmail: string | null
  createdAt: string
  items: OrderItem[]
}

interface OrderData {
  orderNumber: string
  status: string
  customerEmail: string
  customerName: string
  total: number
  createdAt: string
  shippingAddress?: {
    street: string
    city: string
    state: string
  }
  items: Array<{
    productName: string
    quantity: number
    weight: number
    totalPrice: number
  }>
  updates: OrderStatus[]
}

const statusOrder = ['pending', 'paid', 'preparing', 'shipped', 'delivered']

const statusLabels: Record<string, string> = {
  pending: 'Pendiente de Pago',
  paid: 'Pagado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500',
  paid: 'bg-blue-500',
  preparing: 'bg-purple-500',
  shipped: 'bg-primary-600',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
}

function adaptGuestOrderToOrderData(guestOrder: GuestOrder): OrderData {
  return {
    orderNumber: guestOrder.id,
    status: guestOrder.status,
    customerEmail: guestOrder.guestEmail || '',
    customerName: guestOrder.guestEmail?.split('@')[0] || 'Cliente',
    total: parseFloat(guestOrder.totalAmount),
    createdAt: guestOrder.createdAt,
    items: guestOrder.items.map(item => ({
      productName: item.name,
      quantity: item.quantity,
      weight: 0,
      totalPrice: parseFloat(item.total),
    })),
    updates: [],
  }
}

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [searchedEmail, setSearchedEmail] = useState('')

  const { data, loading, error } = useQuery<GraphQLGuestOrdersResult>(GET_GUEST_ORDERS, {
    variables: { email: searchedEmail },
    skip: !searchedEmail,
  })

  const order = data?.guestOrders
    ? (() => {
        const found = data.guestOrders.find((o: GuestOrder) => o.id === orderNumber)
        return found ? adaptGuestOrderToOrderData(found) : null
      })()
    : null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    const sanitizedEmail = email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '')
    const sanitizedOrderNumber = orderNumber.trim().replace(/<[^>]*>/g, '')
    setEmail(sanitizedEmail)
    setOrderNumber(sanitizedOrderNumber)
    setSearchedEmail(sanitizedEmail)
  }

  const currentStatusIndex = order ? statusOrder.indexOf(order.status) : -1

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-900 font-display mb-2">
            Seguimiento de Pedido
          </h1>
          <p className="text-neutral-600">
            Ingresá tu número de pedido y email para ver el estado
          </p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 shadow-card mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-neutral-700 mb-1">
                Número de Pedido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ej: TNK-20240515-0001"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu email de compra"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                required
                aria-required="true"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Buscando...' : 'Buscar Pedido'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8" role="alert" aria-live="polite">
            <p className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error.message}
            </p>
          </div>
        )}

        {!loading && searchedEmail && data?.guestOrders?.length === 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8" role="alert" aria-live="polite">
            <p className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No se encontró el pedido
            </p>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-neutral-500">Número de Pedido</p>
                  <p className="text-xl font-bold text-neutral-900">{order.orderNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-neutral-500">Cliente</p>
                  <p className="font-medium text-neutral-900">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Total</p>
                  <p className="font-bold text-primary-600">${order.total.toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Fecha</p>
                  <p className="font-medium text-neutral-900">
                    {new Date(order.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
                {order.shippingAddress && (
                  <div>
                    <p className="text-sm text-neutral-500">Envío a</p>
                    <p className="font-medium text-neutral-900">
                      {order.shippingAddress.street}, {order.shippingAddress.city}
                    </p>
                  </div>
                )}
              </div>

              {order.items && order.items.length > 0 && (
                <div className="border-t border-neutral-100 pt-4">
                  <p className="font-medium text-neutral-900 mb-3">Productos</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-neutral-600">
                          {item.quantity}x {item.productName} ({item.weight}g)
                        </span>
                        <span className="font-medium">${item.totalPrice.toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-card">
              <h3 className="font-semibold text-neutral-900 mb-6">Estado del Envío</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200" />
                <div className="space-y-6">
                  {statusOrder.slice(0, currentStatusIndex + 1).map((status, idx) => {
                    const update = order.updates?.find(u => u.status === status)
                    const isLast = idx === currentStatusIndex

                    return (
                      <div key={status} className="relative flex items-start gap-4 pl-12">
                        <div
                          className={`absolute left-2 w-5 h-5 rounded-full ${statusColors[status]} ${isLast ? 'animate-pulse' : ''}`}
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-medium text-neutral-900">{statusLabels[status]}</p>
                          {update && (
                            <p className="text-sm text-neutral-500 mt-1">
                              {update.description || new Date(update.date).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                          {isLast && !update && (
                            <p className="text-sm text-neutral-500 mt-1">
                              {new Date(order.createdAt).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link href="/catalog" className="text-primary-600 hover:text-primary-700 font-medium">
                Continuar Comprando
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}