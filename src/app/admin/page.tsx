'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'
import { GET_ORDERS, GET_ADMIN_METRICS, GET_RECENT_ORDERS, GET_TOP_PRODUCTS } from '@/lib/graphql/queries'
import { formatPrice } from '@/lib/utils'

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
  orderNumber: string
  customerName: string
  customerEmail: string
  total: number
  status: string
  paymentStatus: string
  createdAt: string
}

interface TopProduct {
  productName: string
  quantity: number
  totalPrice: number
}

interface AdminMetricsData {
  adminMetrics: {
    totalOrders: number
    pendingOrders: number
    totalCustomers: number
    totalProducts: number
    revenueToday: number
    revenueThisMonth: number
    avgOrderValue: number
    ordersByStatus: { status: string; count: number }[]
    ordersByPayment: { paymentStatus: string; count: number }[]
  }
}

interface RecentOrdersData {
  recentOrders: Order[]
}

interface TopProductsData {
  topProducts: TopProduct[]
}

interface OrdersData {
  orders: {
    items: {
      id: string
      status: string
      paymentStatus: string
      totalAmount: number
      createdAt: string
    }[]
    count: number
  }
}

const statusConfig: Record<string, { es: string; bgColor: string; dot: string; textColor: string }> = {
  pending: { es: 'Pendiente', bgColor: 'bg-amber-50', dot: 'bg-amber-500', textColor: 'text-amber-700' },
  paid: { es: 'Pagado', bgColor: 'bg-emerald-50', dot: 'bg-emerald-500', textColor: 'text-emerald-700' },
  preparing: { es: 'Preparando', bgColor: 'bg-blue-50', dot: 'bg-blue-500', textColor: 'text-blue-700' },
  shipped: { es: 'Enviado', bgColor: 'bg-purple-50', dot: 'bg-purple-500', textColor: 'text-purple-700' },
  delivered: { es: 'Entregado', bgColor: 'bg-teal-50', dot: 'bg-teal-500', textColor: 'text-teal-700' },
  cancelled: { es: 'Cancelado', bgColor: 'bg-red-50', dot: 'bg-red-500', textColor: 'text-red-700' },
}

