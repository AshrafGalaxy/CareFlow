'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { ArrowLeft, Clock, Save, FileText, CheckCircle, XCircle, AlertCircle, Loader2, Filter, Play, Square, Users, MoreVertical, Pill, Droplet, Syringe, Package, Beaker, User as UserIcon, Plus } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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

interface PatientOverview {
 patient_id: string
 name: string
 email: string
 medication_adherence_rate: number
 pending_follow_ups: number
 recent_report_id: string | null
 active_medications: {
  id: string
  name: string
  dosage: string
  frequency: string
 }[]
}

const getIconForDosage = (dosage: string) => {
 const d = (dosage || '').toLowerCase()
 if (d.includes('ml') || d.includes('liquid') || d.includes('syrup') || d.includes('tonic') || d.includes('drops')) return Droplet
 if (d.includes('injection') || d.includes('mcg') || d.includes('pen') || d.includes('syringe')) return Syringe
 if (d.includes('packet') || d.includes('sachet') || d.includes('powder')) return Package
 if (d.includes('spoon') || d.includes('tbsp') || d.includes('tsp')) return Beaker
 return Pill
}

export default function ClinicalChartPage() {
 const [patients, setPatients] = useState<PatientOverview[]>([])
 const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
 const [medications, setMedications] = useState<Medication[]>([])
 const [logs, setLogs] = useState<MedicationLog[]>([])
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState<string | null>(null)
 
 // For Modal editing
 const [editingMedId, setEditingMedId] = useState<string | null>(null)
 const [editData, setEditData] = useState<Record<string, { previous_dosage: string, hospital_notes: string }>>({})

 // For Adding Medication
 const [isAddingMed, setIsAddingMed] = useState(false)
 const [newMed, setNewMed] = useState({
  name: '', dosage: '', frequency: 'Daily', times_of_day: ['08:00']
 })
 const [isSubmittingMed, setIsSubmittingMed] = useState(false)

 const [statusFilter, setStatusFilter] = useState('all')
 const [medFilter, setMedFilter] = useState('all')
 const [monthFilter, setMonthFilter] = useState('all')
 const [logsDays, setLogsDays] = useState(30)

 const availableMonths = useMemo(() => {
  const months = new Set<string>()
  logs.forEach(log => {
   months.add(format(parseISO(log.scheduled_time), 'MMMM yyyy'))
  })
  return Array.from(months).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
 }, [logs])

 const loadPatients = async () => {
  try {
   const res = await api.get('/api/dashboard/patients')
   setPatients(res.data)
   setLoading(false)
  } catch (e) {
   console.error(e)
   toast.error("Failed to load patients")
   setLoading(false)
  }
 }

 const loadData = useCallback(async () => {
  if (!selectedPatient) return
  setLoading(true)
  try {
   const [medsRes, logsRes] = await Promise.all([
    api.get(`/api/medications/?patient_id=${selectedPatient}`),
    api.get(`/api/medications/logs/all?patient_id=${selectedPatient}&days=${logsDays}`),
   ])
   
   setMedications(medsRes.data)
   setLogs(logsRes.data)

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
 }, [selectedPatient, logsDays])

  const hasHydrated = useAuthStore(state => state._hasHydrated)

  useEffect(() => {
   if (hasHydrated && !selectedPatient) {
    loadPatients()
   }
  }, [hasHydrated, selectedPatient])

  useEffect(() => {
   if (selectedPatient) {
    loadData()
   }
  }, [selectedPatient, logsDays, loadData])

 const loadMoreLogs = () => {
  setLogsDays(prev => prev + 60)
 }

 const handleSave = async (id: string) => {
  setSaving(id)
  try {
   const dataToSave = editData[id]
   await api.put(`/api/medications/${id}`, dataToSave)
   toast.success("Clinical notes updated successfully")
   setMedications(medications.map(m => m.id === id ? { ...m, ...dataToSave } : m))
   setEditingMedId(null) // Close modal on success
  } catch (error) {
   console.error(error)
   toast.error("Failed to save updates")
  } finally {
   setSaving(null)
  }
 }

 const handleAddMedication = async () => {
  if (!selectedPatient || !newMed.name || !newMed.dosage) return
  setIsSubmittingMed(true)
  try {
   const payload = {
    patient_id: selectedPatient,
    name: newMed.name,
    dosage: newMed.dosage,
    frequency: newMed.frequency,
    times_of_day: newMed.times_of_day,
    start_date: new Date().toISOString().split('T')[0]
   }
   await api.post('/api/medications/', payload)
   toast.success("Medication added successfully")
   setIsAddingMed(false)
   setNewMed({ name: '', dosage: '', frequency: 'Daily', times_of_day: ['08:00'] })
   loadData() // Refetch
  } catch (e) {
   console.error(e)
   toast.error("Failed to add medication")
  } finally {
   setIsSubmittingMed(false)
  }
 }

 const toggleActive = async (id: string, currentStatus: boolean) => {
  try {
   const newStatus = !currentStatus
   await api.put(`/api/medications/${id}`, { is_active: newStatus })
   setMedications(medications.map(m => m.id === id ? { ...m, is_active: newStatus } : m))
   toast.success(newStatus ? "Medication resumed successfully" : "Medication stopped successfully")
   setEditingMedId(null) // Close modal
  } catch (error) {
   console.error(error)
   toast.error("Failed to change medication status")
  }
 }

 const groupedLogs = useMemo(() => {
  const groups: Record<string, (MedicationLog & { medName: string })[]> = {}
  const medMap = new Map(medications.map(m => [m.id, m.name]))

  const filteredLogs = logs.filter(log => {
   if (statusFilter !== 'all' && log.status !== statusFilter) return false
   if (medFilter !== 'all' && log.medication_id !== medFilter) return false
   if (monthFilter !== 'all' && format(parseISO(log.scheduled_time), 'MMMM yyyy') !== monthFilter) return false
   return true
  })

  filteredLogs.forEach(log => {
   const date = parseISO(log.scheduled_time)
   const monthKey = format(date, 'MMMM yyyy')
   if (!groups[monthKey]) groups[monthKey] = []
   groups[monthKey].push({
    ...log,
    medName: medMap.get(log.medication_id) || 'Unknown Medication'
   })
  })

  Object.keys(groups).forEach(key => {
   groups[key].sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime())
  })

  const sortedMonths = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  return { groups, sortedMonths }
 }, [logs, medications, statusFilter, medFilter, monthFilter])

 const renderOverviewGrid = () => (
  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-background">
   <div className="max-w-7xl mx-auto space-y-8">
    <div className="flex items-center justify-between gap-4">
     <div>
      <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight flex items-center gap-3">
       <Users className="text-sky-500" size={28} />
       Patient Medications Overview
      </h1>
      <p className="text-muted-foreground mt-1">Select a patient to view and manage their detailed clinical hospital chart.</p>
     </div>
    </div>

    {patients.length === 0 ? (
     <div className="bg-card border border-dashed border-border rounded-xl p-12 flex flex-col items-center text-center">
      <Users size={48} className="text-sky-500/50 mb-4" />
      <p className="text-foreground font-semibold text-lg">No assigned patients</p>
      <p className="text-muted-foreground">When patients are assigned to you, they will appear here.</p>
     </div>
    ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.map(p => (
       <div 
        key={p.patient_id} 
        onClick={() => setSelectedPatient(p.patient_id)}
        className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-sky-500/30 transition-all cursor-pointer group flex flex-col"
       >
        <div className="flex items-start gap-4 mb-6">
         <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
          <UserIcon size={24} />
         </div>
         <div>
          <h3 className="font-bold text-foreground text-lg">{p.name}</h3>
          <p className="text-xs text-muted-foreground">{p.email}</p>
         </div>
        </div>

        <div className="flex-1 space-y-4">
         <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Medications ({p.active_medications?.length || 0})</h4>
         {p.active_medications && p.active_medications.length > 0 ? (
          <div className="space-y-2">
           {p.active_medications.slice(0, 3).map(m => {
            const MedIcon = getIconForDosage(m.dosage)
            return (
             <div key={m.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-lg border border-border/50">
              <MedIcon size={16} className="text-sky-500" />
              <div className="flex-1 min-w-0">
               <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
               <p className="text-xs text-muted-foreground truncate">{m.dosage}</p>
              </div>
             </div>
            )
           })}
           {p.active_medications.length > 3 && (
            <p className="text-xs text-center text-muted-foreground italic font-medium pt-1">
             +{p.active_medications.length - 3} more medications
            </p>
           )}
          </div>
         ) : (
          <div className="h-24 flex items-center justify-center bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-dashed border-border">
           <p className="text-sm text-muted-foreground italic">No active medications.</p>
          </div>
         )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-sm font-medium">
         <span className="text-sky-600 dark:text-sky-400 group-hover:underline">View Chart</span>
         <ArrowLeft size={16} className="text-sky-500 rotate-180 transform group-hover:translate-x-1 transition-transform" />
        </div>
       </div>
      ))}
     </div>
    )}
   </div>
  </div>
 )

 const renderDetailedChart = () => (
  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-background">
   <div className="max-w-5xl mx-auto space-y-8">
    
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
     <div className="flex items-center gap-4">
      <Button 
       variant="outline" 
       onClick={() => { setSelectedPatient(null); setMedications([]); setLogs([]); }}
       className="p-2 h-auto bg-card hover:bg-muted rounded-full shrink-0"
      >
       <ArrowLeft size={20} />
      </Button>
      <div>
       <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight flex items-center gap-3">
        <FileText className="text-sky-500" size={28} />
        Clinical Hospital Chart
       </h1>
       <p className="text-muted-foreground mt-1">Unified medication record and historical adherence logs</p>
      </div>
     </div>
     <div className="w-full md:w-64 shrink-0">
      <Select value={selectedPatient || undefined} onValueChange={setSelectedPatient}>
       <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
         <Users size={16} className="text-sky-500" />
         <SelectValue placeholder="Switch Patient" />
        </div>
       </SelectTrigger>
       <SelectContent>
        {patients.map(p => (
         <SelectItem key={p.patient_id} value={p.patient_id}>{p.name}</SelectItem>
        ))}
       </SelectContent>
      </Select>
     </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
     <div className="lg:col-span-2 space-y-6">
      <h2 className="text-xl font-bold font-heading text-foreground">Current & Past Prescriptions</h2>
      
      {medications.length === 0 ? (
       <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground">No medications recorded.</p>
       </div>
      ) : (
       <div className="space-y-8">
        <section className="space-y-4">
         <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-foreground">Active Prescriptions</h2>
          <Button onClick={() => setIsAddingMed(true)} className="bg-sky-500 hover:bg-sky-600 text-white gap-2 h-9 px-3">
           <Plus size={16} /> Add Medication
          </Button>
         </div>
         {medications.filter(m => m.is_active).length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center opacity-75">
           <p className="text-muted-foreground text-sm">No active prescriptions.</p>
          </div>
         ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {medications.filter(m => m.is_active).map(renderMedicationCard)}
          </div>
         )}
        </section>

        {medications.filter(m => !m.is_active).length > 0 && (
         <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-xl font-bold font-heading text-muted-foreground">Past Prescriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {medications.filter(m => !m.is_active).map(renderMedicationCard)}
          </div>
         </section>
        )}
       </div>
      )}
     </div>

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
             <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 text-foreground">
              <option value="all">All Months</option>
              {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
             </select>
            </div>
            <div className="space-y-1.5">
             <label className="text-xs font-semibold text-muted-foreground uppercase">Medication</label>
             <select value={medFilter} onChange={e => setMedFilter(e.target.value)} className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 text-foreground">
              <option value="all">All Medications</option>
              {medications.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
             </select>
            </div>
            <div className="space-y-1.5">
             <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
             <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 text-foreground">
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
      
      {groupedLogs.sortedMonths.length > 0 && (
       <div className="flex justify-center pt-2">
        <Button variant="outline" onClick={loadMoreLogs} disabled={loading} className="w-full bg-card hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground transition-colors border-dashed">
         Load Older Logs (Currently showing {logsDays} days)
        </Button>
       </div>
      )}
     </div>
    </div>
    
    {/* Modals for Edit Details */}
    {medications.map(med => (
     <Dialog key={`modal-${med.id}`} open={editingMedId === med.id} onOpenChange={(open) => !open && setEditingMedId(null)}>
      <DialogContent className="sm:max-w-[425px]">
       <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
         {React.createElement(getIconForDosage(med.dosage), { size: 24, className: "text-sky-500" })}
         {med.name} Details
        </DialogTitle>
       </DialogHeader>
       <div className="py-4 space-y-6">
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
         <textarea
          placeholder="Doctor's notes..."
          rows={3}
          value={editData[med.id]?.hospital_notes || ''}
          onChange={(e) => setEditData({
           ...editData,
           [med.id]: { ...editData[med.id], hospital_notes: e.target.value }
          })}
          className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none"
         />
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-border">
         <Button
          variant="outline"
          onClick={() => toggleActive(med.id, med.is_active)}
          className={`flex items-center justify-center gap-2 border-0
           ${med.is_active 
            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 hover:text-rose-700 dark:hover:text-rose-300' 
            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300'}
          `}
         >
          {med.is_active ? <><Square size={16} /> Stop Medication</> : <><Play size={16} /> Resume Medication</>}
         </Button>
         <Button
          onClick={() => handleSave(med.id)}
          disabled={saving === med.id}
          className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white"
         >
          {saving === med.id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
         </Button>
      </DialogContent>
     </Dialog>
    ))}

    <Dialog open={isAddingMed} onOpenChange={setIsAddingMed}>
     <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
       <DialogTitle>Add New Medication</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
       <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Medication Name</label>
        <input
         type="text"
         className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
         value={newMed.name}
         onChange={(e) => setNewMed({...newMed, name: e.target.value})}
         placeholder="e.g. Metformin"
        />
       </div>
       <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Dosage</label>
        <input
         type="text"
         className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
         value={newMed.dosage}
         onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
         placeholder="e.g. 500mg"
        />
       </div>
       <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
         <label className="text-sm font-medium text-foreground">Frequency</label>
         <Select value={newMed.frequency} onValueChange={(v) => setNewMed({...newMed, frequency: v})}>
          <SelectTrigger>
           <SelectValue />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="Daily">Daily</SelectItem>
           <SelectItem value="Weekly">Weekly</SelectItem>
           <SelectItem value="As needed">As needed</SelectItem>
          </SelectContent>
         </Select>
        </div>
        <div className="space-y-2">
         <label className="text-sm font-medium text-foreground">Time (HH:MM)</label>
         <input
          type="time"
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={newMed.times_of_day[0]}
          onChange={(e) => setNewMed({...newMed, times_of_day: [e.target.value]})}
         />
        </div>
       </div>
       <div className="flex justify-end pt-4">
        <Button onClick={handleAddMedication} disabled={isSubmittingMed || !newMed.name || !newMed.dosage}>
         {isSubmittingMed ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
         Prescribe
        </Button>
       </div>
      </div>
     </DialogContent>
    </Dialog>

   </div>
  )
 )

 const renderMedicationCard = (med: Medication) => {
  const MedIcon = getIconForDosage(med.dosage)
  
  return (
   <div key={med.id} className={`bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group flex flex-col h-full ${!med.is_active ? 'opacity-60 grayscale-[0.3]' : ''}`}>
    <div className="absolute top-4 right-4 z-10">
     <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
       <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
        <MoreVertical size={16} />
       </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
       <DropdownMenu.Content align="end" className="min-w-[160px] bg-card border border-border rounded-lg shadow-xl p-1 z-[100] animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
        <DropdownMenu.Item 
         className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md cursor-pointer outline-none" 
         onClick={() => setEditingMedId(med.id)}
        >
         <FileText size={14} /> View Details
        </DropdownMenu.Item>
       </DropdownMenu.Content>
      </DropdownMenu.Portal>
     </DropdownMenu.Root>
    </div>

    <div className="flex items-start gap-4 mb-4 pr-10">
     <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
      <MedIcon size={20} />
     </div>
     <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-foreground text-lg truncate">{med.name}</h3>
      <p className="text-sm text-muted-foreground truncate">{med.frequency}</p>
     </div>
    </div>
    
    <div className="flex-1">
      <div className="text-sm font-medium mb-1">
        <span className="text-muted-foreground block text-xs uppercase tracking-wider">Current Dosage</span>
        <span className="text-foreground">{med.dosage || 'Not specified'}</span>
      </div>
      {med.previous_dosage && (
        <div className="text-sm mt-3">
          <span className="text-muted-foreground block text-xs uppercase tracking-wider">Previous Dosage</span>
          <span className="text-muted-foreground line-through decoration-muted-foreground/40">{med.previous_dosage}</span>
        </div>
      )}
    </div>

    {med.hospital_notes && (
     <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg text-sm text-muted-foreground border border-border italic line-clamp-2">
      {med.hospital_notes}
     </div>
    )}
    
    {!med.is_active && (
     <div className="mt-4 pt-3 border-t border-border flex justify-center">
      <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">
       Inactive
      </span>
     </div>
    )}
   </div>
  )
 }

 if (loading && !selectedPatient && patients.length === 0) {
  return (
   <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-background">
    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-muted-foreground font-medium">Loading clinical data...</p>
   </div>
  )
 }

 return selectedPatient ? renderDetailedChart() : renderOverviewGrid()
}
