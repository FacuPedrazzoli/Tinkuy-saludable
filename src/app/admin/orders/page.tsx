'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatPrice } from '@/lib/utils'
import { ToastContainer, useToast } from '@/components/Toast'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  total: number
  subtotal: number
  shipping_cost: number
  discount_amount: number
  status: string
  payment_status: string
  payment_method: string | null
  notes: string | null
  shipping_address: any
  created_at: string
  order_items?: OrderItem[]
}

interface OrderItem {
  id: string
  product_name: string
  product_price: number
  quantity: number
  weight: number
  unit_price: number
  total_price: number
}

const statusConfig: Record<string, { label: string; es: string; color: string; bgColor: string; dot: string }> = {
  pending: { label: 'Pendiente', es: 'Pendiente', color: 'text-amber-700', bgColor: 'bg-amber-50', dot: 'bg-amber-500' },
  paid: { label: 'Pagado', es: 'Pagado', color: 'text-emerald-700', bgColor: 'bg-emerald-50', dot: 'bg-emerald-500' },
  preparing: { label: 'Preparando', es: 'Preparando', color: 'text-blue-700', bgColor: 'bg-blue-50', dot: 'bg-blue-500' },
  shipped: { label: 'Enviado', es: 'Enviado', color: 'text-purple-700', bgColor: 'bg-purple-50', dot: 'bg-purple-500' },
  delivered: { label: 'Entregado', es: 'Entregado', color: 'text-teal-700', bgColor: 'bg-teal-50', dot: 'bg-teal-500' },
  cancelled: { label: 'Cancelado', es: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-50', dot: 'bg-red-500' },
}

const paymentConfig: Record<string, { label: string; es: string; color: string; bgColor: string }> = {
  pending: { label: 'Pendiente', es: 'Pendiente', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  paid: { label: 'Pagado', es: 'Pagado', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  failed: { label: 'Fallido', es: 'Fallido', color: 'text-red-700', bgColor: 'bg-red-50' },
  refunded: { label: 'Reintegrado', es: 'Reintegrado', color: 'text-blue-700', bgColor: 'bg-blue-50' },
}

const nextStatus: Record<string, string> = {
  pending: 'paid',
  paid: 'preparing',
  preparing: 'shipped',
  shipped: 'delivered',
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-4 border-b border-neutral-100 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-neutral-200 rounded" />
        <div className="h-3 w-32 bg-neutral-200 rounded" />
      </div>
      <div className="h-6 w-20 bg-neutral-200 rounded-full" />
    </div>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const toast = useToast()

  const fetchOrders = useCallback(async () => {
    try {
      let url = '/api/orders?'
      if (filterStatus) url += `status=${filterStatus}`
      if (searchQuery) url += (filterStatus ? '&' : '') + `search=${encodeURIComponent(searchQuery)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Error fetching orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      setError('Error cargando pedidos')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, searchQuery])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Error updating status')
      fetchOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null)
      }
    } catch (err) {
      toast.error('Error actualizando estado')
    }
  }

  const viewOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (!res.ok) throw new Error('Error fetching order')
      const data = await res.json()
      setSelectedOrder(data)
    } catch (err) {
      toast.error('Error cargando pedido')
    }
  }

  const statusFilters = [
    { value: '', label: 'Todos', count: orders.length },
    ...Object.entries(statusConfig).map(([status, config]) => ({
      value: status,
      label: config.es,
      count: orders.filter(o => o.status === status).length
    }))
  ]

  const exportToCSV = () => {
    const headers = ['Pedido', 'Fecha', 'Cliente', 'Email', 'Teléfono', 'Total', 'Subtotal', 'Envío', 'Descuento', 'Estado', 'Pago', 'Método de Pago']
    const rows = orders.map(order => [
      order.order_number,
      new Date(order.created_at).toLocaleDateString('es-AR'),
      order.customer_name,
      order.customer_email,
      order.customer_phone || '',
      order.total.toString(),
      order.subtotal.toString(),
      order.shipping_cost.toString(),
      order.discount_amount.toString(),
      statusConfig[order.status]?.es || order.status,
      paymentConfig[order.payment_status]?.es || order.payment_status,
      order.payment_method || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Pedidos</h1>
          <p className="text-neutral-500 mt-1">{orders.length} pedidos</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={orders.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por código de pedido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filterStatus === filter.value
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {filter.label}
                <span className={`ml-2 text-xs ${filterStatus === filter.value ? 'text-primary-200' : 'text-neutral-400'}`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6">
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchOrders} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
            Reintentar
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No hay pedidos</h3>
          <p className="text-neutral-500">Los pedidos aparecerán aquí cuando se creen</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Pedido</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Pago</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-neutral-900">{order.order_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-neutral-900">{order.customer_name}</p>
                      <p className="text-sm text-neutral-500">{order.customer_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-neutral-600">
                        {new Date(order.created_at).toLocaleDateString('es-AR')}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {new Date(order.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-lg text-neutral-900">{formatPrice(order.total)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig[order.status]?.bgColor} ${statusConfig[order.status]?.color}`}>
                        <span className={`w-2 h-2 rounded-full ${statusConfig[order.status]?.dot}`} />
                        {statusConfig[order.status]?.es}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${paymentConfig[order.payment_status]?.bgColor} ${paymentConfig[order.payment_status]?.color}`}>
                        {paymentConfig[order.payment_status]?.es}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => viewOrder(order.id)}
                          className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                        >
                          Ver
                        </button>
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <button
                            onClick={() => updateStatus(order.id, nextStatus[order.status])}
                            className="px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-medium"
                          >
                            Avanzar →
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-100 p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">{selectedOrder.order_number}</h2>
                <p className="text-neutral-500 text-sm mt-1">
                  {new Date(selectedOrder.created_at).toLocaleString('es-AR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status & Payment */}
              <div className="flex flex-wrap gap-4">
                <div className={`flex-1 min-w-[200px] p-4 rounded-xl ${statusConfig[selectedOrder.status]?.bgColor}`}>
                  <p className="text-sm text-neutral-500 mb-1">Estado del Pedido</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${statusConfig[selectedOrder.status]?.dot}`} />
                    <span className={`font-semibold ${statusConfig[selectedOrder.status]?.color}`}>
                      {statusConfig[selectedOrder.status]?.es}
                    </span>
                  </div>
                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <select
                      value={selectedOrder.status}
                      onChange={async (e) => {
                        await updateStatus(selectedOrder.id, e.target.value)
                        const res = await fetch(`/api/orders/${selectedOrder.id}`)
                        if (res.ok) setSelectedOrder(await res.json())
                      }}
                      className="mt-3 w-full px-3 py-2 rounded-lg border-0 bg-white text-sm"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="paid">Pagado</option>
                      <option value="preparing">Preparando</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  )}
                </div>
                <div className={`flex-1 min-w-[200px] p-4 rounded-xl ${paymentConfig[selectedOrder.payment_status]?.bgColor}`}>
                  <p className="text-sm text-neutral-500 mb-1">Estado del Pago</p>
                  <p className={`font-semibold ${paymentConfig[selectedOrder.payment_status]?.color}`}>
                    {paymentConfig[selectedOrder.payment_status]?.es}
                  </p>
                </div>
              </div>

              {/* Customer & Shipping */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <h3 className="font-semibold text-neutral-900 mb-3">Datos del Cliente</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-neutral-500">Nombre:</span> <span className="font-medium">{selectedOrder.customer_name}</span></p>
                    <p><span className="text-neutral-500">Email:</span> <span className="font-medium">{selectedOrder.customer_email}</span></p>
                    {selectedOrder.customer_phone && (
                      <p><span className="text-neutral-500">Teléfono:</span> <span className="font-medium">{selectedOrder.customer_phone}</span></p>
                    )}
                  </div>
                </div>
                {selectedOrder.shipping_address && (
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="font-semibold text-neutral-900 mb-3">Dirección de Envío</h3>
                    <p className="text-sm text-neutral-700">
                      {selectedOrder.shipping_address.street} {selectedOrder.shipping_address.number}
                    </p>
                    <p className="text-sm text-neutral-700">
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}
                    </p>
                    <p className="text-sm text-neutral-500">CP: {selectedOrder.shipping_address.postal_code}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Items del Pedido</h3>
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Producto</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-neutral-900">Cantidad</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">Precio</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedOrder.order_items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-neutral-900">{item.product_name}</p>
                            <p className="text-xs text-neutral-500">{item.weight}g</p>
                          </td>
                          <td className="px-4 py-3 text-center text-neutral-600">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-neutral-600">
                            {formatPrice(item.unit_price)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                            {formatPrice(item.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-neutral-50 rounded-xl p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Descuento</span>
                      <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Envío</span>
                    <span className="font-medium">{formatPrice(selectedOrder.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200">
                    <span>Total</span>
                    <span className="text-primary-600">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="font-semibold text-amber-800 mb-2">Notas</h3>
                  <p className="text-sm text-amber-700">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}