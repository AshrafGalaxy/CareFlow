import { Link } from "@/i18n/routing"
import Image from "next/image"
import { FileSearch } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <Image 
            src="/favicon.svg" 
            alt="CareFlow AI Logo" 
            width={36} 
            height={36} 
            className="h-9 w-9"
            priority
          />
          <span className="font-brand text-2xl font-bold text-slate-900 tracking-tight">
            CareFlow <span className="text-sky-500">AI</span>
          </span>
        </div>

        <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-8">
          <FileSearch className="h-10 w-10 text-slate-400" />
        </div>

        <p className="text-sm font-semibold text-sky-600 uppercase tracking-widest mb-3">
          404 — Page Not Found
        </p>
        <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
          This page doesn&apos;t exist
        </h1>
        <p className="text-slate-500 text-base mb-10 leading-relaxed">
          We couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-8 py-3 rounded-xl shadow-sm transition-colors duration-200"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-sm font-medium px-8 py-3 rounded-xl transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
