import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/apiResponse'
import { validateCSRF, csrfError } from '@/lib/csrf'

const reorderSchema = z.object({
  categories: z.array(z.object({
    id: z.string().uuid(),
    sort_order: z.number(),
  })),
})

export async function PUT(request: NextRequest) {
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
    const validated = reorderSchema.parse(body)

    for (const cat of validated.categories) {
      const { error } = await supabase
        .from('categories')
        .update({ sort_order: cat.sort_order })
        .eq('id', cat.id)

      if (error) {
        console.error('Error reordering category:', error)
        return apiError('Error reordering', 500)
      }
    }

    return apiSuccess({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError(JSON.stringify(err.format()), 400)
    }
    return apiError('Internal server error', 500)
  }
}