import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Cuenta | Tinkuy',
  description: 'Creá tu cuenta en Tinkuy y empezá a comprar productos naturales.',
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}