import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/apiResponse'
import { validateCSRF, csrfError } from '@/lib/csrf'
import { checkLoginRateLimit, getClientIP } from '@/lib/rateLimit'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const rateLimit = checkLoginRateLimit(ip)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Probá de nuevo en ' + Math.ceil(rateLimit.resetIn / 60000) + ' minutos.', code: 'RATE_LIMITED' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetIn),
          'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
        },
      }
    )
  }

  if (!validateCSRF(request)) {
    return csrfError()
  }

  try {
    const supabase = await createClient()

    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return apiError(error.message, 401)
    }

    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError.message)
      }

      if (!profile) {
        await supabase.auth.signOut()
        return apiError('Usuario no encontrado en la base de datos. Ejecutá el SQL para crear el usuario admin.', 403)
      }

      if (!['owner', 'admin', 'editor'].includes(profile.role)) {
        await supabase.auth.signOut()
        return apiError('No tienes permisos de administrador. Rol: ' + profile.role, 403)
      }

      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)

      await supabase
        .from('activity_logs')
        .insert({
          user_id: data.user.id,
          action: 'LOGIN',
          details: { email },
        })
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return apiError('Email y password son requeridos', 400)
    }
    console.error('Login error:', err)
    return apiError('Error interno del servidor', 500)
  }
}

export async function DELETE(request: NextRequest) {
  if (!validateCSRF(request)) {
    return csrfError()
  }

  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'LOGOUT',
        })
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      return apiError(error.message, 500)
    }

    return apiSuccess({ success: true })
  } catch (err) {
    console.error('Logout error:', err)
    return apiError('Internal server error', 500)
  }
}