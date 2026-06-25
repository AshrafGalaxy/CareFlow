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
      <div className="relative flex items-end bg-white border border-gray-300 rounded-2xl overflow-hidden shadow-sm focus-within:ring-4 focus-within:ring-blue-100/50 focus-within:border-blue-400 transition-all duration-200">
        <textarea
          ref={textareaRef}
          className="flex-1 max-h-40 min-h-[60px] w-full resize-none bg-transparent py-4 pl-5 pr-14 text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'CareFlow AI is thinking...' : 'Ask about your health...'}
          disabled={disabled}
          rows={1}
        />
        <div className="absolute right-2 bottom-2">
          <button
            className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all duration-200"
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
          >
            <Send size={18} className={!disabled && value.trim() ? 'translate-x-0.5' : ''} />
          </button>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Press <kbd className="font-sans px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-500">Enter</kbd> to send &middot; <kbd className="font-sans px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-500">Shift+Enter</kbd> for new line</p>
      </div>
    </div>
  )
}
