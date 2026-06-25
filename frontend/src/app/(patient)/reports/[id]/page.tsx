'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FileText, AlertCircle, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import { AbnormalValueBadge } from '@/components/reports/AbnormalValueBadge'
import { DoctorQuestions } from '@/components/reports/DoctorQuestions'

interface Highlight {
  label: string
  value: string
  status: 'normal' | 'low' | 'high' | 'borderline'
  note: string
}

interface AbnormalValue {
  label: string
  value: string
  concern: string
}

interface Report {
  id: string
  original_filename: string
  processing_status: string
  ai_summary: string | null
  ai_highlights: Highlight[]
  abnormal_values: AbnormalValue[]
  questions_for_doctor: string[]
  uploaded_at: string
  file_type: string
}

/** Safely extract plain-text summary from ai_summary field.
 *  Old reports may store raw JSON or ```json fences in this field. */
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
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reanalyzing, setReanalyzing] = useState(false)

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
    let interval: NodeJS.Timeout

    const fetchReport = async () => {
      try {
        const res = await api.get(`/api/reports/${id}`)
        const data: Report = res.data
        setReport(data)
        if (data.processing_status === 'done' || data.processing_status === 'failed') {
          clearInterval(interval)
          setReanalyzing(false)
        }
      } catch {
        setError('Could not load this report.')
        clearInterval(interval)
      }
    }

    fetchReport()
    interval = setInterval(fetchReport, 3000)
    return () => clearInterval(interval)
  }, [id])

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
        {/* Re-analyze button appears when highlights are missing (old/corrupted report) */}
        {!hasFullAnalysis && (
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="reanalyze-btn"
          >
            {reanalyzing ? '⏳ Re-analyzing...' : '🔄 Re-analyze Report'}
          </button>
        )}
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
                <div className="highlight-value">{h.value}</div>
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
                  <span className="abnormal-value">{av.value}</span>
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
        <div className="report-section" style={{textAlign:'center', color:'#94a3b8', paddingTop:'1rem'}}>
          <p>👆 Click <strong>Re-analyze Report</strong> above to load Key Highlights, Abnormal Values and Doctor Questions.</p>
        </div>
      )}
    </div>
  )
}
