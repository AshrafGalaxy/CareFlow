"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { PenLine, Plus, Loader2, Calendar } from "lucide-react";
import api from "@/lib/api";

export default function PatientMemo({ patientId, memos: initialMemos }: { patientId: string, memos: any[] }) {
  const [memos, setMemos] = useState(initialMemos || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newMemoContent, setNewMemoContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMemo = async () => {
    if (!newMemoContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/dashboard/patients/${patientId}/memos`, {
        content: newMemoContent
      });
      setMemos([res.data, ...memos]);
      setNewMemoContent("");
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to add memo", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 rounded-2xl border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500">
            <PenLine className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-lg text-slate-900 dark:text-white">Clinical Notes</h2>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Note
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {isAdding && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
              rows={4}
              placeholder="Type your clinical note here..."
              value={newMemoContent}
              onChange={(e) => setNewMemoContent(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddMemo}
                disabled={isSubmitting || !newMemoContent.trim()}
                className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Save Note
              </button>
            </div>
          </div>
        )}

        {(!memos || memos.length === 0) && !isAdding ? (
          <div className="h-32 flex flex-col items-center justify-center text-center">
             <p className="text-sm text-slate-500 dark:text-slate-400">No clinical notes recorded yet.</p>
          </div>
        ) : (
          memos.map((memo: any) => (
            <div key={memo.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(memo.created_at).toLocaleString()}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {memo.content}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
