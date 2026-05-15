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

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function parseAuthUser(cookieValue: string | null): AuthUser | null {
  if (!cookieValue) return null
  try {
    return JSON.parse(cookieValue)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkSession = useCallback(() => {
    const tokenCookie = getCookieValue('auth_token')
    if (!tokenCookie) {
      setUser(null)
    } else {
      const userCookie = getCookieValue('auth_user')
      const parsed = parseAuthUser(userCookie)
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
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      if (!res.ok) {
        throw new Error('Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      document.cookie = 'auth_token=; path=/; max-age=0'
      document.cookie = 'auth_user=; path=/; max-age=0'
      setUser(null)
    }
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
