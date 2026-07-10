import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Paperclip, Mic, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface ChatInputProps {
 onSend: (message: string, imageBase64?: string) => void
 disabled?: boolean
 initialValue?: string
}

export function ChatInput({ onSend, disabled, initialValue = '' }: ChatInputProps) {
 const [value, setValue] = useState(initialValue)
 const [imageBase64, setImageBase64] = useState<string | null>(null)
 const textareaRef = useRef<HTMLTextAreaElement>(null)
 const fileInputRef = useRef<HTMLInputElement>(null)

  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
   if (initialValue) {
    setValue(initialValue)
   }
  }, [initialValue])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setValue((prev) => prev + (prev ? ' ' : '') + transcript)
        }

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            toast.error("Microphone access denied. Please allow microphone permissions in your browser to use voice input.")
          } else if (event.error !== 'no-speech') {
            toast.error(`Speech recognition failed: ${event.error}`)
          }
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (e) {
        console.error(e)
      }
    }
  }

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0]
   if (!file) return
   
   const reader = new FileReader()
   reader.onload = (event) => {
    if (typeof event.target?.result === 'string') {
     setImageBase64(event.target.result)
    }
   }
   reader.readAsDataURL(file)
   if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSend = () => {
   const trimmed = value.trim()
   if ((!trimmed && !imageBase64) || disabled) return
   
   if (isListening) {
     recognitionRef.current?.stop()
     setIsListening(false)
   }
   
   onSend(trimmed, imageBase64 || undefined)
   setValue('')
   setImageBase64(null)
   
   if (textareaRef.current) {
    textareaRef.current.style.height = 'auto'
   }
  }

  return (
   <div className="max-w-4xl mx-auto w-full">
    {/* Image Preview Area */}
    {imageBase64 && (
     <div className="mb-3 px-4 relative group inline-block">
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 w-32 h-32">
       <img src={imageBase64} alt="Upload preview" className="w-full h-full object-cover" />
       <button 
        onClick={() => setImageBase64(null)}
        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
       >
        <X size={14} />
       </button>
      </div>
     </div>
    )}

    <div className="relative flex items-end bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm focus-within:ring-4 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all duration-200 px-2 py-2">
     <input 
      type="file" 
      accept="image/*" 
      className="hidden" 
      ref={fileInputRef} 
      onChange={handleFileChange}
     />
     <button 
      type="button"
      onClick={() => fileInputRef.current?.click()}
      className="p-2.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0 mb-0.5"
      title="Attach image or report"
      disabled={disabled}
     >
      <Paperclip size={20} />
     </button>
     <button 
      type="button"
      onClick={toggleListening}
      className={`p-2.5 rounded-full transition-colors shrink-0 mb-0.5 mr-1 ${isListening ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 animate-pulse' : 'text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800'}`}
      title={isListening ? "Listening..." : "Voice input"}
      disabled={disabled}
     >
      <Mic size={20} />
     </button>
     
     <textarea
      ref={textareaRef}
      className="flex-1 max-h-40 min-h-[44px] w-full resize-none bg-transparent py-3 px-2 text-[15px] text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={isListening ? 'Listening...' : (disabled ? 'CareFlow AI is thinking...' : 'Ask about your health, or upload a report...')}
      disabled={disabled}
      rows={1}
     />
     
     <button
      className="flex items-center justify-center w-11 h-11 rounded-full bg-sky-500 text-white hover:bg-sky-600 hover:shadow-md disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:shadow-none transition-all duration-200 shrink-0 mb-0.5 ml-2"
      onClick={handleSend}
      disabled={disabled || (!value.trim() && !imageBase64)}
      aria-label="Send message"
     >
      <Send size={18} />
     </button>
   </div>
   <div className="mt-3 text-center">
    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">Press <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">Enter</kbd> to send &middot; <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">Shift+Enter</kbd> for new line</p>
   </div>
  </div>
 )
}
