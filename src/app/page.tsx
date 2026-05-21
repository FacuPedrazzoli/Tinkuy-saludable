import { Metadata } from 'next'
import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { CategorySection } from '@/components/CategorySection'
import { ProductGrid } from '@/components/ProductGrid'
import { FAQSection } from '@/components/FAQSection'
import { ShippingSection } from '@/components/ShippingSection'
import { siteConfig } from '@/data/siteConfig'
import { safeJsonStringify } from '@/lib/utils'
import { serverQuery } from '@/lib/graphql/server-client'
import { GET_PRODUCTS } from '@/lib/graphql/queries'
import { GraphQLProductsResult } from '@/lib/graphql/types'
import { adaptProduct } from '@/lib/graphql/adapters'
import { Product } from '@/types'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinkuy-saludable-gamma.vercel.app'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tinkuy — Dietética Natural | Suplementos y Productos Orgánicos',
    description: 'Encontrá suplementos, proteínas y productos naturales de la mejor calidad. Frutos secos, semillas, harinas integrales y más. Envío a todo Buenos Aires.',
    keywords: ['dietética', 'productos naturales', 'orgánicos', 'suplementos', 'proteínas', 'frutos secos', 'semillas', 'harinas integrales', 'Buenos Aires'],
    openGraph: {
      title: 'Tinkuy — Dietética Natural | Suplementos y Productos Orgánicos',
      description: 'Encontrá suplementos, proteínas y productos naturales de la mejor calidad. Frutos secos, semillas, harinas integrales y más.',
      url: baseUrl,
      siteName: 'Tinkuy',
      locale: 'es_AR',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Tinkuy - Productos naturales y orgánicos',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Tinkuy — Dietética Natural',
      description: 'Encontrá suplementos, proteínas y productos naturales de la mejor calidad.',
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: baseUrl,
    },
  }
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  description: siteConfig.description,
  url: baseUrl,
  logo: `${baseUrl}/logo-tinkuy.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: siteConfig.phone,
    email: siteConfig.email,
    contactType: 'customer service',
    availableLanguage: 'Spanish',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.address,
    addressLocality: 'Buenos Aires',
    addressCountry: 'AR',
  },
  sameAs: siteConfig.social.instagram
    ? [`https://instagram.com/${siteConfig.social.instagram.replace('@', '')}`]
    : [],
}

export default async function HomePage() {
  const data = await serverQuery<GraphQLProductsResult>(GET_PRODUCTS, {
    isVisible: true,
    first: 8,
  })

  const displayedProducts: Product[] = (data?.products?.edges ?? [])
    .map(({ node }) => adaptProduct(node))
    .slice(0, 8)

  const productSchema = displayedProducts.map((product) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: [product.images[0]],
    offers: {
      '@type': 'Offer',
      price: String(product.price),
      priceCurrency: 'ARS',
      availability: 'https://schema.org/InStock',
    },
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(organizationSchema) }}
      />
      {productSchema.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(schema) }}
        />
      ))}
      <Hero />
      <CategorySection />

      <section className="py-20 bg-cream-50" aria-labelledby="featured-products-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-600 rounded-full text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                Destacados
              </span>
              <h2 id="featured-products-heading" className="text-3xl sm:text-4xl font-bold text-neutral-900 font-display">
                Productos Destacados
              </h2>
              <p className="text-neutral-600 mt-2">
                Los más elegidos por nuestra comunidad
              </p>
            </div>
            <Link
              href="/catalog"
              className="hidden sm:inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              Ver todos los productos
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          {displayedProducts.length > 0 ? (
            <ProductGrid products={displayedProducts} />
          ) : (
            <p className="text-neutral-500 text-center py-12">
              No hay productos disponibles en este momento.
            </p>
          )}
          <div className="text-center mt-12 sm:hidden">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Ver todo el catálogo
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream-50" aria-label="Envíos y preguntas frecuentes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 lg:gap-16 lg:grid-cols-2 items-stretch">
          <ShippingSection bare />
          <FAQSection bare />
        </div>
      </section>
    </>
  )
}
