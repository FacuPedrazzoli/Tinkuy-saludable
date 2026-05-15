import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getAllProducts, getProductBySlug, getRelatedProducts } from '@/data/products'
import { ProductActions } from '@/components/product/ProductActions'
import { validateProductImage } from '@/lib/productImages'
import { formatPrice, safeJsonStringify } from '@/lib/utils'
import { calculatePrice } from '@/lib/store'

interface ProductPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: 'Producto no encontrado | Tinkuy',
    }
  }

  const productImage = validateProductImage(product.images[0], product.category, product.subcategory)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinkuy-saludable-gamma.vercel.app'

  return {
    title: `${product.name} | Tinkuy`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: productImage ? [{ url: productImage }] : [],
    },
    alternates: {
      canonical: `${baseUrl}/product/${product.slug}`,
    },
  }
}

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinkuy-saludable-gamma.vercel.app'

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id, product.category)
  const displayedRelatedProducts = relatedProducts.slice(0, 4)

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images,
    sku: product.id,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: {
      '@type': 'Offer',
      price: String(product.price),
      priceCurrency: 'ARS',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Tinkuy',
      },
    },
    aggregateRating: product.rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    ...(product.category && { category: product.category }),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
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
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${baseUrl}/product/${product.slug}`,
      },
    ],
  }

  const productImage = validateProductImage(product.images[0], product.category, product.subcategory)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-primary-600 transition-colors">Tienda</Link>
            <span>/</span>
            <span className="text-neutral-900">{product.name}</span>
          </nav>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
              <div className="relative aspect-square bg-neutral-100 rounded-xl overflow-hidden">
                {productImage ? (
                  <Image
                    src={productImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-400">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="mb-4">
                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h1 className="text-3xl font-bold text-neutral-900 font-display mb-2">
                    {product.name}
                  </h1>
                  <p className="text-neutral-600">
                    {product.shortDescription}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-neutral-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xl text-neutral-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <ProductActions product={product} />
                </div>

                {product.description && (
                  <div className="mt-6 pt-6 border-t border-neutral-100">
                    <h3 className="font-semibold text-neutral-900 mb-2">Descripción</h3>
                    <p className="text-neutral-600 whitespace-pre-line">{product.description}</p>
                  </div>
                )}

                {product.ingredients && (
                  <div className="mt-6 pt-6 border-t border-neutral-100">
                    <h3 className="font-semibold text-neutral-900 mb-2">Ingredientes</h3>
                    <p className="text-neutral-600 whitespace-pre-line">{product.ingredients}</p>
                  </div>
                )}

                {product.benefits && product.benefits.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-neutral-100">
                    <h3 className="font-semibold text-neutral-900 mb-3">Beneficios</h3>
                    <ul className="space-y-2">
                      {product.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-neutral-600">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.nutritionalInfo && (
                  <div className="mt-6 pt-6 border-t border-neutral-100">
                    <h3 className="font-semibold text-neutral-900 mb-3">Información Nutricional</h3>
                    <div className="text-neutral-600 whitespace-pre-line">{JSON.stringify(product.nutritionalInfo, null, 2)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {displayedRelatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-neutral-900 font-display mb-6">
                Productos Relacionados
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayedRelatedProducts.map((relatedProduct) => {
                  const relatedImage = validateProductImage(
                    relatedProduct.images[0],
                    relatedProduct.category,
                    relatedProduct.subcategory
                  )
                  return (
                    <Link
                      key={relatedProduct.id}
                      href={`/product/${relatedProduct.slug}`}
                      className="group bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-square bg-neutral-100 relative overflow-hidden">
                        {relatedImage ? (
                          <Image
                            src={relatedImage}
                            alt={relatedProduct.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                            Sin imagen
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-neutral-900 text-sm truncate group-hover:text-primary-600 transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-neutral-600 font-semibold mt-1">
                          {formatPrice(relatedProduct.price)}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
