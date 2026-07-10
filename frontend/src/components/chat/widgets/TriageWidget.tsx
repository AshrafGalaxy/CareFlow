'use client'

import { useState } from 'react'
import { Activity, AlertTriangle, CheckCircle2, ChevronRight, Stethoscope } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'

export function TriageWidget() {
  const [step, setStep] = useState(0)
  const [painLevel, setPainLevel] = useState(5)
  const [symptoms, setSymptoms] = useState({
    fever: false,
    shortnessOfBreath: false,
    chestPain: false,
    dizziness: false
  })
  
  const [result, setResult] = useState<'green' | 'yellow' | 'red' | null>(null)

  const handleNext = () => setStep(step + 1)
  
  const toggleSymptom = (key: keyof typeof symptoms) => {
    setSymptoms(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const calculateTriage = () => {
    let score = 0
    score += painLevel
    
    if (symptoms.chestPain) score += 8
    if (symptoms.shortnessOfBreath) score += 6
    if (symptoms.fever) score += 3
    if (symptoms.dizziness) score += 4

    if (score >= 12) setResult('red')
    else if (score >= 7) setResult('yellow')
    else setResult('green')
    
    setStep(2)
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm w-full max-w-sm mb-4 font-sans">
      <div className="flex items-center gap-3 text-rose-500 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
          <Stethoscope size={20} />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200">Symptom Checker</h4>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">How severe is your pain/discomfort?</p>
            <div className="flex flex-col gap-2">
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={painLevel} 
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Mild (1)</span>
                <span className="text-rose-500 text-lg">{painLevel}</span>
                <span>Severe (10)</span>
              </div>
            </div>
            <button onClick={handleNext} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 mt-2">
              Next <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Are you experiencing any of these?</p>
            <div className="flex flex-col gap-2">
              {Object.entries({
                chestPain: "Chest Pain / Pressure",
                shortnessOfBreath: "Shortness of Breath",
                fever: "High Fever",
                dizziness: "Severe Dizziness / Fainting"
              }).map(([key, label]) => (
                <button 
                  key={key} 
                  onClick={() => toggleSymptom(key as keyof typeof symptoms)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-bold flex justify-between items-center transition-colors ${symptoms[key as keyof typeof symptoms] ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                >
                  {label}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${symptoms[key as keyof typeof symptoms] ? 'border-rose-500 bg-rose-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    {symptoms[key as keyof typeof symptoms] && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={calculateTriage} className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95 mt-2">
              Assess Risk
            </button>
          </motion.div>
        )}

        {step === 2 && result && (
          <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center gap-3 py-2">
            {result === 'red' && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-500 mb-2 border border-red-200 dark:border-red-900/50 animate-pulse">
                  <AlertTriangle size={32} />
                </div>
                <h5 className="font-black text-red-600 dark:text-red-400 text-lg">EMERGENCY</h5>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 px-2 leading-relaxed">
                  Your symptoms suggest a potentially life-threatening condition. Please seek immediate emergency medical care or call an ambulance.
                </p>
                <button className="mt-2 w-full py-3 bg-red-500 text-white rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2">
                  <AlertTriangle size={16} /> Contact ER Now
                </button>
              </>
            )}
            
            {result === 'yellow' && (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center text-amber-500 mb-2 border border-amber-200 dark:border-amber-900/50">
                  <Activity size={32} />
                </div>
                <h5 className="font-black text-amber-600 dark:text-amber-400 text-lg">See a Doctor</h5>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 px-2 leading-relaxed">
                  Your symptoms require medical evaluation. Please schedule an appointment with a doctor within the next 24-48 hours.
                </p>
              </>
            )}

            {result === 'green' && (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 mb-2 border border-emerald-200 dark:border-emerald-900/50">
                  <CheckCircle2 size={32} />
                </div>
                <h5 className="font-black text-emerald-600 dark:text-emerald-400 text-lg">Monitor at Home</h5>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 px-2 leading-relaxed">
                  Your symptoms do not indicate a medical emergency. Rest, hydrate, and monitor your condition. Consult a doctor if symptoms worsen.
                </p>
              </>
            )}
            
            <button onClick={() => setStep(0)} className="text-[10px] text-slate-400 font-bold uppercase mt-4 hover:text-slate-600 transition-colors">
              Retake Assessment
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
