'use client'

import { ContactFormData, ShippingFormData } from '@/lib/checkout/validation'

interface PaymentFormProps {
  paymentMethod: 'mercadopago' | 'transfer' | 'cash'
  setPaymentMethod: React.Dispatch<React.SetStateAction<'mercadopago' | 'transfer' | 'cash'>>
  contactData: ContactFormData
  shippingData: ShippingFormData
  isSubmitting: boolean
  onPlaceOrder: () => void
  onBack: () => void
}

export default function PaymentForm({
  paymentMethod,
  setPaymentMethod,
  contactData,
  shippingData,
  isSubmitting,
  onPlaceOrder,
  onBack,
}: PaymentFormProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-100">
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">
        Método de Pago
      </h2>
      <fieldset className="space-y-4 mb-6">
        <legend className="sr-only">Selecciona un método de pago</legend>
        <div
          onClick={() => setPaymentMethod('mercadopago')}
          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
            paymentMethod === 'mercadopago'
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-200 hover:border-primary-300'
          }`}
        >
          <input
            type="radio"
            name="payment"
            id="mp"
            checked={paymentMethod === 'mercadopago'}
            onChange={() => setPaymentMethod('mercadopago')}
            className="w-5 h-5 text-primary-600"
          />
          <label htmlFor="mp" className="flex-1 cursor-pointer">
            <span className="font-medium text-neutral-900">MercadoPago</span>
            <span className="block text-sm text-neutral-500">Pago seguro con tu cuenta de MercadoPago</span>
          </label>
        </div>
        <div
          onClick={() => setPaymentMethod('transfer')}
          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
            paymentMethod === 'transfer'
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-200 hover:border-primary-300'
          }`}
        >
          <input
            type="radio"
            name="payment"
            id="transfer"
            checked={paymentMethod === 'transfer'}
            onChange={() => setPaymentMethod('transfer')}
            className="w-5 h-5 text-primary-600"
          />
          <label htmlFor="transfer" className="flex-1 cursor-pointer">
            <span className="font-medium text-neutral-900">Transferencia Bancaria</span>
            <span className="block text-sm text-neutral-500">CBU o Alias para realizar la transferencia</span>
          </label>
        </div>
        <div
          onClick={() => setPaymentMethod('cash')}
          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
            paymentMethod === 'cash'
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-200 hover:border-primary-300'
          }`}
        >
          <input
            type="radio"
            name="payment"
            id="cash"
            checked={paymentMethod === 'cash'}
            onChange={() => setPaymentMethod('cash')}
            className="w-5 h-5 text-primary-600"
          />
          <label htmlFor="cash" className="flex-1 cursor-pointer">
            <span className="font-medium text-neutral-900">Efectivo</span>
            <span className="block text-sm text-neutral-500">Pago contra entrega</span>
          </label>
        </div>
      </fieldset>
      <div className="bg-neutral-50 p-4 rounded-xl mb-6">
        <h3 className="font-medium text-neutral-900 mb-2">Resumen del pedido:</h3>
        <p className="text-sm text-neutral-600">
          {contactData.name} - {contactData.email}
        </p>
        <p className="text-sm text-neutral-600">
          {shippingData.street} {shippingData.number}, {shippingData.city} {shippingData.postal_code}
        </p>
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
          type="button"
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          className="flex-1 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Procesando...
            </>
          ) : (
            'Realizar Pedido'
          )}
        </button>
      </div>
    </div>
  )
}
