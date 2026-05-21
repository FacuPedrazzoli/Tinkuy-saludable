import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Envíos | Tinkuy',
  description: 'Envíos por día a zona oeste de Buenos Aires. Envío gratis desde $20.000 en Haedo y zonas cercanas. Tu compra se confirma en 24 hs.',
  alternates: {
    canonical: '/politica-de-envios',
  },
  openGraph: {
    title: 'Política de Envíos | Tinkuy',
    description: 'Envíos por día a zona oeste de Buenos Aires. Envío gratis desde $20.000 en Haedo y zonas cercanas.',
    type: 'website',
    locale: 'es_AR',
    url: '/politica-de-envios',
  },
}

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 font-display mb-8">
          Política de Envíos
        </h1>

        <div className="bg-white rounded-2xl p-8 shadow-card space-y-8 text-neutral-600">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. Confirmación del Pedido</h2>
            <p className="mb-4">
              Tu compra se confirma luego de <strong>24 hs</strong>. En ese plazo
              coordinamos y confirmamos el despacho de tu pedido por el canal que
              dejaste al comprar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. Zona de Cobertura</h2>
            <p className="mb-4">
              Hacemos envíos por día a toda la <strong>zona oeste de Buenos Aires</strong>.
              Coordinamos el día de entrega según tu localidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. Costos de Envío</h2>
            <div className="bg-primary-50 rounded-xl p-4 mb-4">
              <p className="font-medium text-neutral-900">🚚 Envío GRATIS:</p>
              <p>
                En compras desde <strong>$20.000</strong> en Haedo y zonas cercanas
                (Morón, Villa Luzuriaga, Villa Sarmiento, Ramos Mejía, El Palomar).
              </p>
            </div>
            <p>
              📦 Para otras localidades de la zona oeste, el costo del envío se
              coordina según tu dirección. Consultanos antes de finalizar la compra.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. Seguimiento</h2>
            <p>
              El seguimiento de tu pedido se hace por el canal de comunicación que
              dejaste al comprar. Te avisamos cuando confirmamos el despacho y
              coordinamos la entrega directamente con vos por ese medio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. Entregas Fallidas</h2>
            <p>
              Si no podemos entregar por dirección incorrecta o ausencia del receptor,
              reprogramamos la entrega para el siguiente día de reparto en tu zona.
              Te contactamos para coordinar una nueva fecha.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">6. Contacto</h2>
            <p>
              Si tenés alguna consulta sobre tu envío, escribinos a{' '}
              <a href="mailto:tinkuyalmacenaaludable@gmail.com" className="text-primary-600 hover:underline">
                tinkuyalmacenaaludable@gmail.com
              </a>{' '}
              con tu número de pedido.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
