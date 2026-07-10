'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Pill, Clock, Calendar, CheckCircle, XCircle, AlertCircle, Save, Stethoscope, FileText } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface Medication {
 id: string
 name: string
 dosage: string
 frequency: string
 times_of_day: string[]
 start_date: string
 end_date: string | null
 notes: string | null
 hospital_notes: string | null
 is_active: boolean
}

interface MedicationLog {
 id: string
 status: string
 scheduled_time: string
 taken_at: string | null
}

export default function MedicationDoctorViewPage() {
 const params = useParams()
 const router = useRouter()
 const medicationId = params.id as string

 const [medication, setMedication] = useState<Medication | null>(null)
 const [logs, setLogs] = useState<MedicationLog[]>([])
 const [loading, setLoading] = useState(true)

 const [hospitalNotes, setHospitalNotes] = useState("")
 const [savingNotes, setSavingNotes] = useState(false)
 const hasHydrated = useAuthStore(state => state._hasHydrated)

 const fetchData = async () => {
  try {
   const [medRes, logsRes] = await Promise.all([
    api.get(`/api/medications/${medicationId}`),
    api.get(`/api/medications/${medicationId}/logs?limit=50`)
   ])
   setMedication(medRes.data)
   setHospitalNotes(medRes.data.hospital_notes || "")
   setLogs(logsRes.data)
  } catch (error) {
   console.error(error)
   toast.error("Failed to load medication details")
  } finally {
   setLoading(false)
  }
 }

 useEffect(() => {
  if (hasHydrated) {
   fetchData()
  }
 }, [medicationId, hasHydrated])

 const handleSaveNotes = async () => {
  setSavingNotes(true)
  try {
   await api.put(`/api/medications/${medicationId}`, { hospital_notes: hospitalNotes })
   toast.success("Clinical notes updated successfully")
  } catch (error) {
   console.error(error)
   toast.error("Failed to save notes")
  } finally {
   setSavingNotes(false)
  }
 }

 const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`
 }

 const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
   weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  })
 }

 const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', {
   month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  })
 }

 if (loading) {
  return (
   <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[50vh]">
    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-muted-foreground font-medium">Loading clinical details...</p>
   </div>
  )
 }

 if (!medication) {
  return (
   <div className="flex-1 p-6 flex flex-col items-center justify-center">
    <AlertCircle size={48} className="text-rose-500 mb-4" />
    <h2 className="text-xl font-bold mb-2">Medication Not Found</h2>
    <button onClick={() => router.back()} className="text-sky-500 hover:underline">Go Back</button>
   </div>
  )
 }

 // Calculate quick stats
 const totalLogs = logs.length
 const takenLogs = logs.filter(l => l.status === 'taken').length
 const adherenceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 0

 return (
  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-background">
   <div className="max-w-4xl mx-auto space-y-6">
    
    {/* Header */}
    <div className="flex items-center gap-4 mb-6">
     <button onClick={() => router.back()} className="p-2 bg-card hover:bg-muted border border-border rounded-full transition-colors">
      <ArrowLeft size={20} />
     </button>
     <div>
      <h1 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
       Doctor View: {medication.name}
       {!medication.is_active && <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium ml-2">Inactive</span>}
      </h1>
      <p className="text-sm text-muted-foreground">Comprehensive medication adherence and clinical notes</p>
     </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
     {/* Left Column: Details & Notes */}
     <div className="lg:col-span-2 space-y-6">
      
      {/* Basic Info Card */}
      <motion.div 
       initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
       className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start"
      >
       <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center shrink-0">
        <Pill size={32} />
       </div>
       <div className="flex-1 space-y-4">
        <div>
         <h2 className="text-xl font-bold text-foreground">{medication.name}</h2>
         <p className="text-lg text-sky-600 dark:text-sky-400 font-medium">{medication.dosage}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={16} />
          <span>Started: {formatDate(medication.start_date)}</span>
         </div>
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={16} />
          <span>{medication.frequency}</span>
         </div>
        </div>

        {medication.times_of_day.length > 0 && (
         <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          {medication.times_of_day.map(t => (
           <span key={t} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold">
            {formatTime(t)}
           </span>
          ))}
         </div>
        )}
       </div>
      </motion.div>

      {/* Doctor / Hospital Notes (Editable) */}
      <motion.div 
       initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
       className="bg-card border border-border rounded-2xl p-6 shadow-sm border-l-4 border-l-amber-500"
      >
       <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-amber-600 dark:text-amber-500">
         <Stethoscope size={20} />
         Clinical & Hospital Notes
        </h3>
       </div>
       <p className="text-xs text-muted-foreground mb-4">These notes are stored specifically for doctors to understand the context of this prescription, previous dose adjustments, and specific hospital instructions.</p>
       
       <textarea
        value={hospitalNotes}
        onChange={(e) => setHospitalNotes(e.target.value)}
        placeholder="Enter clinical notes, dose adjustments, doctor instructions..."
        className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
       />
       
       <div className="flex justify-end mt-4">
        <button
         onClick={handleSaveNotes}
         disabled={savingNotes}
         className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
         {savingNotes ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
         Save Clinical Notes
        </button>
       </div>
      </motion.div>

     </div>

     {/* Right Column: Stats & Logs */}
     <div className="space-y-6">
      
      {/* Quick Stats */}
      <motion.div 
       initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
       className="bg-card border border-border rounded-2xl p-6 shadow-sm"
      >
       <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Adherence Overview</h3>
       
       <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32 flex items-center justify-center">
         <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="10" fill="none" />
          <circle 
           cx="50" cy="50" r="40" 
           className="stroke-emerald-500 transition-all duration-1000 ease-out" 
           strokeWidth="10" fill="none" 
           strokeDasharray="251.2" 
           strokeDashoffset={251.2 - (251.2 * adherenceRate) / 100}
           strokeLinecap="round"
          />
         </svg>
         <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{adherenceRate}%</span>
         </div>
        </div>
       </div>

       <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
         <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{takenLogs}</p>
         <p className="text-xs font-medium text-emerald-800 dark:text-emerald-500">Doses Taken</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-900/50">
         <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{totalLogs - takenLogs}</p>
         <p className="text-xs font-medium text-rose-800 dark:text-rose-500">Doses Missed</p>
        </div>
       </div>
      </motion.div>

      {/* Log History */}
      <motion.div 
       initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
       className="bg-card border border-border rounded-2xl p-6 shadow-sm flex-1"
      >
       <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        <FileText size={16} /> Recent Doses
       </h3>
       
       <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.length === 0 ? (
         <p className="text-sm text-muted-foreground italic text-center py-4">No doses logged yet.</p>
        ) : (
         logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/30">
           <div className={`mt-0.5 shrink-0
            ${log.status === 'taken' ? 'text-emerald-500' : ''}
            ${log.status === 'missed' ? 'text-rose-500' : ''}
            ${log.status === 'skipped' ? 'text-amber-500' : ''}
           `}>
            {log.status === 'taken' ? <CheckCircle size={18} /> : <XCircle size={18} />}
           </div>
           <div>
            <p className="text-sm font-bold text-foreground capitalize">{log.status}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(log.scheduled_time)}</p>
            {log.taken_at && log.status === 'taken' && (
             <p className="text-[10px] text-sky-600 dark:text-sky-400 mt-1">Logged at: {formatDateTime(log.taken_at)}</p>
            )}
           </div>
          </div>
         ))
        )}
       </div>
      </motion.div>

     </div>
    </div>

   </div>
  </div>
 )
}
