'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { products, getRelatedProducts } from '@/data/products'
import { testimonials } from '@/data/testimonials'
import { useCartStore, calculatePrice, WEIGHTS, type Weight } from '@/lib/store'
import { useToast } from '@/components/Toast'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const product = products.find((p) => p.slug === slug)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedWeight, setSelectedWeight] = useState<Weight>(250)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()
  const { showToast } = useToast()

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Producto no encontrado</h1>
          <Link href="/catalog" className="text-primary-600 hover:text-primary-700 font-medium">
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  const relatedProducts = getRelatedProducts(product.id, product.category)
  const productTestimonials = testimonials.filter((t) => t.productId === product.id)
  const currentPrice = calculatePrice(product.price, selectedWeight)
  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0

  const handleAddToCart = () => {
    addItem(product, quantity, selectedWeight)
    showToast(`${product.name} agregado al carrito`, 'success')
  }

  return (
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
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-neutral-100">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.promo && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-primary-600 text-white text-sm font-bold rounded-full">
                  {product.promo}
                </span>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                    selectedImage === index
                      ? 'border-primary-600 ring-2 ring-primary-600/20'
                      : 'border-neutral-100 hover:border-neutral-200'
                  )}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.organic && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Orgánico
                  </span>
                )}
                {product.glutenFree && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    Sin Gluten
                  </span>
                )}
                {product.vegan && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    Vegano
                  </span>
                )}
                {product.keto && (
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                    Keto
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 font-display mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-neutral-600">{product.shortDescription}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={cn(
                      'w-5 h-5',
                      star <= Math.round(product.rating) ? 'text-amber-400' : 'text-neutral-200'
                    )}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-neutral-600">
                {product.rating} ({product.reviews} reseñas)
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-neutral-900">{formatPrice(currentPrice)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-neutral-400 line-through">
                    {formatPrice(calculatePrice(product.originalPrice, selectedWeight))}
                  </span>
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm font-bold rounded-lg">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="border-t border-b border-neutral-100 py-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-3">
                  Presentación
                </label>
                <div className="flex flex-wrap gap-2">
                  {WEIGHTS.map((weight) => (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={cn(
                        'px-4 py-2 rounded-lg border-2 font-medium transition-all',
                        selectedWeight === weight
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                      )}
                    >
                      {weight}g
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-3">
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 px-6 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Agregar al Carrito
                </button>
              </div>
            </div>

            {product.stock < 20 && (
              <p className="text-sm text-amber-600 font-medium">
                Solo quedan {product.stock} unidades
              </p>
            )}

            {product.brand && (
              <p className="text-sm text-neutral-500">
                Marca: <span className="font-medium text-neutral-900">{product.brand}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2 space-y-8">
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

          <div>
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Reseñas de Clientes</h2>
              {productTestimonials.length > 0 ? (
                <div className="space-y-4">
                  {productTestimonials.slice(0, 3).map((testimonial) => (
                    <div key={testimonial.id} className="border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-medium">{testimonial.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{testimonial.name}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={cn(
                                  'w-4 h-4',
                                  star <= testimonial.rating ? 'text-amber-400' : 'text-neutral-200'
                                )}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-neutral-600 text-sm">{testimonial.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Aún no hay reseñas para este producto.</p>
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 font-display mb-8">Productos Relacionados</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.slug}`}
                  className="group bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:border-primary-200 transition-all hover:shadow-lg"
                >
                  <div className="relative aspect-square bg-neutral-50">
                    <Image
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-primary-600 font-bold mt-1">{formatPrice(relatedProduct.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}