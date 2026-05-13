import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/apiResponse'
import { validateCSRF, csrfError } from '@/lib/csrf'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
  role: z.enum(['admin', 'editor']).default('editor'),
})

export async function POST(request: NextRequest) {
  if (!validateCSRF(request)) {
    return csrfError()
  }

  try {
    const supabase = await createClient()

    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return apiError('Unauthorized', 401)
    }

    const { data: currentProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (!currentProfile || currentProfile.role !== 'owner') {
      return apiError('Solo el owner puede crear nuevos administradores', 403)
    }

    const body = await request.json()
    const { email, password, full_name, role } = registerSchema.parse(body)

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return apiError('Este email ya está registrado', 400)
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
    })

    if (error) {
      return apiError(error.message, 400)
    }

    if (data.user) {
      await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          full_name,
          role,
        })

      await supabase
        .from('activity_logs')
        .insert({
          user_id: currentUser.id,
          action: 'CREATE_USER',
          entity_type: 'user',
          entity_id: data.user.id,
          details: { email, role },
        })
    }

    return apiSuccess({ user: data.user }, 201)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return apiError(JSON.stringify(err.format()), 400)
    }
    console.error('Register error:', err)
    return apiError('Internal server error', 500)
  }
}