'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@apollo/client/react'
import { ADMIN_LOGIN } from '@/lib/graphql/queries'

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16
const COOKIE_SECRET = process.env.NEXT_PUBLIC_COOKIE_SECRET || 'default-fallback-secret-32bytes!!'

async function encrypt(text: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(COOKIE_SECRET),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new TextEncoder().encode('tinkuy-salt'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    new TextEncoder().encode(text)
  )
  const encryptedArray = new Uint8Array(encrypted)
  const encryptedHex = Array.from(encryptedArray).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${Buffer.from(iv).toString('hex')}:${encryptedHex}`
}

function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}; HttpOnly`
}

export default function AdminLoginPage() {
  const router = useRouter()
  const emailInputRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [adminLogin, { loading }] = useMutation(ADMIN_LOGIN)

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

    try {
      const sanitizedEmail = sanitizeInput(email)

      const { data } = await adminLogin({
        variables: {
          input: {
            email: sanitizedEmail,
            password: password,
            tenantId: 'default'
          }
        }
      })

      const loginData = data as { adminLogin?: { token: string; user: { id: string; email: string; firstName: string; lastName: string; role: string; tenantId: string | null } } } | undefined

      if (loginData?.adminLogin) {
        setCookie('graphql_token', loginData.adminLogin.token)
        const userData = {
          id: loginData.adminLogin.user.id,
          email: loginData.adminLogin.user.email,
          firstName: loginData.adminLogin.user.firstName,
          lastName: loginData.adminLogin.user.lastName,
          role: loginData.adminLogin.user.role,
          tenantId: loginData.adminLogin.user.tenantId
        }
        const encryptedUser = await encrypt(JSON.stringify(userData))
        setCookie('auth_user', encryptedUser)
        router.push('/admin')
        router.refresh()
      }
    } catch (err) {
      setError('Credenciales incorrectas')
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
              disabled={loading}
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
              disabled={loading}
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
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-neutral-500 mt-4">
            ¿Olvidaste tu contraseña?{' '}
            <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">
              Recuperarla
            </Link>
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