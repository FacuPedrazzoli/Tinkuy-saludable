import { Metadata } from 'next'

interface OpenGraphProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'product'
}

export function buildOpenGraph(props: OpenGraphProps): Metadata['openGraph'] {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinkuy.com'
  
  return {
    title: props.title,
    description: props.description,
    url: props.url || baseUrl,
    siteName: 'Tinkuy',
    images: props.image ? [{
      url: props.image,
      width: 1200,
      height: 630,
      alt: props.title,
    }] : [],
    locale: 'es_AR',
    type: props.type as 'website',
  }
}