import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { products, getRelatedProducts } from '@/data/products'
import { ProductActions } from '@/components/product/ProductActions'
import { validateProductImage } from '@/lib/productImages'
import { formatPrice } from '@/lib/utils'
import { calculatePrice } from '@/lib/store'

interface ProductPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = products.find((p) => p.slug === params.slug)

  if (!product) {
    return {
      title: 'Producto no encontrado | Tinkuy',
    }
  }

  const productImage = validateProductImage(product.images[0], product.category, product.subcategory)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinkuy.com'

  return {
    title: `${product.name} | Tinkuy`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [productImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.shortDescription,
      images: [productImage],
    },
    alternates: {
      canonical: `${baseUrl}/product/${product.slug}`,
    },
  }
}

export async function generateStaticParams() {
  const popularProducts = products.filter(p => p.featured).slice(0, 10)
  return popularProducts.map((product) => ({
    slug: product.slug,
  }))
}

const productSchema = (product: typeof products[0]) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.images,
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'ARS',
    availability: product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: product.rating,
    reviewCount: product.reviews,
  },
})

export default function ProductPage({ params }: ProductPageProps) {
  const product = products.find((p) => p.slug === params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = getRelatedProducts(product.id, product.category)
  const productImage = validateProductImage(product.images[0], product.category, product.subcategory)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema(product)) }}
      />
      <div className="min-h-screen bg-neutral-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
            <Link href="/" className="hover:text-primary-600 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-primary-600 transition-colors">Tienda</Link>
            <span>/</span>
            <span className="text-neutral-900">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <ProductActions product={product} />
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-neutral-100 p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Descripción</h2>
                <p className="text-neutral-600 leading-relaxed">{product.description}</p>
              </div>

              {product.ingredients && (
                <div className="bg-white rounded-2xl border border-neutral-100 p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">Ingredientes</h2>
                  <p className="text-neutral-600">{product.ingredients}</p>
                </div>
              )}

              {product.benefits && product.benefits.length > 0 && (
                <div className="bg-white rounded-2xl border border-neutral-100 p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">Beneficios</h2>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-neutral-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.nutritionalInfo && (
                <div className="bg-white rounded-2xl border border-neutral-100 p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4">Información Nutricional</h2>
                  <p className="text-sm text-neutral-500 mb-4">Por porción de {product.nutritionalInfo.servingSize}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-neutral-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-neutral-900">{product.nutritionalInfo.calories}</p>
                      <p className="text-sm text-neutral-500">Calorías</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-neutral-900">{product.nutritionalInfo.protein}</p>
                      <p className="text-sm text-neutral-500">Proteínas</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-neutral-900">{product.nutritionalInfo.carbs}</p>
                      <p className="text-sm text-neutral-500">Carbohidratos</p>
                    </div>
                    <div className="bg-neutral-50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-neutral-900">{product.nutritionalInfo.fat}</p>
                      <p className="text-sm text-neutral-500">Grasas</p>
                    </div>
                    {product.nutritionalInfo.fiber && (
                      <div className="bg-neutral-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-neutral-900">{product.nutritionalInfo.fiber}</p>
                        <p className="text-sm text-neutral-500">Fibra</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 font-display mb-8">Productos Relacionados</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map((relatedProduct) => {
                  const relatedImage = validateProductImage(relatedProduct.images[0], relatedProduct.category, relatedProduct.subcategory)
                  return (
                    <Link
                      key={relatedProduct.id}
                      href={`/product/${relatedProduct.slug}`}
                      className="group bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:border-primary-200 transition-all hover:shadow-lg"
                    >
                      <div className="relative aspect-square bg-neutral-50">
                        <Image
                          src={relatedImage}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-primary-600 font-bold font-mono mt-1">{formatPrice(calculatePrice(relatedProduct.price, 250))}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}