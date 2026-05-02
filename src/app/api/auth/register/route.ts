import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
  role: z.enum(['admin', 'editor']).default('editor'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: currentProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (!currentProfile || currentProfile.role !== 'owner') {
    return NextResponse.json(
      { error: 'Solo el owner puede crear nuevos administradores' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { email, password, full_name, role } = registerSchema.parse(body)

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
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
      return NextResponse.json({ error: error.message }, { status: 400 })
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

    return NextResponse.json({ user: data.user }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.format() }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}