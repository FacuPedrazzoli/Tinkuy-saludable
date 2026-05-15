import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'

const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  tenantId: 'tenant-1',
}

const createWrapper = () => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(AuthProvider, null, children)
  }
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.cookie = ''
    global.fetch = vi.fn()
  })

  it('throws error when used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const throwsError = () => {
      const { result } = renderHook(() => useAuth())
      result.current
    }
    expect(throwsError).toThrow('useAuth must be used within an AuthProvider')
    consoleSpy.mockRestore()
  })

  it('provides initial loading state', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('returns user from cookie when auth_token exists', () => {
    document.cookie = 'auth_token=valid-token'
    document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(mockUser))}`

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('returns null user when cookie has invalid data', () => {
    document.cookie = 'auth_token=valid-token'
    document.cookie = 'auth_user=invalid-json'

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('logout clears user and cookies', async () => {
    document.cookie = 'auth_token=valid-token'
    document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(mockUser))}`

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
