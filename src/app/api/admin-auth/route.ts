import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (data.user) {
      console.log('User logged in:', data.user.id)

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single()

      console.log('Profile query result:', { profile, profileError })

      if (profileError) {
        console.error('Profile error:', profileError)
      }

      if (!profile) {
        console.log('No profile found for user id:', data.user.id)
        await supabase.auth.signOut()
        return NextResponse.json(
          { error: 'Usuario no encontrado en la base de datos. Ejecutá el SQL para crear el usuario admin.' },
          { status: 403 }
        )
      }

      if (!['owner', 'admin', 'editor'].includes(profile.role)) {
        console.log('User role is:', profile.role)
        await supabase.auth.signOut()
        return NextResponse.json(
          { error: 'No tienes permisos de administrador. Rol: ' + profile.role },
          { status: 403 }
        )
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
      return NextResponse.json({ error: 'Email y password son requeridos' }, { status: 400 })
    }
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE() {
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}