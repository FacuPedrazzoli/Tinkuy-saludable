import Link from 'next/link'
import { siteConfig } from '@/data/siteConfig'

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-400 text-sm">
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <Link href="/politica-de-privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <Link href="/terminos-y-condiciones" className="hover:text-white transition-colors">Términos y Condiciones</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}