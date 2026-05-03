import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderNumber = searchParams.get('orderNumber')
  const email = searchParams.get('email')

  if (!orderNumber || !email) {
    return NextResponse.json(
      { error: 'Se requiere número de pedido y email' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*),
        shipping_updates(*)
      `)
      .eq('order_number', orderNumber)
      .eq('customer_email', email.toLowerCase())
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'No se encontró el pedido' },
        { status: 404 }
      )
    }

    const response = {
      orderNumber: order.order_number,
      status: order.status,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      total: order.total,
      createdAt: order.created_at,
      shippingAddress: order.shipping_address,
      items: (order.order_items || []).map((item: Record<string, unknown>) => ({
        productName: item.product_name,
        quantity: item.quantity,
        weight: item.weight,
        totalPrice: item.total_price,
      })),
      updates: (order.shipping_updates || []).map((update: Record<string, unknown>) => ({
        status: update.status,
        description: update.description,
        date: update.created_at,
      })),
    }

    return NextResponse.json({ order: response })
  } catch (err) {
    console.error('Order tracking error:', err)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}