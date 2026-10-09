"use client"

import React from "react"
import { Link } from "@/i18n/routing"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface State {
  hasError: boolean
  errorMessage: string
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, errorMessage: "" }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, send to error tracking (Sentry etc.)
    console.error("[CareFlow ErrorBoundary]", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-xl p-8 sm:p-10 max-w-md w-full text-center">
            <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              We encountered an unexpected interface issue. Your clinical records and session remain completely secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() =>
                  this.setState({ hasError: false, errorMessage: "" })
                }
                className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <Link
                href={typeof window !== 'undefined' && window.location.pathname.includes('/doctor') ? '/doctor/dashboard' : '/dashboard'}
                className="flex items-center justify-center text-sm font-semibold text-foreground border border-border hover:bg-muted px-6 py-2.5 rounded-xl transition-all active:scale-98"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
