import Link from 'next/link'
import { siteConfig } from '@/data/siteConfig'

export const metadata = {
  title: 'Nosotros',
  description: 'Conocé la historia de Tinkuy, tu dietética premium de productos saludables.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-900 font-display text-center mb-4">
            Sobre Nosotros
          </h1>
          <p className="text-xl text-neutral-600 text-center mb-16">
            Comer bien, todos los días.
          </p>

          <div className="prose prose-lg mx-auto">
            <div className="bg-neutral-50 p-8 rounded-2xl mb-12">
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-4">
                Nuestra Historia
              </h2>
              <p className="text-neutral-600 mb-4">
                {siteConfig.name} nació en 2023 con una misión clara: hacer que la alimentación saludable
                sea accesible, deliciosa y sin complicaciones. Somos una familia apasionada por el bienestar
                que cree que los mejores ingredientes hacen la diferencia.
              </p>
              <p className="text-neutral-600">
                Empezamos seleccionando los mejores frutos secos y semillas, y hoy tenemos más de
                60 productos premium para cada estilo de vida: vegano, keto, sin gluten y más.
              </p>
            </div>

            <div className="bg-neutral-50 p-8 rounded-2xl mb-12">
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-4">
                Nuestra Misión
              </h2>
              <p className="text-neutral-600 mb-4">
                Democratizar el acceso a alimentos saludables y de calidad. Trabajamos directamente
                con productores locales y cooperativas para garantizar que cada producto que vendemos
                cumpla con los más altos estándares.
              </p>
              <p className="text-neutral-600">
                Creemos que alimentarse bien no debería ser un lujo. Por eso luchamos contra
                los precios inflados y ofrecemos productos premium a precios justos.
              </p>
            </div>

            <div className="bg-neutral-50 p-8 rounded-2xl mb-12">
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-4">
                Nuestros Valores
              </h2>
              <ul className="space-y-4">
                {[
                  'Calidad sin compromisos: Solo productos que cumplirían en nuestra propia mesa.',
                  'Transparencia total: Ingredientes claros, información honesta.',
                  'Sustentabilidad: Empaque eco-friendly y prácticas responsables.',
                  'Comunidad: Vos importás, tu salud importa.',
                ].map((value, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-neutral-600">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-50 p-8 rounded-2xl mb-12">
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-4">
                Contacto
              </h2>
              <p className="text-neutral-600 mb-4">
                Visitanos en nuestro local de Av. Corrientes 1234, CABA.
                Estamos abiertos de lunes a sábado de 9:00 a 20:00hs.
              </p>
              <p className="text-neutral-600">
                ¿Tenés preguntas? Escribinos a hola@tinkuy.com o llamanos al +54 11 5254-0950.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}