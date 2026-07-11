'use client'

import { useEffect, useState } from 'react'
import { FileText, Pill, Calendar, Shield, Loader2, RefreshCw, Beaker, Syringe, Package, Droplet, Clock, Activity, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface TimelineEvent {
 id: string
 event_type: string
 event_date: string
 title: string
 description: string
 reference_id: string | null
 reference_table: string | null
 created_at: string
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
 report: <FileText size={20} />,
 followup: <Calendar size={20} />,
 appointment: <Calendar size={20} />,
 insurance_query: <Shield size={20} />,
}

const getMedicationIcon = (description: string) => {
  const lower = description.toLowerCase();
  if (lower.includes('spoon') || lower.includes('tbsp') || lower.includes('tsp') || lower.includes('scoop')) return <Beaker size={20} />
  if (lower.includes('liquid') || lower.includes('drop') || lower.includes('syrup') || lower.match(/\bml\b/)) return <Droplet size={20} />
  if (lower.includes('packet') || lower.includes('sachet')) return <Package size={20} />
  if (lower.includes('injection') || lower.includes('ampoule')) return <Syringe size={20} />
  return <Pill size={20} />
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
 const [lastUpdated, setLastUpdated] = useState<string | null>(null)
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

 const loadSummary = async (forceRefresh = false) => {
  setSummaryLoading(true)
  try {
   const res = await api.get(`/api/timeline/summary?force_refresh=${forceRefresh}`)
   setSummary(res.data.summary)
   setLastUpdated(res.data.last_updated)
  } catch (e) {
   console.error(e)
  } finally {
   setSummaryLoading(false)
  }
 }

  const hasHydrated = useAuthStore(state => state._hasHydrated)

  useEffect(() => {
   if (hasHydrated) {
    loadTimeline()
    loadSummary()
   }
  }, [hasHydrated])

 const getEventLink = (event: TimelineEvent): string | null => {
  if (event.reference_table === 'reports' && event.reference_id) {
   return `/reports/detail/${event.reference_id}`
  }
  if (event.reference_table === 'medications' && event.reference_id) {
   return `/medications`
  }
  return null
 }

 const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
   day: 'numeric', month: 'short', year: 'numeric'
  })
 }

 const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString('en-IN', {
   hour: '2-digit', minute: '2-digit', hour12: true
  })
 }

  return (
   <div className="w-full space-y-8">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm">
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">Health Timeline</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your complete health journey, automatically tracked</p>
        </div>
      </div>
    </div>

    {/* AI Summary Card */}
    <div className="timeline-summary-card">
     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
       <h2 className="!mb-0 flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
         <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-sm">
          <Activity size={18} />
         </div> 
         Your Health Journey
       </h2>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-md">
            <Clock size={12} /> Last updated: {formatTime(lastUpdated)}
          </span>
        )}
        <button 
          onClick={() => loadSummary(true)} 
          disabled={summaryLoading}
          className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={summaryLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>
    </div>

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
   <div className="timeline-events relative">
    {loading ? (
     <div className="w-full">
      <div className="text-center mb-6 text-sm font-semibold text-sky-600 animate-pulse">Synchronizing timeline...</div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex w-full gap-5 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl skeleton shrink-0 z-10" />
            <div className="w-[2px] h-16 my-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
          </div>
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-6 w-1/3 skeleton rounded-md" />
            <div className="h-4 w-2/3 skeleton rounded-md" />
          </div>
        </div>
      ))}
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
        const color = EVENT_COLORS[event.event_type] || '#64748b'
        
        let icon = EVENT_ICONS[event.event_type] || <Calendar size={20} />
        if (event.event_type === 'medication') {
          icon = getMedicationIcon(event.description || '')
        }

        return (
         <div key={event.id} className="flex w-full gap-5 mb-8 group relative">
          <div className="flex flex-col items-center relative">
           {index < events.length - 1 && <div className="absolute top-12 bottom-[-2rem] left-1/2 -ml-[1px] w-[2px] border-l-2 border-dashed border-slate-300 dark:border-slate-700 group-hover:border-sky-300 dark:group-hover:border-sky-800 transition-colors duration-300 z-0" />}
           <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 z-10 relative" style={{ background: color }}>
            <span className="text-white">{icon}</span>
           </div>
          </div>

          <div className="flex-1 pb-4">
           <div className="timeline-item-header flex items-center gap-3 mb-2">
            <span className="timeline-type-badge text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md" style={{ background: `${color}15`, color }}>
             {event.event_type.replace('_', ' ')}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="timeline-date">{formatDate(event.event_date)}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>{formatTime(event.created_at)}</span>
            </div>
           </div>

           <h3 className="timeline-title text-lg font-bold text-slate-800 dark:text-slate-100 mb-1.5 group-hover:text-sky-600 transition-colors">
           {link ? (
            <Link href={link}>{event.title}</Link>
           ) : (
            event.title
           )}
          </h3>

           {event.description && (
            <p className="timeline-description text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mt-2 border border-slate-100 dark:border-slate-800">
              {event.description}
            </p>
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
