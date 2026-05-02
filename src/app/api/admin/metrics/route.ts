import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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

  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

  const [
    totalOrdersResult,
    pendingOrdersResult,
    totalCustomersResult,
    totalProductsResult,
    ordersTodayResult,
    ordersThisMonthResult,
    revenueTodayResult,
    revenueThisMonthResult,
    recentOrdersResult,
    topProductsResult,
    ordersByStatusResult,
    ordersByPaymentResult,
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total').gte('created_at', startOfToday),
    supabase.from('orders').select('total').gte('created_at', startOfMonth),
    supabase.from('orders').select('total').gte('created_at', startOfToday).eq('payment_status', 'paid'),
    supabase.from('orders').select('total').gte('created_at', startOfMonth).eq('payment_status', 'paid'),
    supabase.from('orders').select('*, order_items(*), customers(full_name, email)').order('created_at', { ascending: false }).limit(10),
    supabase.from('order_items').select('product_id, product_name, quantity, total_price').order('quantity', { ascending: false }).limit(5),
    supabase.from('orders').select('status'),
    supabase.from('orders').select('payment_status'),
  ])

  const totalOrders = totalOrdersResult.count || 0
  const pendingOrders = pendingOrdersResult.count || 0
  const totalCustomers = totalCustomersResult.count || 0
  const totalProducts = totalProductsResult.count || 0

  const ordersToday = ordersTodayResult.data || []
  const ordersThisMonth = ordersThisMonthResult.data || []
  const revenueTodayData = revenueTodayResult.data || []
  const revenueThisMonthData = revenueThisMonthResult.data || []

  const revenueToday = revenueTodayData.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const revenueThisMonth = revenueThisMonthData.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const avgOrder = totalOrders ? revenueThisMonth / totalOrders : 0

  const ordersByStatus: Record<string, number> = {}
  ordersByStatusResult.data?.forEach(o => {
    ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1
  })

  const ordersByPayment: Record<string, number> = {}
  ordersByPaymentResult.data?.forEach(o => {
    ordersByPayment[o.payment_status] = (ordersByPayment[o.payment_status] || 0) + 1
  })

  return NextResponse.json({
    metrics: {
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      revenueToday,
      revenueThisMonth,
      avgOrderValue: avgOrder,
    },
    recentOrders: recentOrdersResult.data || [],
    topProducts: topProductsResult.data || [],
    ordersByStatus,
    ordersByPayment,
  })
}