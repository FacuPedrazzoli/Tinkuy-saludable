import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const imageSchema = z.object({
  product_id: z.string().uuid(),
  url: z.string().url(),
  is_primary: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  alt_text: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || !['owner', 'admin', 'editor'].includes(adminUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
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
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.format() }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
