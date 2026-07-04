import { create } from 'zustand'

interface ChatMessage {
 id: string
 role: 'user' | 'assistant'
 content: string
 timestamp: string
}

interface ChatSession {
 id: string
 title: string
 created_at: string
}

interface ChatStore {
 sessions: ChatSession[]
 activeSession: ChatSession | null
 messages: ChatMessage[]
 isStreaming: boolean
 setSessions: (sessions: ChatSession[]) => void
 setActiveSession: (session: ChatSession | null) => void
 setMessages: (messages: ChatMessage[]) => void
 addMessage: (message: ChatMessage) => void
 setStreaming: (streaming: boolean) => void
 updateLastMessage: (token: string) => void
 appendSession: (session: ChatSession) => void
}

export const useChatStore = create<ChatStore>((set) => ({
 sessions: [],
 activeSession: null,
 messages: [],
 isStreaming: false,

 setSessions: (sessions) => set({ sessions }),
 setActiveSession: (session) => set({ activeSession: session }),
 setMessages: (messages) => set({ messages }),
 appendSession: (session) =>
  set((state) => ({ sessions: [session, ...state.sessions] })),

 addMessage: (message) =>
  set((state) => ({ messages: [...state.messages, message] })),

 setStreaming: (streaming) => set({ isStreaming: streaming }),

 updateLastMessage: (token) =>
  set((state) => {
   const msgs = [...state.messages]
   if (msgs.length === 0) return state
   const last = msgs[msgs.length - 1]
   if (last.role === 'assistant') {
    msgs[msgs.length - 1] = { ...last, content: last.content + token }
   } else {
    msgs.push({
     id: `stream-${Date.now()}`,
     role: 'assistant',
     content: token,
     timestamp: new Date().toISOString(),
    })
   }
   return { messages: msgs }
  }),
}))
