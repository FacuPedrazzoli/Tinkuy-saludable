import { Metadata } from 'next'
import CatalogClient from './CatalogClient'
import { safeJsonStringify } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Explora nuestra selección de productos saludables: frutos secos, semillas, harinas integrales y más.',
  alternates: {
    canonical: '/catalog',
  },
  openGraph: {
    title: 'Tienda | Tinkuy',
    description: 'Explora nuestra selección de productos saludables: frutos secos, semillas, harinas integrales y más.',
    type: 'website',
    locale: 'es_AR',
  },
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinkuy-saludable-gamma.vercel.app'

const catalogSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Tienda Tinkuy',
  description: 'Explora nuestra selección de productos saludables: frutos secos, semillas, harinas integrales y más.',
  url: `${baseUrl}/catalog`,
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tienda',
        item: `${baseUrl}/catalog`,
      },
    ],
  },
  publisher: {
    '@type': 'Organization',
    name: 'Tinkuy',
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo-tinkuy.png`,
    },
  },
}

export default function CatalogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(catalogSchema) }}
      />
      <CatalogClient />
    </>
  )
}