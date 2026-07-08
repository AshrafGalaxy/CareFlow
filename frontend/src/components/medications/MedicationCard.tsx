'use client'

import { useState, useEffect } from 'react'
import { Pill, CheckCircle, XCircle, Clock, MoreVertical, Trash2, Edit2, Undo2, FileText, ChevronRight } from 'lucide-react'
import api from '@/lib/api'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface Medication {
 id: string
 name: string
 dosage: string
 frequency: string
 times_of_day: string[]
 is_active: boolean
}

interface MedicationLog {
 id: string
 medication_id: string
 status: string
 scheduled_time: string
 taken_at?: string
}

interface MedicationCardProps {
 medication: Medication
 onLogSuccess?: () => void
}

export function MedicationCard({ medication, onLogSuccess }: MedicationCardProps) {
 const router = useRouter()
 const [logging, setLogging] = useState(false)
 const [todayLog, setTodayLog] = useState<MedicationLog | null>(null)
 const [loadingLogs, setLoadingLogs] = useState(true)

 useEffect(() => {
  const fetchRecentLogs = async () => {
   try {
    const res = await api.get(`/api/medications/${medication.id}/logs?limit=1`)
    const logs = res.data
    if (logs.length > 0) {
     // Check if the latest log was today
     const logDate = new Date(logs[0].scheduled_time).toDateString()
     const today = new Date().toDateString()
     if (logDate === today) {
      setTodayLog(logs[0])
     }
    }
   } catch (e) {
    console.error("Failed to fetch logs:", e)
   } finally {
    setLoadingLogs(false)
   }
  }

  if (medication.is_active) {
   fetchRecentLogs()
  } else {
   setLoadingLogs(false)
  }
 }, [medication.id, medication.is_active])

 const logDose = async (status: 'taken' | 'missed' | 'skipped') => {
  setLogging(true)
  try {
   const res = await api.post(`/api/medications/${medication.id}/log`, { status })
   setTodayLog(res.data)
   toast.success(`Dose marked as ${status}`)
   onLogSuccess?.()
  } catch (e) {
   toast.error("Failed to log dose")
   console.error(e)
  } finally {
   setLogging(false)
  }
 }

 const updateLog = async (status: 'taken' | 'missed' | 'skipped') => {
  if (!todayLog) return
  setLogging(true)
  try {
   const res = await api.put(`/api/medications/logs/${todayLog.id}`, { status })
   setTodayLog(res.data)
   toast.success(`Dose updated to ${status}`)
   onLogSuccess?.()
  } catch (e) {
   toast.error("Failed to update dose")
   console.error(e)
  } finally {
   setLogging(false)
  }
 }

 const handleDelete = async () => {
  if (confirm(`Are you sure you want to delete ${medication.name}?`)) {
   try {
    await api.delete(`/api/medications/${medication.id}`)
    toast.success("Medication deleted")
    onLogSuccess?.()
   } catch (e) {
    toast.error("Failed to delete medication")
    console.error(e)
   }
  }
 }

 const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
 }

 return (
  <div className={`bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group ${!medication.is_active ? 'opacity-60' : ''}`}>
   
   {/* Dropdown Menu for Edit/Delete */}
   <div className="absolute top-4 right-4 z-10">
    <DropdownMenu.Root>
     <DropdownMenu.Trigger asChild>
      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
       <MoreVertical size={16} />
      </button>
     </DropdownMenu.Trigger>

     <DropdownMenu.Portal>
      <DropdownMenu.Content 
       align="end" 
       className="min-w-[160px] bg-card border border-border rounded-lg shadow-xl p-1 z-[100] animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
      >
       <DropdownMenu.Item 
        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md cursor-pointer outline-none"
        onClick={() => router.push(`/medications/${medication.id}`)}
       >
        <FileText size={14} />
        View Details
       </DropdownMenu.Item>
       <DropdownMenu.Separator className="h-px bg-border my-1" />
       <DropdownMenu.Item 
        className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md cursor-pointer outline-none"
        onClick={handleDelete}
       >
        <Trash2 size={14} />
        Delete
       </DropdownMenu.Item>
      </DropdownMenu.Content>
     </DropdownMenu.Portal>
    </DropdownMenu.Root>
   </div>

   <div className="flex items-start gap-4 mb-4 pr-6">
    <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
     <Pill size={20} />
    </div>
    <div className="flex-1 min-w-0">
     <h3 className="font-semibold text-foreground text-lg truncate">{medication.name}</h3>
     <p className="text-sm text-muted-foreground truncate">{medication.dosage} · {medication.frequency}</p>
    </div>
   </div>

   {medication.times_of_day?.length > 0 && (
    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg mb-4">
     <Clock size={14} className="shrink-0 text-sky-500" />
     <span className="truncate">{medication.times_of_day.map(formatTime).join(', ')}</span>
    </div>
   )}

   {medication.is_active && (
    <div className="mt-4 pt-4 border-t border-border">
     <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-foreground">Today&apos;s dose</p>
      {todayLog && (
       <button 
        onClick={() => setTodayLog(null)} 
        className="text-xs flex items-center gap-1 text-muted-foreground hover:text-sky-500 transition-colors"
        title="Undo / Edit Log"
       >
        <Undo2 size={12} /> Edit
       </button>
      )}
     </div>

     {loadingLogs ? (
      <div className="h-[38px] flex items-center justify-center">
       <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
     ) : todayLog ? (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
       ${todayLog.status === 'taken' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' : ''}
       ${todayLog.status === 'missed' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900' : ''}
       ${todayLog.status === 'skipped' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900' : ''}
      `}>
       {todayLog.status === 'taken' && <><CheckCircle size={16} /> Marked as Taken</>}
       {todayLog.status === 'missed' && <><XCircle size={16} /> Marked as Missed</>}
       {todayLog.status === 'skipped' && <><XCircle size={16} /> Skipped</>}
      </div>
     ) : (
      <div className="grid grid-cols-3 gap-2">
       <button
        onClick={() => logDose('taken')}
        disabled={logging}
        className="flex items-center justify-center gap-1.5 py-2 px-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
       >
        <CheckCircle size={14} /> Taken
       </button>
       <button
        onClick={() => logDose('missed')}
        disabled={logging}
        className="flex items-center justify-center gap-1.5 py-2 px-1 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
       >
        <XCircle size={14} /> Missed
       </button>
       <button
        onClick={() => logDose('skipped')}
        disabled={logging}
        className="flex items-center justify-center gap-1.5 py-2 px-1 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
       >
        Skip
       </button>
      </div>
     )}
    </div>
   )}
   
  </div>
 )
}
