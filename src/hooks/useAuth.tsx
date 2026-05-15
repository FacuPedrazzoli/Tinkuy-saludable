'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'

interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  tenantId: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16
const COOKIE_SECRET = process.env.NEXT_PUBLIC_COOKIE_SECRET || 'default-fallback-secret-32bytes!!'

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}; HttpOnly`
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

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

async function decrypt(encryptedData: string): Promise<string | null> {
  try {
    const parts = encryptedData.split(':')
    if (parts.length !== 2) return null
    const iv = Uint8Array.from(Buffer.from(parts[0], 'hex'))
    const encrypted = Uint8Array.from(Buffer.from(parts[1], 'hex'))
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
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encrypted
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}

async function parseAuthUser(cookieValue: string | null): Promise<AuthUser | null> {
  if (!cookieValue) return null
  try {
    const decrypted = await decrypt(cookieValue)
    if (!decrypted) return null
    return JSON.parse(decrypted)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkSession = useCallback(async () => {
    const tokenCookie = getCookieValue('graphql_token')
    if (!tokenCookie) {
      setUser(null)
    } else {
      const userCookie = getCookieValue('auth_user')
      const parsed = await parseAuthUser(userCookie)
      setUser(parsed)
    }
  }, [])

  useEffect(() => {
    checkSession()
    setIsLoading(false)

    intervalRef.current = setInterval(checkSession, 60000)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkSession])

  const logout = useCallback(async () => {
    deleteCookie('graphql_token')
    deleteCookie('auth_user')
    setUser(null)
  }, [])

  const refreshSession = useCallback(() => {
    checkSession()
  }, [checkSession])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { encrypt, decrypt }
