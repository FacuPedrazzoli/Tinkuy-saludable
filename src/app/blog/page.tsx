// TODO: wire to backend Blog entity when available

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Consejos de nutrición, recetas saludables y novedades del mundo wellness.',
  openGraph: {
    title: 'Blog de Bienestar | Tinkuy',
    description: 'Consejos de nutrición, recetas saludables y las últimas tendencias en alimentación consciente.',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog de Bienestar | Tinkuy',
    description: 'Consejos de nutrición, recetas saludables y las últimas tendencias en alimentación consciente.',
  },
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-neutral-900 font-display mb-4">
            Blog de Bienestar
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Consejos de nutrición, recetas saludables y las últimas tendencias en alimentación consciente.
          </p>
        </div>

        <p className="text-neutral-400 text-center py-12">
          No hay artículos disponibles aún.
        </p>
      </div>
    </div>
  )
}
