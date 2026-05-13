import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeHtml } from '@/lib/utils'
import { apiSuccess, apiError } from '@/lib/apiResponse'
import { validateCSRF, csrfError } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  if (!validateCSRF(request)) {
    return csrfError()
  }

  try {
    const body = await request.json()
    const { name, email, phone, message } = body

    if (!name || !email || !message) {
      return apiError('Faltan campos requeridos', 400)
    }

    const useSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (useSupabase) {
      const supabase = await createClient()
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: sanitizeHtml(name),
          email: sanitizeHtml(email),
          phone: phone ? sanitizeHtml(phone) : null,
          message: sanitizeHtml(message)
        })

      if (error) {
        console.error('Supabase contact error:', error)
        return apiError('Error al guardar el mensaje', 500)
      }
    } else {
      console.log('Contact form submission (mock):', { name: sanitizeHtml(name), email: sanitizeHtml(email), phone: phone ? sanitizeHtml(phone) : null, message: sanitizeHtml(message) })
    }

    return apiSuccess({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return apiError('Error interno del servidor', 500)
  }
}