import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { FileText, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

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
 const [numPages, setNumPages] = useState(1)
 
 useEffect(() => {
  if (isOpen) {
   setIsLoading(true)
   setScale(1)
   setNumPages(1)
  }
 }, [isOpen, fileUrl])

 const lowerUrl = fileUrl?.toLowerCase() || ''
 const isPdf = fileType === 'application/pdf' || lowerUrl.endsWith('.pdf')
 const isCloudinaryPdf = isPdf && fileUrl.includes('res.cloudinary.com')
 const isRegularImage = !isPdf && (fileType?.startsWith('image/') || lowerUrl.endsWith('.png') || lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg'))
 
 const showCustomZoom = isRegularImage || isCloudinaryPdf

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
         {isCloudinaryPdf || isPdf ? 'PDF Viewer' : isRegularImage ? 'Image Viewer' : 'Document Viewer'}
        </DialogDescription>
       </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
       {showCustomZoom && (
        <div className="hidden sm:flex items-center bg-muted/50 rounded-lg p-1 border border-border/50">
         <button onClick={handleZoomOut} className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-all shadow-sm" title="Zoom Out">
          <ZoomOut size={16} />
         </button>
         <div className="px-3 text-xs font-semibold text-muted-foreground w-12 text-center">
          {Math.round(scale * 100)}%
         </div>
         <button onClick={handleZoomIn} className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-all shadow-sm" title="Zoom In">
          <ZoomIn size={16} />
         </button>
         <div className="w-px h-4 bg-border mx-1" />
         <button onClick={handleResetZoom} className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-all shadow-sm" title="Reset Zoom">
          <RotateCcw size={16} />
         </button>
        </div>
       )}

       <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all flex items-center justify-center shadow-sm font-semibold text-sm gap-2"
        title="Download File"
       >
        <Download size={16} />
        <span className="hidden sm:inline">Download</span>
       </a>
      </div>
     </div>
    </DialogHeader>

    <div className="flex-1 bg-slate-100/50 dark:bg-black/20 flex items-center justify-center overflow-auto relative">
     <AnimatePresence>
      {isLoading && (
       <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10"
       >
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-sm text-foreground font-semibold animate-pulse tracking-tight">Loading your report...</p>
       </motion.div>
      )}
     </AnimatePresence>

     {isCloudinaryPdf ? (
      <div className="w-full h-full flex flex-col items-center gap-8 p-8 overflow-auto">
       {Array.from({ length: numPages }).map((_, index) => {
        const pageNum = index + 1;
        const pageUrl = fileUrl.replace('/upload/', `/upload/pg_${pageNum}/`).replace(/\.pdf$/i, '.jpg');
        
        return (
         <img 
          key={pageNum}
          src={pageUrl} 
          alt={`${fileName} - Page ${pageNum}`} 
          style={{ width: `${scale * 100}%`, maxWidth: scale > 1 ? 'none' : '100%' }}
          className="h-auto object-contain rounded-lg shadow-xl border border-border/50 transition-all duration-200 ease-out"
          onLoad={() => {
           if (pageNum === numPages) {
            setNumPages(prev => prev + 1);
           }
           if (pageNum === 1) setIsLoading(false);
          }}
          onError={(e) => {
           if (pageNum === numPages) {
            (e.target as HTMLImageElement).style.display = 'none';
           }
           if (pageNum === 1) setIsLoading(false);
          }}
         />
        )
       })}
      </div>
     ) : isRegularImage ? (
      <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
       <img 
        src={fileUrl} 
        alt={fileName} 
        style={{ scale }}
        className="max-w-full max-h-full object-contain rounded-lg shadow-xl border border-border/50 origin-center transition-transform duration-200 ease-out"
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
       />
      </div>
     ) : isPdf ? (
      <div className="w-full h-full overflow-hidden flex items-center justify-center bg-slate-200 dark:bg-slate-900 relative">
       <iframe 
        src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
        className="w-full h-full border-0 bg-transparent absolute inset-0" 
        title={fileName}
        onLoad={() => setIsLoading(false)}
       />
      </div>
     ) : (
      <div className="text-center text-muted-foreground bg-card p-10 rounded-2xl shadow-xl border border-border/50 max-w-md mx-4">
       <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
        <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
       </div>
       <p className="text-lg font-semibold text-foreground mb-2">Preview Unavailable</p>
       <p className="text-sm mb-8 leading-relaxed">This particular file type requires an external application to view properly.</p>
       <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md"
       >
        <Download size={18} />
        Download to View
       </a>
      </div>
     )}
    </div>
   </DialogContent>
  </Dialog>
 )
}
