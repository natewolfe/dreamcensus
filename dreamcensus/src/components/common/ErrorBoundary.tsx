'use client'

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Card, Button } from '@/components/ui'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to external service (e.g., Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.retry)
        }
        return this.props.fallback
      }

      // Default fallback
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md" padding="lg">
            <div className="text-center">
              <div className="mb-4 text-6xl">⚠️</div>
              <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
              <p className="mb-4 text-sm text-muted">
                We encountered an unexpected error. This has been logged and we'll look into it.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="mb-4 rounded-lg bg-subtle p-3 text-left">
                  <summary className="cursor-pointer text-sm font-medium">
                    Error details
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex gap-2 justify-center">
                <Button onClick={this.retry}>Try Again</Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = '/today'}
                >
                  Go Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

