import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { CookieConsent } from '@/components/CookieConsent'

vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
})

describe('CookieConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    localStorage.getItem.mockReturnValue(null)
  })

  it('se muestra después de 1.5s si no hay consent', async () => {
    render(<CookieConsent />)
    
    expect(screen.queryByRole('region', { name: 'Consentimiento de cookies' })).not.toBeInTheDocument()
    
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    
    expect(screen.getByRole('region', { name: 'Consentimiento de cookies' })).toBeInTheDocument()
  })

  it('acceptAll() guarda consent y oculta banner', async () => {
    render(<CookieConsent />)
    
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    
    act(() => {
      fireEvent.click(screen.getByText('Aceptar todas'))
    })
    
    expect(localStorage.setItem).toHaveBeenCalledWith('cookie-consent', 'all')
  })

  it('acceptEssential() guarda consent y oculta banner', async () => {
    render(<CookieConsent />)
    
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    
    act(() => {
      fireEvent.click(screen.getByText('Solo esenciales'))
    })
    
    expect(localStorage.setItem).toHaveBeenCalledWith('cookie-consent', 'essential')
  })

  it('no se muestra si ya existe consent', async () => {
    localStorage.getItem.mockReturnValue('all')
    
    render(<CookieConsent />)
    
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    
    expect(screen.queryByRole('region', { name: 'Consentimiento de cookies' })).not.toBeInTheDocument()
  })
})
