'use client'

import { useEffect, useState } from 'react'
import { Plus, Pill, CalendarCheck, Clock, ClipboardList, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Flame, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { MedicationCard } from '@/components/medications/MedicationCard'
import { AdherenceChart } from '@/components/medications/AdherenceChart'
import { format, parseISO } from 'date-fns'

interface Medication {
 id: string
 name: string
 dosage: string
 frequency: string
 times_of_day: string[]
 is_active: boolean
 start_date: string
 end_date?: string
 status?: string
}

interface Adherence {
 total_doses: number
 taken: number
 missed: number
 skipped: number
 adherence_rate: number
}

interface MedicationLog {
 id: string
 medication_id: string
 scheduled_time: string
 status: string
 taken_at: string | null
}

export default function MedicationsPage() {
 const [medications, setMedications] = useState<Medication[]>([])
 const [adherence, setAdherence] = useState<Adherence | null>(null)
 const [logs, setLogs] = useState<MedicationLog[]>([])
 const [expandedStatus, setExpandedStatus] = useState<'taken' | 'missed' | 'skipped' | null>(null)
 const [loading, setLoading] = useState(true)

 const loadData = async () => {
  try {
   const [medsRes, adherenceRes, logsRes] = await Promise.all([
    api.get('/api/medications/'),
    api.get('/api/medications/adherence?days=30'),
    api.get('/api/medications/logs/all')
   ])
   setMedications(medsRes.data)
   setAdherence(adherenceRes.data)
   // Sort logs newest first
   const sortedLogs = logsRes.data.sort((a: MedicationLog, b: MedicationLog) => 
    new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime()
   )
   setLogs(sortedLogs)
  } catch (e) {
   console.error(e)
  } finally {
   setLoading(false)
  }
 }

  const hasHydrated = useAuthStore(state => state._hasHydrated)

  useEffect(() => {
   if (hasHydrated) {
    loadData()
   }
  }, [hasHydrated])

  const todayStr = new Date().toISOString().split('T')[0]
  
  const activeMeds = medications.filter(m => 
    (m.status === 'active' || !m.status) && m.is_active && m.start_date <= todayStr && (!m.end_date || m.end_date >= todayStr)
  )
  const upcomingMeds = medications.filter(m => 
    (m.status === 'active' || !m.status) && m.is_active && m.start_date > todayStr
  )
  const inactiveMeds = medications.filter(m => 
    (m.status === 'active' || !m.status) && (!m.is_active || (m.end_date && m.end_date < todayStr))
  )
  const pendingMeds = medications.filter(m => m.status === 'pending')

  const getStreak = (medId?: string) => {
    if (!logs || logs.length === 0) return 0

    const medsToCheck = medId ? medications.filter(m => m.id === medId) : activeMeds
    if (medsToCheck.length === 0) return 0
    
    // Group logs by date
    const logsByDate: Record<string, MedicationLog[]> = {}
    const filteredLogs = medId ? logs.filter(l => l.medication_id === medId) : logs
    
    filteredLogs.forEach(log => {
      const dateStr = format(new Date(log.scheduled_time), 'yyyy-MM-dd')
      if (!logsByDate[dateStr]) logsByDate[dateStr] = []
      logsByDate[dateStr].push(log)
    })
    
    let streak = 0
    let currentDate = new Date()
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      
      let requiredDoses = 0
      let validMedsForDate = 0
      
      for (const med of medsToCheck) {
        if (dateStr >= med.start_date && med.is_active) {
            requiredDoses += (med.times_of_day?.length || 0)
            validMedsForDate++
        }
      }
      
      if (validMedsForDate === 0) break
      if (requiredDoses === 0) {
        currentDate.setDate(currentDate.getDate() - 1)
        continue
      }
      
      const dayLogs = logsByDate[dateStr] || []
      const takenCount = dayLogs.filter(l => l.status === 'taken').length
      const missedCount = dayLogs.filter(l => l.status === 'missed' || l.status === 'skipped').length
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      
      if (dateStr === todayStr) {
         if (missedCount > 0) break
         if (takenCount === requiredDoses) streak += 1
      } else {
         if (takenCount === requiredDoses) {
            streak += 1
         } else {
            break
         }
      }
      
      currentDate.setDate(currentDate.getDate() - 1)
      
      // Limit check to logs fetch window (30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      if (currentDate < thirtyDaysAgo) break
    }
    
    return streak
  }
 return (
  <div className="w-full space-y-8">
    
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
     <div className="flex items-center gap-4">
      <Link 
       href="/dashboard" 
       className="p-2 bg-card border border-border rounded-full hover:bg-muted transition-colors shadow-sm"
      >
       <ArrowLeft size={20} className="text-foreground" />
      </Link>
      <div>
       <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">My Medications</h1>
       <p className="text-sm text-muted-foreground mt-1">Manage your prescriptions and daily doses</p>
      </div>
     </div>
     <div className="flex items-center gap-3">
      <Link 
       href="/medications/add" 
       className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow transition-all active:scale-95"
      >
       <Plus size={18} /> Request Medication
      </Link>
     </div>
    </div>

    {loading ? (
     <div className="flex flex-col items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-muted-foreground font-medium">Loading your medications...</p>
     </div>
    ) : (
     <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* Left Column: Medications List */}
      <div className="lg:col-span-3 space-y-8">
       
       {/* Pending Medications */}
       {pendingMeds.length > 0 && (
        <section className="mb-8">
         <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2 mb-4">
          Pending Requests
          <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
           {pendingMeds.length}
          </span>
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
          {pendingMeds.map(med => (
           <MedicationCard key={med.id} medication={med} streak={0} onLogSuccess={loadData} />
          ))}
         </div>
        </section>
       )}

       {/* Active Medications */}
       <section>
        {activeMeds.length === 0 ? (
         <div className="bg-card border border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-sky-50 dark:bg-sky-900/20 text-sky-500 rounded-full flex items-center justify-center mb-4">
           <Pill size={32} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No active medications</h3>
          <p className="text-muted-foreground max-w-sm mb-6">Add your first medication to start tracking your schedule and generating adherence reports.</p>
          <Link 
           href="/medications/add" 
           className="inline-flex items-center justify-center gap-2 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
           <Plus size={16} /> Add Medication
          </Link>
         </div>
        ) : (
          <>
          <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2 mb-4">
           Active Medications 
           <span className="text-xs font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full">
            {activeMeds.length}
           </span>
          </h2>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
           {activeMeds.map(med => (
            <motion.div 
              key={med.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <MedicationCard medication={med} streak={getStreak(med.id)} onLogSuccess={loadData} />
            </motion.div>
           ))}
          </motion.div>
         </>
        )}
       </section>

       {/* Upcoming Medications */}
       {upcomingMeds.length > 0 && (
        <section className="pt-8 border-t border-border">
         <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2 mb-4">
          Scheduled & Upcoming
          <span className="text-xs font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full">
           {upcomingMeds.length}
          </span>
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingMeds.map(med => (
           <MedicationCard key={med.id} medication={med} streak={0} onLogSuccess={loadData} />
          ))}
         </div>
        </section>
       )}

       {/* Inactive Medications */}
       {inactiveMeds.length > 0 && (
        <section className="pt-8 border-t border-border">
         <h2 className="text-lg font-bold font-heading text-muted-foreground flex items-center gap-2 mb-4 opacity-80">
          Inactive Medications
          <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
           {inactiveMeds.length}
          </span>
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-80 grayscale-[0.5]">
          {inactiveMeds.map(med => (
           <MedicationCard key={med.id} medication={med} streak={getStreak(med.id)} onLogSuccess={loadData} />
          ))}
         </div>
        </section>
       )}
      </div>

      {/* Right Column: Adherence Summary */}
      <div className="lg:col-span-1">
       <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-8">
        <div className="flex items-center justify-between mb-6">
         <h2 className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
          <CalendarCheck size={20} className="text-sky-500" />
          30-Day Adherence
         </h2>
         {adherence && adherence.adherence_rate > 80 && getStreak() > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-bold text-xs shadow-sm">
           <Flame size={14} className="fill-orange-500 text-orange-500" />
           {getStreak()} Day Streak!
          </div>
         )}
        </div>
        
        {adherence && (
         <div className="flex flex-col items-center">
          <div className="w-full max-w-[200px] mb-6">
           <AdherenceChart
            taken={adherence.taken}
            missed={adherence.missed}
            skipped={adherence.skipped}
            adherenceRate={adherence.adherence_rate}
           />
          </div>
          
          <div className="w-full space-y-3">
           {/* Taken Box */}
           <div>
            <button 
             onClick={() => setExpandedStatus(expandedStatus === 'taken' ? null : 'taken')}
             className="w-full flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 transition-colors"
            >
             <span className="text-sm font-medium text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              Taken {expandedStatus === 'taken' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
             </span>
             <span className="font-bold text-emerald-600 dark:text-emerald-500">{adherence.taken}</span>
            </button>
            {expandedStatus === 'taken' && (
             <div className="mt-2 space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.filter(l => l.status === 'taken').length === 0 ? (
               <p className="text-sm text-muted-foreground text-center py-4">No taken doses.</p>
              ) : (
               logs.filter(l => l.status === 'taken').map(log => {
                const medName = medications.find(m => m.id === log.medication_id)?.name || 'Unknown'
                return (
                 <div key={log.id} className="p-3 bg-card border border-border rounded-xl shadow-sm text-left">
                  <p className="text-sm font-bold text-foreground">{medName}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(log.scheduled_time), 'MMM d, h:mm a')}</p>
                 </div>
                )
               })
              )}
             </div>
            )}
           </div>

           {/* Missed Box */}
           <div>
            <button 
             onClick={() => setExpandedStatus(expandedStatus === 'missed' ? null : 'missed')}
             className="w-full flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/30 transition-colors"
            >
             <span className="text-sm font-medium text-rose-800 dark:text-rose-400 flex items-center gap-2">
              Missed {expandedStatus === 'missed' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
             </span>
             <span className="font-bold text-rose-600 dark:text-rose-500">{adherence.missed}</span>
            </button>
            {expandedStatus === 'missed' && (
             <div className="mt-2 space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.filter(l => l.status === 'missed').length === 0 ? (
               <p className="text-sm text-muted-foreground text-center py-4">No missed doses.</p>
              ) : (
               logs.filter(l => l.status === 'missed').map(log => {
                const medName = medications.find(m => m.id === log.medication_id)?.name || 'Unknown'
                return (
                 <div key={log.id} className="p-3 bg-card border border-border rounded-xl shadow-sm text-left">
                  <p className="text-sm font-bold text-foreground">{medName}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(log.scheduled_time), 'MMM d, h:mm a')}</p>
                 </div>
                )
               })
              )}
             </div>
            )}
           </div>

           {/* Skipped Box */}
           <div>
            <button 
             onClick={() => setExpandedStatus(expandedStatus === 'skipped' ? null : 'skipped')}
             className="w-full flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30 transition-colors"
            >
             <span className="text-sm font-medium text-amber-800 dark:text-amber-400 flex items-center gap-2">
              Skipped {expandedStatus === 'skipped' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
             </span>
             <span className="font-bold text-amber-600 dark:text-amber-500">{adherence.skipped}</span>
            </button>
            {expandedStatus === 'skipped' && (
             <div className="mt-2 space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.filter(l => l.status === 'skipped').length === 0 ? (
               <p className="text-sm text-muted-foreground text-center py-4">No skipped doses.</p>
              ) : (
               logs.filter(l => l.status === 'skipped').map(log => {
                const medName = medications.find(m => m.id === log.medication_id)?.name || 'Unknown'
                return (
                 <div key={log.id} className="p-3 bg-card border border-border rounded-xl shadow-sm text-left">
                  <p className="text-sm font-bold text-foreground">{medName}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(log.scheduled_time), 'MMM d, h:mm a')}</p>
                 </div>
                )
               })
              )}
             </div>
            )}
           </div>
          </div>
         </div>
        )}
       </div>
      </div>

     </div>
    )}
   </div>
  )
}
