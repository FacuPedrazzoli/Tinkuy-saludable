import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.number().min(0).optional(),
  original_price: z.number().min(0).nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  brand: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  ingredients: z.string().nullable().optional(),
  benefits: z.array(z.string()).nullable().optional(),
  nutritional_info: z.record(z.string(), z.any()).nullable().optional(),
  stock: z.number().int().min(0).optional(),
  stock_alert: z.number().int().min(0).optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  is_organic: z.boolean().optional(),
  is_gluten_free: z.boolean().optional(),
  is_vegan: z.boolean().optional(),
  is_keto: z.boolean().optional(),
  weight_options: z.array(z.number()).optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
})

type Params = Promise<{ id: string }>

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: product, error } = await supabase
    .from('products')
    .select('*, categories(*), product_images(*)')
    .eq('id', id)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  const supabase = await createClient()
  const { id } = await params

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
    const validated = updateProductSchema.parse(body)

    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('products')
      .update(validated)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action: 'UPDATE_PRODUCT',
        entity_type: 'product',
        entity_id: id,
        details: validated,
      })

    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos en el formulario' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['owner', 'admin'].includes(adminUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await supabase
    .from('activity_logs')
    .insert({
      user_id: user.id,
      action: 'DELETE_PRODUCT',
      entity_type: 'product',
      entity_id: id,
    })

  return NextResponse.json({ success: true })
}