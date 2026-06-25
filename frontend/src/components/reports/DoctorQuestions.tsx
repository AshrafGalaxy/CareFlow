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
    <div className="doctor-questions-container">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg">
          <ClipboardList size={20} className="text-indigo-500" />
          <h3>Questions to Ask Your Doctor</h3>
        </div>
        <button 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors rounded-lg text-xs font-bold uppercase tracking-wider" 
          onClick={copyAll}
        >
          {copiedAll ? <CopyCheck size={14} /> : <Copy size={14} />}
          {copiedAll ? 'Copied All!' : 'Copy All'}
        </button>
      </div>

      <ol className="space-y-3">
        {questions.map((q, i) => (
          <li key={i} className="doctor-question-item group">
            <span className="font-bold text-indigo-300 mr-1">{i + 1}.</span>
            <span className="doctor-question-text">{q}</span>
            <button
              className="doctor-question-copy-btn opacity-50 group-hover:opacity-100"
              onClick={() => copyOne(q, i)}
              title="Copy Question"
              aria-label={`Copy question ${i + 1}`}
            >
              {copiedIndex === i ? <CopyCheck size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
