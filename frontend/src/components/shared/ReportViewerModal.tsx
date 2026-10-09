'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { FileText, ExternalLink, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

interface ReportViewerModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  fileType?: string
  fileName: string
  reportId?: string
}

export function ReportViewerModal({ isOpen, onClose, fileUrl, fileType, fileName, reportId }: ReportViewerModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const token = useAuthStore((state) => state.token)
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const lowerUrl = fileUrl?.toLowerCase() || ''
  const isPdf = fileType === 'application/pdf' || lowerUrl.endsWith('.pdf') || lowerUrl.includes('.pdf?') || lowerUrl.includes('.pdf.pdf')
  const isRegularImage = !isPdf && (fileType?.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(lowerUrl))

  // Direct backend endpoint streams genuine application/pdf with zero 401 ACL blocks
  const directPdfUrl = reportId
    ? `${apiBase}/api/reports/${reportId}/file?token=${encodeURIComponent(token || '')}`
    : fileUrl

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 1200)
      return () => clearTimeout(timer)
    }
  }, [isOpen, fileUrl])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[85vh] lg:h-[90vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl">
        <DialogHeader className="px-4 sm:px-6 py-3.5 border-b border-border/40 shrink-0 bg-background/40 backdrop-blur-md z-20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0 shadow-sm border border-primary/10">
                <FileText size={18} strokeWidth={2.5} />
              </div>
              <div className="min-w-0 pr-2">
                <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight truncate">{fileName}</DialogTitle>
                <DialogDescription className="text-xs font-medium text-muted-foreground truncate">
                  {isPdf ? 'Clinical PDF Document' : isRegularImage ? 'Medical Image Document' : 'Clinical Document Viewer'}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* View / Open PDF in New Tab */}
              <a 
                href={directPdfUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all flex items-center justify-center shadow-sm font-semibold text-xs sm:text-sm gap-1.5 cursor-pointer active:scale-95"
                title={isPdf ? "Open Genuine PDF in New Browser Tab (with Adobe / Print tools)" : "Open Original File in New Tab"}
              >
                <ExternalLink size={15} />
                <span className="hidden sm:inline">{isPdf ? "View PDF" : "Open Original"}</span>
              </a>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-slate-100/60 dark:bg-black/60 flex items-center justify-center overflow-hidden relative">
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10"
              >
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-sm text-foreground font-semibold animate-pulse tracking-tight">Loading document...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {isPdf ? (
            <div className="w-full h-full flex flex-col items-stretch overflow-hidden relative bg-slate-100 dark:bg-black">
              <iframe
                src={`${directPdfUrl}#toolbar=1`}
                className="w-full h-full border-0"
                title={fileName}
                onLoad={() => setIsLoading(false)}
              />
            </div>
          ) : isRegularImage ? (
            <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-auto">
              <img 
                src={fileUrl} 
                alt={fileName} 
                className="max-w-full max-h-full object-contain rounded-xl shadow-xl border border-border/50"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground bg-card p-10 rounded-2xl shadow-xl border border-border/50 max-w-md mx-4">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">Document Preview</p>
              <p className="text-sm mb-8 leading-relaxed">
                Click below to view this document in your browser or desktop application.
              </p>
              <a 
                href={directPdfUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md cursor-pointer"
              >
                <ExternalLink size={18} />
                Open Document in New Tab
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
