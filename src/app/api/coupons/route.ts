import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/apiResponse'
import { validateCSRF, csrfError } from '@/lib/csrf'

const couponSchema = z.object({
  code: z.string().min(1).max(50),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive(),
  min_purchase: z.number().min(0).default(0),
  max_uses: z.number().int().positive().nullable().optional(),
  starts_at: z.string().datetime().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
  is_active: z.boolean().default(true),
})

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return apiError(error.message, 500)
    }

    return apiSuccess({ coupons: data })
  } catch (err) {
    console.error('Coupons GET error:', err)
    return apiError('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  if (!validateCSRF(request)) {
    return csrfError()
  }

  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return apiError('Unauthorized', 401)
    }

    const { data: adminUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminUser || !['owner', 'admin'].includes(adminUser.role)) {
      return apiError('Forbidden', 403)
    }

    const body = await request.json()
    const validated = couponSchema.parse(body)

    const { data, error } = await supabase
      .from('coupons')
      .insert(validated)
      .select()
      .single()

    if (error) {
      return apiError(error.message, 400)
    }

    return apiSuccess(data, 201)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError(JSON.stringify(err.format()), 400)
    }
    console.error('Coupon POST error:', err)
    return apiError('Internal server error', 500)
  }
}