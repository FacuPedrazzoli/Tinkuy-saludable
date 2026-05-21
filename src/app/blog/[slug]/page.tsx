// TODO: wire to backend Blog entity when available

import { notFound } from 'next/navigation'
import { Metadata } from 'next'

// No static params — all blog slugs resolve to 404 until the backend entity exists
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {}
}

export default function BlogPostPage() {
  // Backend blog entity is pending — all slugs return 404 for now
  notFound()
}
