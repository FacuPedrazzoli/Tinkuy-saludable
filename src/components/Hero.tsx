import Link from 'next/link'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-bone to-cream-dark" />

      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234A7C59' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <svg className="absolute top-20 left-10 w-24 h-24 text-primary-100/40" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 0C50 27.6142 27.6142 50 0 50C27.6142 50 50 72.3858 50 100C50 72.3858 72.3858 50 100 50C72.3858 50 50 27.6142 50 0Z" />
      </svg>
      <svg className="absolute bottom-32 right-20 w-32 h-32 text-secondary-200/30" viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="50" rx="50" ry="30" />
      </svg>
      <svg className="absolute top-1/3 right-1/4 w-16 h-16 text-primary-200/20 transform rotate-45" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 0C50 27.6142 27.6142 50 0 50C27.6142 50 50 72.3858 50 100C50 72.3858 72.3858 50 100 50C72.3858 50 50 27.6142 50 0Z" />
      </svg>

      <div className="absolute top-20 right-10 w-72 h-72 bg-secondary-200/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-float-slow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm text-primary-600 rounded-full text-sm font-semibold shadow-card border border-primary-100/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              100% Natural y Orgánico
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] xl:text-7xl font-bold text-neutral-900 leading-[1.05] font-display">
              Comer bien,
              <br />
              <span className="relative">
                <span className="relative z-10 text-primary">todos los días.</span>
                <span className="absolute -bottom-2 left-0 right-0 h-4 bg-primary-100/60 -z-0" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-600 max-w-lg leading-relaxed">
              Descubrí nuestra selección premium de productos saludables. Frutos secos,
              semillas, harinas alternativas y más para tu bienestar diario.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/catalog"
                className="group inline-flex items-center justify-center px-8 py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-0.5"
              >
                <span>Ver Catálogo</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="group inline-flex items-center justify-center px-8 py-4 bg-white text-neutral-700 font-semibold rounded-xl border-2 border-neutral-200 hover:border-primary-300 hover:text-primary-600 transition-all duration-300 shadow-card hover:shadow-card-hover"
              >
                <span>Conocer más</span>
                <svg className="w-5 h-5 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            
          </div>

          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-primary-200/30 to-secondary-200/30 rounded-[4rem] blur-3xl" />

              <div className="relative">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary-100 rounded-3xl -rotate-6 animate-float shadow-xl border border-secondary-200/50 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200&h=200&fit=crop"
                    alt="Frutos secos premium"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-primary-100 rounded-3xl rotate-6 animate-float-slow shadow-xl border border-primary-200/50 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop"
                    alt="Semillas naturales"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-1/2 -left-12 w-24 h-24 bg-amber-100 rounded-2xl -rotate-12 animate-float shadow-xl border border-amber-200/50 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=200&h=200&fit=crop"
                    alt="Granola"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] lg:w-[420px] lg:h-[420px] bg-white rounded-[2.5rem] shadow-2xl border border-neutral-100 overflow-hidden">
                  <Image
                    src="/logo-tinkuy.png"
                    alt="Tinkuy - Productos naturales"
                    fill
                    className="object-contain p-8"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
