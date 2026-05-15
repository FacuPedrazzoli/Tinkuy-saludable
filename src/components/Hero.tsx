import Link from 'next/link'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAF8F4] via-[#F7F3EC] to-[#F5EFE6]" />

      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28 relative">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-600 rounded-full text-sm font-medium">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
              100% Natural y Orgánico
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] xl:text-6xl font-bold text-neutral-900 leading-[1.1] font-display">
              Comer bien,
              <br />
              <span className="text-secondary-400">todos los días.</span>
            </h1>

            <p className="text-lg text-neutral-600 max-w-md leading-relaxed">
              Descubrí nuestra selección premium de productos saludables. Frutos secos,
              semillas, harinas alternativas y más para tu bienestar diario.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-0.5"
              >
                Ver Catálogo
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-neutral-700 font-semibold rounded-xl border border-neutral-200 hover:border-primary-300 hover:text-primary-600 transition-all duration-300"
              >
                Conocer más
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-primary-50 rounded-full flex items-center justify-center ring-1 ring-primary-100">
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-neutral-800 text-sm">Envío Gratis</p>
                  <p className="text-xs text-neutral-500">En pedidos +$50.000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-secondary-50 rounded-full flex items-center justify-center ring-1 ring-secondary-100">
                  <svg className="w-5 h-5 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-neutral-800 text-sm">Calidad Premium</p>
                  <p className="text-xs text-neutral-500">Productos seleccionados</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative group" role="img" aria-label="Tinkuy - Productos naturales premium">
              <div className="absolute -inset-6 bg-gradient-to-br from-primary-200/20 to-secondary-200/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <Image
                src="/logo-tinkuy.png"
                alt=""
                width={380}
                height={380}
                className="relative object-contain w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[380px] drop-shadow-xl hover:drop-shadow-2xl transition-all duration-500 group-hover:scale-105"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}