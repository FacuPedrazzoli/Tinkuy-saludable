import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pago Pendiente | Tinkuy',
  description: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
}

export default function PendingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}