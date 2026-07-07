'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Search, Calendar, ChevronRight, MessageSquare } from 'lucide-react'
import api from '@/lib/api'
import useSWR from 'swr'
import { Skeleton } from '@/components/ui/skeleton'

interface Report {
 id: string
 original_filename: string
 uploaded_at: string
 processing_status: string
 ai_summary: string
}

const fetcher = (url: string) => api.get(url).then(res => res.data)

export default function ReportsListPage() {
 const router = useRouter()
 const { data: reports, error, isLoading } = useSWR<Report[]>(
  '/api/reports',
  fetcher,
  { refreshInterval: 0, revalidateOnFocus: true }
 )

 return (
  <div className="max-w-6xl mx-auto space-y-6">
   {/* Header */}
   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
     <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">My Reports</h1>
     <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and analyze your medical laboratory reports</p>
    </div>
    <Link 
     href="/reports/upload" 
     className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all duration-200"
    >
     <Plus size={18} />
     Upload New Report
    </Link>
   </div>

   {/* Reports List */}
   <div className="bg-card rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
     <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input 
       type="text" 
       placeholder="Search reports..." 
       className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
      />
     </div>
    </div>

    {isLoading ? (
     <div className="divide-y divide-slate-100">
      {[1, 2, 3].map((i) => (
       <div key={i} className="flex items-center p-4 sm:p-5">
        <Skeleton className="h-12 w-12 rounded-xl shrink-0 mr-4" />
        <div className="flex-1 space-y-2">
         <Skeleton className="h-5 w-1/3" />
         <Skeleton className="h-4 w-1/4" />
        </div>
       </div>
      ))}
     </div>
    ) : !reports || reports.length === 0 ? (
     <div className="p-16 text-center">
      <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
       <FileText className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No reports uploaded yet</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">Upload your first lab report to get an AI-powered analysis and personalized health insights.</p>
      <Link 
       href="/reports/upload" 
       className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all"
      >
       Upload Report
      </Link>
     </div>
    ) : (
     <div className="divide-y divide-slate-100">
      {reports.map((report) => (
       <Link 
        key={report.id} 
        href={`/reports/${report.id}`}
        className="flex items-center p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
       >
        <div className="h-12 w-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shrink-0 mr-4 group-hover:scale-105 transition-transform">
         <FileText size={24} />
        </div>
        
        <div className="flex-1 min-w-0 pr-4">
         <h3 className="text-base font-semibold text-foreground truncate mb-1">
          {report.original_filename}
         </h3>
         <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
           <Calendar size={14} />
           {new Date(report.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          {report.processing_status === 'done' ? (
           <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded text-xs">Analyzed by AI</span>
          ) : report.processing_status === 'failed' ? (
           <span className="text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded text-xs">Processing Failed</span>
          ) : (
           <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded text-xs animate-pulse">Processing...</span>
          )}
         </div>
        </div>

        <div className="flex items-center gap-3">
         <button
          onClick={(e) => {
           e.preventDefault()
           e.stopPropagation()
           const dateStr = new Date(report.uploaded_at).toLocaleDateString()
           const query = encodeURIComponent(`Can you explain my recent report "${report.original_filename}" uploaded on ${dateStr}?`)
           router.push(`/chat?prefill=${query}`)
          }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 rounded-lg text-xs font-semibold transition-colors dark:bg-sky-900/30 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-900/50"
         >
          <MessageSquare size={14} /> Ask AI
         </button>
         <div className="text-slate-300 group-hover:text-sky-500 transition-colors">
          <ChevronRight size={20} />
         </div>
        </div>
       </Link>
      ))}
     </div>
    )}
   </div>
  </div>
 )
}
