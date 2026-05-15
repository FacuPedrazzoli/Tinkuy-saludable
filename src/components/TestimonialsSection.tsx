'use client'

interface Testimonial {
  id: string
  name: string
  text: string
  rating: number
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[]
}

export function TestimonialsSection({ testimonials = [] }: TestimonialsSectionProps) {
  const defaultTestimonials: Testimonial[] = testimonials.length > 0 ? testimonials : [
    {
      id: '1',
      name: 'María García',
      text: 'Los mejores frutos secos que probé. Calidad excepcional y precios justos.',
      rating: 5,
    },
    {
      id: '2',
      name: 'Juan Pérez',
      text: 'Desde que descubrí Tinkuy, no compro en otro lugar. Increíble variedad.',
      rating: 5,
    },
    {
      id: '3',
      name: 'Ana Rodríguez',
      text: 'Me encanta la atención y la calidad de los productos. 100% recomendado.',
      rating: 5,
    },
  ]

  return (
    <section className="py-16 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 font-display mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-neutral-600">
            Experiencias reales de personas que confían en Tinkuy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8" role="list">
          {defaultTestimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-card"
              role="listitem"
            >
              <div className="flex gap-1 mb-4" aria-label={`${testimonial.rating} de 5 estrellas`}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-neutral-600 mb-4 italic">&ldquo;{testimonial.text}&rdquo;</blockquote>
              <p className="font-semibold text-neutral-900">{testimonial.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}