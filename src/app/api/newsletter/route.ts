import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError } from '@/lib/apiResponse'
import { validateCSRF, csrfError } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  if (!validateCSRF(request)) {
    return csrfError()
  }

  try {
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiError('Email inválido', 400)
    }

    const useSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (useSupabase) {
      const supabase = await createClient()
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email })

      if (error) {
        console.error('Newsletter subscription error:', error)
        return apiError('Error al suscribirse', 500)
      }
    }

    return apiSuccess({ success: true })
  } catch (err) {
    console.error('Newsletter API error:', err)
    return apiError('Error interno del servidor', 500)
  }
}