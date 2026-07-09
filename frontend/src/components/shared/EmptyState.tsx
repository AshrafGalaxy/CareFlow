import type { LucideIcon } from "lucide-react"
import { FileText } from "lucide-react"
import { motion } from "framer-motion"

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
   <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
    transition={{ 
     opacity: { duration: 0.3 },
     scale: { duration: 0.3, type: "spring" },
     y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.2 } 
    }}
    className="h-16 w-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-5 shadow-sm"
   >
    <Icon className="h-8 w-8 text-muted-foreground/70" />
   </motion.div>
   <motion.h3 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="text-base font-semibold text-foreground mb-2"
   >
    {title}
   </motion.h3>
   {description && (
    <motion.p 
     initial={{ opacity: 0, y: 10 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ delay: 0.2 }}
     className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6"
    >
     {description}
    </motion.p>
   )}
   {action && (
    <motion.div
     initial={{ opacity: 0, y: 10 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ delay: 0.3 }}
    >
     {action}
    </motion.div>
   )}
  </div>
 )
}
