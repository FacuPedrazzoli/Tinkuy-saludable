import Link from 'next/link'
import Image from 'next/image'

// Real kraft paper photo as the surface, with a soft warm light/shade gradient
// on top for depth. Solid color is the fallback if the image fails.
const kraftPaper: React.CSSProperties = {
  backgroundColor: '#bfa074',
  backgroundImage:
    'radial-gradient(ellipse at 50% 30%, rgba(255,248,232,0.18), transparent 70%), linear-gradient(180deg, rgba(120,90,50,0.06), rgba(90,65,35,0.16)), url("/kraft-texture.avif")',
  backgroundSize: 'auto, auto, cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}

// Seeds, grains and sprouts that emerge from the logo center and travel
// outward while fading in then out. Defined by direction + distance.
type Sprout = { kind: 'seed' | 'grain' | 'plant'; angle: number; dist: number; size: number; delay: number; dur: number }
const EMANATE: Sprout[] = [
  { kind: 'plant', angle: -90, dist: 205, size: 30, delay: 0.0, dur: 6.5 },
  { kind: 'seed', angle: -45, dist: 185, size: 18, delay: 0.9, dur: 7.0 },
  { kind: 'grain', angle: 0, dist: 210, size: 20, delay: 1.7, dur: 6.8 },
  { kind: 'seed', angle: 45, dist: 182, size: 16, delay: 0.4, dur: 7.4 },
  { kind: 'plant', angle: 90, dist: 198, size: 26, delay: 1.2, dur: 6.6 },
  { kind: 'grain', angle: 135, dist: 186, size: 19, delay: 2.1, dur: 7.1 },
  { kind: 'seed', angle: 180, dist: 205, size: 17, delay: 0.6, dur: 7.0 },
  { kind: 'grain', angle: 225, dist: 188, size: 18, delay: 1.5, dur: 6.9 },
]

function SproutShape({ kind, size }: { kind: Sprout['kind']; size: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', className: 'text-stone-700/35' as const }
  if (kind === 'seed') {
    return (
      <svg {...common} fill="currentColor">
        <path d="M12 2C16 6 16 18 12 22C8 18 8 6 12 2Z" />
      </svg>
    )
  }
  if (kind === 'grain') {
    return (
      <svg {...common} fill="currentColor">
        <ellipse cx="12" cy="12" rx="4.5" ry="9" />
      </svg>
    )
  }
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
      <path d="M12 22V9" />
      <path d="M12 13C12 9 9 7 5 7C5 11 8 13 12 13Z" fill="currentColor" stroke="none" />
      <path d="M12 11C12 7.5 14.5 5.5 18 5.5C18 9 15.5 11 12 11Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center" style={kraftPaper}>
      {/* soft warm light pooling so the sheet doesn't read as a flat fill */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_70%_40%,rgba(255,244,214,0.35),transparent_60%)]" />

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
              <span className="text-primary">todos los días.</span>
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
            <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px]">
              <div className="absolute inset-8 rounded-full bg-amber-50/25 blur-3xl" />

              {/* seeds, grains and sprouts emerging from the logo center,
                  travelling outward while they fade in and out */}
              {EMANATE.map((s, i) => {
                const rad = (s.angle * Math.PI) / 180
                const dx = Math.cos(rad) * s.dist
                const dy = Math.sin(rad) * s.dist
                return (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 pointer-events-none"
                    style={{ marginLeft: -s.size / 2, marginTop: -s.size / 2 }}
                  >
                    <div
                      className="sprout-emanate"
                      style={
                        {
                          '--dx': `${dx.toFixed(1)}px`,
                          '--dy': `${dy.toFixed(1)}px`,
                          '--dur': `${s.dur}s`,
                          animationDelay: `${s.delay}s`,
                        } as React.CSSProperties
                      }
                    >
                      <div style={{ transform: `rotate(${s.angle + 90}deg)` }}>
                        <SproutShape kind={s.kind} size={s.size} />
                      </div>
                    </div>
                  </div>
                )
              })}

              <Image
                src="/logo-tinkuy-sin-fondo.png"
                alt="Tinkuy - Productos naturales"
                fill
                className="object-contain drop-shadow-[0_18px_26px_rgba(74,50,16,0.45)]"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
