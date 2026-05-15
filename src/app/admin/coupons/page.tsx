'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { formatPrice } from '@/lib/utils'
import { ToastContainer, useToast } from '@/components/Toast'
import { GET_COUPONS, CREATE_COUPON, UPDATE_COUPON, DELETE_COUPON } from '@/lib/graphql/queries'
import { GraphQLCouponsResult, GraphQLCoupon } from '@/lib/graphql/types'

interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: string
  discountValue: number
  minPurchase: number
  maxUses: number | null
  usesCount: number
  startsAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

const emptyCoupon = {
  id: undefined as string | undefined,
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  minPurchase: 0,
  maxUses: null as number | null,
  startsAt: '',
  expiresAt: '',
  isActive: true,
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<typeof emptyCoupon | null>(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const { data, refetch, loading: gqlLoading, error: gqlError } = useQuery<GraphQLCouponsResult>(GET_COUPONS, {
    onError: (error) => {
      console.error('Coupons query error:', error);
      setError('Error cargando cupones');
    },
  });

  useEffect(() => {
    if (gqlLoading) {
      setLoading(true)
      setError(null)
    }
  }, [gqlLoading])

  useEffect(() => {
    if (gqlError) {
      setError('Error cargando cupones')
      setLoading(false)
    }
  }, [gqlError])

  useEffect(() => {
    if (data?.coupons) {
      setCoupons((data.coupons as GraphQLCoupon[]).map(c => ({
        id: c.id || '',
        code: c.code || '',
        description: c.description ?? null,
        discountType: c.discountType || 'percentage',
        discountValue: c.discountValue ?? 0,
        minPurchase: c.minPurchase ?? 0,
        maxUses: c.maxUses ?? null,
        usesCount: c.usesCount ?? 0,
        startsAt: c.startsAt ?? null,
        expiresAt: c.expiresAt ?? null,
        isActive: c.isActive ?? true,
        createdAt: c.createdAt || new Date().toISOString(),
      })) as Coupon[])
      setLoading(false)
    }
  }, [data])

  const [createCoupon, { loading: createLoading }] = useMutation(CREATE_COUPON, {
    onError: (error) => {
      toast.error(error.message || 'Error al crear cupón');
    },
  })
  const [updateCoupon, { loading: updateLoading }] = useMutation(UPDATE_COUPON, {
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar cupón');
    },
  })
  const [deleteCoupon, { loading: deleteLoading }] = useMutation(DELETE_COUPON, {
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar cupón');
    },
  })

  const handleSave = useCallback(async () => {
    if (!editingCoupon) return

    const validationErrors: string[] = []
    if (!editingCoupon.code.trim()) {
      validationErrors.push('El código del cupón es requerido')
    }
    if (editingCoupon.discountValue <= 0) {
      validationErrors.push('El valor del descuento debe ser mayor a 0')
    }
    if (editingCoupon.discountType === 'percentage' && editingCoupon.discountValue > 100) {
      validationErrors.push('El porcentaje no puede ser mayor a 100')
    }
    if (editingCoupon.startsAt && editingCoupon.expiresAt) {
      const startDate = new Date(editingCoupon.startsAt)
      const endDate = new Date(editingCoupon.expiresAt)
      if (endDate <= startDate) {
        validationErrors.push('La fecha de vencimiento debe ser posterior a la fecha de inicio')
      }
    }

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      const codeInput = document.getElementById('coupon-code')
      if (validationErrors[0].includes('código')) {
        codeInput?.focus()
      }
      return
    }

    if (saving) return
    setSaving(true)

    try {
      const input = {
        code: editingCoupon.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
        description: editingCoupon.description?.trim().replace(/<[^>]*>/g, '') || null,
        discountType: editingCoupon.discountType,
        discountValue: editingCoupon.discountValue,
        minPurchase: editingCoupon.minPurchase,
        maxUses: editingCoupon.maxUses,
        startsAt: editingCoupon.startsAt || null,
        expiresAt: editingCoupon.expiresAt || null,
        isActive: editingCoupon.isActive,
      }

      if (editingCoupon.id) {
        await updateCoupon({ variables: { id: editingCoupon.id, input } })
      } else {
        await createCoupon({ variables: { input } })
      }

      setShowModal(false)
      setEditingCoupon(null)
      refetch()
    } catch (err) {
      const error = err as Error
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }, [editingCoupon, createCoupon, updateCoupon, refetch, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return

    try {
      await deleteCoupon({ variables: { id } })
      refetch()
    } catch (err) {
      const error = err as Error
      toast.error(error.message)
    }
  }, [deleteCoupon, refetch, toast])

  const handleToggleActive = useCallback(async (coupon: Coupon) => {
    try {
      await updateCoupon({
        variables: {
          id: coupon.id,
          input: {
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minPurchase: coupon.minPurchase,
            maxUses: coupon.maxUses,
            startsAt: coupon.startsAt,
            expiresAt: coupon.expiresAt,
            isActive: !coupon.isActive,
          }
        }
      })
      refetch()
    } catch (err) {
      const error = err as Error
      toast.error(error.message)
    }
  }, [updateCoupon, refetch, toast])

  const openEdit = useCallback((coupon: Coupon) => {
    setEditingCoupon({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase,
      maxUses: coupon.maxUses,
      startsAt: coupon.startsAt ? coupon.startsAt.split('T')[0] : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
      isActive: coupon.isActive,
    })
    setShowModal(true)
  }, [])

  const openNew = useCallback(() => {
    setEditingCoupon({ ...emptyCoupon })
    setShowModal(true)
  }, [])

  const isExpired = useCallback((coupon: Coupon) => {
    if (!coupon.expiresAt) return false
    return new Date(coupon.expiresAt) < new Date()
  }, [])

  const isValid = useCallback((coupon: Coupon) => {
    if (!coupon.isActive) return false
    if (isExpired(coupon)) return false
    if (coupon.startsAt && new Date(coupon.startsAt) > new Date()) return false
    if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) return false
    return true
  }, [isExpired])

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Cupones</h1>
          <p className="text-neutral-500 mt-1">{coupons.length} cupones</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-500/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Cupón
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={() => refetch()} className="mt-2 text-primary-600 hover:underline">
            Reintentar
          </button>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
          <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No hay cupones</h3>
          <p className="text-neutral-500 mb-6">Empezá creando tu primer cupón de descuento</p>
          <button onClick={openNew} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
            Crear Cupón
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Código</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Valor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Uso</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Vencimiento</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Estado</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {coupons.map((coupon) => {
                const valid = isValid(coupon)
                const expired = isExpired(coupon)

                return (
                  <tr key={coupon.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-neutral-900 font-mono">{coupon.code}</p>
                        {coupon.description && (
                          <p className="text-sm text-neutral-500 truncate max-w-xs">{coupon.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                        {coupon.discountType === 'percentage' ? 'Porcentaje' : 'Fijo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-neutral-900">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : formatPrice(coupon.discountValue)}
                      </p>
                      {coupon.minPurchase > 0 && (
                        <p className="text-xs text-neutral-500">Mín: {formatPrice(coupon.minPurchase)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-neutral-900">
                        {coupon.usesCount}
                        {coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.expiresAt ? (
                        <p className={`text-sm ${expired ? 'text-red-600' : 'text-neutral-900'}`}>
                          {new Date(coupon.expiresAt).toLocaleDateString('es-AR')}
                        </p>
                      ) : (
                        <span className="text-sm text-neutral-400">Sin vencimiento</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          valid
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : expired
                            ? 'bg-red-100 text-red-700'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {valid ? 'Activo' : expired ? 'Vencido' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                          aria-label="Editar"
                        >
                          <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Eliminar"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && editingCoupon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900">
                {editingCoupon.id ? 'Editar Cupón' : 'Nuevo Cupón'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="coupon-code" className="block text-sm font-medium text-neutral-700 mb-1">Código <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="coupon-code"
                  name="coupon-code"
                  value={editingCoupon.code}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono"
                  placeholder="EJEMPLO20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={editingCoupon.description}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="20% de descuento en tu primera compra"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
                  <select
                    value={editingCoupon.discountType}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                  >
                    <option value="percentage">Porcentaje</option>
                    <option value="fixed">Monto fijo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Valor</label>
                  <input
                    type="number"
                    value={editingCoupon.discountValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Compra mínima (ARS)</label>
                <input
                  type="number"
                  value={editingCoupon.minPurchase}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, minPurchase: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    value={editingCoupon.startsAt}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, startsAt: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha vencimiento</label>
                  <input
                    type="date"
                    value={editingCoupon.expiresAt}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, expiresAt: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Máximo de usos</label>
                <input
                  type="number"
                  value={editingCoupon.maxUses || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Sin límite"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingCoupon.isActive}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-neutral-700">Cupón activo</span>
              </label>
            </div>
            <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingCoupon.code || !editingCoupon.discountValue}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}