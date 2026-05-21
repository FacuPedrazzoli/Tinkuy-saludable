'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { BULK_UPDATE_PRODUCT_PRICES } from '@/lib/graphql/queries'
import { BulkPriceResult, PriceUpdateMode } from '@/lib/graphql/types'

interface BulkPriceActionBarProps {
  selectedIds: string[]
  onClearSelection: () => void
  onSuccess: (result: BulkPriceResult) => void
}

export default function BulkPriceActionBar({
  selectedIds,
  onClearSelection,
  onSuccess,
}: BulkPriceActionBarProps) {
  const [mode, setMode] = useState<PriceUpdateMode>('PERCENT_INCREASE')
  const [value, setValue] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const [bulkUpdatePrices] = useMutation<{ bulkUpdateProductPrices: BulkPriceResult }>(
    BULK_UPDATE_PRODUCT_PRICES
  )

  if (selectedIds.length === 0) return null

  async function handleApply() {
    setValidationError(null)
    const numValue = parseFloat(value)

    if (isNaN(numValue) || numValue <= 0) {
      setValidationError('Ingresá un valor numérico mayor a 0')
      return
    }

    if (mode === 'PERCENT_INCREASE' && numValue > 1000) {
      setValidationError('El porcentaje de aumento no puede superar 1000%')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await bulkUpdatePrices({
        variables: {
          input: {
            productIds: selectedIds,
            mode,
            value: numValue,
          },
        },
      })
      if (data?.bulkUpdateProductPrices) {
        onSuccess(data.bulkUpdateProductPrices)
        setValue('')
        onClearSelection()
      }
    } catch (err) {
      setValidationError(
        `Error al actualizar precios: ${err instanceof Error ? err.message : String(err)}`
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Selection count badge */}
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
            {selectedIds.length}
          </span>
          <span className="text-sm font-medium text-primary-900 dark:text-primary-200">
            producto{selectedIds.length !== 1 ? 's' : ''} seleccionado{selectedIds.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="w-px h-5 bg-primary-200 dark:bg-primary-700 hidden sm:block" />

        {/* Mode selector */}
        <select
          value={mode}
          onChange={(e) => { setMode(e.target.value as PriceUpdateMode); setValidationError(null) }}
          disabled={submitting}
          className="px-3 py-1.5 border border-primary-300 dark:border-primary-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white disabled:opacity-60"
        >
          <option value="PERCENT_INCREASE">% de aumento</option>
          <option value="FIXED_PRICE">Precio final fijo</option>
        </select>

        {/* Value input */}
        <div className="relative">
          {mode === 'FIXED_PRICE' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none">$</span>
          )}
          <input
            type="number"
            value={value}
            onChange={(e) => { setValue(e.target.value); setValidationError(null) }}
            placeholder={mode === 'PERCENT_INCREASE' ? 'Ej: 15' : 'Ej: 2500'}
            min="0"
            step={mode === 'PERCENT_INCREASE' ? '0.1' : '1'}
            disabled={submitting}
            className={`w-28 ${mode === 'FIXED_PRICE' ? 'pl-6' : 'pl-3'} pr-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white disabled:opacity-60 ${validationError ? 'border-red-400' : 'border-primary-300 dark:border-primary-700'}`}
          />
          {mode === 'PERCENT_INCREASE' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none">%</span>
          )}
        </div>

        {/* Apply button */}
        <button
          onClick={handleApply}
          disabled={submitting || !value}
          className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Aplicando...' : 'Aplicar'}
        </button>

        {/* Clear selection */}
        <button
          onClick={onClearSelection}
          disabled={submitting}
          className="ml-auto px-3 py-1.5 text-neutral-500 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          Deseleccionar todo
        </button>
      </div>

      {validationError && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{validationError}</p>
      )}
    </div>
  )
}
