import Link from 'next/link'

const nearbyAreas = [
  'Haedo',
  'Morón',
  'Villa Luzuriaga',
  'Villa Sarmiento',
  'Ramos Mejía',
  'El Palomar',
]

export function ShippingSection({ bare = false }: { bare?: boolean }) {
  return (
    <section
      className={bare ? 'h-full' : 'py-20 bg-cream-50'}
      aria-labelledby="shipping-heading"
      role="region"
    >
      <div className={bare ? 'flex h-full flex-col' : 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'}>
        <div className={bare ? 'mb-8' : 'text-center mb-12'}>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-600 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            Envíos
          </span>
          <h2
            id="shipping-heading"
            className={`font-bold text-neutral-900 font-display mb-4 ${
              bare ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'
            }`}
          >
            Cómo enviamos tus pedidos
          </h2>
          <p className={`text-neutral-500 text-lg ${bare ? '' : 'max-w-2xl mx-auto'}`}>
            Hacemos envíos por día a toda la zona oeste de Buenos Aires. Coordinamos
            la entrega con vos para que tu pedido llegue fresco y a tiempo.
          </p>
        </div>

        <div className={`grid gap-6 ${bare ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
          {/* Confirmación del pedido */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-7 transition-all duration-300 hover:shadow-card-hover">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-5">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-neutral-900 text-lg mb-2">
              Confirmación en 24 hs
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              Tu compra se confirma luego de{' '}
              <strong className="text-neutral-900">24 hs</strong> para coordinar y
              confirmar el despacho de tu pedido.
            </p>
          </div>

          {/* Envío gratis zona oeste cercana */}
          <div className="bg-white rounded-2xl border border-primary-200 shadow-card p-7 transition-all duration-300 hover:shadow-card-hover ring-1 ring-primary-100">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-5 text-2xl">
              <span aria-hidden="true">🚚</span>
            </div>
            <h3 className="font-bold text-neutral-900 text-lg mb-2">
              Envío GRATIS desde $20.000
            </h3>
            <p className="text-neutral-600 leading-relaxed mb-4">
              En Haedo y zonas cercanas para compras desde{' '}
              <strong className="text-neutral-900">$20.000</strong>.
            </p>
            <ul className="flex flex-wrap gap-2">
              {nearbyAreas.map((area) => (
                <li
                  key={area}
                  className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>

          {/* Otras localidades */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-card p-7 transition-all duration-300 hover:shadow-card-hover">
            <div className="w-12 h-12 rounded-xl bg-secondary-400/10 flex items-center justify-center mb-5 text-2xl">
              <span aria-hidden="true">📦</span>
            </div>
            <h3 className="font-bold text-neutral-900 text-lg mb-2">
              Otras localidades
            </h3>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Consultá envíos a otras localidades de la zona oeste de Buenos Aires.
              Coordinamos el costo y el día de entrega según tu dirección.
            </p>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              <span>Consultá tu envío</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        <div className={bare ? 'text-center mt-auto pt-10' : 'text-center mt-10'}>
          <Link
            href="/politica-de-envios"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-700 font-semibold rounded-xl border-2 border-neutral-200 hover:border-primary-300 hover:text-primary-600 transition-all duration-300 shadow-card hover:shadow-card-hover"
          >
            Ver política de envíos completa
          </Link>
        </div>
      </div>
    </section>
  )
}
