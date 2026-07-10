'use client'

import { useState, useEffect } from 'react'
import { useRouter } from "@/i18n/routing"
import { ArrowLeft, Plus, X, Pill, Clock, Calendar, FileText, AlertTriangle, ChevronDown, Stethoscope, Droplet } from 'lucide-react'
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
  "Weekly",
  "Custom"
]

const DOSAGE_UNITS = [
  "mg", "g", "mcg", "ml", "pills", "tablets", "capsules", 
  "drops", "tsp", "tbsp", "units", "puffs", "patches", "scoops"
]

const DURATIONS = [
  "3 Days",
  "5 Days",
  "1 Week",
  "10 Days",
  "14 Days",
  "30 Days",
  "Ongoing",
  "Custom Date"
]

const START_DATES = [
  "Today",
  "Tomorrow",
  "Yesterday",
  "Custom Date"
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
  
  // Smart Context States
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [contextWarning, setContextWarning] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  
  // Dropdown toggles
  const [showFreqDropdown, setShowFreqDropdown] = useState(false)
  const [showUnitDropdown, setShowUnitDropdown] = useState(false)
  const [showDurationDropdown, setShowDurationDropdown] = useState(false)
  const [showStartDateDropdown, setShowStartDateDropdown] = useState(false)

  const [form, setForm] = useState({
    name: '',
    dosage: '',
    unit: 'mg',
    frequency: 'Once Daily',
    custom_frequency: '',
    condition: '', 
    start_date_preset: 'Today',
    start_date_custom: new Date().toISOString().split('T')[0],
    duration_preset: 'Ongoing',
    end_date_custom: '',
    notes: '',
  })
  
  const [timesOfDay, setTimesOfDay] = useState<string[]>(['08:00'])

  useEffect(() => {
    if (_hasHydrated) {
      api.get('/api/medications/')
        .then(res => {
          setActiveMeds(res.data.filter((m: any) => m.is_active))
        })
        .catch(err => console.error("Failed to load context", err))
    }
  }, [_hasHydrated])

  // Check for duplicates
  useEffect(() => {
    if (form.name.trim().length > 2) {
      const exists = activeMeds.some(m => m.name.toLowerCase() === form.name.toLowerCase().trim())
      setIsDuplicate(exists)
    } else {
      setIsDuplicate(false)
    }
  }, [form.name, activeMeds])

  // Smart Context Validation for Frequency vs Times
  useEffect(() => {
    if (form.frequency === "Once Daily" && timesOfDay.length > 1) {
      setContextWarning("You selected 'Once Daily' but added multiple reminder times.")
    } else if (form.frequency === "Twice Daily" && timesOfDay.length !== 2) {
      setContextWarning("For 'Twice Daily', we recommend setting exactly 2 reminder times.")
    } else if (form.frequency === "Three Times Daily" && timesOfDay.length !== 3) {
      setContextWarning("For 'Three Times Daily', we recommend setting exactly 3 reminder times.")
    } else {
      setContextWarning(null)
    }
  }, [form.frequency, timesOfDay.length])


  const calculateDates = () => {
    let start = new Date()
    if (form.start_date_preset === 'Tomorrow') {
      start.setDate(start.getDate() + 1)
    } else if (form.start_date_preset === 'Yesterday') {
      start.setDate(start.getDate() - 1)
    } else if (form.start_date_preset === 'Custom Date') {
      start = new Date(form.start_date_custom)
    }

    let end = null
    if (form.duration_preset !== 'Ongoing') {
      end = new Date(start)
      if (form.duration_preset === '3 Days') end.setDate(end.getDate() + 3)
      else if (form.duration_preset === '5 Days') end.setDate(end.getDate() + 5)
      else if (form.duration_preset === '1 Week') end.setDate(end.getDate() + 7)
      else if (form.duration_preset === '10 Days') end.setDate(end.getDate() + 10)
      else if (form.duration_preset === '14 Days') end.setDate(end.getDate() + 14)
      else if (form.duration_preset === '30 Days') end.setDate(end.getDate() + 30)
      else if (form.duration_preset === 'Custom Date' && form.end_date_custom) {
        end = new Date(form.end_date_custom)
      } else {
        end = null
      }
    }
    
    return { 
      startDateStr: start.toISOString().split('T')[0], 
      endDateStr: end ? end.toISOString().split('T')[0] : null,
      startObj: start,
      endObj: end
    }
  }

  // Validate Dates
  useEffect(() => {
    const { startObj, endObj } = calculateDates()
    if (endObj && endObj < startObj) {
      setDateError("End date cannot be before the start date.")
    } else {
      setDateError(null)
    }
  }, [form.start_date_preset, form.start_date_custom, form.duration_preset, form.end_date_custom])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (dateError) {
      toast.error(dateError)
      return
    }
    
    setLoading(true)
    try {
      const { startDateStr, endDateStr } = calculateDates()
      const finalNotes = form.condition ? `Condition: ${form.condition}\n${form.notes}` : form.notes;
      const finalDosage = form.dosage ? `${form.dosage} ${form.unit}` : "";
      const finalFreq = form.frequency === "Custom" ? form.custom_frequency : form.frequency;
      
      const payload = {
        name: form.name,
        dosage: finalDosage,
        frequency: finalFreq,
        start_date: startDateStr,
        end_date: endDateStr,
        notes: finalNotes,
        times_of_day: timesOfDay,
      }
      
      await api.post('/api/medications/', payload)
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
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
      <div className="max-w-2xl mx-auto space-y-5">
        
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/medications" 
            className="p-2 bg-card border border-border rounded-full hover:bg-muted transition-colors shadow-sm"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">Add Medication</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Configure dosage, frequency, and smart reminders</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border shadow-sm p-5 md:p-6 relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Medication Name <span className="text-rose-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Pill size={16} />
                </div>
                <input
                  type="text"
                  list="active-meds-list"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Metformin"
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm text-foreground placeholder:text-muted-foreground shadow-sm"
                  required
                />
                <datalist id="active-meds-list">
                  {activeMeds.map(m => (
                    <option key={m.id} value={m.name} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Smart Context Warning (Duplicate) */}
            <AnimatePresence>
              {isDuplicate && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 flex gap-2 items-start overflow-hidden shadow-sm"
                >
                  <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Smart Context Alert</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5">You are already actively taking a medication with this name. Please verify if you need to add a duplicate.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Condition Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Condition / Reason <span className="text-muted-foreground font-normal normal-case">(Optional)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Stethoscope size={16} />
                </div>
                <input
                  type="text"
                  value={form.condition}
                  onChange={e => setForm({ ...form, condition: e.target.value })}
                  placeholder="e.g., Blood Pressure, Diabetes"
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm text-foreground placeholder:text-muted-foreground shadow-sm"
                />
              </div>
            </div>

            {/* Dosage & Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Dosage</label>
                <div className="flex gap-2 relative">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Droplet size={16} />
                    </div>
                    <input
                      type="text"
                      value={form.dosage}
                      onChange={e => setForm({ ...form, dosage: e.target.value })}
                      placeholder="e.g., 500"
                      className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm text-foreground placeholder:text-muted-foreground shadow-sm"
                    />
                  </div>
                  
                  {/* Custom Unit Dropdown instead of select */}
                  <div className="relative w-32">
                    <div 
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground flex items-center justify-between cursor-pointer shadow-sm transition-all hover:bg-muted"
                      onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                    >
                      <span className="truncate">{form.unit}</span>
                      <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showUnitDropdown ? 'rotate-180' : ''}`} />
                    </div>
                    <AnimatePresence>
                      {showUnitDropdown && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-30"
                        >
                          <div className="max-h-48 overflow-y-auto py-1">
                            {DOSAGE_UNITS.map(unit => (
                              <div 
                                key={unit}
                                className="px-3 py-2 hover:bg-muted cursor-pointer text-sm text-foreground transition-colors"
                                onClick={() => {
                                  setForm({ ...form, unit })
                                  setShowUnitDropdown(false)
                                }}
                              >
                                {unit}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Frequency</label>
                <div 
                  className="w-full pl-3 pr-10 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground flex items-center justify-between cursor-pointer shadow-sm transition-all hover:bg-muted"
                  onClick={() => setShowFreqDropdown(!showFreqDropdown)}
                >
                  <span className="truncate">{form.frequency}</span>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform absolute right-3 ${showFreqDropdown ? 'rotate-180' : ''}`} />
                </div>
                
                <AnimatePresence>
                  {showFreqDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20"
                    >
                      <div className="max-h-48 overflow-y-auto py-1">
                        {FREQUENCIES.map(freq => (
                          <div 
                            key={freq}
                            className="px-3 py-2 hover:bg-muted cursor-pointer text-sm text-foreground transition-colors"
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
                
                {form.frequency === "Custom" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 overflow-hidden"
                  >
                    <input
                      type="text"
                      value={form.custom_frequency}
                      onChange={e => setForm({ ...form, custom_frequency: e.target.value })}
                      placeholder="e.g., Every 3 days, On weekends"
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm text-foreground placeholder:text-muted-foreground shadow-sm"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Times of Day */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
                Reminder Times
              </label>
              
              {/* Smart Context Warning (Frequency vs Times) */}
              <AnimatePresence>
                {contextWarning && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                      <AlertTriangle size={14} /> {contextWarning}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <AnimatePresence>
                  {timesOfDay.map((time, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-2"
                    >
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-500 z-10">
                          <Clock size={16} />
                        </div>
                        <input
                          type="time"
                          value={time}
                          onChange={e => updateTime(i, e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>
                      {timesOfDay.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeTime(i)} 
                          className="p-2.5 text-muted-foreground hover:text-rose-500 bg-card border border-border rounded-xl shadow-sm transition-colors shrink-0"
                          title="Remove time"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <button 
                  type="button" 
                  onClick={addTime} 
                  className="flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-border rounded-xl text-xs font-semibold text-muted-foreground hover:text-sky-500 hover:border-sky-200 dark:hover:border-sky-900/50 transition-colors"
                >
                  <Plus size={14} /> Add Time
                </button>
              </div>
            </div>

            {/* Dates (Customized Selectors) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              
              {/* Start Date Dropdown */}
              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Start Date</label>
                <div 
                  className="w-full pl-9 pr-10 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground flex items-center justify-between cursor-pointer shadow-sm transition-all hover:bg-muted relative"
                  onClick={() => setShowStartDateDropdown(!showStartDateDropdown)}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Calendar size={16} />
                  </div>
                  <span className="truncate">{form.start_date_preset}</span>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform absolute right-3 ${showStartDateDropdown ? 'rotate-180' : ''}`} />
                </div>
                
                <AnimatePresence>
                  {showStartDateDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20"
                    >
                      <div className="max-h-48 overflow-y-auto py-1">
                        {START_DATES.map(preset => (
                          <div 
                            key={preset}
                            className="px-3 py-2 hover:bg-muted cursor-pointer text-sm text-foreground transition-colors"
                            onClick={() => {
                              setForm({ ...form, start_date_preset: preset })
                              setShowStartDateDropdown(false)
                            }}
                          >
                            {preset}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {form.start_date_preset === "Custom Date" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 overflow-hidden"
                  >
                    <input
                      type="date"
                      value={form.start_date_custom}
                      onChange={e => setForm({ ...form, start_date_custom: e.target.value })}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm text-foreground shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                      required
                    />
                  </motion.div>
                )}
              </div>

              {/* End Date (Duration) Dropdown */}
              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Duration</label>
                <div 
                  className={`w-full pl-9 pr-10 py-2.5 bg-background border rounded-xl text-sm text-foreground flex items-center justify-between cursor-pointer shadow-sm transition-all hover:bg-muted relative ${dateError ? 'border-rose-500' : 'border-border'}`}
                  onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Calendar size={16} />
                  </div>
                  <span className="truncate">{form.duration_preset}</span>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform absolute right-3 ${showDurationDropdown ? 'rotate-180' : ''}`} />
                </div>
                
                <AnimatePresence>
                  {showDurationDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20"
                    >
                      <div className="max-h-48 overflow-y-auto py-1">
                        {DURATIONS.map(preset => (
                          <div 
                            key={preset}
                            className="px-3 py-2 hover:bg-muted cursor-pointer text-sm text-foreground transition-colors"
                            onClick={() => {
                              setForm({ ...form, duration_preset: preset })
                              setShowDurationDropdown(false)
                            }}
                          >
                            {preset}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {form.duration_preset === "Custom Date" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 overflow-hidden"
                  >
                    <input
                      type="date"
                      value={form.end_date_custom}
                      onChange={e => setForm({ ...form, end_date_custom: e.target.value })}
                      className={`w-full px-3 py-2.5 bg-background border rounded-xl focus:ring-2 focus:ring-sky-500/20 transition-all text-sm text-foreground shadow-sm [color-scheme:light] dark:[color-scheme:dark] ${dateError ? 'border-rose-500 focus:border-rose-500' : 'border-border focus:border-sky-500'}`}
                    />
                  </motion.div>
                )}
                {dateError && <p className="text-xs text-rose-500 mt-1">{dateError}</p>}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Instructions / Notes</label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3 flex pointer-events-none text-muted-foreground">
                  <FileText size={16} />
                </div>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g., Mix powder with a glass of milk"
                  rows={2}
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm text-foreground placeholder:text-muted-foreground resize-none shadow-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-border mt-6">
              <Link 
                href="/medications" 
                className="px-5 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={loading || !!dateError}
                className="px-5 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
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
