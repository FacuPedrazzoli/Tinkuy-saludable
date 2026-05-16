import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pago Rechazado | Tinkuy',
  description: 'Hubo un problema con tu pago. Podés reintentar o contactarnos.',
}

export default function FailureLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}