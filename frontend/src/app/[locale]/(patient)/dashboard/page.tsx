"use client"

import { Link } from "@/i18n/routing"
import { UploadCloud, FileText, Pill, CalendarDays, ArrowRight, BrainCircuit, AlertCircle, CheckCircle, ThumbsUp, ThumbsDown, Calendar, FileDown, Eye, MessageSquare, Flame, Activity } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getGreeting, formatRelativeTime } from "@/lib/formatters"
import api from "@/lib/api"
import { API_ROUTES, APP_ROUTES, type ReportStatus } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useEffect, useRef, useState } from "react"

import useSWR from "swr"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"
import { BiomarkerTrends } from "@/components/dashboard/BiomarkerTrends"
import { ReportViewerModal } from "@/components/shared/ReportViewerModal"
import { motion } from "framer-motion"

 interface Report {
  id: string
  original_filename: string
  processing_status: ReportStatus
  uploaded_at: string
  ai_highlights?: any[]
  actionable_insights?: any[]
 file_url?: string
 file_type?: string
}

interface DashboardKPIs {
 medications_today_total: number
 medications_today_taken: number
 health_score: number
 action_items: {
  title: string
  description: string
  type: string
  action_url?: string
  action_label?: string
 }[]
 next_medication?: {
  id: string
  name: string
  scheduled_time: string
  status: string
 }
 next_appointment?: {
  id: string
  doctor_name: string
  specialty?: string
  appointment_date: string
  status: string
 }
}

const fetcher = (url: string) => api.get(url).then(res => res.data)

