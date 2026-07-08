'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FileText, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react'
import api from '@/lib/api'
import { AbnormalValueBadge } from '@/components/reports/AbnormalValueBadge'
import { DoctorQuestions } from '@/components/reports/DoctorQuestions'
import { useAuthStore } from '@/store/authStore'

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
  } catch {
   alert('Failed to start re-analysis. Please try again.')
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
    try {
     const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
     const response = await fetch(`${API_BASE}/api/reports/${id}/progress`, {
      method: 'GET',
      headers: {
       Authorization: `Bearer ${token}`,
      },
      signal: controller.signal
     })

     if (!response.ok || !response.body) return

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
         api.get(`/api/reports/${id}`).then(res => setReport(res.data))
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
     if (err.name !== 'AbortError') {
      console.error('SSE Error:', err)
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
   <div className="report-detail-page">
    <div className="report-error">
     <AlertCircle size={48} />
     <h2>Report Not Found</h2>
     <p>{error}</p>
    </div>
   </div>
  )
 }

 if (!report || report.processing_status === 'pending' || report.processing_status === 'processing') {
  return (
   <div className="report-detail-page">
    <div className="report-processing">
     <div className="processing-spinner" />
      <h2>CareFlow AI is reading your report...</h2>
      <p>This usually takes 15–30 seconds. We&apos;re extracting the text and analyzing it for you.</p>
      {report?.processing_progress && (
        <div className="mt-4 text-sky-600 font-medium">
          {report.processing_progress}
        </div>
      )}
     <div className="processing-steps">
      <div className={`step ${report?.processing_status === 'processing' ? 'step--active' : 'step--waiting'}`}>
       📄 Reading document
      </div>
      <div className={`step ${report?.processing_status === 'processing' ? 'step--active' : 'step--waiting'}`}>
       🤖 Analyzing with AI
      </div>
      <div className="step step--waiting">✅ Results ready</div>
     </div>
     <div className="skeleton-container">
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--text" />
      <div className="skeleton skeleton--text skeleton--short" />
      <div className="skeleton-grid">
       {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton--card" />)}
      </div>
     </div>
    </div>
   </div>
  )
 }

 if (report.processing_status === 'failed') {
  return (
   <div className="report-detail-page">
    <div className="report-error">
     <AlertCircle size={48} />
     <h2>Processing Failed</h2>
     <p>We couldn&apos;t process this report. Please try uploading a clearer version.</p>
    </div>
   </div>
  )
 }

 const summaryText = extractSummary(report.ai_summary)
 const hasFullAnalysis = report.ai_highlights?.length > 0

 return (
  <div className="report-detail-page">
   {/* Header */}
   <div className="report-detail-header">
    <div className="report-detail-icon">
     <FileText size={28} />
    </div>
    <div>
     <h1 className="report-detail-title">{report.original_filename}</h1>
     <p className="report-detail-date">
      Uploaded {new Date(report.uploaded_at).toLocaleDateString('en-IN', {
       day: 'numeric', month: 'long', year: 'numeric'
      })}
     </p>
    </div>
    <div className="report-status-badge">
     <CheckCircle size={16} />
     Analysis Complete
    </div>
    <div className="flex flex-col sm:flex-row gap-2">
     <button
      onClick={() => {
       const dateStr = new Date(report.uploaded_at).toLocaleDateString()
       const query = encodeURIComponent(`Can you explain my recent report "${report.original_filename}" uploaded on ${dateStr}?`)
       router.push(`/chat?prefill=${query}`)
      }}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 rounded-lg font-semibold transition-colors dark:bg-sky-900/30 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-900/50"
     >
      <MessageSquare size={16} /> Ask AI
     </button>
     <button
      onClick={handleReanalyze}
      disabled={reanalyzing}
      className="reanalyze-btn"
     >
      {reanalyzing ? '⏳ Re-analyzing...' : '🔄 Re-analyze Report'}
     </button>
    </div>
   </div>

   {/* AI Summary */}
   {summaryText && (
    <div className="report-section report-summary-card">
     <h2>📋 AI Summary</h2>
     <p>{summaryText}</p>
    </div>
   )}

   {/* Key Highlights */}
   {report.ai_highlights?.length > 0 && (
    <div className="report-section">
     <h2>🔬 Key Highlights</h2>
     <div className="highlights-grid">
      {report.ai_highlights.map((h, i) => (
       <div key={i} className="highlight-card">
        <div className="highlight-header">
         <span className="highlight-label">{h.label}</span>
         <AbnormalValueBadge status={h.status} label={h.status} />
        </div>
        <div className="highlight-value">
         {h.value}
         {h.reference_range && <span className="text-muted-foreground text-sm font-normal ml-1">/ {h.reference_range}</span>}
        </div>
        <div className="highlight-note">{h.note}</div>
       </div>
      ))}
     </div>
    </div>
   )}

   {/* Abnormal Values */}
   {report.abnormal_values?.length > 0 && (
    <div className="report-section">
     <h2>⚠️ Values Outside Typical Range</h2>
     <div className="abnormal-list">
      {report.abnormal_values.map((av, i) => (
       <div key={i} className="abnormal-item">
        <div className="abnormal-item-header">
         <span className="abnormal-label">{av.label}</span>
         <span className="abnormal-value">
          {av.value}
          {av.reference_range && <span className="text-muted-foreground text-sm font-normal ml-1">/ {av.reference_range}</span>}
         </span>
         <AbnormalValueBadge status="high" label="Outside Range" />
        </div>
        <p className="abnormal-concern">{av.concern}</p>
       </div>
      ))}
     </div>
    </div>
   )}

   {/* Doctor Questions */}
   {report.questions_for_doctor?.length > 0 && (
    <div className="report-section">
     <DoctorQuestions questions={report.questions_for_doctor} />
    </div>
   )}

   {/* Nudge if nothing extra loaded yet */}
   {!hasFullAnalysis && !reanalyzing && summaryText && (
    <div className="report-section text-center text-slate-400 pt-4 mt-8 border-t border-slate-100 dark:border-slate-800">
     <p>👆 Click <strong>Re-analyze Report</strong> above to load Key Highlights, Abnormal Values and Doctor Questions.</p>
    </div>
   )}
  </div>
 )
}
