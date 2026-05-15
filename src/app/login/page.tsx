import { Metadata } from 'next'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Panel de administración de Tinkuy.',
}

export default function AdminLoginPage() {
  const router = useRouter()
  const emailInputRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/<[^>]*>/g, '').slice(0, 254)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('El email es requerido')
      emailInputRef.current?.focus()
      return
    }

    if (!password.trim()) {
      setError('La contraseña es requerida')
      return
    }

    setIsLoading(true)

    try {
      const sanitizedEmail = sanitizeInput(email)
      const sanitizedPassword = password

      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError(data.error || 'Credenciales incorrectas')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-neutral-900 font-display">Tinkuy</h1>
          </Link>
          <p className="text-neutral-600 mt-2">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              ref={emailInputRef}
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
              placeholder="admin@tinkuy.com"
              disabled={isLoading}
              required
              aria-required="true"
              aria-invalid={!!error}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-neutral-100"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
              }}
              placeholder="Tu contraseña"
              disabled={isLoading}
              required
              minLength={6}
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
            disabled={isLoading}
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-neutral-500 mt-4">
            ¿Olvidaste tu contraseña? Contactá al administrador.
          </p>
        </form>

        <Link
          href="/"
          className="block text-center text-sm text-neutral-500 hover:text-primary-600 mt-4"
        >
          ← Volver al sitio
        </Link>
      </div>
    </div>
  )
}