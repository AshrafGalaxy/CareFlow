'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Paperclip, Mic } from 'lucide-react'

interface ChatInputProps {
 onSend: (message: string) => void
 disabled?: boolean
 initialValue?: string
}

export function ChatInput({ onSend, disabled, initialValue = '' }: ChatInputProps) {
 const [value, setValue] = useState(initialValue)
 const textareaRef = useRef<HTMLTextAreaElement>(null)

 useEffect(() => {
  if (initialValue) {
   setValue(initialValue)
  }
 }, [initialValue])

 // Auto-resize textarea up to 4 lines
 useEffect(() => {
  if (!textareaRef.current) return
  textareaRef.current.style.height = 'auto'
  const lineHeight = 24
  const maxHeight = lineHeight * 4 + 24 // 4 lines + padding
  textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px'
 }, [value])

 const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === 'Enter' && !e.shiftKey) {
   e.preventDefault()
   handleSend()
  }
 }

 const handleSend = () => {
  const trimmed = value.trim()
  if (!trimmed || disabled) return
  onSend(trimmed)
  setValue('')
  if (textareaRef.current) {
   textareaRef.current.style.height = 'auto'
  }
 }

 return (
  <div className="max-w-4xl mx-auto w-full">
   <div className="relative flex items-end bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm focus-within:ring-4 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all duration-200 px-2 py-2">
    <button 
     type="button"
     className="p-2.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0 mb-0.5"
     title="Attach image or report"
    >
     <Paperclip size={20} />
    </button>
    <button 
     type="button"
     className="p-2.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0 mb-0.5 mr-1"
     title="Voice input"
    >
     <Mic size={20} />
    </button>
    
    <textarea
     ref={textareaRef}
     className="flex-1 max-h-40 min-h-[44px] w-full resize-none bg-transparent py-3 px-2 text-[15px] text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
     value={value}
     onChange={(e) => setValue(e.target.value)}
     onKeyDown={handleKeyDown}
     placeholder={disabled ? 'CareFlow AI is thinking...' : 'Ask about your health, or upload a report...'}
     disabled={disabled}
     rows={1}
    />
    
    <button
     className="p-3 rounded-full bg-sky-500 text-white hover:bg-sky-600 hover:shadow-md disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:shadow-none transition-all duration-200 shrink-0 mb-0.5 ml-2"
     onClick={handleSend}
     disabled={disabled || !value.trim()}
     aria-label="Send message"
    >
     <Send size={18} className={!disabled && value.trim() ? 'translate-x-0.5' : ''} />
    </button>
   </div>
   <div className="mt-3 text-center">
    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">Press <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">Enter</kbd> to send &middot; <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">Shift+Enter</kbd> for new line</p>
   </div>
  </div>
 )
}
