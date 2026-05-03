import Link from 'next/link'
import Image from 'next/image'
import { categories } from '@/data/categories'

export function CategorySection() {
  const featuredCategories = categories.slice(0, 6)

  return (
    <section className="py-20 bg-cream-100">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-display mb-4">
            Nuestras Categorías
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Explorá nuestra selección cuidadosamente curada de productos saludables para cada estilo de vida.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/catalog?category=${category.slug}`}
              className="group"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 via-primary-900/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-sm">
                    {category.name}
                  </h3>
                  <p className="text-white/70 text-xs">
                    {category.productCount} productos
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25"
          >
            Ver Todas las Categorías
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}