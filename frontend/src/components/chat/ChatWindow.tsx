'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { ChatInput } from './ChatInput'

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

 const sendMessage = async (content: string) => {
  if (!activeSession || isStreaming) return
  setError(null)

  // Add user message immediately
  addMessage({
   id: `user-${Date.now()}`,
   role: 'user',
   content,
   timestamp: new Date().toISOString(),
  })

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
     body: JSON.stringify({ content }),
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
   <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-card">
    {messages.length === 0 && (
     <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto opacity-70">
      <div className="text-5xl mb-4 p-4 bg-muted rounded-full">🤖</div>
      <h3 className="text-xl font-bold text-foreground mb-2">CareFlow AI is ready</h3>
      <p className="text-base text-muted-foreground leading-relaxed">Ask me anything about your health reports, medications, or upcoming appointments.</p>
     </div>
    )}

    {messages.map((msg) => (
     <div
      key={msg.id}
      className={`flex items-start max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
     >
      {msg.role === 'assistant' && (
       <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-sky-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mr-4 shadow-sm">
        CF
       </div>
      )}
      <div className={`px-5 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-sky-500 text-white rounded-br-sm ml-4' : 'bg-muted border border-border text-foreground rounded-bl-sm prose prose-sm prose-sky max-w-none dark:prose-invert'}`}>
       {msg.role === 'user' ? (
        <p className="whitespace-pre-wrap">{msg.content}</p>
       ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
         {msg.content}
        </ReactMarkdown>
       )}
      </div>
     </div>
    ))}

    {isStreaming && messages[messages.length - 1]?.role === 'user' && (
     <div className="flex items-start max-w-3xl mr-auto">
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-sky-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mr-4 shadow-sm">
       CF
      </div>
      <div className="px-6 py-5 bg-muted border border-border rounded-3xl rounded-bl-sm flex items-center space-x-2 shadow-sm">
       <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
       <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
       <div className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce"></div>
      </div>
     </div>
    )}

    {error && (
     <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl text-center max-w-md mx-auto shadow-sm">
      <p className="font-medium">{error}</p>
     </div>
    )}

    <div ref={bottomRef} className="h-4" />
   </div>

   <div className="border-t border-border bg-card p-4 md:p-6">
    <ChatInput onSend={sendMessage} disabled={isStreaming || !activeSession} initialValue={initialValue} />
   </div>
  </div>
 )
}
