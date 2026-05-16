'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 font-display mb-8">
          Mi Perfil
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-semibold text-primary-600">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-neutral-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-neutral-500">{user.email}</p>
              </div>
            </div>
            <div className="border-t border-neutral-100 pt-4 mt-4">
              <p className="text-sm text-neutral-500">
                Miembro desde {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <Link href="/perfil/direcciones" className="bg-white rounded-2xl p-6 shadow-card hover:shadow-elevated transition-shadow">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Direcciones</h2>
            <p className="text-neutral-500 text-sm mb-4">Gestiona tus direcciones de envío y facturación</p>
            <span className="text-primary-600 text-sm font-medium">Administrar →</span>
          </Link>

          <Link href="/orders" className="bg-white rounded-2xl p-6 shadow-card hover:shadow-elevated transition-shadow">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Mis Pedidos</h2>
            <p className="text-neutral-500 text-sm mb-4">Ver el historial y rastrear tus pedidos</p>
            <span className="text-primary-600 text-sm font-medium">Ver pedidos →</span>
          </Link>

          <Link href="/wishlist" className="bg-white rounded-2xl p-6 shadow-card hover:shadow-elevated transition-shadow">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Mi Wishlist</h2>
            <p className="text-neutral-500 text-sm mb-4">Productos guardados para después</p>
            <span className="text-primary-600 text-sm font-medium">Ver wishlist →</span>
          </Link>
        </div>
      </div>
    </div>
  )
}