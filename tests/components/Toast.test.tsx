import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useToast, ToastContainer } from '@/components/Toast'

const TestComponent = () => {
  const toast = useToast()
  return (
    <div>
      <button onClick={() => toast.success('Success message')}>Add Success</button>
      <button onClick={() => toast.error('Error message')}>Add Error</button>
      <button onClick={() => toast.info('Info message')}>Add Info</button>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('addToast() agrega toast con id único', () => {
    const { container } = render(<TestComponent />)
    
    fireEvent.click(screen.getByText('Add Success'))
    
    const toasts = container.querySelectorAll('[role="alert"]')
    expect(toasts.length).toBe(1)
    expect(toasts[0]).toHaveTextContent('Success message')
  })

  it('auto-remove después de 5s', () => {
    const { container } = render(<TestComponent />)
    
    fireEvent.click(screen.getByText('Add Success'))
    
    expect(container.querySelectorAll('[role="alert"]').length).toBe(1)
    
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    
    expect(container.querySelectorAll('[role="alert"]').length).toBe(0)
  })

  it('muestra toast success', () => {
    const { container } = render(<TestComponent />)
    
    fireEvent.click(screen.getByText('Add Success'))
    
    const toast = container.querySelector('[role="alert"]')
    expect(toast).toHaveTextContent('Success message')
  })

  it('muestra toast error', () => {
    const { container } = render(<TestComponent />)
    
    fireEvent.click(screen.getByText('Add Error'))
    
    const toast = container.querySelector('[role="alert"]')
    expect(toast).toHaveTextContent('Error message')
  })

  it('muestra toast info', () => {
    const { container } = render(<TestComponent />)
    
    fireEvent.click(screen.getByText('Add Info'))
    
    const toast = container.querySelector('[role="alert"]')
    expect(toast).toHaveTextContent('Info message')
  })

  it('multiple toasts se muestran correctamente', () => {
    const { container } = render(<TestComponent />)
    
    fireEvent.click(screen.getByText('Add Success'))
    fireEvent.click(screen.getByText('Add Error'))
    
    expect(container.querySelectorAll('[role="alert"]').length).toBe(2)
  })
})
