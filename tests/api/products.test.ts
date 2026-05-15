import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockRequest, createCSRFToken } from './helpers'

const mockSupabaseCreateClient = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockSupabaseCreateClient,
}))

const mockValidateCSRF = vi.fn()
const mockCSRFError = vi.fn()

vi.mock('@/lib/csrf', () => ({
  validateCSRF: mockValidateCSRF,
  csrfError: mockCSRFError,
  generateCSRFToken: () => 'test-token',
  setCSRFCookie: () => ({ headers: { 'Set-Cookie': 'csrf_token=test-token' } }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'csrf_token') return { value: 'valid-csrf-token-12345678901234567890123456789012' }
      return undefined
    }),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

describe('/api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateCSRF.mockReturnValue(true)
    mockCSRFError.mockReturnValue(
      new Response(JSON.stringify({ error: 'CSRF validation failed' }), { status: 403 })
    )
  })

  describe('GET', () => {
    it('returns products list', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          price: 100,
          slug: 'product-1',
          is_active: true,
          categories: { name: 'Category 1', slug: 'category-1' },
          product_images: [],
        },
      ]

      const queryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockProducts, error: null, count: 1 }),
      }

      mockSupabaseCreateClient.mockResolvedValue({
        from: vi.fn().mockReturnValue(queryBuilder),
      })

      const { GET } = await import('@/app/api/products/route')
      const request = createMockRequest('http://localhost:3000/api/products')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.products).toBeDefined()
    })

    it('filters products by category', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          category_id: 'cat-uuid',
          is_active: true,
          categories: { name: 'Category 1', slug: 'category-1' },
          product_images: [],
        },
      ]

      const queryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockProducts, error: null, count: 1 }),
      }

      mockSupabaseCreateClient.mockResolvedValue({
        from: vi.fn().mockReturnValue(queryBuilder),
      })

      const { GET } = await import('@/app/api/products/route')
      const request = createMockRequest('http://localhost:3000/api/products?category=cat-uuid')

      const response = await GET(request)

      expect(response.status).toBe(200)
    })

    it('searches products by name', async () => {
      const queryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
      }

      mockSupabaseCreateClient.mockResolvedValue({
        from: vi.fn().mockReturnValue(queryBuilder),
      })

      const { GET } = await import('@/app/api/products/route')
      const request = createMockRequest('http://localhost:3000/api/products?search=whey')

      const response = await GET(request)

      expect(response.status).toBe(200)
    })
  })

  describe('POST', () => {
    it('returns 403 without CSRF token', async () => {
      mockValidateCSRF.mockReturnValue(false)

      const { POST } = await import('@/app/api/products/route')
      const request = createMockRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: { name: 'Test' },
      })

      const response = await POST(request)

      expect(response.status).toBe(403)
    })

    it('returns 401 without auth', async () => {
      mockSupabaseCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      })

      const { POST } = await import('@/app/api/products/route')
      const csrfToken = createCSRFToken()
      const request = createMockRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: { name: 'Test' },
        cookies: { csrf_token: csrfToken },
        headers: { 'x-csrf-token': csrfToken },
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('returns 400 with invalid data', async () => {
      mockSupabaseCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-1' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
        }),
        insert: vi.fn().mockReturnThis(),
      })

      const { POST } = await import('@/app/api/products/route')
      const csrfToken = createCSRFToken()
      const request = createMockRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: { name: '' },
        cookies: { csrf_token: csrfToken },
        headers: { 'x-csrf-token': csrfToken },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })
})
