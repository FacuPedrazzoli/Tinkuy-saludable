import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.number().min(0),
  original_price: z.number().min(0).optional(),
  category_id: z.string().uuid().optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).default([]),
  ingredients: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  nutritional_info: z.record(z.string(), z.any()).optional(),
  stock: z.number().int().min(0).default(0),
  stock_alert: z.number().int().min(0).default(10),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  is_organic: z.boolean().default(false),
  is_gluten_free: z.boolean().default(false),
  is_vegan: z.boolean().default(false),
  is_keto: z.boolean().default(false),
  weight_options: z.array(z.number()).default([100, 250, 500, 1000]),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
})

const updateProductSchema = productSchema.partial()

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'created_at'
  const order = searchParams.get('order') || 'desc'

  let query = supabase
    .from('products')
    .select('*, categories(name, slug), product_images(url, is_primary)', { count: 'exact' })

  if (category) {
    query = query.eq('category_id', category)
  }

  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  query = query
    .eq('is_active', true)
    .order(sort, { ascending: order === 'asc' })
    .range((page - 1) * limit, page * limit - 1)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    products: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['owner', 'admin', 'editor'].includes(adminUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validated = productSchema.parse(body)

    const { data, error } = await supabase
      .from('products')
      .insert(validated)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action: 'CREATE_PRODUCT',
        entity_type: 'product',
        entity_id: data.id,
        details: { name: data.name },
      })

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos en el formulario' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}