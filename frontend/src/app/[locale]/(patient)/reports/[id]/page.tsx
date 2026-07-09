'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Link, useRouter } from '@/i18n/routing'
import { FileText, AlertCircle, CheckCircle, MessageSquare, BrainCircuit, ChevronLeft, RefreshCw, Activity, AlertTriangle } from 'lucide-react'
import api from '@/lib/api'
import { AbnormalValueBadge } from '@/components/reports/AbnormalValueBadge'
import { DoctorQuestions } from '@/components/reports/DoctorQuestions'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { useNotificationStore } from '@/store/notificationStore'

interface Highlight {
 label: string
 value: string
 reference_range?: string
 status: 'normal' | 'low' | 'high' | 'borderline'
 note: string
}

interface AbnormalValue {
 label: string
 value: string
 reference_range?: string
 concern: string
}

interface Report {
 id: string
 original_filename: string
 processing_status: string
 processing_progress?: string
 ai_summary: string | null
 ai_highlights: Highlight[]
 abnormal_values: AbnormalValue[]
 questions_for_doctor: string[]
 uploaded_at: string
 analyzed_at: string | null
 file_type: string
}

/** Safely extract plain-text summary from ai_summary field.
 * Old reports may store raw JSON or ```json fences in this field. */
function extractSummary(raw: string | null): string {
 if (!raw) return ''
 let text = raw.trim()
 try {
  // Strip markdown fences
  if (text.includes('```')) {
   const parts = text.split('```')
   text = parts[1] || ''
   if (text.toLowerCase().startsWith('json')) text = text.slice(4)
   text = text.trim()
  }
  // Try full JSON parse
  if (text.startsWith('{')) {
   try {
    const parsed = JSON.parse(text)
    return parsed.summary || raw
   } catch {
    // Truncated/invalid JSON — regex-extract the summary value
    const match = text.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)/)
    if (match) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
   }
  }
 } catch { /* fall through */ }
 return raw
}

