'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import { decryptAuthCookie } from '@/lib/authCrypto'

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

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  // No HttpOnly: a cookie set via document.cookie that includes HttpOnly is
  // rejected by the browser (HttpOnly can only come from a server Set-Cookie).
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}


async function parseAuthUser(cookieValue: string | null): Promise<AuthUser | null> {
  if (!cookieValue) return null
  try {
    const decrypted = await decryptAuthCookie(cookieValue)
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

  // checkSession owns isLoading. It must flip isLoading=true at the START of
  // EVERY run (not just initial mount) and back to false when it resolves.
  // Otherwise, after login dispatches 'auth_changed' and navigation lands on
  // /admin, ProtectedRoute evaluates while the async decrypt is still running
  // with isLoading=false + user=null and redirects to /login (the "page
  // reloads, no user" symptom). Keeping isLoading=true makes guards wait.
  const checkSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const tokenCookie = getCookieValue('graphql_token')
      if (!tokenCookie) {
        setUser(null)
      } else {
        const userCookie = getCookieValue('auth_user')
        const parsed = await parseAuthUser(userCookie)
        setUser(parsed)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()

    intervalRef.current = setInterval(checkSession, 60000)

    // Re-read the session as soon as login sets the cookies (login pages
    // dispatch 'auth_changed'), and when the tab regains focus.
    const onAuthChanged = () => { checkSession() }
    window.addEventListener('auth_changed', onAuthChanged)
    window.addEventListener('focus', onAuthChanged)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      window.removeEventListener('auth_changed', onAuthChanged)
      window.removeEventListener('focus', onAuthChanged)
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
