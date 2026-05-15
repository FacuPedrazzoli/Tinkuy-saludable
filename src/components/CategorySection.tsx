import Link from 'next/link'
import Image from 'next/image'
import { categories } from '@/data/categories'

export function CategorySection() {
  const featuredCategories = categories.slice(0, 6)

  return (
    <section className="py-20 bg-cream-50" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500/10 text-secondary-500 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-secondary-500 rounded-full" />
            Nuestras Categorías
          </span>
          <h2 id="categories-heading" className="text-3xl sm:text-4xl font-bold text-neutral-900 font-display mb-4">
            Explorá por categoría
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Encontrá exactamente lo que buscás. Desde frutos secos hasta harinas integrales.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" role="list" aria-label="Categorías de productos">
          {featuredCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/catalog?category=${category.slug}`}
              className="group relative"
              role="listitem"
              aria-label={`${category.name}, ${category.productCount} productos`}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-base leading-tight mb-1">
                    {category.name}
                  </h3>
                  <p className="text-white/70 text-xs">
                    {category.productCount} productos
                  </p>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
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
            Ver todas las categorías
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}