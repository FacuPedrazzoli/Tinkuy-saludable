'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, formatStock } from '@/lib/utils'

interface Metrics {
  totalOrders: number
  pendingOrders: number
  totalCustomers: number
  totalProducts: number
  revenueToday: number
  revenueThisMonth: number
  avgOrderValue: number
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  total: number
  status: string
  payment_status: string
  created_at: string
}

interface TopProduct {
  product_name: string
  quantity: number
  total_price: number
}

const statusConfig: Record<string, { label: string; es: string; color: string; bgColor: string; dot: string }> = {
  pending: { label: 'pending', es: 'Pendiente', color: 'text-amber-700', bgColor: 'bg-amber-50', dot: 'bg-amber-500' },
  paid: { label: 'paid', es: 'Pagado', color: 'text-emerald-700', bgColor: 'bg-emerald-50', dot: 'bg-emerald-500' },
  preparing: { label: 'preparing', es: 'Preparando', color: 'text-blue-700', bgColor: 'bg-blue-50', dot: 'bg-blue-500' },
  shipped: { label: 'shipped', es: 'Enviado', color: 'text-purple-700', bgColor: 'bg-purple-50', dot: 'bg-purple-500' },
  delivered: { label: 'delivered', es: 'Entregado', color: 'text-teal-700', bgColor: 'bg-teal-50', dot: 'bg-teal-500' },
  cancelled: { label: 'cancelled', es: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-50', dot: 'bg-red-500' },
}

const paymentConfig: Record<string, { label: string; es: string; color: string; bgColor: string }> = {
  pending: { label: 'pending', es: 'Pendiente', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  paid: { label: 'paid', es: 'Pagado', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  failed: { label: 'failed', es: 'Fallido', color: 'text-red-700', bgColor: 'bg-red-50' },
  refunded: { label: 'refunded', es: 'Reintegrado', color: 'text-blue-700', bgColor: 'bg-blue-50' },
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-100 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-neutral-200 rounded" />
          <div className="h-8 w-32 bg-neutral-200 rounded" />
        </div>
        <div className="w-12 h-12 bg-neutral-200 rounded-xl" />
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-4 border-b border-neutral-100">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-neutral-200 rounded" />
        <div className="h-3 w-32 bg-neutral-200 rounded" />
      </div>
      <div className="h-6 w-20 bg-neutral-200 rounded-full" />
    </div>
  )
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({})
  const [ordersByPayment, setOrdersByPayment] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/metrics')
      if (!res.ok) throw new Error('Error fetching metrics')
      const data = await res.json()
      setMetrics(data.metrics)
      setRecentOrders(data.recentOrders || [])
      setTopProducts(data.topProducts || [])
      setOrdersByStatus(data.ordersByStatus || {})
      setOrdersByPayment(data.ordersByPayment || {})
    } catch (err) {
      setError('Error cargando métricas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-500 mt-1">Cargando...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchMetrics} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
          Reintentar
        </button>
      </div>
    )
  }

  const totalOrdersCount = Object.values(ordersByStatus).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">Resumen de tu tienda</p>
        </div>
        <button
          onClick={fetchMetrics}
          className="flex items-center gap-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v5h.582m-15.356-2A8.001 8.001 0 0119.418 9m0 0H15m-11-11v5h.582" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Ingresos del Mes</p>
              <p className="text-3xl font-bold mt-1">{formatPrice(metrics.revenueThisMonth)}</p>
              <p className="text-emerald-200 text-xs mt-2">+12% vs mes anterior</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Pedidos Totales</p>
              <p className="text-3xl font-bold mt-1">{metrics.totalOrders}</p>
              <p className="text-blue-200 text-xs mt-2">{metrics.pendingOrders} pendientes</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Clientes</p>
              <p className="text-3xl font-bold mt-1">{metrics.totalCustomers}</p>
              <p className="text-purple-200 text-xs mt-2">Registrados</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Ticket Promedio</p>
              <p className="text-3xl font-bold mt-1">{formatPrice(metrics.avgOrderValue)}</p>
              <p className="text-orange-200 text-xs mt-2">Por pedido</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Estado de Pedidos</h2>
            <span className="text-sm text-neutral-500">{totalOrdersCount} total</span>
          </div>
          <div className="space-y-3">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = ordersByStatus[status] || 0
              const percentage = totalOrdersCount > 0 ? (count / totalOrdersCount) * 100 : 0
              return (
                <div key={status} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${config.dot}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700">{config.es}</span>
                      <span className="text-sm font-semibold text-neutral-900">{count}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${config.dot}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Orders by Payment */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Estado de Pagos</h2>
            <span className="text-sm text-neutral-500">{totalOrdersCount} total</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(paymentConfig).map(([status, config]) => {
              const count = ordersByPayment[status] || 0
              const percentage = totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0
              return (
                <div key={status} className={`${config.bgColor} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${
                      status === 'paid' ? 'bg-emerald-500' :
                      status === 'pending' ? 'bg-amber-500' :
                      status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <span className={`text-sm font-medium ${config.color}`}>{config.es}</span>
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{count}</p>
                  <p className="text-xs text-neutral-500 mt-1">{percentage}% del total</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Pedidos Recientes</h2>
            <Link href="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver todos →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-neutral-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-neutral-500">No hay pedidos todavía</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-neutral-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusConfig[order.status]?.bgColor}`}>
                      <span className={`w-2 h-2 rounded-full ${statusConfig[order.status]?.dot}`} />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">{order.order_number}</p>
                      <p className="text-xs text-neutral-500">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900">{formatPrice(order.total)}</p>
                    <p className="text-xs text-neutral-500">{new Date(order.created_at).toLocaleDateString('es-AR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Productos Más Vendidos</h2>
            <Link href="/admin/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver todos →
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-neutral-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-neutral-500">No hay datos de ventas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm truncate">{product.product_name}</p>
                    <p className="text-xs text-neutral-500">{product.quantity} vendidos</p>
                  </div>
                  <p className="font-semibold text-primary-600">{formatPrice(product.total_price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl hover:bg-primary-50 hover:ring-2 hover:ring-primary-200 transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <svg className="w-6 h-6 text-neutral-600 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{metrics.totalProducts}</p>
              <p className="text-sm text-neutral-500">Productos</p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl hover:bg-amber-50 hover:ring-2 hover:ring-amber-200 transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <svg className="w-6 h-6 text-neutral-600 group-hover:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{metrics.pendingOrders}</p>
              <p className="text-sm text-neutral-500">Pedidos Pend.</p>
            </div>
          </Link>

          <Link
            href="/admin/clients"
            className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl hover:bg-purple-50 hover:ring-2 hover:ring-purple-200 transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <svg className="w-6 h-6 text-neutral-600 group-hover:text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{metrics.totalCustomers}</p>
              <p className="text-sm text-neutral-500">Clientes</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl hover:bg-teal-50 hover:ring-2 hover:ring-teal-200 transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <svg className="w-6 h-6 text-neutral-600 group-hover:text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">Tienda</p>
              <p className="text-sm text-neutral-500">Ver sitio</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}