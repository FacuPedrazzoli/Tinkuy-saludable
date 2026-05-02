import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const orderItemSchema = z.object({
  product_id: z.string().uuid().optional(),
  product_name: z.string(),
  product_price: z.number(),
  quantity: z.number().int().positive(),
  weight: z.number().int().positive(),
  unit_price: z.number(),
  total_price: z.number(),
})

const createOrderSchema = z.object({
  customer_email: z.string().email(),
  customer_name: z.string().min(1),
  customer_phone: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number(),
  discount_amount: z.number().default(0),
  shipping_cost: z.number().default(0),
  total: z.number(),
  payment_method: z.enum(['mercadopago', 'transfer', 'cash']),
  coupon_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  shipping_address: z.object({
    street: z.string(),
    number: z.string(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string().default('Argentina'),
  }),
})

export async function GET(request: NextRequest) {
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

  if (!adminUser || !['owner', 'admin'].includes(adminUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = supabase
    .from('orders')
    .select('*, order_items(*), customers(full_name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.ilike('order_number', `%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    orders: data,
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

  try {
    const body = await request.json()
    const validated = createOrderSchema.parse(body)

    let customerId: string | null = null

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', validated.customer_email)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          email: validated.customer_email,
          full_name: validated.customer_name,
          phone: validated.customer_phone,
        })
        .select('id')
        .single()

      customerId = newCustomer?.id || null
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        customer_email: validated.customer_email,
        customer_name: validated.customer_name,
        customer_phone: validated.customer_phone,
        subtotal: validated.subtotal,
        discount_amount: validated.discount_amount,
        shipping_cost: validated.shipping_cost,
        total: validated.total,
        payment_method: validated.payment_method,
        coupon_id: validated.coupon_id,
        notes: validated.notes,
        shipping_address: validated.shipping_address,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || 'Failed to create order' }, { status: 400 })
    }

    const orderItems = validated.items.map((item) => ({
      order_id: order.id,
      ...item,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: itemsError.message }, { status: 400 })
    }

    if (validated.payment_method === 'mercadopago') {
      const { data: payment } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          amount: validated.total,
          payment_method: 'mercadopago',
          status: 'pending',
        })
        .select()
        .single()

      return NextResponse.json({
        order,
        payment,
        checkoutUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/${order.id}?payment=mercadopago`,
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.format() }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}