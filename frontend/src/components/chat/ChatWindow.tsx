'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { ChatInput } from './ChatInput'
import { Copy, Check, RefreshCcw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { CareBotAvatar } from './CareBotAvatar'
import { EmergencyWidget } from './widgets/EmergencyWidget'
import { HospitalLocatorWidget } from './widgets/HospitalLocatorWidget'
import { SchedulingWidget } from './widgets/SchedulingWidget'
import { MedicationWidget } from './widgets/MedicationWidget'
import { PharmacyLocatorWidget } from './widgets/PharmacyLocatorWidget'
import { TriageWidget } from './widgets/TriageWidget'
import { NutritionWidget } from './widgets/NutritionWidget'
import { AdherenceWidget } from './widgets/AdherenceWidget'
import { motion, AnimatePresence } from 'framer-motion'

const CopyButton = ({ text }: { text: string }) => {
 const [copied, setCopied] = useState(false)

 const handleCopy = () => {
  navigator.clipboard.writeText(text)
  setCopied(true)
  toast.success("Copied to clipboard", { duration: 2000 })
  setTimeout(() => setCopied(false), 2000)
 }

 return (
  <button
   onClick={handleCopy}
   className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
   title="Copy message"
  >
   {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
  </button>
 )
}

import { ThumbsUp, ThumbsDown } from 'lucide-react'

const FeedbackButton = ({ messageId, token }: { messageId: string, token: string | null }) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)
  
  const submitFeedback = async (isPositive: boolean) => {
    if (feedback !== null || !token) return
    
    try {
      const response = await fetch(`${API_BASE}/api/chat/messages/${messageId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_positive: isPositive }),
      })
      
      if (response.ok) {
        setFeedback(isPositive ? 'positive' : 'negative')
        toast.success("Feedback recorded. Thank you!")
      } else {
        throw new Error('Failed to submit feedback')
      }
    } catch (err) {
      toast.error("Could not submit feedback")
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => submitFeedback(true)}
        disabled={feedback !== null}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          feedback === 'positive' ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "text-muted-foreground hover:text-emerald-500 hover:bg-slate-200 dark:hover:bg-slate-700",
          feedback === 'negative' && "opacity-50 cursor-not-allowed"
        )}
        title="Helpful"
      >
        <ThumbsUp size={14} />
      </button>
      <button
        onClick={() => submitFeedback(false)}
        disabled={feedback !== null}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          feedback === 'negative' ? "text-rose-500 bg-rose-50 dark:bg-rose-950/30" : "text-muted-foreground hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700",
          feedback === 'positive' && "opacity-50 cursor-not-allowed"
        )}
        title="Not helpful"
      >
        <ThumbsDown size={14} />
      </button>
    </div>
  )
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function ChatWindow({ initialValue }: { initialValue?: string }) {
 const { messages, isStreaming, activeSession, addMessage, setStreaming, updateLastMessage, updateSessionTitle } = useChatStore()
 const { token } = useAuthStore()
 const bottomRef = useRef<HTMLDivElement>(null)
 const [error, setError] = useState<string | null>(null)

 // Auto-scroll to bottom when messages change
 useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
 }, [messages])

 const sendMessage = async (content: string, imageBase64?: string) => {
  if (!activeSession || isStreaming) return
  setError(null)

  // Add user message locally
  addMessage({
   id: `user-${Date.now()}`,
   role: 'user',
   content: content || 'Uploaded an image',
   timestamp: new Date().toISOString(),
   image_base64: imageBase64,
  })

  // Removed local widget injection. We now rely on the AI emitting the widget tokens.

  setStreaming(true)

  try {
   const response = await fetch(
    `${API_BASE}/api/chat/${activeSession.id}/message`,
    {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
     },
     body: JSON.stringify({ 
       content: content || 'Please analyze this image.', 
       image_base64: imageBase64 
     }),
    }
   )

   if (!response.ok) {
    const errorText = await response.text().catch(() => 'No text')
    throw new Error(`Failed to send message: ${response.status} ${errorText}`)
   }
   if (!response.body) throw new Error('No response body')

   const reader = response.body.getReader()
   const decoder = new TextDecoder()

   while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value, { stream: true })
    const lines = text.split('\n')

    for (const line of lines) {
     if (!line.startsWith('data: ')) continue
     const data = line.slice(6).trim()
     if (data === '[DONE]') break
     if (!data) continue

     try {
      const parsed = JSON.parse(data)
      if (parsed.error) {
       throw new Error(parsed.error)
      }
      if (parsed.token) {
       updateLastMessage(parsed.token)
      }
      if (parsed.title) {
       updateSessionTitle(activeSession.id, parsed.title)
      }
     } catch (e: any) {
      if (e.message && e.message !== "Unexpected end of JSON input") {
       throw e
      }
     }
    }
   }
  } catch (err: any) {
   const errorMessage = err.message || 'Failed to get AI response. Please try again.'
   setError(errorMessage)
   console.error('Chat error:', err)
  } finally {
   setStreaming(false)
  }
 }

 return (
  <div className="flex flex-col h-full absolute inset-0">
   <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-card flex flex-col">
    <AnimatePresence initial={false}>
     {messages.length === 0 && (
      <motion.div 
       key="empty-state"
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto py-12"
      >
       <CareBotAvatar size={100} className="mb-6 opacity-90 shadow-xl" />
       <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">CareFlow AI is ready</h3>
       <p className="text-base text-muted-foreground leading-relaxed font-medium">Ask me anything about your health reports, medications, or upcoming appointments.</p>
      </motion.div>
     )}

     {messages.map((msg, index) => {
      // Clean content by removing widget tokens for text display
      let displayContent = msg.content
      const hasEmergency = displayContent.includes('[[WIDGET:EMERGENCY]]')
      const hasHospital = displayContent.includes('[[WIDGET:HOSPITAL]]')
      const hasSchedule = displayContent.includes('[[WIDGET:SCHEDULE]]')
      const hasMedication = displayContent.includes('[[WIDGET:MEDICATION]]')
      const hasPharmacy = displayContent.includes('[[WIDGET:PHARMACY]]')
      const hasTriage = displayContent.includes('[[WIDGET:TRIAGE]]')
      const hasNutrition = displayContent.includes('[[WIDGET:NUTRITION]]')
      const hasAdherence = displayContent.includes('[[WIDGET:ADHERENCE]]')

      displayContent = displayContent
        .replace('[[WIDGET:EMERGENCY]]', '')
        .replace('[[WIDGET:HOSPITAL]]', '')
        .replace('[[WIDGET:SCHEDULE]]', '')
        .replace('[[WIDGET:MEDICATION]]', '')
        .replace('[[WIDGET:PHARMACY]]', '')
        .replace('[[WIDGET:TRIAGE]]', '')
        .replace('[[WIDGET:NUTRITION]]', '')
        .replace('[[WIDGET:ADHERENCE]]', '')
        .trim()

      const isLatestMessage = index === messages.length - 1

      return (
       <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col max-w-3xl mb-8 ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
       >
        <div className={`flex items-start max-w-full ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
         {msg.role === 'assistant' && (
          <CareBotAvatar size={40} className="mr-4 mt-1 shrink-0" />
         )}
         <div className="group relative max-w-full flex-1 min-w-0">
          {displayContent && (
           <div className={`px-5 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-sky-500 text-white rounded-br-sm ml-4 font-medium' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm prose prose-sm prose-slate dark:prose-invert max-w-none'}`}>
            {msg.role === 'user' ? (
             <div className="flex flex-col gap-2">
              {(msg as any).image_base64 && (
               <img src={(msg as any).image_base64} alt="User uploaded" className="max-w-[200px] rounded-lg border border-sky-400/30 object-cover shadow-sm" />
              )}
              <span className="whitespace-pre-wrap">{displayContent}</span>
             </div>
            ) : (
             <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent}
             </ReactMarkdown>
            )}
           </div>
          )}
          {msg.role === 'assistant' && displayContent && (
           <div className="absolute -bottom-8 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
            <CopyButton text={displayContent} />
            <FeedbackButton messageId={msg.id} token={token} />
           </div>
          )}
         </div>
        </div>
        
        {/* Render Widgets below the message text ONLY if it's the latest message */}
        {msg.role === 'assistant' && isLatestMessage && (hasEmergency || hasHospital || hasSchedule || hasMedication || hasPharmacy || hasTriage || hasNutrition || hasAdherence) && (
         <div className={`mt-4 w-full ${displayContent ? 'ml-14' : ''}`}>
          {hasEmergency && <EmergencyWidget />}
          {hasHospital && <HospitalLocatorWidget />}
          {hasSchedule && <SchedulingWidget />}
          {hasMedication && <MedicationWidget />}
          {hasPharmacy && <PharmacyLocatorWidget />}
          {hasTriage && <TriageWidget />}
          {hasNutrition && <NutritionWidget />}
          {hasAdherence && <AdherenceWidget />}
         </div>
        )}
       </motion.div>
      )
     })}

     {isStreaming && (
      <motion.div key="typing-indicator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start max-w-3xl mr-auto mt-4 mb-8">
       <CareBotAvatar size={40} className="mr-4 mt-1" />
       <div className="px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl rounded-bl-sm flex items-center gap-3 shadow-sm min-w-[120px]">
        <div className="flex space-x-1.5">
         <div className="w-2 h-2 bg-sky-400/80 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
         <div className="w-2 h-2 bg-sky-400/80 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
         <div className="w-2 h-2 bg-sky-400/80 rounded-full animate-bounce"></div>
        </div>
        <span className="text-xs font-medium text-slate-500 animate-pulse">AI is thinking...</span>
       </div>
      </motion.div>
     )}

     {error && !isStreaming && (
      <motion.div key="error-message" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start max-w-3xl mr-auto mt-4 mb-8">
       <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center text-sm font-bold flex-shrink-0 mr-4 shadow-sm">
        <AlertCircle size={20} />
       </div>
       <div className="flex flex-col items-start gap-2">
        <div className="px-5 py-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-3xl rounded-bl-sm text-[15px] shadow-sm">
         {error}
        </div>
        <button 
         onClick={() => {
          const lastUserMsg = messages.filter(m => m.role === 'user').pop()
          if (lastUserMsg) sendMessage(lastUserMsg.content)
         }}
         className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors ml-2"
        >
         <RefreshCcw size={12} />
         Retry Message
        </button>
       </div>
      </motion.div>
     )}
    </AnimatePresence>

    {messages.length > 0 && <div ref={bottomRef} className="h-4 shrink-0" />}
   </div>

   <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 md:p-6 pb-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
    <ChatInput onSend={sendMessage} disabled={isStreaming || !activeSession} initialValue={initialValue} />
   </div>
  </div>
 )
}
