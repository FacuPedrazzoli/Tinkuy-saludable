import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Envíos | Tinkuy',
  description: 'Información sobre envíos, tiempos de entrega, costos y seguimiento de tu pedido en Tinkuy.',
  alternates: {
    canonical: '/politica-de-envios',
  },
  openGraph: {
    title: 'Política de Envíos | Tinkuy',
    description: 'Información sobre envíos, tiempos de entrega y seguimiento.',
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
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">1. Tiempo de Preparación</h2>
            <p className="mb-4">
              Los pedidos se preparan en un plazo de 24 a 48 horas hábiles. Una vez dispatched,
              recibirás un email de confirmación con el número de seguimiento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">2. Métodos de Envío</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Mensajería express:</strong> Entrega en 24-48hs hábiles (CABA y GBA)</li>
              <li><strong>Standard:</strong> Entrega en 3-5 días hábiles (resto del país)</li>
              <li><strong>Retiro en punto de entrega:</strong> Disponible en OCA, Correo Argentino</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">3. Costos de Envío</h2>
            <div className="bg-neutral-50 rounded-xl p-4 mb-4">
              <p className="font-medium text-neutral-900">Envío gratis:</p>
              <p>En pedidos superiores a $25.000 dentro de CABA y GBA</p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li>CABA: Desde $1.500 (express) / $800 (standard)</li>
              <li>GBA: Desde $2.000 (express) / $1.200 (standard)</li>
              <li>Interior: Desde $2.500 según destino y peso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">4. Seguimiento</h2>
            <p>
              Una vez dispatched tu pedido, recibirás un email con el link de seguimiento.
              También puedes rastrear tu pedido desde la sección "Mis Pedidos" en tu cuenta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">5. Envíos Fallidos</h2>
            <p>
              Si el courier no puede entregar por dirección incorrecta o ausencia del receptor,
              se dejará un aviso y se intentará nuevamente en 24-48hs. Pasados 2 intentos fallidos,
              el pedido volverá a nuestro centro de distribución.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">6. Contacto</h2>
            <p>
              Si tenés alguna consulta sobre tu envío, escribinos a{' '}
              <a href="mailto:envios@tinkuy.com" className="text-primary-600 hover:underline">
                envios@tinkuy.com
              </a>{' '}
              con tu número de pedido.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
