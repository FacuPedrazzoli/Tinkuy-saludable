import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup, act } from '@testing-library/react'
import React from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

const TestComponent = ({ isActive }: { isActive: boolean }) => {
  const containerRef = useFocusTrap(isActive)
  return (
    <div ref={containerRef}>
      <button>First</button>
      <button>Second</button>
    </div>
  )
}

const TestComponentMultiple = ({ isActive }: { isActive: boolean }) => {
  const containerRef = useFocusTrap(isActive)
  return (
    <div ref={containerRef}>
      <button>First</button>
      <button>Second</button>
      <button>Last</button>
    </div>
  )
}

const TestComponentNoFocusable = ({ isActive }: { isActive: boolean }) => {
  const containerRef = useFocusTrap(isActive)
  return (
    <div ref={containerRef}>
      <span>No focusable elements</span>
    </div>
  )
}

const TestComponentSingle = ({ isActive }: { isActive: boolean }) => {
  const containerRef = useFocusTrap(isActive)
  return (
    <div ref={containerRef}>
      <button>Only One</button>
    </div>
  )
}

const TestComponentVariousTypes = ({ isActive }: { isActive: boolean }) => {
  const containerRef = useFocusTrap(isActive)
  return (
    <div ref={containerRef}>
      <input type="text" />
      <select><option>Option</option></select>
      <textarea></textarea>
      <a href="#">Link</a>
      <div tabIndex={0}>Focusable div</div>
    </div>
  )
}

describe('useFocusTrap', () => {
  beforeEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
  })

  describe('isActive=false', () => {
    it('does not focus any element when isActive is false', () => {
      const { container } = render(<TestComponent isActive={false} />)

      const button = container.querySelector('button')
      expect(document.activeElement).not.toBe(button)
    })

    it('does not add event listener when isActive is false', () => {
      const addEventListenerSpy = vi.spyOn(HTMLDivElement.prototype, 'addEventListener')

      render(<TestComponent isActive={false} />)

      expect(addEventListenerSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })
  })

  describe('isActive=true', () => {
    it('focuses first element when isActive becomes true', () => {
      const { container } = render(<TestComponent isActive={true} />)

      const button = container.querySelector('button')
      expect(document.activeElement).toBe(button)
    })

    it('adds event listener when isActive is true', () => {
      const addEventListenerSpy = vi.spyOn(HTMLDivElement.prototype, 'addEventListener')

      render(<TestComponent isActive={true} />)

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('handles container with no focusable elements', () => {
      const { container } = render(<TestComponentNoFocusable isActive={true} />)

      const span = container.querySelector('span')
      expect(document.activeElement).not.toBe(span)
    })
  })

  describe('Tab forward循环', () => {
    it('calls focus on first element when Tab pressed on last', () => {
      const focusSpy = vi.spyOn(HTMLButtonElement.prototype, 'focus')

      const { container } = render(<TestComponentMultiple isActive={true} />)

      const buttons = container.querySelectorAll('button')
      const lastButton = buttons[buttons.length - 1] as HTMLButtonElement
      const firstButton = buttons[0] as HTMLButtonElement

      act(() => {
        lastButton.focus()
      })

      act(() => {
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
        container.dispatchEvent(tabEvent)
      })

      expect(focusSpy).toHaveBeenCalledTimes(2)

      focusSpy.mockRestore()
    })

    it('does not call focus when Tab pressed on middle element', () => {
      const focusSpy = vi.spyOn(HTMLButtonElement.prototype, 'focus')

      const { container } = render(<TestComponentMultiple isActive={true} />)

      const buttons = container.querySelectorAll('button')
      const middleButton = buttons[1] as HTMLButtonElement

      act(() => {
        middleButton.focus()
      })

      const callCountBefore = focusSpy.mock.calls.length

      act(() => {
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
        container.dispatchEvent(tabEvent)
      })

      expect(focusSpy.mock.calls.length).toBe(callCountBefore)

      focusSpy.mockRestore()
    })
  })

  describe('Shift+Tab backward循环', () => {
    it('calls focus on last element when Shift+Tab pressed on first', () => {
      const focusSpy = vi.spyOn(HTMLButtonElement.prototype, 'focus')

      const { container } = render(<TestComponentMultiple isActive={true} />)

      const buttons = container.querySelectorAll('button')
      const firstButton = buttons[0] as HTMLButtonElement
      const lastButton = buttons[buttons.length - 1] as HTMLButtonElement

      act(() => {
        firstButton.focus()
      })

      act(() => {
        const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
        container.dispatchEvent(shiftTabEvent)
      })

      expect(focusSpy).toHaveBeenCalledTimes(2)

      focusSpy.mockRestore()
    })
  })

  describe('cleanup', () => {
    it('removes event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(HTMLDivElement.prototype, 'removeEventListener')

      const { unmount } = render(<TestComponent isActive={true} />)

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )

      removeEventListenerSpy.mockRestore()
    })
  })

  describe('edge cases', () => {
    it('ignores non-Tab key presses', () => {
      const focusSpy = vi.spyOn(HTMLButtonElement.prototype, 'focus')

      const { container } = render(<TestComponent isActive={true} />)

      const firstButton = container.querySelector('button') as HTMLButtonElement

      act(() => {
        firstButton.focus()
      })

      const callCountBefore = focusSpy.mock.calls.length

      act(() => {
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
        container.dispatchEvent(enterEvent)
      })

      expect(focusSpy.mock.calls.length).toBe(callCountBefore)

      focusSpy.mockRestore()
    })

    it('handles single focusable element', () => {
      const focusSpy = vi.spyOn(HTMLButtonElement.prototype, 'focus')

      const { container } = render(<TestComponentSingle isActive={true} />)

      const button = container.querySelector('button') as HTMLButtonElement

      act(() => {
        button.focus()
      })

      const callCountBefore = focusSpy.mock.calls.length

      act(() => {
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
        container.dispatchEvent(tabEvent)
      })

      expect(focusSpy.mock.calls.length).toBe(callCountBefore)

      focusSpy.mockRestore()
    })

    it('works with different focusable element types', () => {
      const { container } = render(<TestComponentVariousTypes isActive={true} />)

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      expect(focusableElements.length).toBe(5)
    })
  })
})
