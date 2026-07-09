import { cn } from '@/lib/utils'

interface AbnormalValueBadgeProps {
 status: 'normal' | 'low' | 'high' | 'borderline'
 label?: string
}

const STATUS_CONFIG = {
 normal: {
  classes: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
  label: 'Normal',
 },
 low: {
  classes: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
  label: 'Low',
 },
 high: {
  classes: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
  label: 'High',
 },
 borderline: {
  classes: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
  label: 'Borderline',
 },
}

export function AbnormalValueBadge({ status, label }: AbnormalValueBadgeProps) {
 const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.normal

 return (
  <span
   className={cn(
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
    cfg.classes
   )}
  >
   {label || cfg.label}
  </span>
 )
}
