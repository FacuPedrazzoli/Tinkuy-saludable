import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiSuccess, apiError } from '@/lib/apiResponse'
import { validateCSRF, csrfError } from '@/lib/csrf'

type Params = Promise<{ id: string }>

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  if (!validateCSRF(request)) {
    return csrfError()
  }

  try {
    const supabase = await createClient()
    const { id } = await params

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

    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', id)

    if (error) {
      return apiError(error.message, 400)
    }

    return apiSuccess({ success: true })
  } catch (err) {
    console.error('Product image DELETE error:', err)
    return apiError('Internal server error', 500)
  }
}
