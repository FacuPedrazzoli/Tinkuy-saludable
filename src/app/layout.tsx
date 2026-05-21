import type { Metadata } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { siteConfig } from '@/data/siteConfig'
import { Providers } from '@/components/Providers'

const CartDrawer = dynamic(() => import('@/components/CartDrawer').then(mod => ({ default: mod.CartDrawer })), {
  ssr: false,
})

const CookieConsent = dynamic(() => import('@/components/CookieConsent').then(mod => ({ default: mod.CookieConsent })), {
  ssr: false,
})

const DevTools = dynamic(() => import('@/components/DevTools').then(mod => ({ default: mod.DevTools })), {
  ssr: false,
})

const ExitIntentPopup = dynamic(() => import('@/components/ExitIntentPopup').then(mod => ({ default: mod.ExitIntentPopup })), {
  ssr: false,
})

const Analytics = dynamic(() => import('@/components/Analytics').then(mod => ({ default: mod.Analytics })), {
  ssr: false,
})

const ClarityScript = dynamic(() => import('@/components/ClarityScript').then(mod => ({ default: mod.ClarityScript })), {
  ssr: false,
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinkuy-saludable-gamma.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${siteConfig.name} | ${siteConfig.slogan}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['dietética', 'productos saludables', 'frutos secos', 'sin gluten', 'vegano', 'keto'],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: {
    canonical: baseUrl,
  },
  icons: {
    icon: '/logo-tinkuy.png',
    shortcut: '/logo-tinkuy.png',
    apple: '/logo-tinkuy.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: baseUrl,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.slogan}`,
    description: siteConfig.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${siteConfig.slogan}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | ${siteConfig.slogan}`,
    description: siteConfig.description,
    images: ['/logo-tinkuy.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans relative">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
          >
            Saltar al contenido principal
          </a>
            <Header />
            <main id="main-content" className="flex-1 relative z-10 pb-20 md:pb-0">{children}</main>
            <Footer />
            <WhatsAppButton />
            <CartDrawer />
            <CookieConsent />
            <DevTools />
            <ExitIntentPopup />
            <Analytics />
            <ClarityScript />
        </Providers>
      </body>
    </html>
  )
}