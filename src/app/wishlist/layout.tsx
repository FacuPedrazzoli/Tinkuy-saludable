import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mi Lista de Deseos | Tinkuy',
  description: 'Guarda tus productos favoritos para comprarlos después.',
}

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}