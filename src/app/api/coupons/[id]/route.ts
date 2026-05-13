import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/apiResponse'
import { validateCSRF, csrfError } from '@/lib/csrf'

const couponUpdateSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']).optional(),
  discount_value: z.number().positive().optional(),
  min_purchase: z.number().min(0).optional(),
  max_uses: z.number().int().positive().nullable().optional(),
  starts_at: z.string().datetime().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  is_active: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validated = couponUpdateSchema.parse(body)

    const { data, error } = await supabase
      .from('coupons')
      .update(validated)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return apiError(error.message, 400)
    }

    return apiSuccess(data)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError(JSON.stringify(err.format()), 400)
    }
    console.error('Coupon PUT error:', err)
    return apiError('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', params.id)

    if (error) {
      return apiError(error.message, 400)
    }

    return apiSuccess({ success: true })
  } catch (err) {
    console.error('Coupon DELETE error:', err)
    return apiError('Internal server error', 500)
  }
}