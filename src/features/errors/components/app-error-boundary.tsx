import { Component, type ErrorInfo, type ReactNode } from 'react'

import { ServerErrorPage } from '@/features/errors/pages/server-error-page'
import { createErrorReference } from '@/features/errors/util/error-reference'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  error: Error | null
  reference: string | null
}

/** Catches render errors and shows the Tobu Admin 500 page. */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null, reference: null }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error, reference: createErrorReference() }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Admin render error', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <ServerErrorPage
          reference={this.state.reference ?? undefined}
          onRetry={() => {
            this.setState({ error: null, reference: null })
          }}
        />
      )
    }
    return this.props.children
  }
}
