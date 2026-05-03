import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Tinkuy',
  description: 'Términos y condiciones de compra de Tinkuy. Información sobre nuestras condiciones de venta conforme a la Ley 24.240 de Defensa del Consumidor.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 font-display mb-8">
          Términos y Condiciones
        </h1>

        <div className="bg-white rounded-2xl p-8 shadow-card space-y-6 text-neutral-600">
          <p className="text-sm text-neutral-500">Última actualización: Mayo 2024</p>

          <h2 className="text-xl font-semibold text-neutral-900">1. Identificación del Vendedor</h2>
          <p>
            Tinkuy, con domicilio en Av. Corrientes 1234, CABA, Argentina, CUIT 12-34567890-1,
           邮件 hola@tinkuy.com, teléfono +54 11 5254-0950.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900">2. Productos y Precios</h2>
          <p>
            Los precios de nuestros productos están expresados en pesos argentinos (ARS) e incluyen
            el IVA. Los precios pueden cambiar sin previo aviso. El precio válido es el que figura
            al momento de confirmar la compra.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900">3. Métodos de Pago</h2>
          <p>Aceptamos los siguientes métodos de pago:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Tarjeta de crédito/débito (Visa, Mastercard)</li>
            <li>MercadoPago</li>
            <li>Transferencia bancaria</li>
            <li>Efectivo (solo pickups)</li>
          </ul>

          <h2 className="text-xl font-semibold text-neutral-900">4. Envíos y Entregas</h2>
          <p>
            Realizamos envíos a todo Argentina. El costo de envío es de $1.500 para pedidos
            menores a $15.000. Para pedidos mayores, el envío es gratuito. Los plazos de entrega
            son de 3 a 7 días hábiles según la zona.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900">5. Política de Devoluciones</h2>
          <p>
            Conforme a la Ley 24.240, tenés 10 días para desistir de la compra desde la
            recepción del producto. El producto debe estar sin usar y en su packaging original.
            Contactanos a hola@tinkuy.com para iniciar el proceso.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900">6. Garantía</h2>
          <p>
            Todos nuestros productos cuentan con la garantía legal de 6 meses por defectos de
            fábrica. La garantía no cubre daños por uso inadecuado.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900">7. Protección del Consumidor</h2>
          <p>
            En caso de disputas, podés recurrir a la Dirección General de Defensa y Protección
            al Consumidor del GCBA o a la autoridad de tu jurisdicción.
          </p>

          <h2 className="text-xl font-semibold text-neutral-900">8. Ley Aplicable</h2>
          <p>
            Estas condiciones se rigen por las leyes de la República Argentina, en particular
            por la Ley 24.240 de Defensa del Consumidor y la Ley 25.065 de Tarjetas de Crédito.
          </p>
        </div>
      </div>
    </div>
  )
}