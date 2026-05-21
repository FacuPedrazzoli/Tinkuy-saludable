'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      const redirectUrl = `/admin/login?reason=session_expired&redirect=${encodeURIComponent(pathname)}`
      router.push(redirectUrl)
      return
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/')
      return
    }

    const timeoutMs = 30 * 60 * 1000
    let warningTimeout: NodeJS.Timeout
    let logoutTimeout: NodeJS.Timeout

    const resetTimers = () => {
      clearTimeout(warningTimeout)
      clearTimeout(logoutTimeout)

      warningTimeout = setTimeout(() => {
        setShowTimeoutWarning(true)
      }, timeoutMs)

      logoutTimeout = setTimeout(() => {
        setShowTimeoutWarning(false)
        logout()
        router.push('/admin/login?reason=session_expired')
      }, timeoutMs + 60000)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, resetTimers, { passive: true })
    })

    resetTimers()

    return () => {
      clearTimeout(warningTimeout)
      clearTimeout(logoutTimeout)
      events.forEach(event => {
        document.removeEventListener(event, resetTimers)
      })
    }
  }, [isLoading, isAuthenticated, user, pathname, router, allowedRoles, logout])

  useEffect(() => {
    if (!showTimeoutWarning) return

    const dismissWarning = () => setShowTimeoutWarning(false)
    const interval = setInterval(dismissWarning, 5000)
    return () => clearInterval(interval)
  }, [showTimeoutWarning])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {children}
      {showTimeoutWarning && (
        <div className="fixed bottom-4 right-4 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg z-50 animate-slide-up">
          <p className="text-amber-800 text-sm">
            Tu sesión expira en menos de 5 minutos. ¿Sigues ahí?
          </p>
        </div>
      )}
    </>
  )
}
