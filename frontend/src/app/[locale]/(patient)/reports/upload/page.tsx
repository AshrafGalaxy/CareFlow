"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useRouter } from "@/i18n/routing"
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { PageHeader } from "@/components/shared/PageHeader"
import { formatFileSize } from "@/lib/formatters"
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL, ACCEPTED_FILE_LABELS, API_ROUTES } from "@/lib/constants"

type UploadState = "idle" | "hover" | "selected" | "uploading" | "success" | "error"

export default function ReportUploadPage() {
 const [file, setFile] = useState<File | null>(null)
 const [status, setStatus] = useState<UploadState>("idle")
 const [progress, setProgress] = useState(0)
 const [errorMessage, setErrorMessage] = useState("")
 const [shakeKey, setShakeKey] = useState(0)
 const router = useRouter()

 const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: unknown[]) => {
  if (rejectedFiles.length > 0) {
   setStatus("error")
   setShakeKey(k => k + 1)
   const { errors } = rejectedFiles[0] as any
   setErrorMessage(errors[0]?.code === "file-too-large"
    ? "File is too large. Maximum size is 10MB."
    : "Invalid file type. Please upload PDF, JPG, or PNG only.")
   return
  }
  if (acceptedFiles.length > 0) {
   setFile(acceptedFiles[0])
   setStatus("selected")
   setErrorMessage("")
  }
 }, [])

 const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: ACCEPTED_FILE_TYPES,
  maxSize: MAX_FILE_SIZE_BYTES,
  multiple: false,
  onDragEnter: () => status === "idle" && setStatus("hover"),
  onDragLeave: () => status === "hover" && setStatus("idle"),
 })

 const handleUpload = async () => {
  if (!file) return
  setStatus("uploading")
  setProgress(0)
  const formData = new FormData()
  formData.append("file", file)
  try {
   const res = await api.post(API_ROUTES.REPORTS.UPLOAD, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
     if (e.total) setProgress(Math.round((e.loaded * 100) / e.total))
    },
   })
   setStatus("success")
   setTimeout(() => router.push(`/reports/${res.data.id}`), 1500)
  } catch (error: unknown) {
   toast.error((error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Failed to upload report")
   setStatus("error")
   setShakeKey(k => k + 1)
  }
 }

 const removeFile = () => { setFile(null); setStatus("idle"); setProgress(0) }

 const isError = status === "error"
 const isHover = status === "hover" || isDragActive
 const isIdle = status === "idle" || isError

 return (
  <div className="space-y-6">
   <PageHeader
    breadcrumbs={[{ label: "My Reports", href: "/reports" }]}
    title="Upload Medical Records"
    subtitle="Upload a PDF or image of your lab report. Our AI will translate the medical jargon into plain language within minutes."
   />

   <div className="grid lg:grid-cols-3 gap-6">
    {/* Main Upload Card */}
    <div className="lg:col-span-2 bg-card rounded-2xl border border-slate-100 shadow-sm p-8">

     {/* States A, B, E — Drop Zone */}
     {isIdle && (
      <div
       key={shakeKey}
       {...getRootProps()}
       className={`
        flex flex-col items-center justify-center min-h-[280px] border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
        ${isError ? "border-red-400 bg-red-50 animate-shake" : isHover ? "border-sky-500 bg-sky-50" : "border-slate-300 bg-slate-50 hover:border-slate-400"}
       `}
      >
       <input {...getInputProps()} />
       {isError ? (
        <>
         <AlertCircle className="h-14 w-14 text-red-400 mb-4" />
         <p className="text-base font-semibold text-red-600 mb-1">Upload Error</p>
         <p className="text-sm text-red-500 text-center max-w-xs">{errorMessage}</p>
         <p className="text-xs text-slate-400 mt-3">Click or drag to try again</p>
        </>
       ) : (
        <>
         <UploadCloud className={`h-14 w-14 mb-4 transition-colors duration-200 ${isHover ? "text-sky-500" : "text-slate-300"}`} />
         <p className={`text-base font-semibold mb-1 transition-colors ${isHover ? "text-sky-700" : "text-slate-700"}`}>
          {isHover ? "Drop your file here!" : "Drag your medical records here"}
         </p>
         {!isHover && <p className="text-sm text-slate-400 mb-5">or click to browse files from your device</p>}
         <div className="flex gap-2 flex-wrap justify-center">
          {ACCEPTED_FILE_LABELS.map(f => (
           <span key={f} className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{f}</span>
          ))}
         </div>
         <p className="text-xs text-slate-400 mt-4">Maximum file size: {MAX_FILE_SIZE_LABEL}</p>
        </>
       )}
      </div>
     )}

     {/* State C — File Selected */}
     {status === "selected" && file && (
      <div className="space-y-6">
       <div className="flex items-center gap-4 p-5 border border-slate-200 rounded-xl bg-slate-50">
        <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
         <FileText className="h-6 w-6 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
         <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
         <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
        </div>
        <button onClick={removeFile} aria-label="Remove file" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
         <X className="h-4 w-4" />
        </button>
       </div>
       <button
        onClick={handleUpload}
        className="btn-glow w-full h-13 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 py-3.5 transition-colors"
       >
        <UploadCloud className="h-5 w-5" />
        Upload & Analyze
       </button>
      </div>
     )}

     {/* State D — Uploading */}
     {status === "uploading" && (
      <div className="flex flex-col items-center justify-center min-h-[280px] gap-6">
       <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
       <div className="w-full max-w-sm">
        <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
         <span>Uploading...</span>
         <span>{progress}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
         <div
          className="h-full bg-sky-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
         />
        </div>
       </div>
      </div>
     )}

     {/* State Success */}
     {status === "success" && (
      <div className="flex flex-col items-center justify-center min-h-[280px] gap-4">
       <CheckCircle2 className="h-16 w-16 text-emerald-500" />
       <p className="text-lg font-semibold text-foreground">Upload Successful!</p>
       <p className="text-sm text-slate-500">Redirecting to your report summary...</p>
      </div>
     )}
    </div>

    {/* Sidebar Info Card */}
    <div className="space-y-4">
     <div className="bg-card rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">What files can I upload?</h3>
      <ul className="space-y-2.5 text-sm">
       {["Blood Test Reports", "X-Ray Images", "Prescriptions (image)", "Discharge Summaries"].map(item => (
        <li key={item} className="flex items-center gap-2 text-slate-600">
         <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {item}
        </li>
       ))}
       {["Excel / Word documents"].map(item => (
        <li key={item} className="flex items-center gap-2 text-slate-400 line-through">
         <AlertCircle className="h-4 w-4 text-red-400 shrink-0" /> {item}
        </li>
       ))}
      </ul>
     </div>

     <div className="bg-sky-50 rounded-2xl border border-sky-100 p-6">
      <div className="flex items-center gap-2 mb-3">
       <Info className="h-4 w-4 text-sky-500 shrink-0" />
       <h3 className="text-sm font-semibold text-sky-900">Tips for best results</h3>
      </div>
      <ul className="space-y-2 text-xs text-sky-700">
       <li>• Ensure all text in the report is clearly visible</li>
       <li>• Avoid glare or shadows when photographing documents</li>
       <li>• Upload the original PDF when possible for best accuracy</li>
      </ul>
     </div>
    </div>
   </div>
  </div>
 )
}
