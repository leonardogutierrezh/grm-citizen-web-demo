'use client'

import React from 'react'

type Props = {
  children: React.ReactNode
  onReset?: () => void
  resetKey?: string
}

type State = {error: Error | null}

// Without this, any render error anywhere in a screen leaves the whole app
// frozen (DOM stays, handlers detached) — which looks like "buttons stopped
// working". This catches it and offers a recovery action instead.
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {error: null}
  }

  static getDerivedStateFromError(error: Error): State {
    return {error}
  }

  componentDidUpdate(prev: Props) {
    // Auto-clear the error when navigating to a different screen.
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({error: null})
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Screen render error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#f8fafc] px-8 text-center">
          <p className="text-lg font-bold text-[#1f2937]">
            Something went wrong
          </p>
          <p className="text-sm text-[#707070]">
            {this.state.error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({error: null})
              this.props.onReset?.()
            }}
            className="rounded-[10px] bg-[#24c38b] px-6 py-3 text-base font-semibold text-white"
          >
            Go to Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
