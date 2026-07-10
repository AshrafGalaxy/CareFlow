'use client'

import { useState } from 'react'
import { Pill, Check, CalendarCheck, Clock, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'

interface Medication {
  id: string
  name: string
  time: string
  dosage: string
  taken: boolean
}

export function AdherenceWidget() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Metformin', time: '08:00 AM', dosage: '500mg', taken: false },
    { id: '2', name: 'Amlodipine', time: '09:00 AM', dosage: '5mg', taken: false },
    { id: '3', name: 'Atorvastatin', time: '09:00 PM', dosage: '20mg', taken: false }
  ])

  const [savingId, setSavingId] = useState<string | null>(null)

  const handleToggle = (id: string) => {
    const med = medications.find(m => m.id === id)
    if (med?.taken) return // Already taken, disable un-checking for this demo

    setSavingId(id)
    // Simulate API call to log medication
    setTimeout(() => {
      setMedications(prev => 
        prev.map(m => m.id === id ? { ...m, taken: true } : m)
      )
      setSavingId(null)
    }, 600)
  }

  const allTaken = medications.every(m => m.taken)

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm w-full max-w-sm mb-4 font-sans">
      <div className="flex items-center gap-3 text-indigo-500 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
          <CalendarCheck size={20} />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200">Daily Pill Tracker</h4>
      </div>

      <div className="flex flex-col gap-3">
        {medications.map((med) => (
          <div 
            key={med.id} 
            className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${med.taken ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30' : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${med.taken ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50' : 'bg-white dark:bg-slate-800 text-indigo-500 border border-slate-200 dark:border-slate-600'}`}>
                {med.taken ? <CheckCircle2 size={20} /> : <Pill size={18} />}
              </div>
              <div>
                <h5 className={`font-bold text-sm ${med.taken ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-70' : 'text-slate-800 dark:text-slate-200'}`}>{med.name}</h5>
                <p className={`text-xs flex items-center gap-1 mt-0.5 ${med.taken ? 'text-emerald-600/70 dark:text-emerald-500/70' : 'text-slate-500 dark:text-slate-400'}`}>
                  <Clock size={10} /> {med.time} • {med.dosage}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle(med.id)}
              disabled={med.taken || savingId === med.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                med.taken 
                  ? 'bg-transparent text-emerald-500' 
                  : savingId === med.id
                    ? 'bg-indigo-100 text-indigo-500'
                    : 'bg-white border-2 border-slate-200 dark:bg-slate-800 dark:border-slate-600 hover:border-indigo-500 text-transparent hover:text-indigo-200'
              }`}
            >
              {savingId === med.id ? (
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={16} className={med.taken ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
              )}
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {allTaken && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }} 
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }} 
            className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center justify-center text-center overflow-hidden"
          >
            <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Great job! You've taken all your meds today.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
