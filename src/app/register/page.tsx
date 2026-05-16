'use client'

export const metadata = {
  title: 'Crear Cuenta | Tinkuy',
  description: 'Creá tu cuenta en Tinkuy y empezá a comprar productos naturales.',
}

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@apollo/client/react'
import { CUSTOMER_REGISTER } from '@/lib/graphql/queries'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const [customerRegister] = useMutation(CUSTOMER_REGISTER)

  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) {
      return digits.length > 0 ? `+54 ${digits}` : ''
    }
    if (digits.length <= 5) {
      return `+54 ${digits.slice(2)}`
    }
    if (digits.length <= 10) {
      return `+54 ${digits.slice(2, 5)}-${digits.slice(5)}`
    }
    return `+54 ${digits.slice(2, 5)}-${digits.slice(5, 9)}`
  }

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido'
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido'
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (!phoneDigits) {
      newErrors.phone = 'El teléfono es requerido'
    } else if (phoneDigits.length < 10) {
      newErrors.phone = 'El teléfono debe tener al menos 10 dígitos'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else {
      const passwordErrors: string[] = []
      if (formData.password.length < 8) {
        passwordErrors.push('al menos 8 caracteres')
      }
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push('1 mayúscula')
      }
      if (!/[0-9]/.test(formData.password)) {
        passwordErrors.push('1 número')
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        passwordErrors.push('1 carácter especial')
      }
      if (passwordErrors.length > 0) {
        newErrors.password = `La contraseña debe tener ${passwordErrors.join(', ')}`
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmá tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (!termsAccepted) {
      newErrors.terms = 'Debés aceptar los términos y condiciones'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, termsAccepted])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({ ...prev, phone: formatted }))
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    setGlobalError(null)
  }

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/<[^>]*>/g, '').slice(0, 254)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        const refMap: Record<string, React.RefObject<HTMLInputElement>> = {
          firstName: firstNameRef,
          lastName: lastNameRef,
          email: emailRef,
          phone: phoneRef,
          password: passwordRef,
        }
        refMap[firstError]?.current?.focus()
      }
      return
    }

    setIsSubmitting(true)

    try {
      const { data } = await customerRegister({
        variables: {
          input: {
            firstName: sanitizeInput(formData.firstName),
            lastName: sanitizeInput(formData.lastName),
            email: sanitizeInput(formData.email).toLowerCase(),
            phone: formData.phone.replace(/\D/g, ''),
            password: formData.password,
            tenantId: 'default'
          }
        }
      })

      const registerData = data as { customerRegister?: { token: string; customer: { id: string; email: string; firstName: string; lastName: string } } } | undefined

      if (registerData?.customerRegister) {
        setCookie('graphql_token', registerData.customerRegister.token)
        setCookie('graphql_user', JSON.stringify({
          id: registerData.customerRegister.customer.id,
          email: registerData.customerRegister.customer.email,
          firstName: registerData.customerRegister.customer.firstName,
          lastName: registerData.customerRegister.customer.lastName,
          role: 'customer',
          tenantId: 'default'
        }))
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setGlobalError('No se pudo crear la cuenta. El email podría ya estar registrado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pt-20">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-neutral-900 font-display">Tinkuy</h1>
          </Link>
          <p className="text-neutral-600 mt-2">Creá tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstNameRef}
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Juan"
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={!!errors.firstName}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-neutral-100 transition-colors"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500" role="alert">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                ref={lastNameRef}
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Pérez"
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={!!errors.lastName}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-neutral-100 transition-colors"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500" role="alert">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              ref={emailRef}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="juan@email.com"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.email}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-neutral-100 transition-colors"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500" role="alert">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              ref={phoneRef}
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="+54 11 1234-5678"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.phone}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-neutral-100 transition-colors"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500" role="alert">{errors.phone}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">Formato argentino. Ej: +54 11 1234-5678</p>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              ref={passwordRef}
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.password}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-neutral-100 transition-colors"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500" role="alert">{errors.password}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <PasswordRequirement met={formData.password.length >= 8} text="8+ chars" />
              <PasswordRequirement met={/[A-Z]/.test(formData.password)} text="Mayúscula" />
              <PasswordRequirement met={/[0-9]/.test(formData.password)} text="Número" />
              <PasswordRequirement met={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)} text="Especial" />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
              Confirmar Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={!!errors.confirmPassword}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-neutral-100 transition-colors"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500" role="alert">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked)
                  if (e.target.checked && errors.terms) {
                    setErrors(prev => ({ ...prev, terms: undefined }))
                  }
                }}
                disabled={isSubmitting}
                className="mt-1 w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-600">
                Acepto los{' '}
                <Link href="/terminos-y-condiciones" className="text-primary-600 hover:text-primary-700 font-medium">
                  Términos y Condiciones
                </Link>
                {' '}y la{' '}
                <Link href="/politica-de-privacidad" className="text-primary-600 hover:text-primary-700 font-medium">
                  Política de Privacidad
                </Link>
              </span>
            </label>
            {errors.terms && (
              <p className="mt-1 text-xs text-red-500 ml-8" role="alert">{errors.terms}</p>
            )}
          </div>

          {globalError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="polite">
              <p className="text-red-600 text-sm">{globalError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed min-h-[48px]"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-neutral-500 mt-4">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Ingresá
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
      met ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
    }`}>
      {met ? (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {text}
    </span>
  )
}