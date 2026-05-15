'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { siteConfig } from '@/data/siteConfig'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/hooks/ProtectedRoute'
import { AdminDarkModeProvider, useAdminDarkMode } from '@/hooks/useAdminDarkMode'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/products', label: 'Productos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { href: '/admin/categories', label: 'Categorías', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { href: '/admin/orders', label: 'Pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { href: '/admin/coupons', label: 'Cupones', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
  { href: '/admin/clients', label: 'Clientes', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
]

const SESSION_TIMEOUT_MS = 25 * 60 * 1000
const SESSION_WARNING_MS = 5 * 60 * 1000

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useAdminDarkMode()

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors w-full"
      aria-label={isDarkMode ? 'Desactivar modo oscuro' : 'Activar modo oscuro'}
    >
      <div className={cn(
        'w-10 h-6 rounded-full p-0.5 transition-colors',
        isDarkMode ? 'bg-primary-600' : 'bg-neutral-300'
      )}>
        <div className={cn(
          'w-5 h-5 rounded-full bg-white shadow-sm transition-transform flex items-center justify-center',
          isDarkMode ? 'translate-x-4' : 'translate-x-0'
        )}>
          {isDarkMode ? (
            <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-neutral-600 dark:text-neutral-300">
        {isDarkMode ? 'Oscuro' : 'Claro'}
      </span>
    </button>
  )
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, refreshSession } = useAuth()
  const { isDarkMode } = useAdminDarkMode()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const lastActivityRef = useRef(Date.now())
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const clearSessionTimers = useCallback(() => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current)
      logoutTimeoutRef.current = null
    }
  }, [])

  const resetSessionTimers = useCallback(() => {
    clearSessionTimers()
    lastActivityRef.current = Date.now()
    setShowSessionWarning(false)

    warningTimeoutRef.current = setTimeout(() => {
      setShowSessionWarning(true)
    }, SESSION_TIMEOUT_MS)

    logoutTimeoutRef.current = setTimeout(() => {
      setShowSessionWarning(false)
      logout()
      router.push('/login?reason=session_expired')
    }, SESSION_TIMEOUT_MS + SESSION_WARNING_MS)
  }, [clearSessionTimers, logout, router])

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']
    const handleActivity = () => {
      if (Date.now() - lastActivityRef.current > 60000) {
        resetSessionTimers()
      }
    }

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    resetSessionTimers()
    refreshSession()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      clearSessionTimers()
    }
  }, [resetSessionTimers, clearSessionTimers, refreshSession])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const handleLogout = async () => {
    clearSessionTimers()
    await logout()
    router.push('/login')
  }

  const handleExtendSession = () => {
    resetSessionTimers()
    setShowSessionWarning(false)
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-neutral-700 dark:border-neutral-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary-400 font-display">{siteConfig.name}</span>
        </Link>
        <p className="text-xs text-neutral-500 mt-1">Panel de Administración</p>
      </div>
      <nav className="p-4 space-y-1 flex-1">
        {adminNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary-600 text-white'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white'
            )}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-neutral-700 dark:border-neutral-800 space-y-2">
        <DarkModeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors w-full dark:text-neutral-400 dark:hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
        <Link
          href="/"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors dark:text-neutral-400 dark:hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
          Volver al sitio
        </Link>
      </div>
    </>
  )

  return (
    <div className={cn('min-h-screen bg-neutral-100 flex transition-colors', isDarkMode && 'dark')}>
      {isMobile ? (
        <>
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-50 p-3 bg-neutral-900 dark:bg-neutral-800 text-white rounded-lg lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setSidebarOpen(false)}
              />
              <aside className="relative w-72 bg-neutral-900 dark:bg-neutral-800 text-white flex flex-col animate-slide-right">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white"
                  aria-label="Cerrar menú"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <SidebarContent />
              </aside>
            </div>
          )}
        </>
      ) : (
        <aside className="w-64 bg-neutral-900 dark:bg-neutral-800 text-white flex-col flex-shrink-0 hidden md:flex fixed top-0 left-0 h-screen">
          <SidebarContent />
        </aside>
      )}

      <main className={cn(
        'flex-1 p-6 pt-20 overflow-y-auto min-h-screen transition-colors',
        !isMobile && 'md:ml-64'
      )}>
        <ProtectedRoute allowedRoles={['owner', 'admin', 'editor']}>
          {children}
        </ProtectedRoute>
      </main>

      {showSessionWarning && (
        <div className="fixed bottom-4 right-4 bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-xl p-4 shadow-xl z-50 animate-slide-up">
          <p className="text-amber-800 dark:text-amber-100 text-sm mb-3">
            Tu sesión expirará en 5 minutos. ¿Deseas continuar?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExtendSession}
              className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              Continuar
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-medium rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminDarkModeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminDarkModeProvider>
  )
}