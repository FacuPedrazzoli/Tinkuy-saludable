import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockRequest, createCSRFToken } from './helpers'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  validateCSRF: vi.fn(),
  csrfError: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
}))

vi.mock('@/lib/csrf', () => ({
  validateCSRF: mocks.validateCSRF,
  csrfError: mocks.csrfError,
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

describe('/api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.validateCSRF.mockReturnValue(true)
    mocks.csrfError.mockReturnValue(
      new Response(JSON.stringify({ error: 'CSRF validation failed' }), { status: 403 })
    )
  })

  describe('GET', () => {
    it('returns 401 without auth', async () => {
      mocks.createClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
      })

      const { GET } = await import('@/app/api/orders/route')
      const request = createMockRequest('http://localhost:3000/api/orders')

      const response = await GET(request)

      expect(response.status).toBe(401)
    })
  })

  describe('POST', () => {
    const createQueryBuilder = () => {
      const qb = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
      }
      return qb
    }

    it('returns 422 with insufficient stock', async () => {
      const productsQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [{ id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Product 1', stock: 50 }],
          error: null,
        }),
      }

      mocks.createClient.mockResolvedValue({
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'products') {
            return productsQueryBuilder
          }
          return createQueryBuilder()
        }),
      })

      const { POST } = await import('@/app/api/orders/route')
      const csrfToken = createCSRFToken()
      const request = createMockRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: {
          customer_email: 'test@example.com',
          customer_name: 'Test User',
          items: [
            {
              product_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              product_name: 'Product 1',
              product_price: 100,
              quantity: 10,
              weight: 500,
              unit_price: 100,
              total_price: 100,
            },
          ],
          subtotal: 100,
          discount_amount: 0,
          shipping_cost: 0,
          total: 100,
          payment_method: 'transfer' as const,
          shipping_address: {
            street: 'Calle',
            number: '123',
            city: 'Ciudad',
            state: 'Estado',
            postal_code: '1234',
            country: 'Argentina',
          },
        },
        cookies: { csrf_token: csrfToken },
        headers: { 'x-csrf-token': csrfToken },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(422)
      expect(data.code).toBe('STOCK_INSUFFICIENT')
    })

    it('returns 201 on successful order', async () => {
      const mockOrder = {
        id: 'order-uuid',
        order_number: 'TNK-0001',
        customer_email: 'test@example.com',
        customer_name: 'Test User',
        status: 'pending',
        payment_status: 'pending',
        total: 100,
      }

      const productsQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [{ id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Product 1', stock: 5000 }],
          error: null,
        }),
      }

      const ordersInsertBuilder = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
      }

      const ordersQueryBuilder = {
        insert: vi.fn().mockReturnValue(ordersInsertBuilder),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      }

      mocks.createClient.mockResolvedValue({
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'products') {
            return productsQueryBuilder
          }
          if (table === 'orders') {
            return ordersQueryBuilder
          }
          if (table === 'customers') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
              insert: vi.fn().mockReturnThis(),
            }
          }
          if (table === 'order_items') {
            return {
              insert: vi.fn().mockResolvedValue({ data: [], error: null }),
            }
          }
          return createQueryBuilder()
        }),
      })

      const { POST } = await import('@/app/api/orders/route')
      const csrfToken = createCSRFToken()
      const request = createMockRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: {
          customer_email: 'test@example.com',
          customer_name: 'Test User',
          items: [
            {
              product_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              product_name: 'Product 1',
              product_price: 100,
              quantity: 1,
              weight: 250,
              unit_price: 100,
              total_price: 100,
            },
          ],
          subtotal: 100,
          discount_amount: 0,
          shipping_cost: 0,
          total: 100,
          payment_method: 'transfer' as const,
          shipping_address: {
            street: 'Calle',
            number: '123',
            city: 'Ciudad',
            state: 'Estado',
            postal_code: '1234',
            country: 'Argentina',
          },
        },
        cookies: { csrf_token: csrfToken },
        headers: { 'x-csrf-token': csrfToken },
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
    })
  })
})
