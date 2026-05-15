'use client'

import { Component, ReactNode } from 'react'
import { captureException, setUserContext } from '@/lib/sentry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    const context = {
      componentStack: errorInfo.componentStack,
      digest: (error as Error & { digest?: string }).digest,
    }

    captureException(error, context)

    if (typeof window !== 'undefined') {
      const user = (window as Window & { __USER__?: { id?: string; email?: string; username?: string } }).__USER__
      if (user) {
        setUserContext(user)
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    this.props.onReset?.()
  }

  handleRetry = () => {
    this.handleReset()
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 font-display mb-4">
              Algo salió mal
            </h1>
            <p className="text-neutral-600 mb-8">
              Disculpá, parece que hubo un error. Estamos trabajando para solucionarlo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Intentar de nuevo
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-300 transition-colors"
              >
                Ir al inicio
              </button>
            </div>
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-neutral-500 cursor-pointer">Detalles del error</summary>
                <pre className="mt-2 p-3 bg-neutral-100 rounded-lg text-xs text-red-600 overflow-auto">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
