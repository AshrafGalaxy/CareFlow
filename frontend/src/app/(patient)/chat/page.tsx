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

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const res = await api.get('/api/chat/sessions')
      setSessions(res.data)
      if (res.data.length > 0 && !activeSession) {
        selectSession(res.data[0])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

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
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-semibold text-gray-800">Conversations</h2>
          <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors shadow-sm" onClick={createNewSession} aria-label="New conversation">
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading && <p className="text-sm text-gray-500 text-center py-4">Loading...</p>}
          {!loading && sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <MessageSquare size={32} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">No conversations yet</p>
              <button onClick={createNewSession} className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">Start chatting</button>
            </div>
          )}
          {sessions.map((session) => (
            <button
              key={session.id}
              className={`group w-full text-left p-3 rounded-xl flex items-center space-x-3 transition-all ${activeSession?.id === session.id ? 'bg-blue-50/80 border border-blue-200 shadow-sm text-blue-800' : 'hover:bg-gray-100 border border-transparent text-gray-700'}`}
              onClick={() => selectSession(session)}
            >
              <div className={`p-2 rounded-lg ${activeSession?.id === session.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                <MessageSquare size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{session.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {new Date(session.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div 
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                onClick={(e) => deleteSession(e, session.id)}
              >
                <Trash2 size={16} />
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {activeSession ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-3xl shadow-sm flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
              <MessageSquare size={36} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3 tracking-tight">Welcome to CareFlow AI</h2>
            <p className="text-gray-500 max-w-md mb-8 text-lg leading-relaxed">Your AI-powered health companion. Ask questions about your reports, medications, or anything health-related.</p>
            <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md" onClick={createNewSession}>
              Start a conversation
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
