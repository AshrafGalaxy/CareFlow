import type { LucideIcon } from "lucide-react"
import { FileText } from "lucide-react"

interface EmptyStateProps {
 icon?: LucideIcon
 title: string
 description?: string
 action?: React.ReactNode
}

export function EmptyState({
 icon: Icon = FileText,
 title,
 description,
 action,
}: EmptyStateProps) {
 return (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
   <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
    <Icon className="h-8 w-8 text-slate-400" />
   </div>
   <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
   {description && (
    <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-6">{description}</p>
   )}
   {action && <div>{action}</div>}
  </div>
 )
}
