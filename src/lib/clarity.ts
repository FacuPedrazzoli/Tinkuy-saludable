declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void
  }
}

export function setUserId(userId: string): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('setUserId', userId)
  }
}

export function setCartValue(total: number): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('setCartValue', total)
  }
}

export function setCheckoutStep(step: number): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('setCheckoutStep', step)
  }
}

export function identifyUser(userId: string, attributes?: Record<string, string | number>): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('identify', userId, attributes)
  }
}

export function trackEvent(eventName: string, attributes?: Record<string, string | number>): void {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName, attributes)
  }
}
