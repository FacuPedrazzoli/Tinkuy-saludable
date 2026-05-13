import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/apiResponse'
import { validateCSRF, csrfError } from '@/lib/csrf'

const imageSchema = z.object({
  product_id: z.string().uuid(),
  url: z.string().url(),
  is_primary: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  alt_text: z.string().optional(),
})

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

    if (!adminUser || !['owner', 'admin', 'editor'].includes(adminUser.role)) {
      return apiError('Forbidden', 403)
    }

    const body = await request.json()
    const validated = imageSchema.parse(body)

    if (validated.is_primary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', validated.product_id)
    }

    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: validated.product_id,
        url: validated.url,
        is_primary: validated.is_primary,
        sort_order: validated.sort_order,
        alt_text: validated.alt_text,
      })
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
    console.error('Product image POST error:', err)
    return apiError('Internal server error', 500)
  }
}
