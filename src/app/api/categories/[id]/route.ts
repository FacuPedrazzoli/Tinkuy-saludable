import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/apiResponse'
import { validateCSRF, csrfError } from '@/lib/csrf'

const categorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  parent_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true),
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
    const validated = categorySchema.parse(body)

    const { data, error } = await supabase
      .from('categories')
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
    console.error('Category PUT error:', err)
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
      .from('categories')
      .delete()
      .eq('id', params.id)

    if (error) {
      return apiError(error.message, 400)
    }

    return apiSuccess({ success: true })
  } catch (err) {
    console.error('Category DELETE error:', err)
    return apiError('Internal server error', 500)
  }
}