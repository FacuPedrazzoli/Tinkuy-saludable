export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center pt-20">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-primary-600 font-display mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
          Página no encontrada
        </h2>
        <p className="text-neutral-600 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o fue movida.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
        >
          Volver al Inicio
        </a>
      </div>
    </div>
  )
}