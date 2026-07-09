import type { ReportStatus } from "@/lib/constants"

const STATUS_CONFIG: Record<
 ReportStatus,
 { label: string; className: string; pulse?: boolean; dotColor?: string }
> = {
 done: {
  label: "Ready",
  className: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
  dotColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
 },
 processing: {
  label: "Processing",
  className: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
  pulse: true,
  dotColor: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]",
 },
 pending: {
  label: "Pending",
  className: "bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20",
 },
 failed: {
  label: "Failed",
  className: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20",
  dotColor: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]",
 },
}

interface StatusBadgeProps {
 status: ReportStatus
 className?: string
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
 const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending

 return (
  <span
   className={`
    inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full shadow-sm
    ${config.className}
    ${className}
   `}
  >
   {config.dotColor && (
    <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor} ${config.pulse ? "animate-pulse" : ""}`} />
   )}
   {config.label}
  </span>
 )
}
