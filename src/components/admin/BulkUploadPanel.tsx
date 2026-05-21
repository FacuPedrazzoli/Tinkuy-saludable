'use client'

import { useRef, useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { BULK_IMPORT_PRODUCTS } from '@/lib/graphql/queries'
import { BulkProductInput, BulkImportResult, InvoiceType, ProductSaleUnit } from '@/lib/graphql/types'

// ── Canonical column names (exact, order-sensitive) ─────────────────────────
const CANONICAL_HEADERS = ['nombre', 'categoria', 'proveedor', 'factura', 'unidad_venta', 'precio_base'] as const
type CanonicalHeader = typeof CANONICAL_HEADERS[number]

// Mapping from canonical name to BulkProductInput field
type ParsedRow = {
  rowIndex: number
  input: BulkProductInput
  valid: boolean
  errors: string[]
}

// ── SheetJS types (avoid importing just for types) ───────────────────────────
type WorkBook = {
  SheetNames: string[]
  Sheets: Record<string, WorkSheet>
}
type WorkSheet = Record<string, CellObject | { '!ref'?: string }>
type CellObject = { v?: unknown; w?: string; t?: string }

// ── Lazy import so xlsx is not in the initial bundle ─────────────────────────
async function loadXlsx() {
  return import('xlsx')
}

// ── Template generation ───────────────────────────────────────────────────────
async function downloadTemplate() {
  const XLSX = await loadXlsx()

  const headerRow = [...CANONICAL_HEADERS]
  const exampleRow = ['Almendras crudas', 'Frutos secos', 'Proveedor Ejemplo', 'A', 'kg', '1500']

  const dataSheet = XLSX.utils.aoa_to_sheet([headerRow, exampleRow])
  const instructionsSheet = XLSX.utils.aoa_to_sheet([
    ['Campo', 'Valores válidos', 'Notas'],
    ['factura', 'A, B, I, (vacío)', 'Dejar vacío para NONE'],
    ['unidad_venta', 'kg, unidad', 'Solo estos dos valores'],
    ['precio_base', 'Número > 0', 'Ej: 1500 o 1500.50'],
    ['categoria', 'Texto libre', 'El sistema crea la categoría si no existe'],
    ['proveedor', 'Texto libre', 'Campo opcional — puede dejarse vacío'],
  ])

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, dataSheet, 'Productos')
  XLSX.utils.book_append_sheet(wb, instructionsSheet, 'INSTRUCCIONES')

  // XLSX.writeFile uses fs in some bundler configs and silently fails in the browser.
  // Use write() + Blob + programmatic anchor click instead — guaranteed to work client-side.
  const buffer: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla-productos.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Row validation ────────────────────────────────────────────────────────────
function parseAndValidateRows(rows: Record<string, unknown>[]): ParsedRow[] {
  return rows.map((raw, idx) => {
    const rowIndex = idx + 2 // 1-based, row 1 = header
    const errors: string[] = []

    const nombre = String(raw['nombre'] ?? '').trim()
    const categoria = String(raw['categoria'] ?? '').trim()
    const proveedor = String(raw['proveedor'] ?? '').trim() || undefined
    const facturaRaw = String(raw['factura'] ?? '').trim().toUpperCase()
    const unidadRaw = String(raw['unidad_venta'] ?? '').trim().toLowerCase()
    const precioRaw = raw['precio_base']

    if (!nombre) errors.push('nombre es requerido')
    if (!categoria) errors.push('categoria es requerido')

    let invoiceType: InvoiceType | undefined
    if (facturaRaw === '' || facturaRaw === 'NONE') {
      invoiceType = 'NONE'
    } else if (['A', 'B', 'I'].includes(facturaRaw)) {
      invoiceType = facturaRaw as InvoiceType
    } else {
      errors.push(`factura inválido: "${raw['factura']}" — valores válidos: A, B, I, o vacío`)
    }

    let saleUnit: ProductSaleUnit | undefined
    if (unidadRaw === 'kg') {
      saleUnit = 'KG'
    } else if (unidadRaw === 'unidad') {
      saleUnit = 'UNIT'
    } else {
      errors.push(`unidad_venta inválido: "${raw['unidad_venta']}" — valores válidos: kg, unidad`)
    }

    const basePrice = typeof precioRaw === 'number' ? precioRaw : parseFloat(String(precioRaw ?? ''))
    if (isNaN(basePrice) || basePrice <= 0) {
      errors.push(`precio_base inválido: "${precioRaw}" — debe ser un número mayor a 0`)
    }

    const valid = errors.length === 0

    return {
      rowIndex,
      valid,
      errors,
      input: {
        name: nombre,
        category: categoria,
        supplier: proveedor,
        invoiceType: invoiceType ?? 'NONE',
        saleUnit: saleUnit ?? 'UNIT',
        basePrice: isNaN(basePrice) ? 0 : basePrice,
      },
    }
  })
}

// ── Component ─────────────────────────────────────────────────────────────────
interface BulkUploadPanelProps {
  onImportComplete: () => void
}

type UploadState = 'idle' | 'parsing' | 'preview' | 'importing' | 'done' | 'error'

export default function BulkUploadPanel({ onImportComplete }: BulkUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null)
  const [fileName, setFileName] = useState<string>('')

  const [bulkImport] = useMutation<{ bulkImportProducts: BulkImportResult }>(BULK_IMPORT_PRODUCTS)

  const validRows = parsedRows.filter((r) => r.valid)
  const invalidRows = parsedRows.filter((r) => !r.valid)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setHeaderError(null)
    setImportResult(null)
    setUploadState('parsing')

    try {
      const XLSX = await loadXlsx()
      const buffer = await file.arrayBuffer()
      const wb: WorkBook = XLSX.read(buffer, { type: 'array' })
      const firstSheet = wb.Sheets[wb.SheetNames[0]]
      const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })

      if (raw.length === 0) {
        setHeaderError('El archivo está vacío o no tiene filas de datos.')
        setUploadState('error')
        return
      }

      // Validate headers strictly
      const actualHeaders = Object.keys(raw[0]).map((h) => h.trim().toLowerCase())
      const expectedHeaders = [...CANONICAL_HEADERS]
      const headersMatch =
        actualHeaders.length === expectedHeaders.length &&
        expectedHeaders.every((h, i) => actualHeaders[i] === h)

      if (!headersMatch) {
        const expected = expectedHeaders.join(' | ')
        const found = actualHeaders.join(' | ')
        setHeaderError(
          `Formato de encabezados incorrecto.\n\nEsperado: ${expected}\nEncontrado: ${found}\n\nAsegurate de usar exactamente esas columnas en ese orden.`
        )
        setUploadState('error')
        return
      }

      const rows = parseAndValidateRows(raw as Record<string, unknown>[])
      setParsedRows(rows)
      setUploadState('preview')
    } catch (err) {
      setHeaderError(`Error al leer el archivo: ${err instanceof Error ? err.message : String(err)}`)
      setUploadState('error')
    }

    // Reset the input so the same file can be re-selected
    e.target.value = ''
  }

  async function handleConfirmImport() {
    const validInputs = validRows.map((r) => r.input)
    if (validInputs.length === 0) return

    setUploadState('importing')
    try {
      const { data } = await bulkImport({ variables: { input: validInputs } })
      if (data?.bulkImportProducts) {
        setImportResult(data.bulkImportProducts)
        setUploadState('done')
        onImportComplete()
      }
    } catch (err) {
      setHeaderError(`Error al importar: ${err instanceof Error ? err.message : String(err)}`)
      setUploadState('error')
    }
  }

  function handleReset() {
    setParsedRows([])
    setHeaderError(null)
    setImportResult(null)
    setFileName('')
    setUploadState('idle')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Carga masiva de productos
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Importá múltiples productos desde un archivo Excel (.xlsx)
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors text-sm font-medium whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar plantilla
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* File input */}
        {(uploadState === 'idle' || uploadState === 'error') && (
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-neutral-200 dark:border-neutral-600 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
            <svg className="w-8 h-8 text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              Seleccioná un archivo .xlsx
            </span>
            <span className="text-xs text-neutral-400 mt-1">Solo se acepta el formato de la plantilla</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}

        {uploadState === 'parsing' && (
          <div className="flex items-center gap-3 py-8 justify-center text-neutral-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Procesando archivo...</span>
          </div>
        )}

        {/* Header error */}
        {headerError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm font-medium text-red-800 dark:text-red-300 whitespace-pre-line">{headerError}</p>
            <button
              onClick={handleReset}
              className="mt-3 px-4 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Intentar con otro archivo
            </button>
          </div>
        )}

        {/* Preview */}
        {uploadState === 'preview' && parsedRows.length > 0 && (
          <>
            {/* Summary */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-sm">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">{parsedRows.length}</span>
                <span className="text-neutral-500 dark:text-neutral-400">filas totales</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-sm">
                <span className="font-medium text-emerald-700 dark:text-emerald-400">{validRows.length}</span>
                <span className="text-emerald-600 dark:text-emerald-500">válidas</span>
              </div>
              {invalidRows.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                  <span className="font-medium text-red-700 dark:text-red-400">{invalidRows.length}</span>
                  <span className="text-red-600 dark:text-red-500">con errores</span>
                </div>
              )}
              <span className="text-sm text-neutral-400 self-center">{fileName}</span>
            </div>

            {/* Error details */}
            {invalidRows.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Las siguientes filas tienen errores y no se importarán:
                </p>
                <ul className="space-y-1">
                  {invalidRows.map((row) => (
                    <li key={row.rowIndex} className="text-sm text-red-700 dark:text-red-400">
                      <span className="font-medium">Fila {row.rowIndex}:</span> {row.errors.join('; ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview table */}
            <div className="overflow-x-auto rounded-xl border border-neutral-100 dark:border-neutral-700">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-900">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">#</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Nombre</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Categoría</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Proveedor</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Factura</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Unidad</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Precio</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 dark:divide-neutral-700">
                  {parsedRows.slice(0, 50).map((row) => (
                    <tr
                      key={row.rowIndex}
                      className={row.valid ? 'bg-white dark:bg-neutral-800' : 'bg-red-50/60 dark:bg-red-900/10'}
                    >
                      <td className="px-3 py-2 text-neutral-400">{row.rowIndex}</td>
                      <td className="px-3 py-2 font-medium text-neutral-900 dark:text-white max-w-[160px] truncate">{row.input.name || '—'}</td>
                      <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300 max-w-[120px] truncate">{row.input.category || '—'}</td>
                      <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400 max-w-[120px] truncate">{row.input.supplier || '—'}</td>
                      <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300">{row.input.invoiceType ?? '—'}</td>
                      <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300">{row.input.saleUnit}</td>
                      <td className="px-3 py-2 text-neutral-900 dark:text-white font-medium">
                        {row.input.basePrice > 0 ? `$${row.input.basePrice.toLocaleString('es-AR')}` : '—'}
                      </td>
                      <td className="px-3 py-2">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500 dark:text-red-400 text-xs">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Error
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 50 && (
                <p className="px-4 py-2 text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-700">
                  Mostrando primeras 50 filas de {parsedRows.length} totales
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmImport}
                disabled={validRows.length === 0}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Importar {validRows.length} producto{validRows.length !== 1 ? 's' : ''}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </>
        )}

        {/* Importing */}
        {uploadState === 'importing' && (
          <div className="flex items-center gap-3 py-8 justify-center text-neutral-500">
            <svg className="w-5 h-5 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Importando productos...</span>
          </div>
        )}

        {/* Result */}
        {uploadState === 'done' && importResult && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{importResult.created}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Creados</p>
              </div>
              <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{importResult.updated}</p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">Actualizados</p>
              </div>
              <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-center">
                <p className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">{importResult.skipped}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Omitidos</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  El servidor reportó errores en {importResult.errors.length} fila(s):
                </p>
                {importResult.errors.map((e, i) => (
                  <p key={i} className="text-sm text-amber-700 dark:text-amber-400">
                    <span className="font-medium">Fila {e.row}</span>
                    {e.name ? ` (${e.name})` : ''}: {e.message}
                  </p>
                ))}
              </div>
            )}

            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors font-medium"
            >
              Importar otro archivo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
