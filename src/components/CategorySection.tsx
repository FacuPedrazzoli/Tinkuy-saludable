import Link from 'next/link'
import Image from 'next/image'
import { categories } from '@/data/categories'

export function CategorySection() {
  const featuredCategories = categories.slice(0, 6)

  return (
    <section className="py-20 bg-white" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500/10 text-secondary-500 rounded-full text-sm font-bold mb-5">
            <span className="w-2 h-2 bg-secondary-500 rounded-full" />
            Nuestras Categorías
          </span>
          <h2 id="categories-heading" className="text-4xl sm:text-5xl font-bold text-neutral-900 font-display mb-5">
            Explorá por categoría
          </h2>
          <p className="text-neutral-500 max-w-2xl mx-auto text-lg">
            Encontrá exactamente lo que buscás. Desde frutos secos hasta harinas integrales.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5" role="list" aria-label="Categorías de productos">
          {featuredCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/catalog?category=${category.slug}`}
              className="group relative"
              role="listitem"
              aria-label={`${category.name}, ${category.productCount} productos`}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-card group-hover:shadow-card-hover transition-all duration-500 group-hover:-translate-y-1">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300" />

                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold text-sm lg:text-base leading-tight mb-0.5 drop-shadow-sm">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-xs">
                    {category.productCount} productos
                  </p>
                </div>

                <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            href="/catalog"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-all duration-300 hover:shadow-xl hover:shadow-neutral-900/20 hover:-translate-y-0.5"
          >
            <span>Ver todas las categorías</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}