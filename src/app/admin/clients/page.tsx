'use client'

import { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
import { formatPrice } from '@/lib/utils'
import { GET_CUSTOMERS } from '@/lib/graphql/queries'
import { GraphQLCustomersResult } from '@/lib/graphql/types'

interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  totalOrders: number
  totalSpent: number
  createdAt?: string
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-neutral-100 animate-pulse">
      <div className="w-12 h-12 bg-neutral-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-neutral-200 rounded" />
        <div className="h-3 w-48 bg-neutral-200 rounded" />
      </div>
      <div className="h-4 w-20 bg-neutral-200 rounded" />
    </div>
  )
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'spending' | 'orders'>('recent')

  const { data, refetch, loading: gqlLoading, error: gqlError } = useQuery<GraphQLCustomersResult>(GET_CUSTOMERS, {
    variables: { search: search || undefined },
  });

  useEffect(() => {
    if (gqlError) {
      setError('Error cargando clientes')
      setLoading(false)
    } else if (data?.customers) {
      setClients(data.customers.edges.map(e => e.node))
      setLoading(false)
    }
  }, [data, gqlError])

  const sortedClients = useMemo(() => [...clients].sort((a, b) => {
    if (sortBy === 'spending') return (b.totalSpent || 0) - (a.totalSpent || 0)
    if (sortBy === 'orders') return (b.totalOrders || 0) - (a.totalOrders || 0)
    return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  }), [clients, sortBy])

  const stats = useMemo(() => ({
    total: clients.length,
    totalSpent: clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
    avgSpent: clients.length > 0 ? clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / clients.length : 0,
    totalOrders: clients.reduce((sum, c) => sum + (c.totalOrders || 0), 0),
  }), [clients])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Clientes</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">{clients.length} clientes registrados</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Clientes</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Ingresos Totales</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatPrice(stats.totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Pedidos Totales</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Promedio</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatPrice(stats.avgSpent)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                sortBy === 'recent'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Más Recientes
            </button>
            <button
              onClick={() => setSortBy('spending')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                sortBy === 'spending'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Mayor Gasto
            </button>
            <button
              onClick={() => setSortBy('orders')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                sortBy === 'orders'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Más Pedidos
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-6">
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
            Reintentar
          </button>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 p-12 text-center">
          <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No hay clientes</h3>
          <p className="text-neutral-500 dark:text-neutral-400">Los clientes aparecerán cuando realicen su primera compra</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 overflow-hidden">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {sortedClients.map((client) => (
              <div key={client.id} className="p-4 hover:bg-neutral-50 dark:bg-neutral-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{client.firstName} {client.lastName}</h3>
                      {client.totalOrders >= 5 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          VIP
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{client.email}</p>
                    {client.phone && (
                      <p className="text-xs text-neutral-400">{client.phone}</p>
                    )}
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-4">
                      <div className="text-center px-4">
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{client.totalOrders}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">pedidos</p>
                      </div>
                      <div className="text-center px-4 border-l border-neutral-200">
                        <p className="text-2xl font-bold text-primary-600">{formatPrice(client.totalSpent)}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">gastado</p>
                      </div>
                      <div className="text-center px-4 border-l border-neutral-200">
                        <p className="text-sm font-medium text-neutral-700">
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' }) : '-'}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">cliente desde</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Mobile stats */}
                <div className="flex sm:hidden gap-4 mt-3 pt-3 border-t border-neutral-100">
                  <div className="flex-1 text-center">
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">{client.totalOrders}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">pedidos</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-lg font-bold text-primary-600">{formatPrice(client.totalSpent)}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">gastado</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}