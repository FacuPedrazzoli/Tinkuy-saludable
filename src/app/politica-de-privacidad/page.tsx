import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad | Tinkuy',
  description: 'Política de privacidad de Tinkuy. Información sobre cómo protegemos tus datos personales conforme a la Ley 25.326 de Argentina.',
  alternates: {
    canonical: '/politica-de-privacidad',
  },
  openGraph: {
    title: 'Política de Privacidad | Tinkuy',
    description: 'Política de privacidad de Tinkuy. Información sobre cómo protegemos tus datos personales conforme a la Ley 25.326 de Argentina.',
    type: 'website',
    locale: 'es_AR',
    url: '/politica-de-privacidad',
  },
  twitter: {
    card: 'summary',
    title: 'Política de Privacidad | Tinkuy',
    description: 'Política de privacidad de Tinkuy.',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 font-display mb-8">
          Política de Privacidad
        </h1>

        <div className="bg-white rounded-2xl p-8 shadow-card space-y-6 text-neutral-600">
          <p className="text-sm text-neutral-500">Última actualización: Mayo 2024</p>

          <h2 className="text-xl font-semibold text-neutral-900">1. Responsable del Tratamiento</h2>
          <p>
            Tinkuy, con domicilio en Av. Corrientes 1234, CABA, Argentina, es responsable del tratamiento
            de tus datos personales conforme a la Ley 25.326 de Protección de los Datos Personales.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900">2. Datos Personales Recopilados</h2>
          <p>Recopilamos los siguientes datos personales:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nombre y apellido</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Dirección de envío y facturación</li>
            <li>Historial de compras</li>
            <li>Información de pago (procesada por MercadoPago)</li>
          </ul>

          <h2 className="text-xl font-semibold text-neutral-900">3. Finalidad del Tratamiento</h2>
          <p>Tus datos personales son utilizados para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Procesar y entregar tus pedidos</li>
            <li>Enviarte información sobre el estado de tu pedido</li>
            <li>Brindarte soporte al cliente</li>
            <li>Enviarte newsletters y promociones (con tu consentimiento)</li>
            <li>Cumplir con obligaciones legales</li>
          </ul>

          <h2 className="text-xl font-semibold text-neutral-900">4. Tus Derechos</h2>
          <p>Conforme a la Ley 25.326, tienes derecho a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acceder a tus datos personales</li>
            <li>Rectificar datos inexactos</li>
            <li>Solicitar la supresión de tus datos</li>
            <li>Oponerte al tratamiento de tus datos</li>
            <li>Revocar el consentimiento en cualquier momento</li>
          </ul>

          <h2 className="text-xl font-semibold text-neutral-900">5. Contacto</h2>
          <p>
            Para ejercer tus derechos o realizar consultas sobre nuestra política de privacidad,
            contactanos a: <strong>hola@tinkuy.com</strong>
          </p>
        </div>
      </div>
    </div>
  )
}