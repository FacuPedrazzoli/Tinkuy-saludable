import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ProtectedRoute } from '@/hooks/ProtectedRoute'

const mockUser = {
  id: '1',
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin',
  tenantId: '1',
}

const mockUseAuth = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

const TestComponent = () => <div>Protected Content</div>

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: vi.fn(),
      refreshSession: vi.fn(),
    })
  })

  it('isLoading=true muestra spinner', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      logout: vi.fn(),
      refreshSession: vi.fn(),
    })
    
    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    expect(screen.getByText('Verificando sesión...')).toBeInTheDocument()
  })

  it('no muestra children si no autenticado', () => {
    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('muestra children si autenticado', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      logout: vi.fn(),
      refreshSession: vi.fn(),
    })
    
    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('no muestra warning de timeout inicialmente', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      logout: vi.fn(),
      refreshSession: vi.fn(),
    })
    
    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )
    
    act(() => {
      vi.runAllTimers()
    })
    
    expect(screen.queryByText(/sesión expira/)).not.toBeInTheDocument()
  })
})
