'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
 onSend: (message: string) => void
 disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
 const [value, setValue] = useState('')
 const textareaRef = useRef<HTMLTextAreaElement>(null)

 // Auto-resize textarea up to 4 lines
 useEffect(() => {
  if (!textareaRef.current) return
  textareaRef.current.style.height = 'auto'
  const lineHeight = 24
  const maxHeight = lineHeight * 4 + 32 // 4 lines + padding
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
   <div className="relative flex items-end bg-card border border-border rounded-2xl overflow-hidden shadow-sm focus-within:ring-4 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all duration-200">
    <textarea
     ref={textareaRef}
     className="flex-1 max-h-40 min-h-[60px] w-full resize-none bg-transparent py-4 pl-5 pr-14 text-[15px] text-foreground placeholder-muted-foreground focus:outline-none"
     value={value}
     onChange={(e) => setValue(e.target.value)}
     onKeyDown={handleKeyDown}
     placeholder={disabled ? 'CareFlow AI is thinking...' : 'Ask about your health...'}
     disabled={disabled}
     rows={1}
    />
    <div className="absolute right-2 bottom-2">
     <button
      className="p-3 rounded-xl bg-sky-500 text-white hover:bg-sky-600 hover:shadow-md disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none transition-all duration-200"
      onClick={handleSend}
      disabled={disabled || !value.trim()}
      aria-label="Send message"
     >
      <Send size={18} className={!disabled && value.trim() ? 'translate-x-0.5' : ''} />
     </button>
    </div>
   </div>
   <div className="mt-3 text-center">
    <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Press <kbd className="font-sans px-1.5 py-0.5 bg-muted rounded border border-border text-foreground">Enter</kbd> to send &middot; <kbd className="font-sans px-1.5 py-0.5 bg-muted rounded border border-border text-foreground">Shift+Enter</kbd> for new line</p>
   </div>
  </div>
 )
}
