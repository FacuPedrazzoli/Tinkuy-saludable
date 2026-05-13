import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError } from '@/lib/apiResponse'
import { validateCSRF, csrfError } from '@/lib/csrf'

export async function POST(request: NextRequest) {
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

    if (!adminUser || !['owner', 'admin', 'editor'].includes(adminUser.role)) {
      return apiError('Forbidden', 403)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return apiError('No file provided', 400)
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return apiError('Invalid file type', 400)
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return apiError('File too large (max 5MB)', 400)
    }

    const ext = file.type.split('/')[1] || 'webp'
    const baseName = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/\s+/g, '-')
    const fileName = `${baseName}-${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        cacheControl: '31536000',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return apiError(error.message, 500)
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)

    return apiSuccess({ url: urlData.publicUrl, path: data.path })
  } catch (err) {
    console.error('Upload error:', err)
    return apiError('Internal server error', 500)
  }
}
