'use client'

// TODO: wire to backend FAQ entity when available
import { useState } from 'react'
import { FAQ } from '@/types'

interface FAQSectionProps {
  bare?: boolean
  faqs?: FAQ[]
}

export function FAQSection({ bare = false, faqs = [] }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const visibleFaqs = faqs.slice(0, bare ? 6 : 4)

  return (
    <section className={bare ? 'h-full' : 'py-20 bg-cream-50/50'}>
      <div className={bare ? 'flex h-full flex-col' : 'max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'}>
        <div className={bare ? 'mb-8' : 'text-center mb-12'}>
          <h2
            className={`font-bold text-neutral-900 font-display mb-4 ${
              bare ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
            }`}
          >
            Preguntas Frecuentes
          </h2>
          <p className="text-neutral-500 text-lg">
            Encontrá respuestas a las dudas más comunes sobre nuestros productos y servicios
          </p>
        </div>

        {visibleFaqs.length === 0 ? (
          <p className="text-neutral-400 text-center py-6">
            No hay preguntas frecuentes disponibles aún.
          </p>
        ) : (
          <div className="space-y-4" role="region" aria-label="Preguntas frecuentes">
            {visibleFaqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-neutral-100 shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover"
              >
                <h3 className="sr-only">{faq.question}</h3>
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-neutral-50 transition-colors duration-200"
                  aria-expanded={openId === faq.id}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <span className="font-bold text-neutral-900 pr-6 text-base">{faq.question}</span>
                  <svg
                    className={`w-6 h-6 text-secondary-400 flex-shrink-0 transition-all duration-300 ${
                      openId === faq.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openId === faq.id && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    className="px-6 pb-6 pt-2 text-neutral-600 leading-relaxed animate-slide-down"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={bare ? 'text-center mt-auto pt-10' : 'text-center mt-10'}>
          <a
            href="/faq"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-700 font-semibold rounded-xl border-2 border-neutral-200 hover:border-primary-300 hover:text-primary-600 transition-all duration-300 shadow-card hover:shadow-card-hover"
          >
            <span>Ver todas las preguntas</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
