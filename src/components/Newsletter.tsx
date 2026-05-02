'use client'

import { useState } from 'react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      setEmail('')
      setTimeout(() => setIsSubmitted(false), 3000)
    }
  }

  return (
    <section className="bg-neutral-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-display mb-4">
            Unite a nuestro newsletter
          </h2>
          <p className="text-neutral-400 mb-8">
            Recibí las mejores ofertas, recetas saludables y novedades directo en tu correo.
          </p>
          {isSubmitted ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-primary-600/20 rounded-xl animate-fade-in">
              <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-primary-300 font-medium">
                ¡Gracias por suscribirte! Pronto recibirás novedades.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="flex-1 px-6 py-4 bg-neutral-800 text-white placeholder-neutral-500 rounded-xl border border-neutral-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors whitespace-nowrap"
              >
                Suscribirme
              </button>
            </form>
          )}
          <p className="text-xs text-neutral-500 mt-4">
            Podés darte de baja en cualquier momento. No spam, lo prometemos.
          </p>
        </div>
      </div>
    </section>
  )
}