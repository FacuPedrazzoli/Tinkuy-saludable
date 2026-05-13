import { Metadata } from 'next'
import CatalogClient from './CatalogClient'

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Explora nuestra selección de productos saludables: frutos secos, semillas, harinas integrales y más.',
  alternates: {
    canonical: '/catalog',
  },
}

export default function CatalogPage() {
  return <CatalogClient />
}