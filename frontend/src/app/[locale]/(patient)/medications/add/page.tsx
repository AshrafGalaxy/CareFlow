'use client'

import { useState, useEffect } from 'react'
import { useRouter } from "@/i18n/routing"
import { ArrowLeft, Plus, X, Pill, Clock, Calendar, FileText, AlertTriangle, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const FREQUENCIES = [
  "Once Daily",
  "Twice Daily",
  "Three Times Daily",
  "Every 4 Hours",
  "Every 6 Hours",
  "Every 8 Hours",
  "Every 12 Hours",
  "As Needed",
  "Weekly"
]

interface ActiveMedication {
  id: string
  name: string
  is_active: boolean
}

export default function AddMedicationPage() {
  const router = useRouter()
  const { user, _hasHydrated } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [activeMeds, setActiveMeds] = useState<ActiveMedication[]>([])
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [showFreqDropdown, setShowFreqDropdown] = useState(false)

  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: 'Once Daily',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  })
  
  const [timesOfDay, setTimesOfDay] = useState<string[]>(['08:00'])

  useEffect(() => {
    if (_hasHydrated) {
      // Fetch existing medications for smart context
      api.get('/api/medications/')
        .then(res => {
          setActiveMeds(res.data.filter((m: any) => m.is_active))
        })
        .catch(err => console.error("Failed to load context", err))
    }
  }, [_hasHydrated])

  // Check for duplicates when name changes
  useEffect(() => {
    if (form.name.trim().length > 2) {
      const exists = activeMeds.some(m => m.name.toLowerCase() === form.name.toLowerCase().trim())
      setIsDuplicate(exists)
    } else {
      setIsDuplicate(false)
    }
  }, [form.name, activeMeds])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/api/medications/', {
        ...form,
        times_of_day: timesOfDay,
        end_date: form.end_date || null,
      })
      toast.success("Medication added successfully")
      router.push('/medications')
    } catch {
      toast.error('Failed to add medication. Please try again.')
      setLoading(false)
    }
  }

  const addTime = () => setTimesOfDay([...timesOfDay, '12:00'])
  const removeTime = (index: number) => setTimesOfDay(timesOfDay.filter((_, i) => i !== index))
  const updateTime = (index: number, value: string) => {
    const updated = [...timesOfDay]
    updated[index] = value
    setTimesOfDay(updated)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-background">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/medications" 
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Add Medication</h1>
            <p className="text-sm text-muted-foreground mt-1">Configure dosage, frequency, and smart reminders</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Medication Name <span className="text-rose-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Pill size={18} />
                </div>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Metformin"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {/* Smart Context Warning */}
            <AnimatePresence>
              {isDuplicate && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex gap-3 items-start overflow-hidden"
                >
                  <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Smart Context Alert</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-0.5">You are already actively taking a medication with this name. Please verify if you need to add a duplicate.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dosage & Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Dosage</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span className="font-medium text-xs">mg</span>
                  </div>
                  <input
                    type="text"
                    value={form.dosage}
                    onChange={e => setForm({ ...form, dosage: e.target.value })}
                    placeholder="e.g., 500mg or 2 pills"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Frequency</label>
                <div 
                  className="relative cursor-pointer"
                  onClick={() => setShowFreqDropdown(!showFreqDropdown)}
                >
                  <div className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span>{form.frequency}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${showFreqDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                <AnimatePresence>
                  {showFreqDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-20"
                    >
                      <div className="max-h-48 overflow-y-auto">
                        {FREQUENCIES.map(freq => (
                          <div 
                            key={freq}
                            className="px-4 py-2.5 hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer text-sm text-slate-700 dark:text-slate-300 transition-colors"
                            onClick={() => {
                              setForm({ ...form, frequency: freq })
                              setShowFreqDropdown(false)
                            }}
                          >
                            {freq}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Times of Day */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reminder Times</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <AnimatePresence>
                  {timesOfDay.map((time, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group"
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-500">
                        <Clock size={16} />
                      </div>
                      <input
                        type="time"
                        value={time}
                        onChange={e => updateTime(i, e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50 rounded-xl text-sky-900 dark:text-sky-100 font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                      />
                      {timesOfDay.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeTime(i)} 
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-900 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <button 
                  type="button" 
                  onClick={addTime} 
                  className="flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-500 hover:text-sky-500 hover:border-sky-200 dark:hover:border-sky-900/50 transition-colors"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start Date <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900 dark:text-slate-100 [color-scheme:light] dark:[color-scheme:dark]"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">End Date (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900 dark:text-slate-100 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5 pt-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Instructions / Notes</label>
              <div className="relative">
                <div className="absolute top-3.5 left-0 pl-3.5 flex pointer-events-none text-slate-400">
                  <FileText size={18} />
                </div>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g., Take with food"
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Link 
                href="/medications" 
                className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Adding...' : 'Save Medication'}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  )
}
