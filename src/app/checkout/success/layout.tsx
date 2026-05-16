import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '¡Compra Exitosa! | Tinkuy',
  description: 'Tu pedido fue confirmado. Te enviamos los detalles a tu email.',
}

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}