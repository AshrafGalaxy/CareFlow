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
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
            <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              We ran into an unexpected error. Your data is safe — please try
              refreshing the page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() =>
                  this.setState({ hasError: false, errorMessage: "" })
                }
                className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <Link
                href="/dashboard"
                className="flex items-center justify-center text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-6 py-2.5 rounded-xl transition-all duration-200"
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
