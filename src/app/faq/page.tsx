'use client'

// TODO: wire to backend FAQ entity when available

import { useState } from 'react'

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null)

  // Empty state — backend FAQ entity is pending
  const faqs: Array<{ id: string; question: string; answer: string; category: string }> = []
  const categories = ['all']
  const [selectedCategory, setSelectedCategory] = useState('all')

  return (
    <>
      <div className="min-h-screen bg-neutral-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-neutral-900 font-display text-center mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-neutral-600 text-center mb-12">
            Todo lo que necesitás saber sobre nuestros productos y servicios.
          </p>

          {faqs.length === 0 ? (
            <p className="text-neutral-400 text-center py-12">
              No hay preguntas frecuentes disponibles aún.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap justify-center gap-2 mb-12" role="group" aria-label="Filtrar por categoría">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={selectedCategory === cat}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {cat === 'all' ? 'Todas' : cat}
                  </button>
                ))}
              </div>

              <div className="space-y-4" role="region" aria-label="Preguntas frecuentes">
                {faqs
                  .filter((f) => selectedCategory === 'all' || f.category === selectedCategory)
                  .map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-white border border-neutral-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                        className="w-full flex items-center justify-between p-5 text-left"
                        aria-expanded={openId === faq.id}
                        aria-controls={`faq-answer-${faq.id}`}
                      >
                        <span className="font-medium text-neutral-900 pr-4">{faq.question}</span>
                        <svg
                          className={`w-5 h-5 text-neutral-500 flex-shrink-0 transition-transform ${
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
                        <div id={`faq-answer-${faq.id}`} className="px-5 pb-5 text-neutral-600 animate-slide-down">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}

          <div className="mt-16 text-center bg-primary-50 p-8 rounded-2xl">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              ¿No encontraste tu respuesta?
            </h2>
            <p className="text-neutral-600 mb-6">
              Estamos para ayudarte. Contactanos y te responderemos a la brevedad.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              Contactar
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
