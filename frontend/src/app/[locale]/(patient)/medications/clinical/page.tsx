'use client'

import { useEffect, useState, useMemo } from 'react'
import { ArrowLeft, Clock, Save, FileText, CheckCircle, XCircle, AlertCircle, Loader2, Filter, Play, Square } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface Medication {
 id: string
 name: string
 dosage: string
 previous_dosage: string
 frequency: string
 is_active: boolean
 hospital_notes: string
}

interface MedicationLog {
 id: string
 medication_id: string
 scheduled_time: string
 taken_at: string | null
 status: 'taken' | 'missed' | 'skipped'
}

export default function ClinicalChartPage() {
 const [medications, setMedications] = useState<Medication[]>([])
 const [logs, setLogs] = useState<MedicationLog[]>([])
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState<string | null>(null) // medication ID being saved

 const [editData, setEditData] = useState<Record<string, { previous_dosage: string, hospital_notes: string }>>({})

 const [statusFilter, setStatusFilter] = useState('all')
 const [medFilter, setMedFilter] = useState('all')
 const [monthFilter, setMonthFilter] = useState('all')

 const availableMonths = useMemo(() => {
  const months = new Set<string>()
  logs.forEach(log => {
   months.add(format(parseISO(log.scheduled_time), 'MMMM yyyy'))
  })
  return Array.from(months).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
 }, [logs])

 const loadData = async () => {
  try {
   const [medsRes, logsRes] = await Promise.all([
    api.get('/api/medications/'),
    api.get('/api/medications/logs/all'),
   ])
   
   setMedications(medsRes.data)
   setLogs(logsRes.data)

   // Initialize edit state
   const initEdit: Record<string, any> = {}
   medsRes.data.forEach((med: Medication) => {
    initEdit[med.id] = {
     previous_dosage: med.previous_dosage || '',
     hospital_notes: med.hospital_notes || ''
    }
   })
   setEditData(initEdit)
  } catch (e) {
   console.error(e)
   toast.error("Failed to load clinical data")
  } finally {
   setLoading(false)
  }
 }

 useEffect(() => {
  loadData()
 }, [])

 const handleSave = async (id: string) => {
  setSaving(id)
  try {
   const dataToSave = editData[id]
   await api.put(`/api/medications/${id}`, dataToSave)
   toast.success("Clinical notes updated successfully")
  } catch (error) {
   console.error(error)
   toast.error("Failed to save updates")
  } finally {
   setSaving(null)
  }
 }

 const toggleActive = async (id: string, currentStatus: boolean) => {
  try {
   const newStatus = !currentStatus
   await api.put(`/api/medications/${id}`, { is_active: newStatus })
   setMedications(medications.map(m => m.id === id ? { ...m, is_active: newStatus } : m))
   toast.success(newStatus ? "Medication resumed successfully" : "Medication stopped successfully")
  } catch (error) {
   console.error(error)
   toast.error("Failed to change medication status")
  }
 }

 // Group logs by Month-Year
 const groupedLogs = useMemo(() => {
  const groups: Record<string, (MedicationLog & { medName: string })[]> = {}
  
  // Create a map for quick med name lookup
  const medMap = new Map(medications.map(m => [m.id, m.name]))

  // 1. Filter Logs
  const filteredLogs = logs.filter(log => {
   if (statusFilter !== 'all' && log.status !== statusFilter) return false
   if (medFilter !== 'all' && log.medication_id !== medFilter) return false
   if (monthFilter !== 'all' && format(parseISO(log.scheduled_time), 'MMMM yyyy') !== monthFilter) return false
   return true
  })

  // 2. Group
  filteredLogs.forEach(log => {
   const date = parseISO(log.scheduled_time)
   const monthKey = format(date, 'MMMM yyyy') // e.g., "July 2026"
   
   if (!groups[monthKey]) {
    groups[monthKey] = []
   }
   
   groups[monthKey].push({
    ...log,
    medName: medMap.get(log.medication_id) || 'Unknown Medication'
   })
  })

  // Sort logs within each month (newest first)
  Object.keys(groups).forEach(key => {
   groups[key].sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime())
  })

  // Sort months (newest first)
  const sortedMonths = Object.keys(groups).sort((a, b) => {
   return new Date(b).getTime() - new Date(a).getTime()
  })

  return { groups, sortedMonths }
 }, [logs, medications, statusFilter, medFilter, monthFilter])

 const renderMedication = (med: Medication) => (
  <div key={med.id} className={`bg-card border rounded-xl overflow-hidden shadow-sm transition-all ${med.is_active ? 'border-border' : 'border-dashed border-border opacity-75'}`}>
   <div className={`bg-slate-50 dark:bg-slate-900/50 px-5 py-4 border-b border-border flex items-center justify-between ${!med.is_active ? 'grayscale-[0.3]' : ''}`}>
    <div>
     <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
      {med.name}
      {!med.is_active && <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">Inactive</span>}
     </h3>
     <p className="text-sm text-muted-foreground">{med.frequency}</p>
    </div>
    <div className="text-right">
     <span className="block text-sm text-muted-foreground">{med.is_active ? 'Current Dose' : 'Previous Dose'}</span>
     <span className="font-bold text-sky-600 dark:text-sky-400">{med.dosage || 'Not specified'}</span>
    </div>
   </div>
   
   <div className={`p-5 space-y-4 ${!med.is_active ? 'grayscale-[0.3]' : ''}`}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Previous Dosage</label>
      <input
       type="text"
       placeholder="e.g. 10mg (before Jul 1)"
       value={editData[med.id]?.previous_dosage || ''}
       onChange={(e) => setEditData({
        ...editData,
        [med.id]: { ...editData[med.id], previous_dosage: e.target.value }
       })}
       className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-sky-500 outline-none"
      />
     </div>
     <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clinical Notes</label>
      <input
       type="text"
       placeholder="Doctor's notes..."
       value={editData[med.id]?.hospital_notes || ''}
       onChange={(e) => setEditData({
        ...editData,
        [med.id]: { ...editData[med.id], hospital_notes: e.target.value }
       })}
       className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-sky-500 outline-none"
      />
     </div>
    </div>
    
    <div className="flex justify-between items-center pt-2">
     <button
      onClick={() => toggleActive(med.id, med.is_active)}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
       ${med.is_active 
        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40' 
        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40'}
      `}
     >
      {med.is_active ? <><Square size={16} /> Stop Medication</> : <><Play size={16} /> Resume Medication</>}
     </button>
     <button
      onClick={() => handleSave(med.id)}
      disabled={saving === med.id}
      className="flex items-center justify-center gap-2 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
     >
      {saving === med.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      Save Record
     </button>
    </div>
   </div>
  </div>
 )

 if (loading) {
  return (
   <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-background">
    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-muted-foreground font-medium">Loading clinical chart...</p>
   </div>
  )
 }

 return (
  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-background">
   <div className="max-w-5xl mx-auto space-y-8">
    
    {/* Header */}
    <div className="flex items-center gap-4">
     <Link 
      href="/medications" 
      className="p-2 bg-card hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-border"
     >
      <ArrowLeft size={20} className="text-muted-foreground" />
     </Link>
     <div>
      <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight flex items-center gap-3">
       <FileText className="text-sky-500" size={28} />
       Clinical Hospital Chart
      </h1>
      <p className="text-muted-foreground mt-1">Unified medication record and historical adherence logs</p>
     </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
     
     {/* Left Col: Medication List with Dosages */}
     <div className="lg:col-span-2 space-y-6">
      <h2 className="text-xl font-bold font-heading text-foreground">Current & Past Prescriptions</h2>
      
      {medications.length === 0 ? (
       <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground">No medications recorded.</p>
       </div>
      ) : (
       <div className="space-y-8">
        <section className="space-y-4">
         <h2 className="text-xl font-bold font-heading text-foreground">Active Prescriptions</h2>
         {medications.filter(m => m.is_active).length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center opacity-75">
           <p className="text-muted-foreground text-sm">No active prescriptions.</p>
          </div>
         ) : (
          <div className="space-y-4">
           {medications.filter(m => m.is_active).map(renderMedication)}
          </div>
         )}
        </section>

        {medications.filter(m => !m.is_active).length > 0 && (
         <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-xl font-bold font-heading text-muted-foreground">Past Prescriptions</h2>
          <div className="space-y-4">
           {medications.filter(m => !m.is_active).map(renderMedication)}
          </div>
         </section>
        )}
       </div>
      )}
     </div>

     {/* Right Col: Month-wise History */}
     <div className="lg:col-span-1 space-y-6">
      <div className="flex flex-col gap-4">
       <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
         <Clock className="text-sky-500" size={20} />
         Log History
        </h2>
        
        <Popover>
         <PopoverTrigger className="flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-slate-100 dark:hover:bg-slate-800 border border-border rounded-lg text-sm font-semibold transition-colors shadow-sm">
          <Filter size={16} /> Filters
          {(statusFilter !== 'all' || medFilter !== 'all' || monthFilter !== 'all') && (
           <span className="w-2 h-2 rounded-full bg-sky-500 ml-1" />
          )}
         </PopoverTrigger>
         <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
           <h4 className="font-semibold text-sm">Filter History</h4>
           
           <div className="space-y-3">
            <div className="space-y-1.5">
             <label className="text-xs font-semibold text-muted-foreground uppercase">Month</label>
             <select 
              value={monthFilter} 
              onChange={e => setMonthFilter(e.target.value)} 
              className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
             >
              <option value="all">All Months</option>
              {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
             </select>
            </div>

            <div className="space-y-1.5">
             <label className="text-xs font-semibold text-muted-foreground uppercase">Medication</label>
             <select 
              value={medFilter} 
              onChange={e => setMedFilter(e.target.value)} 
              className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
             >
              <option value="all">All Medications</option>
              {medications.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
             </select>
            </div>

            <div className="space-y-1.5">
             <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
             <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
             >
              <option value="all">All Statuses</option>
              <option value="missed">Missed Only</option>
              <option value="skipped">Skipped Only</option>
              <option value="taken">Taken Only</option>
             </select>
            </div>
           </div>
          </div>
         </PopoverContent>
        </Popover>
       </div>
      </div>
      
      {groupedLogs.sortedMonths.length === 0 ? (
       <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground text-sm">No historical logs found.</p>
       </div>
      ) : (
       <div className="space-y-6">
        {groupedLogs.sortedMonths.map(month => (
         <div key={month} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 border-b border-border">
           <h3 className="font-semibold text-sm text-foreground">{month}</h3>
          </div>
          <div className="divide-y divide-border">
           {groupedLogs.groups[month].map(log => (
            <div key={log.id} className="p-3 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
             <div>
              <p className="text-sm font-bold text-foreground">{log.medName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
               {format(parseISO(log.scheduled_time), 'MMM d, h:mm a')}
              </p>
             </div>
             <div>
              {log.status === 'taken' && (
               <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                <CheckCircle size={12} /> Taken
               </span>
              )}
              {log.status === 'missed' && (
               <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md">
                <XCircle size={12} /> Missed
               </span>
              )}
              {log.status === 'skipped' && (
               <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                <AlertCircle size={12} /> Skipped
               </span>
              )}
             </div>
            </div>
           ))}
          </div>
         </div>
        ))}
       </div>
      )}
     </div>

    </div>
   </div>
  </div>
 )
}
