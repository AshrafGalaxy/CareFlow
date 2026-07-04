"use client"

import { Link } from "@/i18n/routing"
import { UploadCloud, FileText, Pill, CalendarDays, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getGreeting, formatRelativeTime } from "@/lib/formatters"
import api from "@/lib/api"
import { API_ROUTES, APP_ROUTES, type ReportStatus } from "@/lib/constants"

import useSWR from "swr"
import { Skeleton } from "@/components/ui/skeleton"

interface Report {
  id: string
  original_filename: string
  processing_status: ReportStatus
  uploaded_at: string
}

const fetcher = (url: string) => api.get(url).then(res => res.data)

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const firstName = user?.name?.split(" ")[0] || "there"
  const greeting = getGreeting()

  const { data, error, isLoading } = useSWR<Report[]>(
    API_ROUTES.REPORTS.LIST, 
    fetcher, 
    { refreshInterval: 0, revalidateOnFocus: true }
  )

  const reports = data?.slice(0, 3) || []

  const statCards = [
    {
      icon: FileText,
      label: "Reports Uploaded",
      value: isLoading ? "—" : String(reports.length),
      sub: reports.length > 0 ? `Last uploaded ${formatRelativeTime(reports[0]?.uploaded_at)}` : "No reports yet",
      iconColor: "text-sky-500",
      iconBg: "bg-sky-50",
    },
    {
      icon: Pill,
      label: "Medications Today",
      value: "—",
      sub: "Available in Phase 2",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
    },
    {
      icon: CalendarDays,
      label: "Next Appointment",
      value: "—",
      sub: "Available in Phase 2",
      iconColor: "text-violet-500",
      iconBg: "bg-violet-50",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {greeting}, {firstName}
          </h1>
          <p className="text-slate-500 text-sm">Here&apos;s your health overview for today.</p>
        </div>
        <Link
          href={APP_ROUTES.REPORT_UPLOAD}
          className="btn-glow hidden sm:flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors duration-200 shrink-0"
        >
          <UploadCloud className="h-4 w-4" />
          Upload Report
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className={`h-10 w-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
            <p className="text-xs text-slate-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Recent Reports</h2>
          <Link
            href={APP_ROUTES.REPORTS}
            className="text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="px-6 py-5 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description="Upload your first lab report and CareFlow AI will translate it into plain language."
            action={
              <Link
                href={APP_ROUTES.REPORT_UPLOAD}
                className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-200"
              >
                <UploadCloud className="h-4 w-4" />
                Upload Your First Report
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={APP_ROUTES.REPORT_DETAIL(report.id)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {report.original_filename}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatRelativeTime(report.uploaded_at)}
                  </p>
                </div>
                <StatusBadge status={report.processing_status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={APP_ROUTES.REPORT_UPLOAD}
          className="btn-glow flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors duration-200 flex-1"
        >
          <UploadCloud className="h-4 w-4" />
          Upload New Report
        </Link>
        <Link
          href={APP_ROUTES.CHAT}
          className="flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-600 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 flex-1"
        >
          Chat with AI Assistant
        </Link>
      </div>
    </div>
  )
}
