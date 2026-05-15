import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getBlogPostBySlug, blogPosts } from '@/data/blog'
import { Metadata } from 'next'
import { safeJsonStringify } from '@/lib/utils'

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug)
  if (!post) notFound()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tinkuy-saludable-gamma.vercel.app'

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tinkuy',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo-tinkuy.png`,
      },
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(articleSchema) }}
      />
    <div className="min-h-screen bg-white pt-20">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
          <Link href="/" className="hover:text-primary-600">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary-600">Blog</Link>
          <span>/</span>
          <span className="text-neutral-900">{post.title}</span>
        </nav>

        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
          <Image src={post.image} alt={post.title} fill className="object-cover" priority />
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-6">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 font-medium rounded-full">
            {post.category}
          </span>
          <span>{new Date(post.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>·</span>
          <span>{post.readTime} min de lectura</span>
        </div>

        <h1 className="text-4xl font-bold text-neutral-900 font-display mb-6">
          {post.title}
        </h1>

        <p className="text-lg text-neutral-600 mb-8 pb-8 border-b border-neutral-100">
          {post.excerpt}
        </p>

        <div className="prose prose-lg max-w-none">
          <div className="text-neutral-700 whitespace-pre-line">{post.content}</div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-100">
          <p className="text-neutral-500 text-sm">
            Autor: <span className="text-neutral-700 font-medium">{post.author}</span>
          </p>
        </div>

        <div className="mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Blog
          </Link>
        </div>
      </article>
    </div>
    </>
  )
}