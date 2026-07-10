'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Paperclip, Mic, X, FileText, AppWindow } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'

interface ChatInputProps {
 onSend: (message: string, imageBase64?: string) => void
 disabled?: boolean
 initialValue?: string
}

interface MentionItem {
  id: string;
  type: 'widget' | 'report';
  name: string;
  command: string; // Text to append to the message sent to AI
}

const WIDGETS: MentionItem[] = [
  { id: 'w1', type: 'widget', name: 'Pharmacy Locator', command: '[[WIDGET:PHARMACY]]' },
  { id: 'w2', type: 'widget', name: 'Symptom Triage', command: '[[WIDGET:TRIAGE]]' },
  { id: 'w3', type: 'widget', name: 'Diet Scanner', command: '[[WIDGET:NUTRITION]]' },
  { id: 'w4', type: 'widget', name: 'Pill Checklist', command: '[[WIDGET:ADHERENCE]]' },
  { id: 'w5', type: 'widget', name: 'Hospital Map', command: '[[WIDGET:HOSPITAL]]' },
  { id: 'w6', type: 'widget', name: 'Emergency Contacts', command: '[[WIDGET:EMERGENCY]]' },
  { id: 'w7', type: 'widget', name: 'Doctor Appointments', command: '[[WIDGET:SCHEDULE]]' },
  { id: 'w8', type: 'widget', name: 'Order Medicine', command: '[[WIDGET:MEDICATION]]' },
]

