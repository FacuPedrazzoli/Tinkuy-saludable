import Link from 'next/link'
import Image from 'next/image'
import { blogPosts } from '@/data/blog'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Consejos de nutrición, recetas saludables y novedades del mundo wellness.',
  openGraph: {
    title: 'Blog de Bienestar | Tinkuy',
    description: 'Consejos de nutrición, recetas saludables y las últimas tendencias en alimentación consciente.',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog de Bienestar | Tinkuy',
    description: 'Consejos de nutrición, recetas saludables y las últimas tendencias en alimentación consciente.',
  },
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-neutral-900 font-display mb-4">
            Blog de Bienestar
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Consejos de nutrición, recetas saludables y las últimas tendencias en alimentación consciente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <article className="bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-primary-200 transition-all hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-neutral-700 text-sm font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-neutral-500 mb-3">
                    <span>{new Date(post.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>·</span>
                    <span>{post.readTime} min de lectura</span>
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 group-hover:text-primary-600 transition-colors mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-neutral-600 line-clamp-3">{post.excerpt}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}