'use client'

import { useEffect, useState } from 'react'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { useChatStore } from '@/store/chatStore'
import { ChatWindow } from '@/components/chat/ChatWindow'

interface ChatSession {
 id: string
 title: string
 created_at: string
}

export default function ChatPage() {
 const { sessions, activeSession, messages, setSessions, setActiveSession, setMessages } = useChatStore()
 const [loading, setLoading] = useState(true)

 const loadSessions = async () => {
  try {
   const res = await api.get('/api/chat/sessions')
   // Backend returns a plain array — guard against all response shapes
   const data = res.data
   const list: ChatSession[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.sessions)
     ? data.sessions
     : []
   setSessions(list)
   if (list.length > 0 && !activeSession) {
    setActiveSession(list[0])
   }
  } catch (e) {
   console.error('[Chat] Failed to load sessions:', e)
   setSessions([])
  } finally {
   setLoading(false)
  }
 }

 useEffect(() => {
  loadSessions()
 }, [])

 const selectSession = async (session: ChatSession) => {
  setActiveSession(session)
  try {
   const res = await api.get(`/api/chat/${session.id}/messages`)
   setMessages(
    res.data.map((m: { id: string; role: 'user' | 'assistant'; content: string; timestamp: string }) => ({
     id: m.id,
     role: m.role,
     content: m.content,
     timestamp: m.timestamp,
    }))
   )
  } catch {
   setMessages([])
  }
 }

 const createNewSession = async () => {
  try {
   const res = await api.post('/api/chat/sessions', {})
   const newSession = res.data
   setSessions([newSession, ...sessions])
   setActiveSession(newSession)
   setMessages([])
  } catch (e) {
   console.error(e)
  }
 }

 const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
  e.stopPropagation()
  if (!window.confirm("Are you sure you want to delete this conversation?")) return
  
  try {
   await api.delete(`/api/chat/${sessionId}`)
   setSessions(sessions.filter(s => s.id !== sessionId))
   if (activeSession?.id === sessionId) {
    setActiveSession(null)
    setMessages([])
   }
  } catch (err) {
   console.error(err)
  }
 }


 return (
  <div className="flex-1 flex overflow-hidden bg-background rounded-2xl border border-border shadow-sm h-[calc(100vh-7.5rem)] min-h-[500px]">
   {/* Sidebar for chat sessions */}
   <aside className="w-80 border-r border-border bg-card flex flex-col hidden md:flex shrink-0">
    <div className="p-4 border-b border-border flex justify-between items-center bg-card">
     <h2 className="font-heading font-bold text-lg tracking-tight text-foreground">Conversations</h2>
     <button
      onClick={createNewSession}
      className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors shadow-sm"
      aria-label="New chat"
     >
      <Plus size={18} strokeWidth={2.5} />
     </button>
    </div>
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
     {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>}
     {!loading && sessions.length === 0 && (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
       <MessageSquare size={32} className="mb-2 opacity-30" />
       <p className="text-sm font-medium">No conversations yet</p>
       <button onClick={createNewSession} className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">Start chatting</button>
      </div>
     )}
     {sessions.map((session) => (
      <button
       key={session.id}
       className={`group w-full text-left p-3 rounded-xl flex items-center space-x-3 transition-all ${activeSession?.id === session.id ? 'bg-primary/10 border border-primary/20 shadow-sm text-primary' : 'hover:bg-accent border border-transparent text-foreground'}`}
       onClick={() => selectSession(session)}
      >
       <div className={`p-2 rounded-lg ${activeSession?.id === session.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
        <MessageSquare size={16} />
       </div>
       <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{session.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
         {new Date(session.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </p>
       </div>
       <div 
        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
        onClick={(e) => deleteSession(e, session.id)}
       >
        <Trash2 size={16} />
       </div>
      </button>
     ))}
    </div>
   </aside>

   {/* Main Chat Area */}
   <main className="flex-1 flex flex-col bg-card overflow-hidden relative">
    {activeSession ? (
     <ChatWindow />
    ) : (
     <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background/50">
      <div className="w-20 h-20 bg-gradient-to-tr from-sky-500/20 to-indigo-500/10 rounded-3xl shadow-sm flex items-center justify-center text-sky-500 mb-6 border border-sky-500/20">
       <MessageSquare size={36} />
      </div>
      <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Welcome to CareFlow AI</h2>
      <p className="text-muted-foreground max-w-md mb-8 text-lg leading-relaxed">Your AI-powered health companion. Ask questions about your reports, medications, or anything health-related.</p>
      <button className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md" onClick={createNewSession}>
       Start a conversation
      </button>
     </div>
    )}
   </main>
  </div>
 )
}
