'use client'

import { useEffect, useState } from 'react'
import { FileText, Pill, Calendar, Shield, Loader2 } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface TimelineEvent {
  id: string
  event_type: string
  event_date: string
  title: string
  description: string
  reference_id: string | null
  reference_table: string | null
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  report: <FileText size={18} />,
  medication: <Pill size={18} />,
  followup: <Calendar size={18} />,
  insurance_query: <Shield size={18} />,
}

const EVENT_COLORS: Record<string, string> = {
  report: '#6366f1',
  medication: '#22c55e',
  followup: '#f59e0b',
  insurance_query: '#3b82f6',
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [total, setTotal] = useState(0)
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(true)

  const loadTimeline = async () => {
    try {
      const res = await api.get('/api/timeline/?limit=50&offset=0')
      setEvents(res.data.events)
      setTotal(res.data.total)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const res = await api.get('/api/timeline/summary')
      setSummary(res.data.summary)
    } catch (e) {
      console.error(e)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    loadTimeline()
    loadSummary()
  }, [])

  const getEventLink = (event: TimelineEvent): string | null => {
    if (event.reference_table === 'reports' && event.reference_id) {
      return `/reports/${event.reference_id}`
    }
    if (event.reference_table === 'medications' && event.reference_id) {
      return `/medications`
    }
    return null
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  return (
    <div className="timeline-page">
      <div className="timeline-header">
        <h1>Health Timeline</h1>
        <p>Your complete health journey, automatically tracked</p>
      </div>

      {/* AI Summary Card */}
      <div className="timeline-summary-card">
        <h2>🤖 Your Health Journey</h2>
        {summaryLoading ? (
          <div className="summary-loading">
            <Loader2 size={18} className="spin" />
            <span>AI is summarizing your journey...</span>
          </div>
        ) : (
          <p>{summary}</p>
        )}
      </div>

      {/* Timeline Events */}
      <div className="timeline-events">
        {loading ? (
          <div className="timeline-loading">
            <Loader2 size={32} className="spin" />
            <p>Loading your timeline...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="timeline-empty">
            <Calendar size={48} />
            <h3>No events yet</h3>
            <p>Upload a report or add a medication to start your health timeline.</p>
          </div>
        ) : (
          <div className="timeline-list">
            <p className="timeline-count">{total} event{total !== 1 ? 's' : ''} recorded</p>
            {events.map((event, index) => {
              const link = getEventLink(event)
              const color = EVENT_COLORS[event.event_type] || '#6b7280'

              return (
                <div key={event.id} className="timeline-item">
                  <div className="timeline-connector">
                    <div className="timeline-dot" style={{ background: color }}>
                      <span style={{ color }}>{EVENT_ICONS[event.event_type] || <Calendar size={18} />}</span>
                    </div>
                    {index < events.length - 1 && <div className="timeline-line" />}
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-item-header">
                      <span className="timeline-type-badge" style={{ background: `${color}20`, color }}>
                        {event.event_type.replace('_', ' ')}
                      </span>
                      <span className="timeline-date">{formatDate(event.event_date)}</span>
                    </div>

                    <h3 className="timeline-title">
                      {link ? (
                        <Link href={link}>{event.title}</Link>
                      ) : (
                        event.title
                      )}
                    </h3>

                    {event.description && (
                      <p className="timeline-description">{event.description}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
