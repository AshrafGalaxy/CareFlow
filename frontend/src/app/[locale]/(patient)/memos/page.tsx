"use client"

import { useTranslations } from "next-intl"
import useSWR from "swr"
import api from "@/lib/api"
import { API_ROUTES } from "@/lib/constants"
import { Card } from "@/components/ui/card"
import { MessageSquare, Calendar, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface Memo {
  id: string
  doctor_name: string
  content: string
  created_at: string
}

const fetcher = (url: string) => api.get(url).then(res => res.data)

export default function MemosPage() {
  const t = useTranslations("Memos")
  
  const { data: memos, isLoading, error } = useSWR<Memo[]>(
    API_ROUTES.DASHBOARD.MEMOS,
    fetcher
  )

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
        <MessageSquare className="w-12 h-12 text-rose-500 opacity-50" />
        <p className="text-muted-foreground">Failed to load clinical notes</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Clinical Notes</h1>
        <p className="text-muted-foreground mt-1">Review notes and memos left by your doctors.</p>
      </div>

      <div className="grid gap-6">
        {(!memos || memos.length === 0) ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-card rounded-2xl border border-border shadow-sm">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-lg font-medium text-foreground">No notes found</p>
            <p className="text-sm text-muted-foreground">You don't have any clinical notes or memos from your doctors yet.</p>
          </div>
        ) : (
          memos.map((memo) => (
            <Card key={memo.id} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6 relative overflow-hidden shadow-sm group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="bg-amber-500/20 p-2.5 rounded-xl shrink-0 mt-0.5">
                  <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-amber-900 dark:text-amber-500">
                      Note from Dr. {memo.doctor_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700/60 dark:text-amber-500/60">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(memo.created_at), "PPP 'at' p")}
                    </div>
                  </div>
                  <p className="text-sm text-amber-900/80 dark:text-amber-400/90 leading-relaxed italic whitespace-pre-wrap">
                    "{memo.content}"
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
