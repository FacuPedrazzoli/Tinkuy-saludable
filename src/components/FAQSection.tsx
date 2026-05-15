'use client'

import { faqs } from '@/data/faqs'
import { useState, useCallback } from 'react'

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null)

  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentId: string) => {
    const faqItems = faqs.slice(0, 4)
    const currentIndex = faqItems.findIndex(f => f.id === currentId)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % faqItems.length
      setOpenId(faqItems[nextIndex].id)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = currentIndex === 0 ? faqItems.length - 1 : currentIndex - 1
      setOpenId(faqItems[prevIndex].id)
    }
  }, [])

  return (
    <section className="py-20 bg-cream-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-display mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-neutral-500 text-lg">
            Encontrá respuestas a las dudas más comunes sobre nuestros productos y servicios
          </p>
        </div>

        <div className="space-y-4" role="region" aria-label="Preguntas frecuentes">
          {faqs.slice(0, 4).map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-neutral-100 shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover"
            >
              <h3 className="sr-only">{faq.question}</h3>
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                onKeyDown={(e) => handleKeyDown(e, faq.id)}
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

        <div className="text-center mt-10">
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