export default function DashboardPage() {
 const t = useTranslations("Dashboard")
 const user = useAuthStore((state) => state.user)
 const firstName = user?.name?.split(" ")[0] || "there"
 const greeting = t("greeting") || getGreeting()
 const [explainSimply, setExplainSimply] = useState(false)
 const [viewingReport, setViewingReport] = useState<Report | null>(null)

 const { data, error, isLoading, mutate } = useSWR<Report[]>(
  API_ROUTES.REPORTS.LIST, 
  fetcher, 
  { refreshInterval: 0, revalidateOnFocus: true }
 )

  const { data: kpiData, isLoading: kpiLoading } = useSWR<DashboardKPIs>(
   API_ROUTES.DASHBOARD.KPIS,
   fetcher,
   { refreshInterval: 60000, revalidateOnFocus: true }
  )

  const notifiedMedication = useRef<string | null>(null)

  useEffect(() => {
    if (kpiData?.next_medication && kpiData.next_medication.id !== notifiedMedication.current) {
      const medTime = new Date(kpiData.next_medication.scheduled_time)
      const now = new Date()
      const diffMinutes = (medTime.getTime() - now.getTime()) / (1000 * 60)
      
      // If medication is due in the next 30 minutes, or slightly overdue
      if (diffMinutes <= 30 && diffMinutes > -60) {
        toast("Medication Reminder", {
          description: `It's time to take your ${kpiData.next_medication.name}.`,
          duration: 10000,
          icon: <Pill className="w-5 h-5 text-emerald-500" />
        })
        notifiedMedication.current = kpiData.next_medication.id
      }
    }
  }, [kpiData?.next_medication])

  const reports = data?.slice(0, 3) || []

  // Dynamic Medications Logic
  const medTotal = kpiData?.medications_today_total || 0
  const medTaken = kpiData?.medications_today_taken || 0
  const medProgress = medTotal > 0 ? (medTaken / medTotal) * 100 : 0
  let medSub = "No medications scheduled today"
  if (kpiData?.next_medication) {
    const time = new Date(kpiData.next_medication.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    medSub = `Next: ${kpiData.next_medication.name} at ${time}`
  } else if (medTotal > 0 && medTaken === medTotal) {
    medSub = "All medications taken today!"
  }

  // Dynamic Appointment Logic
  let apptValue = "—"
  let apptSub = "No upcoming appointments"
  let apptUrgent = false
  if (kpiData?.next_appointment) {
    const apptDate = new Date(kpiData.next_appointment.appointment_date)
    const now = new Date()
    const diffHours = (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 24 && diffHours > 0) {
      apptValue = "Tomorrow"
      apptUrgent = true
    } else if (diffHours <= 0) {
      apptValue = "Today"
      apptUrgent = true
    } else {
      apptValue = apptDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }
    
    const time = apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    apptSub = `Dr. ${kpiData.next_appointment.doctor_name} • ${time}`
  }

   const statCards = [
    {
     icon: Activity,
     label: "Health Score",
     value: kpiLoading ? "—" : `${kpiData?.health_score || 0}`,
     sub: "Based on recent data",
     iconColor: "text-indigo-500 dark:text-indigo-400",
     iconBg: "bg-indigo-50 dark:bg-indigo-900/30",
     progress: kpiData?.health_score,
    },
    {
     icon: FileText,
     label: "Reports Uploaded",
     value: isLoading ? "—" : String(reports.length),
     sub: reports.length > 0 ? `Last uploaded ${formatRelativeTime(reports[0]?.uploaded_at)}` : "No reports yet",
     iconColor: "text-sky-500 dark:text-sky-400",
     iconBg: "bg-sky-50 dark:bg-sky-900/30",
    },
   {
    icon: Pill,
    label: "Medications Today",
    value: kpiLoading ? "—" : `${medTaken} / ${medTotal}`,
    sub: medSub,
    iconColor: "text-emerald-500 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
    progress: medTotal > 0 ? medProgress : undefined,
   },
   {
    icon: CalendarDays,
    label: "Next Appointment",
    value: kpiLoading ? "—" : apptValue,
    sub: apptSub,
    iconColor: "text-violet-500 dark:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-900/30",
    urgent: apptUrgent,
   },
  ]

 return (
  <div className="space-y-8">
   {/* Dynamic Action Items */}
   {!kpiLoading && kpiData?.action_items && kpiData.action_items.length > 0 && (
    <div className="space-y-3">
     {kpiData.action_items.map((item, idx) => (
      <div key={idx} className={cn(
       "border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden",
       item.type === 'warning' ? "bg-rose-500/10 border-rose-500/20" : "bg-amber-500/10 border-amber-500/20"
      )}>
       <div className="absolute top-0 right-0 p-4 opacity-10">
        <AlertCircle className={cn("w-24 h-24", item.type === 'warning' ? "text-rose-500" : "text-amber-500")} />
       </div>
       <div className="flex items-center gap-3 relative z-10">
        <div className={cn("p-2.5 rounded-xl", item.type === 'warning' ? "bg-rose-500/20" : "bg-amber-500/20")}>
         <Flame className={cn("w-5 h-5 animate-pulse", item.type === 'warning' ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400")} />
        </div>
        <div>
         <h3 className={cn("text-sm font-bold", item.type === 'warning' ? "text-rose-600 dark:text-rose-400" : "text-amber-700 dark:text-amber-500")}>
          {item.title}
         </h3>
         <p className={cn("text-sm font-medium", item.type === 'warning' ? "text-rose-600/80 dark:text-rose-400/80" : "text-amber-700/80 dark:text-amber-500/80")}>
          {item.description}
         </p>
        </div>
       </div>
       {item.action_label && (
        <button 
         onClick={() => {
          if (item.action_url) {
           window.location.href = item.action_url
          }
         }}
         className={cn(
          "text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0 relative z-10 shadow-sm",
          item.type === 'warning' ? "bg-rose-500 hover:bg-rose-600" : "bg-amber-500 hover:bg-amber-600"
         )}
        >
         {item.action_label}
        </button>
       )}
      </div>
     ))}
    </div>
   )}

   {/* Welcome Banner */}
   <div className="flex items-start justify-between gap-4">
    <div>
     <h1 className="text-2xl font-bold text-foreground mb-1">
      {greeting}, {firstName}
     </h1>
     <p className="text-muted-foreground text-sm">{t("welcomeText")}</p>
    </div>
    <Link
     href={APP_ROUTES.REPORT_UPLOAD}
     className="btn-glow hidden sm:flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors duration-200 shrink-0"
    >
     <UploadCloud className="h-4 w-4" />
     {t("uploadReportBtn")}
    </Link>
   </div>

   {/* Stat Cards */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    {statCards.map((stat, i) => (
     <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: i * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
     >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-500 blur-2xl ${stat.iconColor.split(' ')[0].replace('text-', 'bg-')}`} />
      <div className={`h-10 w-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300`}>
       <stat.icon className={`h-5 w-5 ${stat.iconColor} ${stat.urgent ? "animate-pulse" : ""}`} />
      </div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 relative z-10">
       {stat.label}
      </p>
      <div className="flex items-center justify-between gap-3 mb-2 relative z-10">
       <p className="text-3xl font-bold text-foreground">{stat.value}</p>
       {stat.progress !== undefined && (
        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
         <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" className="stroke-muted" strokeWidth="4" />
          <circle 
           cx="18" cy="18" r="14" fill="none" className="stroke-emerald-500 transition-all duration-1000 ease-out" 
           strokeWidth="4" strokeDasharray="88" strokeDashoffset={88 - (88 * stat.progress) / 100} strokeLinecap="round" 
          />
         </svg>
         <span className="absolute text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{Math.round(stat.progress)}%</span>
        </div>
       )}
      </div>
      <p className={cn("text-xs relative z-10 font-medium", stat.urgent ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground/80")}>
       {stat.sub}
      </p>
     </motion.div>
     ))}
    </div>

   {/* Doctor's Memo */}
   <div className="bg-amber-100/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-5 relative overflow-hidden shadow-sm group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
    <div className="flex items-start gap-4 relative z-10">
     <div className="bg-amber-500/20 p-2.5 rounded-xl shrink-0 mt-0.5">
      <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-500" />
     </div>
     <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
       <h3 className="text-sm font-bold text-amber-900 dark:text-amber-500">Note from Dr. Jenkins</h3>
       <span className="text-xs font-medium text-amber-700/60 dark:text-amber-500/60">2 hours ago</span>
      </div>
      <p className="text-sm text-amber-800/90 dark:text-amber-400/90 leading-relaxed italic">
       "I've reviewed your latest HbA1c results and they look fantastic. Let's stick with the current metformin dosage. Keep up the good work!"
      </p>
     </div>
    </div>
   </div>

   {/* Dynamic Biomarker Trends (Recharts) */}
   {!isLoading && data && data.length > 0 && (
    <BiomarkerTrends reports={data} />
   )}

   {/* Recent AI Insights */}
   {!isLoading && reports[0]?.processing_status === 'done' && (
    <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-md p-6 relative overflow-hidden">
     <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-10">
      <BrainCircuit className="w-48 h-48 text-foreground" />
     </div>
     <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
       <div className="flex items-center gap-2">
        <BrainCircuit className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h2 className="text-lg font-bold text-foreground">Latest AI Insights</h2>
        <span className="text-muted-foreground text-sm ml-2 hidden sm:inline">— from {reports[0].original_filename}</span>
       </div>
       <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border border-border">
         <span className="text-xs text-muted-foreground font-medium">Explain Simply</span>
         <button 
          onClick={() => setExplainSimply(!explainSimply)}
          className={cn("w-8 h-4 rounded-full relative transition-colors duration-200", explainSimply ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700")}
         >
          <span className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200", explainSimply ? "left-4" : "left-1")} />
         </button>
        </div>
       </div>
      </div>
      
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports[0].actionable_insights && reports[0].actionable_insights.length > 0 ? (
         reports[0].actionable_insights.map((insight, index) => {
          const isWarning = insight.type === 'action_required' || insight.type === 'warning'
          return (
           <div key={index} className="bg-muted/30 backdrop-blur-sm border border-border rounded-xl p-4 flex flex-col justify-between group">
            <div>
             <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
               {isWarning ? (
                <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
               ) : (
                <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
               )}
               <h3 className={cn("text-sm font-semibold", isWarning ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>
                {insight.title}
               </h3>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={async () => {
                 try {
                  await api.post(`/api/reports/${reports[0].id}/insights/${index}/feedback`, { feedback: 'up' })
                  toast.success("Feedback submitted. Thank you!")
                  mutate()
                 } catch (e) {
                  toast.error("Failed to submit feedback")
                 }
                }}
                className={cn("p-1 rounded hover:bg-muted transition-colors", insight.feedback === 'up' ? "text-emerald-500" : "text-muted-foreground hover:text-foreground")}
               >
                <ThumbsUp className="w-3.5 h-3.5" />
               </button>
               <button 
                onClick={async () => {
                 try {
                  await api.post(`/api/reports/${reports[0].id}/insights/${index}/feedback`, { feedback: 'down' })
                  toast.success("Feedback submitted. Thank you!")
                  mutate()
                 } catch (e) {
                  toast.error("Failed to submit feedback")
                 }
                }}
                className={cn("p-1 rounded hover:bg-muted transition-colors", insight.feedback === 'down' ? "text-rose-500" : "text-muted-foreground hover:text-foreground")}
               >
                <ThumbsDown className="w-3.5 h-3.5" />
               </button>
              </div>
             </div>
             <p className="text-sm text-foreground/80 leading-relaxed mb-4">
              {explainSimply ? insight.content_simple : insight.content_technical}
             </p>
            </div>
            {insight.action_label && (
             <button 
              onClick={() => toast.success(`Opening ${insight.action_label} scheduler...`)}
              className="mt-auto flex items-center justify-center gap-2 w-full py-2 bg-background border border-border hover:bg-muted rounded-lg text-sm font-medium transition-colors text-foreground"
             >
              {insight.action_label}
             </button>
            )}
           </div>
          )
         })
        ) : (
         <div className="col-span-1 sm:col-span-2 text-center py-6 text-muted-foreground text-sm">
          No actionable insights generated for this report yet.
         </div>
        )}
       </div>
     </div>
    </div>
   )}

   {/* Recent Reports */}
   <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
     <h2 className="text-base font-semibold text-foreground">{t("recentReports")}</h2>
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
      title={t("noReports")}
      description={t("uploadYourFirstReport")}
      action={
       <Link
        href={APP_ROUTES.REPORT_UPLOAD}
        className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-200"
       >
        <UploadCloud className="h-4 w-4" />
        {t("uploadReportBtn")}
       </Link>
      }
     />
    ) : (
      <div className="divide-y divide-border/50">
       {reports.map((report) => (
         <div
          key={report.id}
          className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/30 transition-all hover:shadow-[inset_4px_0_0_0_#0ea5e9] group"
         >
          <Link href={APP_ROUTES.REPORT_DETAIL(report.id)} className="flex items-center gap-4 flex-1 min-w-0 group-hover:translate-x-1 transition-transform">
           <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-red-500 dark:text-red-400" />
           </div>
           <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate group-hover:text-sky-500 transition-colors">
             {report.original_filename}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
             <p className="text-xs text-muted-foreground">
              {formatRelativeTime(report.uploaded_at)}
             </p>
             {report.actionable_insights && report.actionable_insights.length > 0 && (
               <>
                 <span className="w-1 h-1 rounded-full bg-border" />
                 <span className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 truncate flex items-center gap-1">
                   <BrainCircuit className="w-3 h-3" />
                   {report.actionable_insights.length} Insight{report.actionable_insights.length !== 1 ? 's' : ''}
                 </span>
               </>
             )}
            </div>
           </div>
         </Link>
         
         <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <Link 
            href={`${APP_ROUTES.CHAT}?prefill=${encodeURIComponent(`@${report.original_filename} Please provide a detailed, in-depth explanation of this lab report. Break down the key findings, highlight any abnormal values (like high or low markers), and explain what they mean for my health in simple, concise terms. What are the most important takeaways?`)}`}
            className="p-1.5 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors group/btn relative"
           >
            <BrainCircuit className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Ask AI</span>
           </Link>
           <button 
            onClick={(e) => {
             e.preventDefault()
             e.stopPropagation()
             setViewingReport(report)
            }}
            className="p-1.5 text-muted-foreground hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors group/btn relative"
           >
            <Eye className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">View PDF</span>
           </button>
          </div>
          
          <div className="w-24 flex justify-end">
           <StatusBadge status={report.processing_status} />
          </div>
         </div>
        </div>
       ))}
     </div>
    )}
   </div>


   {/* Floating AI Button */}
   <Link
    href={APP_ROUTES.CHAT}
    className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-full px-5 py-3 group"
   >
    <BrainCircuit className="w-5 h-5 group-hover:animate-pulse" />
    <span className="font-semibold text-sm">Ask CareFlow AI</span>
   </Link>

   {viewingReport && (
    <ReportViewerModal
     isOpen={!!viewingReport}
     onClose={() => setViewingReport(null)}
     fileUrl={viewingReport.file_url || ""}
     fileType={viewingReport.file_type || "application/pdf"}
     fileName={viewingReport.original_filename}
    />
   )}
  </div>
 )
}
