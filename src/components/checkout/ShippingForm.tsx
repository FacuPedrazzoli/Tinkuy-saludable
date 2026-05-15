'use client'

import { ShippingFormData } from '@/lib/checkout/validation'

interface ShippingFormProps {
  shippingData: ShippingFormData
  setShippingData: React.Dispatch<React.SetStateAction<ShippingFormData>>
  errors: Record<string, string>
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  streetInputRef: React.RefObject<HTMLInputElement>
  cityInputRef: React.RefObject<HTMLInputElement>
  postalCodeInputRef: React.RefObject<HTMLInputElement>
}

export default function ShippingForm({
  shippingData,
  setShippingData,
  errors,
  setErrors,
  onSubmit,
  onBack,
  streetInputRef,
  cityInputRef,
  postalCodeInputRef,
}: ShippingFormProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setShippingData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl border border-neutral-100">
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">
        Dirección de Envío
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium text-neutral-700 mb-2">
              Calle *
            </label>
            <input
              type="text"
              id="street"
              name="street"
              ref={streetInputRef}
              value={shippingData.street}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors ${
                errors.street ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
              }`}
              placeholder="Av. Santa Fe"
            />
            {errors.street && <p className="text-red-500 text-sm mt-1" role="alert">{errors.street}</p>}
          </div>
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-neutral-700 mb-2">
              Número
            </label>
            <input
              type="text"
              id="number"
              name="number"
              value={shippingData.number}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              placeholder="1234"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2">
              Ciudad *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              ref={cityInputRef}
              value={shippingData.city}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors ${
                errors.city ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
              }`}
              placeholder="CABA"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1" role="alert">{errors.city}</p>}
          </div>
          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-neutral-700 mb-2">
              Código Postal *
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              ref={postalCodeInputRef}
              value={shippingData.postal_code}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors ${
                errors.postal_code ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
              }`}
              placeholder="C1054"
            />
            {errors.postal_code && <p className="text-red-500 text-sm mt-1" role="alert">{errors.postal_code}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-2">
            Notas (opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={shippingData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
            placeholder="Indicaciones para el delivery..."
          />
          <input type="hidden" name="state" value={shippingData.state} />
          <input type="hidden" name="country" value={shippingData.country} />
        </div>
      </div>
      <div className="flex gap-4 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-4 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors"
        >
          Volver
        </button>
        <button
          type="submit"
          className="flex-1 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
        >
          Continuar
        </button>
      </div>
    </form>
  )
}
