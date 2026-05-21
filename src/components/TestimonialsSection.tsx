'use client'

// TODO: wire to backend testimonials/reviews entity when available

interface Testimonial {
  id: string
  name: string
  text: string
  rating: number
  avatar?: string
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[]
}

export function TestimonialsSection({ testimonials = [] }: TestimonialsSectionProps) {
  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-b from-cream-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-600 rounded-full text-sm font-bold mb-5">
            <span className="w-2 h-2 bg-primary-500 rounded-full" />
            Testimonios
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 font-display mb-5">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-neutral-500 max-w-2xl mx-auto text-lg">
            Experiencias reales de personas que confían en Tinkuy para su alimentación saludable
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8" role="list">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.id}
              className="bg-white p-6 lg:p-8 rounded-2xl border border-neutral-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              role="listitem"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-1 mb-5" aria-label={`${testimonial.rating} de 5 estrellas`}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-neutral-600 mb-6 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-neutral-900">{testimonial.name}</p>
                  <p className="text-xs text-neutral-500">Cliente verificado</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
