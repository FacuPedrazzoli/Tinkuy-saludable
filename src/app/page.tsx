'use client'

import { Hero } from '@/components/Hero'
import { CategorySection } from '@/components/CategorySection'
import { ProductGrid } from '@/components/ProductGrid'
import { FAQSection } from '@/components/FAQSection'
import { getFeaturedProducts } from '@/data/products'
import { siteConfig } from '@/data/siteConfig'
import { safeJsonStringify } from '@/lib/utils'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { Product } from '@/types'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  description: siteConfig.description,
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://tinkuy-saludable-gamma.vercel.app',
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tinkuy-saludable-gamma.vercel.app'}/logo-tinkuy.png`,
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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinkuy-saludable-gamma.vercel.app'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  useEffect(() => {
    getFeaturedProducts().then(products => setFeaturedProducts(products.slice(0, 8)))
  }, [])

  const productSchema = useMemo(() => featuredProducts.map((product) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: [product.images[0]],
    offers: {
      '@type': 'Offer',
      price: String(product.price),
      priceCurrency: 'ARS',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.rating > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviews,
        }
      : undefined,
  })), [featuredProducts])

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
          <ProductGrid products={featuredProducts.slice(0, 8)} />
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

      <FAQSection />
    </>
  )
}