const paymentConfig: Record<string, { es: string; bgColor: string; textColor: string }> = {
  pending: { es: 'Pendiente', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
  paid: { es: 'Pagado', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  failed: { es: 'Fallido', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  refunded: { es: 'Reintegrado', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-100 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-3 w-20 bg-neutral-200 rounded" />
          <div className="h-8 w-28 bg-neutral-200 rounded" />
        </div>
        <div className="w-12 h-12 bg-neutral-200 rounded-xl" />
      </div>
    </div>
  )
}

function computeMetricsFromOrders(ordersData: OrdersData | undefined): Metrics {
  if (!ordersData?.orders?.items) {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      revenueToday: 0,
      revenueThisMonth: 0,
      avgOrderValue: 0,
    }
  }

  const items = ordersData.orders.items
  const totalOrders = items.length
  const pendingOrders = items.filter(o => o.status === 'pending').length

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString()

  const ordersThisMonth = items.filter(o => o.createdAt >= startOfMonth)
  const ordersToday = items.filter(o => o.createdAt >= startOfToday)

  const revenueThisMonth = ordersThisMonth.reduce((sum, o) => sum + o.totalAmount, 0)
  const revenueToday = ordersToday.reduce((sum, o) => sum + o.totalAmount, 0)
  const avgOrderValue = totalOrders > 0 ? revenueThisMonth / totalOrders : 0

  return {
    totalOrders,
    pendingOrders,
    totalCustomers: 0,
    totalProducts: 0,
    revenueToday,
    revenueThisMonth,
    avgOrderValue,
  }
}

export default function AdminDashboard() {
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({})
  const [ordersByPayment, setOrdersByPayment] = useState<Record<string, number>>({})

  const { data: metricsData, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useQuery<AdminMetricsData>(GET_ADMIN_METRICS, {
    pollInterval: 120000,
  })
  const { data: recentOrdersData, loading: recentOrdersLoading, error: recentOrdersError } = useQuery<RecentOrdersData>(GET_RECENT_ORDERS, {
    variables: { limit: 10 },
    pollInterval: 60000,
  })
  const { data: topProductsData, loading: topProductsLoading, error: topProductsError } = useQuery<TopProductsData>(GET_TOP_PRODUCTS, {
    variables: { limit: 5 },
    pollInterval: 120000,
  })
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useQuery<OrdersData>(GET_ORDERS, {
    variables: { take: 100 },
  })

  const loading = metricsLoading || recentOrdersLoading || topProductsLoading || ordersLoading
  const error = metricsError

  const computedMetrics = useMemo(() => computeMetricsFromOrders(ordersData as OrdersData | undefined), [ordersData])

  const memoizedStatusConfig = useMemo(() => statusConfig, [])
  const memoizedPaymentConfig = useMemo(() => paymentConfig, [])

  const metrics: Metrics | null = metricsData?.adminMetrics
    ? {
        totalOrders: metricsData.adminMetrics.totalOrders,
        pendingOrders: metricsData.adminMetrics.pendingOrders,
        totalCustomers: metricsData.adminMetrics.totalCustomers,
        totalProducts: metricsData.adminMetrics.totalProducts,
        revenueToday: metricsData.adminMetrics.revenueToday,
        revenueThisMonth: metricsData.adminMetrics.revenueThisMonth,
        avgOrderValue: metricsData.adminMetrics.avgOrderValue,
      }
    : computedMetrics

  const recentOrders: Order[] = recentOrdersData?.recentOrders || (ordersData as OrdersData | undefined)?.orders?.items?.slice(0, 5).map(o => ({
    id: o.id || '',
    orderNumber: `#${(o.id || '').slice(0, 8).toUpperCase()}`,
    customerName: 'Cliente',
    customerEmail: '-',
    total: o.totalAmount,
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
  })) || []

  const topProducts: TopProduct[] = (topProductsData as TopProductsData | undefined)?.topProducts || []

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">Cargando...</p>
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
        <p className="text-red-600 mb-4">{error?.message || 'Error cargando métricas'}</p>
        <button onClick={() => refetchMetrics()} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
          Reintentar
        </button>
      </div>
    )
  }

  const computedOrdersByStatus: Record<string, number> = metricsData?.adminMetrics?.ordersByStatus
    ? Object.fromEntries(metricsData.adminMetrics.ordersByStatus.map(s => [s.status, s.count]))
    : ordersByStatus

  const computedOrdersByPayment: Record<string, number> = metricsData?.adminMetrics?.ordersByPayment
    ? Object.fromEntries(metricsData.adminMetrics.ordersByPayment.map(p => [p.paymentStatus, p.count]))
    : ordersByPayment

  const totalOrdersCount = Object.values(computedOrdersByStatus).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">Resumen de tu tienda</p>
        </div>
        <button
          onClick={() => refetchMetrics()}
          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v5h.582m-15.356-2A8.001 8.001 0 0119.418 9m0 0H15m-11-11v5h.582" />
          </svg>
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-500">Ingresos del Mes</span>
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{formatPrice(metrics.revenueThisMonth)}</p>
          <p className="text-xs text-neutral-400 mt-1">{/* TODO: calcular real */}</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-500">Pedidos Totales</span>
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{metrics.totalOrders}</p>
          <p className="text-xs text-amber-600 mt-1">{metrics.pendingOrders} pendientes</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-500">Clientes</span>
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{metrics.totalCustomers}</p>
          <p className="text-xs text-neutral-400 mt-1">Registrados</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-500">Ticket Promedio</span>
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{formatPrice(metrics.avgOrderValue)}</p>
          <p className="text-xs text-neutral-400 mt-1">Por pedido</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Estado de Pedidos</h2>
            <span className="text-sm text-neutral-400">{totalOrdersCount} total</span>
          </div>
          <div className="space-y-4">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = computedOrdersByStatus[status] || 0
              const percentage = totalOrdersCount > 0 ? (count / totalOrdersCount) * 100 : 0
              return (
                <div key={status} className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-neutral-700">{config.es}</span>
                      <span className="text-sm font-semibold text-neutral-900">{count}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
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

        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Estado de Pagos</h2>
            <span className="text-sm text-neutral-400">{totalOrdersCount} total</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(paymentConfig).map(([status, config]) => {
              const count = computedOrdersByPayment[status] || 0
              const percentage = totalOrdersCount > 0 ? Math.round((count / totalOrdersCount) * 100) : 0
              return (
                <div key={status} className={`${config.bgColor} rounded-xl p-4`}>
                  <span className={`text-sm font-medium ${config.textColor}`}>{config.es}</span>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{count}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{percentage}%</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Pedidos Recientes</h2>
            <Link href="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver todos
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10">
              <svg className="w-12 h-12 text-neutral-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-neutral-400 text-sm">No hay pedidos todavía</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-neutral-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${statusConfig[order.status]?.bgColor}`}>
                      <span className={`w-2 h-2 rounded-full ${statusConfig[order.status]?.dot}`} />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-neutral-400">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900 text-sm">{formatPrice(order.total)}</p>
                    <p className="text-xs text-neutral-400">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Productos Más Vendidos</h2>
            <Link href="/admin/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver todos
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-10">
              <svg className="w-12 h-12 text-neutral-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-neutral-400 text-sm">No hay datos de ventas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center gap-4 py-2.5 border-b border-neutral-50 last:border-0">
                  <div className="w-8 h-8 bg-primary-50 text-primary-700 rounded-lg flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm truncate">{product.productName}</p>
                    <p className="text-xs text-neutral-400">{product.quantity} vendidos</p>
                  </div>
                  <p className="font-semibold text-primary-600 text-sm">{formatPrice(product.totalPrice)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all group"
          >
            <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <svg className="w-5 h-5 text-neutral-500 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group"
          >
            <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <svg className="w-5 h-5 text-neutral-500 group-hover:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all group"
          >
            <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <svg className="w-5 h-5 text-neutral-500 group-hover:text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all group"
          >
            <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <svg className="w-5 h-5 text-neutral-500 group-hover:text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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