import type { ReportStatus } from "@/lib/constants"

const STATUS_CONFIG: Record<
 ReportStatus,
 { label: string; className: string; pulse?: boolean }
> = {
 done: {
  label: "Done",
  className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
 },
 processing: {
  label: "Processing",
  className: "bg-amber-50 text-amber-700 border border-amber-200",
  pulse: true,
 },
 pending: {
  label: "Pending",
  className: "bg-slate-100 text-slate-600 border border-slate-200",
 },
 failed: {
  label: "Failed",
  className: "bg-red-50 text-red-700 border border-red-200",
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
    inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full
    ${config.className}
    ${config.pulse ? "badge-processing" : ""}
    ${className}
   `}
  >
   {config.pulse && (
    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
   )}
   {config.label}
  </span>
 )
}