export default function ReportDetailPage() {
 const { id } = useParams()
 const router = useRouter()
 const { token } = useAuthStore()
 const [report, setReport] = useState<Report | null>(null)
 const [error, setError] = useState<string | null>(null)
 const [reanalyzing, setReanalyzing] = useState(false)
 const abortControllerRef = useRef<AbortController | null>(null)

 const handleReanalyze = async () => {
  if (!id || reanalyzing) return
  setReanalyzing(true)
  try {
   await api.post(`/api/reports/${id}/reanalyze`)
   setReport(prev => prev ? { ...prev, processing_status: 'processing' } : prev)
   } catch (error: any) {
    const { toast } = await import('sonner')
    toast.error("Re-analysis Failed", {
     description: error.response?.data?.detail || 'Failed to start AI re-analysis. Please try again later.',
     icon: <AlertCircle className="w-5 h-5 text-red-500" />,
     className: "border-red-500/20 bg-red-50/50 dark:bg-red-950/20",
    })
    setReanalyzing(false)
   }
 }

 useEffect(() => {
  if (!id) return
  
  const fetchReport = async () => {
   try {
    const res = await api.get(`/api/reports/${id}`)
    setReport(res.data)
    if (res.data.processing_status === 'done' || res.data.processing_status === 'failed') {
     setReanalyzing(false)
    }
   } catch {
    setError('Could not load this report.')
   }
  }

  // Fetch immediately
  fetchReport()
 }, [id])

  // SSE Streaming for processing updates
  useEffect(() => {
   if (!id || !token) return
   if (report && (report.processing_status === 'done' || report.processing_status === 'failed')) {
    return
   }

   const controller = new AbortController()
   abortControllerRef.current = controller

   const listenToProgress = async () => {
    while (!controller.signal.aborted) {
     try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_BASE}/api/reports/${id}/progress`, {
       method: 'GET',
       headers: {
        Authorization: `Bearer ${token}`,
       },
       signal: controller.signal
      })

      if (!response.ok || !response.body) {
       await new Promise(r => setTimeout(r, 2000))
       continue
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
       const { done, value } = await reader.read()
       if (done) break

       const text = decoder.decode(value, { stream: true })
       const lines = text.split('\n')

       for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const dataStr = line.slice(6).trim()
        if (!dataStr) continue
        
        try {
         const data = JSON.parse(dataStr)
         setReport(prev => {
          if (!prev) return prev
          return {
           ...prev,
           processing_status: data.status || prev.processing_status,
           processing_progress: data.progress || prev.processing_progress
          }
         })
         
         if (data.status === 'done' || data.status === 'failed') {
          // Final fetch to get all generated data
          api.get(`/api/reports/${id}`).then(res => {
           setReport(res.data)
           if (data.status === 'done') {
            toast.success("Analysis Complete", {
             description: "CareFlow AI has finished analyzing your medical report.",
             icon: <BrainCircuit className="w-5 h-5 text-purple-500" />
            })
            useNotificationStore.getState().addNotification({
             title: "Analysis Complete",
             message: `AI has extracted insights from "${res.data.original_filename}".`,
             type: "system"
            })
           }
          })
          setReanalyzing(false)
          controller.abort()
          return
         }
        } catch (e) {
         // ignore parse error for chunks
        }
       }
      }
     } catch (err: any) {
      if (err.name === 'AbortError') return
      console.error('SSE Error:', err)
     }
     
     // Wait before attempting to reconnect
     if (!controller.signal.aborted) {
      await new Promise(r => setTimeout(r, 3000))
     }
    }
   }

   listenToProgress()

   return () => {
    controller.abort()
   }
  }, [id, token, report?.processing_status])

 if (error) {
  return (
   <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl text-center">
     <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
     <h2 className="text-xl font-heading font-bold text-foreground mb-2">Report Not Found</h2>
     <p className="text-slate-500 dark:text-slate-400">{error}</p>
    </div>
   </div>
  )
 }

 if (!report || report.processing_status === 'pending' || report.processing_status === 'processing' || report.processing_status === 'reanalyzing') {
  return (
   <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
    {/* Navigation Skeleton */}
    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />

    {/* Header Skeleton */}
    <div className="bg-card rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
     <div className="flex items-start gap-4 relative z-10">
      <div className="h-14 w-14 rounded-2xl shrink-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="space-y-3">
       <div className="h-7 w-48 sm:w-64 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
       <div className="flex gap-2">
        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
       </div>
      </div>
     </div>
     <div className="flex flex-col sm:flex-row gap-3 relative z-10">
      <div className="h-10 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="h-10 w-32 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
     </div>
    </div>

    {/* Dynamic Progress Indicator */}
    <div className="bg-gradient-to-br from-sky-50/80 to-white dark:from-sky-950/20 dark:to-slate-900 border border-sky-100 dark:border-sky-900/30 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-sm relative overflow-hidden">
     <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
     <div className="relative z-10 flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center mb-6">
       <div className="absolute inset-0 bg-sky-200 dark:bg-sky-800 blur-xl rounded-full opacity-50 animate-pulse" />
       <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-100 dark:border-sky-900 border-t-sky-500 relative z-10" />
       <Activity className="absolute text-sky-500 w-6 h-6 animate-pulse z-20" />
      </div>
      <h2 className="text-2xl font-heading font-bold text-sky-950 dark:text-sky-100 mb-3">
       {report?.processing_status === 'reanalyzing' ? 'Re-analyzing Report...' : 'CareFlow AI is analyzing your report...'}
      </h2>
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl py-3 px-6 inline-flex items-center gap-3 border border-sky-100/50 dark:border-sky-800/50 shadow-sm transition-all duration-300">
       <span className="text-sm font-medium text-sky-700 dark:text-sky-300 animate-pulse">
        {report?.processing_progress || "Initializing AI engine..."}
       </span>
      </div>
     </div>
    </div>

    {/* Summary Skeleton */}
    <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
     <div className="flex items-center gap-3 mb-2">
      <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
     </div>
     <div className="space-y-3">
      <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="h-4 w-[95%] rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="h-4 w-[90%] rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="h-4 w-[75%] rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
     </div>
    </div>
   </div>
  )
 }

 if (report.processing_status === 'failed') {
  return (
   <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl text-center">
     <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
     <h2 className="text-xl font-heading font-bold text-foreground mb-2">Processing Failed</h2>
     <p className="text-slate-500 dark:text-slate-400">We couldn&apos;t process this report. Please try uploading a clearer version.</p>
    </div>
   </div>
  )
 }

 const summaryText = extractSummary(report.ai_summary)
 const hasFullAnalysis = report.ai_highlights?.length > 0

  return (
   <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    {/* Navigation */}
    <Link 
     href="/reports" 
     className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
    >
     <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Reports
    </Link>

    {/* Header */}
    <div className="bg-card rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
     <div className="flex items-start gap-4">
      <div className="h-14 w-14 bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 rounded-2xl flex items-center justify-center shrink-0">
       <FileText size={28} />
      </div>
      <div>
       <h1 className="text-xl font-heading font-bold text-foreground break-all">{report.original_filename}</h1>
       <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
         <span className="font-medium text-slate-600 dark:text-slate-300">Uploaded:</span> 
         {new Date(report.uploaded_at).toLocaleString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
         })}
        </span>
        {report.analyzed_at && (
         <>
          <span className="text-slate-300 dark:text-slate-600 mx-1">•</span>
          <span className="flex items-center gap-1">
           <span className="font-medium text-slate-600 dark:text-slate-300">Analyzed:</span> 
           {new Date(report.analyzed_at).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
           })}
          </span>
         </>
        )}
        <span className="text-slate-300 dark:text-slate-600 mx-1">•</span>
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-0.5 rounded-full">
         <CheckCircle size={14} /> Analysis Complete
        </span>
       </div>
      </div>
     </div>
     <div className="flex flex-col sm:flex-row gap-3">
      <button
       onClick={() => {
        const dateStr = new Date(report.uploaded_at).toLocaleDateString()
        const query = encodeURIComponent(`@${report.original_filename} Please provide a detailed, in-depth explanation of this lab report. Break down the key findings, highlight any abnormal values (like high or low markers), and explain what they mean for my health in simple, concise terms. What are the most important takeaways?`)
        router.push(`/chat?prefill=${query}`)
       }}
       className="flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 rounded-lg text-sm font-medium transition-all dark:bg-sky-900/30 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-900/50"
      >
       <MessageSquare size={16} /> Ask AI
      </button>
      <button
       onClick={handleReanalyze}
       disabled={reanalyzing}
       className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
      >
       {reanalyzing ? (
        <><RefreshCw size={16} className="animate-spin" /> Re-analyzing...</>
       ) : (
        <><RefreshCw size={16} /> Re-analyze</>
       )}
      </button>
     </div>
    </div>

    {/* AI Summary */}
    {summaryText && (
     <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
       <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
        <BrainCircuit size={24} />
       </div>
       <h2 className="text-lg font-heading font-bold text-indigo-950 dark:text-indigo-50">AI Summary</h2>
      </div>
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
       {summaryText}
      </p>
     </div>
    )}

    {/* Key Highlights */}
    {report.ai_highlights?.length > 0 && (
     <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
       <Activity size={24} className="text-sky-500" />
       <h2 className="text-lg font-heading font-bold">Key Highlights</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
       {report.ai_highlights.map((h, i) => (
        <div key={i} className="bg-card border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
         <div>
          <div className="flex items-start justify-between gap-2 mb-3">
           <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm leading-tight">{h.label}</span>
           <AbnormalValueBadge status={h.status} label={h.status} />
          </div>
          <div className="text-xl font-bold text-foreground mb-2 flex items-baseline gap-1">
           {h.value}
           {h.reference_range && <span className="text-xs font-medium text-slate-400 dark:text-slate-500">/ {h.reference_range}</span>}
          </div>
         </div>
         <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-2 border-t border-slate-100 dark:border-slate-800 pt-3">{h.note}</div>
        </div>
       ))}
      </div>
     </div>
    )}

    {/* Abnormal Values */}
    {report.abnormal_values?.length > 0 && (
     <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
       <AlertTriangle size={24} className="text-red-500" />
       <h2 className="text-lg font-heading font-bold">Values Outside Typical Range</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {report.abnormal_values.map((av, i) => (
        <div key={i} className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-5 flex flex-col justify-between">
         <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
           <span className="font-bold text-red-950 dark:text-red-200 text-sm">{av.label}</span>
           <AbnormalValueBadge status="high" label="Outside Range" />
          </div>
          <div className="text-lg font-bold text-red-700 dark:text-red-400 mb-4 flex items-baseline gap-1">
           {av.value}
           {av.reference_range && <span className="text-xs font-medium text-red-400/70 dark:text-red-500/50">/ {av.reference_range}</span>}
          </div>
         </div>
         <p className="text-sm text-red-800/80 dark:text-red-200/70 leading-relaxed bg-red-100/50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200/50 dark:border-red-800/30">
          <span className="font-semibold block mb-1">AI Concern:</span>
          {av.concern}
         </p>
        </div>
       ))}
      </div>
     </div>
    )}

    {/* Doctor Questions */}
    {report.questions_for_doctor?.length > 0 && (
     <div className="pt-4">
      <DoctorQuestions questions={report.questions_for_doctor} />
     </div>
    )}

    {/* Nudge if nothing extra loaded yet */}
    {!hasFullAnalysis && !reanalyzing && summaryText && (
     <div className="text-center text-slate-500 dark:text-slate-400 p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50 dark:bg-slate-800/30">
      <p>👆 Click <strong>Re-analyze Report</strong> above to extract Key Highlights, Abnormal Values, and Doctor Questions.</p>
     </div>
    )}
   </div>
  )
}
