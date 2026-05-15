'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useMutation } from '@apollo/client/react'
import { useCartStore, calculatePrice, Weight } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { ContactFormData, ShippingFormData } from '@/lib/checkout/validation'
import { sanitizeContactData, sanitizeShippingData } from '@/lib/checkout/sanitization'
import { useCheckoutValidation } from '@/hooks/useCheckoutValidation'
import { CREATE_CART, ADD_TO_CART, CHECKOUT } from '@/lib/graphql/queries'
import ContactForm from '@/components/checkout/ContactForm'
import ShippingForm from '@/components/checkout/ShippingForm'
import PaymentForm from '@/components/checkout/PaymentForm'
import OrderSummary from '@/components/checkout/OrderSummary'
import OrderTotals from '@/components/checkout/OrderTotals'
import { siteConfig } from '@/data/siteConfig'

const DEFAULT_BRANCH_ID = process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID || 'default-branch'

interface CheckoutError {
  code: string
  message: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

const errorMessages: Record<string, CheckoutError> = {
  PRICE_MISMATCH: {
    code: 'PRICE_MISMATCH',
    message: 'El precio de uno de tus productos cambió. Revisá tu carrito.',
    action: { label: 'Revisar carrito', href: '/cart' }
  },
  INSUFFICIENT_STOCK: {
    code: 'INSUFFICIENT_STOCK',
    message: 'No hay suficiente stock para la cantidad seleccionada.',
    action: { label: 'Modificar carrito', href: '/cart' }
  },
  PAYMENT_FAILED: {
    code: 'PAYMENT_FAILED',
    message: 'El pago no pudo procesarse. Verificá tus datos e intentá nuevamente.',
    action: { label: 'Reintentar', href: '/checkout' }
  },
  PAYMENT_CANCELLED: {
    code: 'PAYMENT_CANCELLED',
    message: 'El pago fue cancelado. Podés reintentarlo cuando quieras.',
    action: { label: 'Volver al pago', href: '/checkout' }
  },
  INVALID_COUPON: {
    code: 'INVALID_COUPON',
    message: 'El cupón ingresado no es válido o ya fue utilizado.',
  },
  COUPON_EXPIRED: {
    code: 'COUPON_EXPIRED',
    message: 'Este cupón ya venció.',
  },
  COUPON_MAX_USES: {
    code: 'COUPON_MAX_USES',
    message: 'Este cupón alcanzó su límite de usos.',
  },
  COUPON_MIN_PURCHASE: {
    code: 'COUPON_MIN_PURCHASE',
    message: 'El monto mínimo para usar este cupón no se alcanzó.',
  },
  CART_EMPTY: {
    code: 'CART_EMPTY',
    message: 'Tu carrito está vacío. Agregá productos para continuar.',
    action: { label: 'Ir a la tienda', href: '/catalog' }
  },
  INVALID_EMAIL: {
    code: 'INVALID_EMAIL',
    message: 'El email ingresado no es válido.',
  },
  INVALID_PHONE: {
    code: 'INVALID_PHONE',
    message: 'El teléfono ingresado no es válido.',
  },
  MISSING_SHIPPING: {
    code: 'MISSING_SHIPPING',
    message: 'Faltan datos de envío. Completalos para continuar.',
  },
  SHIPPING_ADDRESS_INVALID: {
    code: 'SHIPPING_ADDRESS_INVALID',
    message: 'La dirección de envío no es válida. Verificá los datos.',
  },
  BRANCH_NOT_FOUND: {
    code: 'BRANCH_NOT_FOUND',
    message: 'No se encontró la sucursal. Contactá a soporte.',
  },
  PRODUCT_NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    message: 'Uno de los productos ya no está disponible.',
    action: { label: 'Revisar carrito', href: '/cart' }
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    message: 'Tu sesión expiró. Iniciá sesión nuevamente.',
    action: { label: 'Iniciar sesión', href: '/login' }
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    message: 'El servicio no está disponible en este momento. Reintentá más tarde.',
  },
}

function getErrorInfo(rawMessage: string): CheckoutError {
  const normalizedMessage = rawMessage.toUpperCase().replace(/[\s_-]/g, '_')

  for (const [key, error] of Object.entries(errorMessages)) {
    if (normalizedMessage.includes(key)) {
      return error
    }
  }

  if (rawMessage.toLowerCase().includes('price') || rawMessage.toLowerCase().includes('precio')) {
    return errorMessages.PRICE_MISMATCH
  }
  if (rawMessage.toLowerCase().includes('stock') || rawMessage.toLowerCase().includes('inventario')) {
    return errorMessages.INSUFFICIENT_STOCK
  }
  if (rawMessage.toLowerCase().includes('payment') || rawMessage.toLowerCase().includes('pago')) {
    return errorMessages.PAYMENT_FAILED
  }
  if (rawMessage.toLowerCase().includes('coupon') || rawMessage.toLowerCase().includes('cupón')) {
    return errorMessages.INVALID_COUPON
  }
  if (rawMessage.toLowerCase().includes('email')) {
    return errorMessages.INVALID_EMAIL
  }
  if (rawMessage.toLowerCase().includes('phone') || rawMessage.toLowerCase().includes('teléfono')) {
    return errorMessages.INVALID_PHONE
  }
  if (rawMessage.toLowerCase().includes('stock')) {
    return errorMessages.INSUFFICIENT_STOCK
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Ocurrió un error inesperado. Por favor reintentá.',
    action: { label: 'Reintentar', href: '/checkout' }
  }
}

