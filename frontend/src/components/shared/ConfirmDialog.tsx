import { useState } from 'react'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
 trigger: React.ReactNode
 title: string
 description: string
 onConfirm: () => Promise<void> | void
 confirmText?: string
 cancelText?: string
 isDestructive?: boolean
}

export function ConfirmDialog({
 trigger,
 title,
 description,
 onConfirm,
 confirmText = 'Confirm',
 cancelText = 'Cancel',
 isDestructive = false,
}: ConfirmDialogProps) {
 const [open, setOpen] = useState(false)
 const [isLoading, setIsLoading] = useState(false)

 const handleConfirm = async () => {
  try {
   setIsLoading(true)
   await onConfirm()
   setOpen(false)
  } catch (error) {
   console.error('Confirmation action failed:', error)
  } finally {
   setIsLoading(false)
  }
 }

 return (
  <Dialog open={open} onOpenChange={setOpen}>
   <DialogTrigger render={trigger as React.ReactElement} />
   <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
     <div className="flex items-center gap-3">
      {isDestructive && (
       <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-5 h-5 text-destructive" />
       </div>
      )}
      <DialogTitle>{title}</DialogTitle>
     </div>
     <DialogDescription className="pt-3">
      {description}
     </DialogDescription>
    </DialogHeader>
    <DialogFooter className="gap-3 sm:gap-3">
     <Button
      variant="outline"
      onClick={() => setOpen(false)}
      disabled={isLoading}
      className="min-w-[100px]"
     >
      {cancelText}
     </Button>
     <Button
      variant={isDestructive ? 'destructive' : 'default'}
      onClick={handleConfirm}
      disabled={isLoading}
      className="min-w-[110px]"
     >
      {isLoading ? (
       <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {isDestructive ? 'Deleting...' : 'Processing...'}
       </>
      ) : (
       confirmText
      )}
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 )
}
