import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Tinkuy',
  description: 'Ingresá a tu cuenta para ver tus pedidos y gestionar tus datos.',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}