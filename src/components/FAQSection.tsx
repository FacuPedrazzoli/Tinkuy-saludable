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
    <section className="py-16 bg-sage-50/50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">

          <h2 className="text-2xl font-bold text-neutral-900 font-display mb-2">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-3" role="region" aria-label="Preguntas frecuentes">
          {faqs.slice(0, 4).map((faq) => (
            <div
              key={faq.id}
              className="border border-primary-200/50 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              <h3 className="sr-only">{faq.question}</h3>
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                onKeyDown={(e) => handleKeyDown(e, faq.id)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-cream-50 transition-colors"
                aria-expanded={openId === faq.id}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <span className="font-medium text-neutral-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-secondary-400 flex-shrink-0 transition-transform ${
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
                  className="px-5 pb-5 text-neutral-600 animate-slide-down bg-cream-50/50"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="/faq"
            className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            Ver todas las preguntas
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}