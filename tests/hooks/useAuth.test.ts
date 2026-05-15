import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
    vi.useFakeTimers()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
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

  describe('logout', () => {
    it('clears user and cookies on successful logout', async () => {
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

    it('clears user even when fetch fails', async () => {
      document.cookie = 'auth_token=valid-token'
      document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(mockUser))}`

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('clears user when fetch throws', async () => {
      document.cookie = 'auth_token=valid-token'
      document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(mockUser))}`

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      consoleSpy.mockRestore()
    })
  })

  describe('refreshSession', () => {
    it('re-checks session when called', async () => {
      document.cookie = 'auth_token=valid-token'
      document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(mockUser))}`

      const wrapper = createWrapper()
      const { result, rerender } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toEqual(mockUser)

      document.cookie = 'auth_token=valid-token'
      document.cookie = 'auth_user=; path=/; max-age=0'

      await act(async () => {
        result.current.refreshSession()
      })

      expect(result.current.user).toBeNull()
    })

    it('updates user when auth_user cookie changes', async () => {
      document.cookie = 'auth_token=valid-token'
      document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(mockUser))}`

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAuth(), { wrapper })

      const newUser = { ...mockUser, email: 'new@example.com' }
      document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(newUser))}`

      await act(async () => {
        result.current.refreshSession()
      })

      expect(result.current.user).toEqual(newUser)
    })
  })

  describe('interval cleanup', () => {
    it('clears interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const wrapper = createWrapper()
      const { unmount } = renderHook(() => useAuth(), { wrapper })

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('sets up interval on mount', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval')

      const wrapper = createWrapper()
      renderHook(() => useAuth(), { wrapper })

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000)
    })
  })

  describe('parseAuthUser edge cases', () => {
    it('returns null for empty string', () => {
      document.cookie = 'auth_token=valid-token'
      document.cookie = 'auth_user='

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toBeNull()
    })

    it('returns null for whitespace only', () => {
      document.cookie = 'auth_token=valid-token'
      document.cookie = 'auth_user=   '

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toBeNull()
    })

    it('returns null for partial JSON', () => {
      document.cookie = 'auth_token=valid-token'
      document.cookie = 'auth_user={"id": "1", '

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toBeNull()
    })

    it('handles user with special characters in properties', () => {
      const specialUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'José',
        lastName: 'García',
        role: 'user',
        tenantId: 'tenant-1',
      }
      document.cookie = 'auth_token=valid-token'
      document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(specialUser))}`

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toEqual(specialUser)
    })

    it('returns null when auth_token exists but auth_user is missing', async () => {
      document.cookie = 'auth_token=valid-token'
      document.cookie = 'auth_user=; path=/; max-age=0'

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        result.current.refreshSession()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})
