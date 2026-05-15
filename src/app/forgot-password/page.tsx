'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation } from '@apollo/client/react'
import { FORGOT_PASSWORD } from '@/lib/graphql/queries'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD)

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/<[^>]*>/g, '').slice(0, 254)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('El email es requerido')
      return
    }

    try {
      const sanitizedEmail = sanitizeInput(email)
      await forgotPassword({
        variables: { email: sanitizedEmail },
      })
      setSuccess(true)
    } catch (err) {
      setError('Ocurrió un error. Intentalo de nuevo.')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-neutral-900 font-display">Tinkuy</h1>
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Revisá tu email</h2>
            <p className="text-neutral-600 mb-6">
              Si el email existe en nuestra base de datos, vas a recibir un enlace para restablecer tu contraseña.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-neutral-900 font-display">Tinkuy</h1>
          </Link>
          <p className="text-neutral-600 mt-2">Recuperá tu contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              placeholder="tu@email.com"
              disabled={loading}
              required
              aria-required="true"
              aria-invalid={!!error}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-neutral-100"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="polite">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>

          <p className="text-center text-sm text-neutral-500 mt-4">
            ¿Recordaste tu contraseña?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Volver al login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
