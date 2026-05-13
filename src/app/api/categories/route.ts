import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/apiResponse'
import { validateCSRF, csrfError } from '@/lib/csrf'

const categorySchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  parent_id: z.string().uuid().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
})

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      return apiError(error.message, 500)
    }

    return apiSuccess({ categories: data })
  } catch (err) {
    console.error('Categories GET error:', err)
    return apiError('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  if (!validateCSRF(request)) {
    return csrfError()
  }

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

  try {
    const body = await request.json()
    const validated = categorySchema.parse(body)

    const { data, error } = await supabase
      .from('categories')
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
    return apiError('Internal server error', 500)
  }
}