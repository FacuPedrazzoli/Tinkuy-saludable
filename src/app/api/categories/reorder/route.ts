import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const reorderSchema = z.object({
  categories: z.array(z.object({
    id: z.string().uuid(),
    sort_order: z.number(),
  })),
})

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = reorderSchema.parse(body)

    const supabase = await createClient()

    for (const cat of validated.categories) {
      const { error } = await supabase
        .from('categories')
        .update({ sort_order: cat.sort_order })
        .eq('id', cat.id)

      if (error) {
        console.error('Error reordering category:', error)
        return NextResponse.json({ error: 'Error reordering' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.format() }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}