export function ChatInput({ onSend, disabled, initialValue = '' }: ChatInputProps) {
 const [value, setValue] = useState(initialValue)
 const [imageBase64, setImageBase64] = useState<string | null>(null)
 const textareaRef = useRef<HTMLTextAreaElement>(null)
 const fileInputRef = useRef<HTMLInputElement>(null)

 const [isListening, setIsListening] = useState(false)
 const recognitionRef = useRef<any>(null)

 // Mention States
 const [reports, setReports] = useState<MentionItem[]>([])
 const [mentionSearch, setMentionSearch] = useState<string | null>(null)
 const [mentionIndex, setMentionIndex] = useState(-1)
 const [mentionedItems, setMentionedItems] = useState<MentionItem[]>([])

 useEffect(() => {
  if (initialValue) {
   setValue(initialValue)
  }
 }, [initialValue])

 // Fetch Reports
 useEffect(() => {
   const fetchReports = async () => {
     try {
       const res = await api.get('/api/reports/')
       const mapped = res.data.map((r: any) => ({
         id: r.id,
         type: 'report',
         name: r.original_filename,
         command: `[Reference Attached Report: ${r.original_filename}]`
       }))
       setReports(mapped)
     } catch (e) {
       console.error("Failed to fetch reports for mentions", e)
     }
   }
   fetchReports()
 }, [])

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
    if (mentionSearch !== null) {
      // If menu is open, don't send message, prevent default to let user select (or just close it)
      e.preventDefault()
      setMentionSearch(null)
      return
    }
    e.preventDefault()
    handleSend()
  }
  
  if (e.key === 'Escape' && mentionSearch !== null) {
    setMentionSearch(null)
  }
 }

 const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
   const val = e.target.value
   setValue(val)

   // Mention detection logic
   const cursorPosition = e.target.selectionStart || 0
   const textBeforeCursor = val.slice(0, cursorPosition)
   
   // Check if we are currently typing an @mention
   const match = textBeforeCursor.match(/(?:^|\s)@([^/\s]*)$/)
   
   if (match) {
     setMentionSearch(match[1].toLowerCase())
     setMentionIndex(match.index! + (textBeforeCursor[match.index!] === '@' ? 0 : 1))
   } else {
     setMentionSearch(null)
     setMentionIndex(-1)
   }
 }

 const handleSelectMention = (item: MentionItem) => {
   // Add to attached chips
   if (!mentionedItems.find(m => m.id === item.id)) {
     setMentionedItems([...mentionedItems, item])
   }

   // Remove the @ text from the input
   const beforeMention = value.slice(0, mentionIndex)
   const afterMention = value.slice(mentionIndex + (mentionSearch?.length || 0) + 1)
   setValue(beforeMention + afterMention)
   setMentionSearch(null)
   setMentionIndex(-1)
   
   // Refocus input
   setTimeout(() => textareaRef.current?.focus(), 10)
 }

 const removeMention = (id: string) => {
   setMentionedItems(mentionedItems.filter(m => m.id !== id))
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
  if ((!trimmed && !imageBase64 && mentionedItems.length === 0) || disabled) return
  
  if (isListening) {
    recognitionRef.current?.stop()
    setIsListening(false)
  }
  
  // Combine user text with the invisible mention commands
  let finalMessage = trimmed
  if (mentionedItems.length > 0) {
    const commands = mentionedItems.map(m => m.command).join(' ')
    finalMessage = `${trimmed}\n\n${commands}`.trim()
  }

  onSend(finalMessage, imageBase64 || undefined)
  setValue('')
  setImageBase64(null)
  setMentionedItems([])
  
  if (textareaRef.current) {
   textareaRef.current.style.height = 'auto'
  }
 }

 // Filter mention options based on search
 const filteredWidgets = WIDGETS.filter(w => w.name.toLowerCase().includes(mentionSearch || ''))
 const filteredReports = reports.filter(r => r.name.toLowerCase().includes(mentionSearch || ''))

 return (
  <div className="max-w-4xl mx-auto w-full relative">
   
   {/* Mentions Dropdown Menu */}
   <AnimatePresence>
     {mentionSearch !== null && (filteredWidgets.length > 0 || filteredReports.length > 0) && (
       <motion.div 
         initial={{ opacity: 0, y: 10 }} 
         animate={{ opacity: 1, y: 0 }} 
         exit={{ opacity: 0, y: 10 }}
         className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col max-h-64"
       >
         <div className="overflow-y-auto p-2 flex flex-col gap-1">
           {filteredReports.length > 0 && (
             <>
               <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Reports</div>
               {filteredReports.map(report => (
                 <button
                   key={report.id}
                   onClick={() => handleSelectMention(report)}
                   className="flex items-center gap-2 px-3 py-2 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left group"
                 >
                   <div className="p-1.5 bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 rounded-lg group-hover:bg-sky-200 dark:group-hover:bg-sky-900/50 transition-colors">
                     <FileText size={14} />
                   </div>
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{report.name}</span>
                 </button>
               ))}
             </>
           )}

           {filteredWidgets.length > 0 && (
             <>
               <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Features & Widgets</div>
               {filteredWidgets.map(widget => (
                 <button
                   key={widget.id}
                   onClick={() => handleSelectMention(widget)}
                   className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left group"
                 >
                   <div className="p-1.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                     <AppWindow size={14} />
                   </div>
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{widget.name}</span>
                 </button>
               ))}
             </>
           )}
         </div>
       </motion.div>
     )}
   </AnimatePresence>

   {/* Attachments Area (Images + Chips) */}
   {(imageBase64 || mentionedItems.length > 0) && (
    <div className="mb-3 px-2 flex flex-wrap gap-2 items-end">
     {imageBase64 && (
      <div className="relative group inline-block">
       <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 w-24 h-24">
        <img src={imageBase64} alt="Upload preview" className="w-full h-full object-cover" />
        <button 
         onClick={() => setImageBase64(null)}
         className="absolute top-1.5 right-1.5 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
        >
         <X size={12} />
        </button>
       </div>
      </div>
     )}

     {mentionedItems.map(item => (
       <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm animate-in fade-in zoom-in duration-200">
         <div className={`p-1.5 rounded-lg ${item.type === 'report' ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
           {item.type === 'report' ? <FileText size={14} /> : <AppWindow size={14} />}
         </div>
         <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
         <button onClick={() => removeMention(item.id)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
           <X size={14} />
         </button>
       </div>
     ))}
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
     title="Attach image"
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
     className="flex-1 max-h-40 min-h-[44px] w-full resize-none bg-transparent py-3 px-2 text-[15px] text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none leading-relaxed"
     value={value}
     onChange={handleChange}
     onKeyDown={handleKeyDown}
     placeholder={isListening ? 'Listening...' : (disabled ? 'CareFlow AI is thinking...' : 'Ask about your health, or type @ to attach...')}
     disabled={disabled}
     rows={1}
    />
    
    <button
     className="flex items-center justify-center w-11 h-11 rounded-full bg-sky-500 text-white hover:bg-sky-600 hover:shadow-md disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:shadow-none transition-all duration-200 shrink-0 mb-0.5 ml-2"
     onClick={handleSend}
     disabled={disabled || (!value.trim() && !imageBase64 && mentionedItems.length === 0)}
     aria-label="Send message"
    >
     <Send size={18} />
    </button>
  </div>
  <div className="mt-3 text-center">
   <p className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-wide">Press <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">Enter</kbd> to send &middot; <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">Shift+Enter</kbd> for new line &middot; Type <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400">@</kbd> to attach</p>
  </div>
 </div>
 )
}
