import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { FileText, ExternalLink, ZoomIn, ZoomOut, RotateCcw, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface ReportViewerModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  fileType?: string
  fileName: string
}

export function ReportViewerModal({ isOpen, onClose, fileUrl, fileType, fileName }: ReportViewerModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setScale(1)
      // Safety timeout: ensure loading state clears even if embed onLoad event does not bubble
      const timer = setTimeout(() => setIsLoading(false), 1200)
      return () => clearTimeout(timer)
    }
  }, [isOpen, fileUrl])

  const lowerUrl = fileUrl?.toLowerCase() || ''
  const isPdf = fileType === 'application/pdf' || lowerUrl.endsWith('.pdf') || lowerUrl.includes('.pdf?')
  const isRegularImage = !isPdf && (fileType?.startsWith('image/') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.webp'))

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5))
  const handleResetZoom = () => setScale(1)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl h-[85vh] lg:h-[90vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border/40 shrink-0 bg-background/40 backdrop-blur-md z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0 shadow-sm border border-primary/10">
                <FileText size={20} strokeWidth={2.5} />
              </div>
              <div className="min-w-0 pr-4">
                <DialogTitle className="text-lg font-semibold tracking-tight truncate">{fileName}</DialogTitle>
                <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                  {isPdf ? 'PDF Document Viewer' : isRegularImage ? 'Image Document Viewer' : 'Clinical Document Viewer'}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {isRegularImage && (
                <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                  <button 
                    onClick={handleZoomOut} 
                    disabled={scale <= 0.5}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-foreground hover:bg-white dark:hover:bg-slate-700/80 rounded-lg transition-all disabled:opacity-30 cursor-pointer active:scale-95" 
                    title="Zoom Out"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <div className="px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 min-w-[3.5rem] text-center select-none font-mono">
                    {Math.round(scale * 100)}%
                  </div>
                  <button 
                    onClick={handleZoomIn} 
                    disabled={scale >= 3}
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-foreground hover:bg-white dark:hover:bg-slate-700/80 rounded-lg transition-all disabled:opacity-30 cursor-pointer active:scale-95" 
                    title="Zoom In"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                  <button 
                    onClick={handleResetZoom} 
                    className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-foreground hover:bg-white dark:hover:bg-slate-700/80 rounded-lg transition-all cursor-pointer active:scale-95" 
                    title="Reset Zoom"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              )}

              {fileUrl && (
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all flex items-center justify-center shadow-sm font-semibold text-sm gap-2 cursor-pointer active:scale-95"
                  title={isPdf ? "Open PDF in New Browser Tab" : "Open Original File in New Tab"}
                >
                  <ExternalLink size={16} />
                  <span className="hidden sm:inline">{isPdf ? "View PDF" : "Open in New Tab"}</span>
                </a>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-slate-100/50 dark:bg-black/30 flex items-center justify-center overflow-auto relative">
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10"
              >
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-sm text-foreground font-semibold animate-pulse tracking-tight">Loading document preview...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {isPdf ? (
            <div className="w-full h-full flex flex-col items-stretch overflow-hidden relative bg-slate-100 dark:bg-slate-950">
              <object
                data={`${fileUrl}#toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full h-full border-0"
                onLoad={() => setIsLoading(false)}
              >
                <iframe
                  src={`${fileUrl}#toolbar=1&navpanes=0`}
                  className="w-full h-full border-0"
                  title={fileName}
                  onLoad={() => setIsLoading(false)}
                >
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <FileText size={32} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{fileName}</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        View this report directly in your browser with native zoom, print, and PDF tools.
                      </p>
                    </div>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                    >
                      <ExternalLink size={16} />
                      <span>View PDF in New Tab</span>
                    </a>
                  </div>
                </iframe>
              </object>
            </div>
          ) : isRegularImage ? (
            <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
              <img 
                src={fileUrl} 
                alt={fileName} 
                style={{ transform: `scale(${scale})` }}
                className="max-w-full max-h-full object-contain rounded-lg shadow-xl border border-border/50 origin-center transition-transform duration-200 ease-out"
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
                Click below to view this document in your browser or default desktop application.
              </p>
              <a 
                href={fileUrl} 
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
