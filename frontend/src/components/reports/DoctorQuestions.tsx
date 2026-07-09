'use client'

import { useState } from 'react'
import { Copy, CopyCheck, ClipboardList } from 'lucide-react'

interface DoctorQuestionsProps {
 questions: string[]
}

export function DoctorQuestions({ questions }: DoctorQuestionsProps) {
 const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
 const [copiedAll, setCopiedAll] = useState(false)

 const copyOne = async (text: string, index: number) => {
  await navigator.clipboard.writeText(text)
  setCopiedIndex(index)
  setTimeout(() => setCopiedIndex(null), 2000)
 }

 const copyAll = async () => {
  const all = questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
  await navigator.clipboard.writeText(all)
  setCopiedAll(true)
  setTimeout(() => setCopiedAll(false), 2000)
 }

 return (
  <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-3">
     <div className="h-10 w-10 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
      <ClipboardList size={20} />
     </div>
     <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">Questions to Ask Your Doctor</h2>
    </div>
    <button 
     className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors rounded-lg text-sm font-semibold whitespace-nowrap border border-indigo-100 dark:border-indigo-800" 
     onClick={copyAll}
    >
     {copiedAll ? <CopyCheck size={16} /> : <Copy size={16} />}
     {copiedAll ? 'Copied All!' : 'Copy All'}
    </button>
   </div>

   <ol className="space-y-3">
    {questions.map((q, i) => (
     <li key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
      <span className="font-bold text-indigo-500/50 dark:text-indigo-400/50 mt-0.5 min-w-[1.5rem]">{i + 1}.</span>
      <span className="flex-1 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{q}</span>
      <button
       className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 shrink-0"
       onClick={() => copyOne(q, i)}
       title="Copy Question"
       aria-label={`Copy question ${i + 1}`}
      >
       {copiedIndex === i ? <CopyCheck size={16} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={16} />}
      </button>
     </li>
    ))}
   </ol>
  </div>
 )
}