function ErrorMessage({ error, onDismiss }: { error: CheckoutError; onDismiss: () => void }) {
  const whatsappNumber = siteConfig.social.whatsapp?.replace('https://wa.me/', '') || '5491152540950'

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl" role="alert">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-800 mb-1">
            {error.code === 'UNKNOWN_ERROR' ? 'Error' : error.code.replace(/_/g, ' ')}
          </h3>
          <p className="text-red-700 text-sm mb-3">
            {error.message}
          </p>
          <div className="flex flex-wrap gap-2">
            {error.action?.href && (
              <Link
                href={error.action.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                {error.action.label}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hola!%20Tengo%20un%20problema%20con%20mi%20pedido.%20Error%3A%20${error.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contactar
            </a>
            <button
              onClick={onDismiss}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [step, setStep] = useState(1)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [error, setError] = useState<CheckoutError | null>(null)
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const streetInputRef = useRef<HTMLInputElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const postalCodeInputRef = useRef<HTMLInputElement>(null)

  const [createCart] = useMutation(CREATE_CART)
  const [addToCart] = useMutation(ADD_TO_CART)
  const [checkout] = useMutation(CHECKOUT)

  const { errors, validateContact, validateShipping, setErrors } = useCheckoutValidation(
    contactData,
    shippingData,
    { nameInputRef, emailInputRef, phoneInputRef, streetInputRef, cityInputRef, postalCodeInputRef }
  )

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

  const handleDismissError = useCallback(() => {
    setError(null)
  }, [])

  const handlePlaceOrder = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: cartData } = await createCart()
      const cartId = (cartData as { createCart: string })?.createCart

      if (!cartId) {
        throw new Error('CART_CREATION_FAILED')
      }

      for (const item of items) {
        const unitPrice = calculatePrice(item.product.price, item.weight as Weight)
        await addToCart({
          variables: {
            input: {
              cartId,
              productId: item.product.id,
              variantId: (item as any).variant?.id,
              name: item.product.name,
              price: unitPrice,
              quantity: item.quantity,
              imageUrl: item.product.images[0] || null,
            },
          },
        })
      }

      const { data: checkoutData } = await checkout({
        variables: {
          input: {
            cartId,
            branchId: DEFAULT_BRANCH_ID,
            guestEmail: contactData.email,
          },
        },
      })

      const checkoutResult = (checkoutData as { checkout: { initPoint: string | null; sandboxInitPoint: string | null; preferenceId: string | null; totalAmount: number } } | null)?.checkout

      if (!checkoutResult) {
        throw new Error('CHECKOUT_FAILED')
      }

      const { initPoint, sandboxInitPoint, preferenceId, totalAmount } = checkoutResult

      if (paymentMethod === 'mercadopago' && (initPoint || sandboxInitPoint)) {
        const mpUrl = process.env.NODE_ENV === 'production' ? initPoint : sandboxInitPoint
        if (mpUrl) {
          window.location.href = mpUrl
          return
        }
      }

      const newOrderId = preferenceId ? `TNK-${preferenceId.slice(0, 8).toUpperCase()}` : `TNK-${Date.now()}`
      setOrderId(newOrderId)
      setOrderPlaced(true)
      clearCart()
      router.push(`/checkout/success?order_id=${newOrderId}&amount=${totalAmount}&payment_method=${paymentMethod}`)
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : 'Error al procesar el pedido'
      const errorInfo = getErrorInfo(rawMessage)
      setError(errorInfo)
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, items, contactData, paymentMethod, createCart, addToCart, checkout, clearCart, router])

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
          <ErrorMessage error={error} onDismiss={handleDismissError} />
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
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span
                className={`font-medium ${
                  step === i + 1 ? 'text-primary-600' : 'text-neutral-600'
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
              <ContactForm
                contactData={contactData}
                setContactData={setContactData}
                errors={errors}
                setErrors={setErrors}
                onSubmit={handleContactSubmit}
                nameInputRef={nameInputRef}
                emailInputRef={emailInputRef}
                phoneInputRef={phoneInputRef}
              />
            )}

            {step === 2 && (
              <ShippingForm
                shippingData={shippingData}
                setShippingData={setShippingData}
                errors={errors}
                setErrors={setErrors}
                onSubmit={handleShippingSubmit}
                onBack={() => setStep(1)}
                streetInputRef={streetInputRef}
                cityInputRef={cityInputRef}
                postalCodeInputRef={postalCodeInputRef}
              />
            )}

            {step === 3 && (
              <PaymentForm
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                contactData={contactData}
                shippingData={shippingData}
                isSubmitting={isSubmitting}
                onPlaceOrder={handlePlaceOrder}
                onBack={() => setStep(2)}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary items={items} getTotal={getTotal} />
            <OrderTotals subtotal={getTotal()} />
          </div>
        </div>
      </div>
    </div>
  )
}