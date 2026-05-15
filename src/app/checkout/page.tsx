'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore, calculatePrice, Weight } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { CartItem } from '@/types'

interface ContactFormData {
  name: string
  email: string
  phone: string
}

interface ShippingFormData {
  street: string
  number: string
  city: string
  state: string
  postal_code: string
  country: string
  notes: string
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [step, setStep] = useState(1)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transfer' | 'cash'>('cash')
  const [contactData, setContactData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
  })
  const [shippingData, setShippingData] = useState<ShippingFormData>({
    street: '',
    number: '',
    city: '',
    state: 'Buenos Aires',
    postal_code: '',
    country: 'Argentina',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const streetInputRef = useRef<HTMLInputElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const postalCodeInputRef = useRef<HTMLInputElement>(null)
  const stateInputRef = useRef<HTMLInputElement>(null)
  const countryInputRef = useRef<HTMLInputElement>(null)

  const validateContact = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!contactData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (contactData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!contactData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!validateEmail(contactData.email)) {
      newErrors.email = 'Ingresá un email válido'
    }

    if (!contactData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    } else if (contactData.phone.replace(/\D/g, '').length < 8) {
      newErrors.phone = 'Ingresá un teléfono válido'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.name && nameInputRef.current) {
        nameInputRef.current.focus()
      } else if (newErrors.email && emailInputRef.current) {
        emailInputRef.current.focus()
      } else if (newErrors.phone && phoneInputRef.current) {
        phoneInputRef.current.focus()
      }
      return false
    }
    return true
  }

  const validateShipping = (): boolean => {
    const newErrors: Record<string, string> = {}
    let firstErrorField: string | null = null

    if (!shippingData.street.trim()) {
      newErrors.street = 'La dirección es requerida'
      if (!firstErrorField) firstErrorField = 'street'
    }

    if (!shippingData.city.trim()) {
      newErrors.city = 'La ciudad es requerida'
      if (!firstErrorField) firstErrorField = 'city'
    }

    if (!shippingData.postal_code.trim()) {
      newErrors.postal_code = 'El código postal es requerido'
      if (!firstErrorField) firstErrorField = 'postal_code'
    }

    setErrors(newErrors)

    if (firstErrorField) {
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.focus()
      }
      return false
    }
    return true
  }

  const handleContactSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (validateContact()) {
      setStep(2)
    }
  }, [validateContact])

  const handleShippingSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (validateShipping()) {
      setStep(3)
    }
  }, [validateShipping])

  const handlePlaceOrder = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    const sanitizedContactData = {
      name: contactData.name.trim().replace(/<[^>]*>/g, ''),
      email: contactData.email.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, ''),
      phone: contactData.phone.trim().replace(/[^0-9+\-\s]/g, ''),
    }

    const sanitizedShippingData = {
      street: shippingData.street.trim().replace(/<[^>]*>/g, ''),
      number: shippingData.number.trim().replace(/<[^>]*>/g, ''),
      city: shippingData.city.trim().replace(/<[^>]*>/g, ''),
      state: shippingData.state.trim(),
      postal_code: shippingData.postal_code.trim().replace(/<[^>]*>/g, ''),
      country: shippingData.country.trim(),
      notes: shippingData.notes.trim().replace(/<[^>]*>/g, ''),
    }

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        weight: item.weight,
        unit_price: calculatePrice(item.product.price, item.weight as Weight),
        total_price: calculatePrice(item.product.price, item.weight as Weight) * item.quantity,
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: sanitizedContactData.email,
          customer_name: sanitizedContactData.name,
          customer_phone: sanitizedContactData.phone,
          items: orderItems,
          subtotal: getTotal(),
          discount_amount: 0,
          shipping_cost: 0,
          total: getTotal(),
          payment_method: paymentMethod,
          notes: sanitizedShippingData.notes,
          shipping_address: {
            street: sanitizedShippingData.street,
            number: sanitizedShippingData.number,
            city: sanitizedShippingData.city,
            state: sanitizedShippingData.state,
            postal_code: sanitizedShippingData.postal_code,
            country: sanitizedShippingData.country,
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear el pedido')
      }

      const data = await res.json()
      setOrderId(data.order?.order_number || 'TNK-' + Date.now())

      if (paymentMethod === 'mercadopago' && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      setOrderPlaced(true)
      clearCart()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al procesar el pedido'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [contactData, shippingData, items, paymentMethod, getTotal, clearCart, isSubmitting])

  const handleInputChange = <T extends Record<string, unknown>>(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<T>>
  ) => {
    const { name, value } = e.target
    setter((prev: T) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 font-display mb-4">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-neutral-600 mb-2">
            Tu pedido #{orderId} fue recibido.
          </p>
          <p className="text-neutral-600 mb-6">
            Te enviamos un email a {contactData.email} con los detalles.
          </p>
          <div className="p-4 bg-primary-50 rounded-xl mb-6">
            <p className="text-primary-700 font-medium">
              Orden de compra: <span className="font-mono">{orderId}</span>
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Tu carrito está vacío</h1>
          <Link href="/catalog" className="text-primary-600 hover:text-primary-700 font-medium">
            Volver a la tienda
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 font-display mb-8">
          Finalizar Compra
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-4 mb-8" role="tablist" aria-label="Pasos del checkout">
          {['Contacto', 'Envío', 'Pago'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                role="tab"
                aria-selected={step === i + 1}
                aria-current={step === i + 1 ? 'step' : undefined}
                aria-label={`Paso ${i + 1}: ${s}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step > i + 1
                    ? 'bg-primary-600 text-white'
                    : step === i + 1
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-neutral-200 text-neutral-500'
                }`}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span
                className={`font-medium ${
                  step === i + 1 ? 'text-primary-600' : 'text-neutral-500'
                }`}
              >
                {s}
              </span>
              {i < 2 && <div className="w-8 h-px bg-neutral-200 mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <form onSubmit={handleContactSubmit} className="bg-white p-6 rounded-xl border border-neutral-100">
                <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                  Información de Contacto
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      ref={nameInputRef}
                      value={contactData.name}
                      onChange={(e) => handleInputChange(e, setContactData)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors ${
                        errors.name ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                      }`}
                      placeholder="Juan Pérez"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1" role="alert">{errors.name}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        ref={emailInputRef}
                        value={contactData.email}
                        onChange={(e) => handleInputChange(e, setContactData)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors ${
                          errors.email ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                        }`}
                        placeholder="juan@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1" role="alert">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        ref={phoneInputRef}
                        value={contactData.phone}
                        onChange={(e) => handleInputChange(e, setContactData)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors ${
                          errors.phone ? 'border-red-500 focus:border-red-500' : 'border-neutral-200 focus:border-primary-500'
                        }`}
                        placeholder="+54 11 1234-5678"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1" role="alert">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Continuar
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleShippingSubmit} className="bg-white p-6 rounded-xl border border-neutral-100">
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
                        onChange={(e) => handleInputChange(e, setShippingData)}
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
                        onChange={(e) => handleInputChange(e, setShippingData)}
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
                        onChange={(e) => handleInputChange(e, setShippingData)}
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
                        onChange={(e) => handleInputChange(e, setShippingData)}
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
                      onChange={(e) => handleInputChange(e, setShippingData)}
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
                    onClick={() => setStep(1)}
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
            )}

            {step === 3 && (
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
                    onClick={() => setStep(2)}
                    className="px-6 py-4 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Procesando...' : 'Realizar Pedido'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-neutral-100 sticky top-24">
              <h3 className="font-semibold text-neutral-900 mb-4">Tu Pedido</h3>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.weight}`} className="flex gap-3">
                    <div className="relative w-14 h-14 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {item.quantity}x{item.weight}g
                      </p>
                    </div>
                    <p className="text-sm font-medium text-neutral-900">
                      {formatPrice(calculatePrice(item.product.price, item.weight as Weight) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(getTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Envío</span>
                  <span className="text-primary-600 font-medium">Gratis</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-100">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatPrice(getTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}