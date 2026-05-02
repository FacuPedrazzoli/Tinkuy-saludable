import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  notes: z.string().optional(),
  shipping_address: z.record(z.string(), z.any()).optional(),
})

type Params = Promise<{ id: string }>

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*)
    `)
    .eq('id', id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PATCH(
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

  try {
    const body = await request.json()
    const validated = updateOrderSchema.parse(body)

    const { data: existing } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('orders')
      .update(validated)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (validated.status && validated.status !== existing.status) {
      await supabase
        .from('shipping_updates')
        .insert({
          order_id: id,
          status: validated.status,
          description: `Estado actualizado a ${validated.status}`,
        })

      if (validated.status === 'cancelled') {
        const { data: items } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', id)

        if (items) {
          for (const item of items) {
            if (item.product_id) {
              await supabase.rpc('increment_stock', {
                p_product_id: item.product_id,
                p_quantity: item.quantity,
              })
            }
          }
        }
      }
    }

    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action: 'UPDATE_ORDER',
        entity_type: 'order',
        entity_id: id,
        details: { previous_status: existing.status, new_status: validated.status },
      })

    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.format() }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}