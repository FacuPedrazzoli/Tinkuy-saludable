import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateProductImage } from '@/lib/productImages'

export const revalidate = 3600

interface CatalogFilters {
  page: number
  limit: number
  category?: string
  search?: string
  sort?: string
  order?: string
  is_organic?: boolean
  is_vegan?: boolean
  is_gluten_free?: boolean
  is_keto?: boolean
  min_price?: number
  max_price?: number
}

function buildSupabaseQuery(supabase: Awaited<ReturnType<typeof createClient>>, filters: CatalogFilters) {
  let query = supabase
    .from('products')
    .select(`
      *,
      categories(id, name, slug),
      product_images(id, url, alt_text, is_primary, sort_order)
    `, { count: 'exact' })
    .eq('is_active', true)

  if (filters.category) {
    query = query.eq('categories.slug', filters.category)
  }

  if (filters.is_organic === true) {
    query = query.eq('is_organic', true)
  }

  if (filters.is_vegan === true) {
    query = query.eq('is_vegan', true)
  }

  if (filters.is_gluten_free === true) {
    query = query.eq('is_gluten_free', true)
  }

  if (filters.is_keto === true) {
    query = query.eq('is_keto', true)
  }

  if (filters.min_price !== undefined) {
    query = query.gte('price', filters.min_price)
  }

  if (filters.max_price !== undefined) {
    query = query.lte('price', filters.max_price)
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const sortColumn = filters.sort || 'created_at'
  const sortOrder = filters.order === 'asc' ? true : false

  if (sortColumn === 'price') {
    query = query.order('price', { ascending: sortOrder })
  } else if (sortColumn === 'rating') {
    query = query.order('rating', { ascending: false })
  } else if (sortColumn === 'name') {
    query = query.order('name', { ascending: sortOrder })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const from = (filters.page - 1) * filters.limit
  const to = from + filters.limit - 1
  query = query.range(from, to)

  return query
}

function transformProduct(product: Record<string, unknown>) {
  const category = product.categories as Record<string, unknown> | null
  const images = product.product_images as Array<Record<string, unknown>> | null

  const sortedImages = images
    ?.sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
    .map(img => img.url as string) || []

  const categorySlug = category?.slug as string || ''
  const subcategoryName = category?.name as string | undefined

  const validatedImage = validateProductImage(
    sortedImages[0],
    categorySlug,
    subcategoryName
  )

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    shortDescription: product.short_description || '',
    price: Number(product.price),
    originalPrice: product.original_price ? Number(product.original_price) : undefined,
    category: categorySlug,
    subcategory: subcategoryName,
    tags: product.tags || [],
    images: sortedImages.length > 0 ? [validatedImage, ...sortedImages.slice(1)] : [validatedImage],
    ingredients: product.ingredients || undefined,
    benefits: product.benefits || undefined,
    nutritionalInfo: product.nutritional_info || undefined,
    stock: product.stock || 0,
    rating: Number(product.rating) || 0,
    reviews: product.reviews_count || 0,
    featured: product.is_featured || false,
    promo: undefined,
    brand: product.brand || undefined,
    organic: product.is_organic || false,
    glutenFree: product.is_gluten_free || false,
    vegan: product.is_vegan || false,
    keto: product.is_keto || false,
    createdAt: product.created_at as string,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const useSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const filters: CatalogFilters = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '24'),
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || 'created_at',
    order: searchParams.get('order') || 'desc',
    is_organic: searchParams.get('is_organic') === 'true' ? true : undefined,
    is_vegan: searchParams.get('is_vegan') === 'true' ? true : undefined,
    is_gluten_free: searchParams.get('is_gluten_free') === 'true' ? true : undefined,
    is_keto: searchParams.get('is_keto') === 'true' ? true : undefined,
    min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
    max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
  }

  if (!useSupabase) {
    const { products: mockProducts } = await import('@/data/products')
    let filtered = [...mockProducts]

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category)
    }

    if (filters.search) {
      const q = filters.search.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    if (filters.is_organic) {
      filtered = filtered.filter(p => p.organic)
    }
    if (filters.is_vegan) {
      filtered = filtered.filter(p => p.vegan)
    }
    if (filters.is_gluten_free) {
      filtered = filtered.filter(p => p.glutenFree)
    }
    if (filters.is_keto) {
      filtered = filtered.filter(p => p.keto)
    }

    if (filters.min_price !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.min_price!)
    }
    if (filters.max_price !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.max_price!)
    }

    const sort = filters.sort || 'created_at'
    const order = filters.order === 'asc' ? 1 : -1

    filtered.sort((a, b) => {
      if (sort === 'price') return (a.price - b.price) * order
      if (sort === 'rating') return (a.rating - b.rating) * order
      if (sort === 'name') return a.name.localeCompare(b.name) * order
      return 0
    })

    const total = filtered.length
    const totalPages = Math.ceil(total / filters.limit)
    const from = (filters.page - 1) * filters.limit
    const paginatedProducts = filtered.slice(from, from + filters.limit)

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  }

  try {
    const supabase = await createClient()
    const query = buildSupabaseQuery(supabase, filters)
    const { data, error, count } = await query

    if (error) {
      console.error('Supabase catalog error:', error)
      return NextResponse.json(
        { error: 'Error fetching products', code: 'SUPABASE_ERROR' },
        { status: 500 }
      )
    }

    const products = (data || []).map(transformProduct)
    const total = count || 0
    const totalPages = Math.ceil(total / filters.limit)

    return NextResponse.json({
      products,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    console.error('Catalog API error:', err)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}