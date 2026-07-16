'use client'

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useInsurance } from "@/hooks/useInsurance"
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, ShieldCheck, IndianRupee, FileCheck, Stethoscope, Search, CheckCircle, Circle, Hospital, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import NetworkHospitalMap from "@/components/insurance/NetworkHospitalMap"

const STATES = ["Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Rajasthan", "West Bengal", "Telangana"]

// Map of scheme names (partial match) → { applyUrl, infoUrl }
const SCHEME_LINKS: { match: string; applyUrl: string; infoUrl: string }[] = [
  {
    match: "Ayushman Bharat",
    applyUrl: "https://beneficiary.nha.gov.in/",
    infoUrl: "https://pmjay.gov.in/",
  },
  {
    match: "PM-JAY",
    applyUrl: "https://beneficiary.nha.gov.in/",
    infoUrl: "https://pmjay.gov.in/",
  },
  {
    match: "Mahatma Jyotiba Phule Jan Arogya",
    applyUrl: "https://www.jeevandayee.gov.in/",
    infoUrl: "https://www.jeevandayee.gov.in/",
  },
  {
    match: "MJPJAY",
    applyUrl: "https://www.jeevandayee.gov.in/",
    infoUrl: "https://www.jeevandayee.gov.in/",
  },
  {
    match: "ESI",
    applyUrl: "https://esic.gov.in/",
    infoUrl: "https://esic.gov.in/medical-benefit",
  },
  {
    match: "Employees' State Insurance",
    applyUrl: "https://esic.gov.in/",
    infoUrl: "https://esic.gov.in/medical-benefit",
  },
  {
    match: "Central Government Health Scheme",
    applyUrl: "https://cghs.gov.in/",
    infoUrl: "https://cghs.gov.in/",
  },
  {
    match: "CGHS",
    applyUrl: "https://cghs.gov.in/",
    infoUrl: "https://cghs.gov.in/",
  },
  {
    match: "Rashtriya Swasthya Bima Yojana",
    applyUrl: "https://www.india.gov.in/spotlight/rashtriya-swasthya-bima-yojana",
    infoUrl: "https://labour.gov.in/rsby",
  },
  {
    match: "RSBY",
    applyUrl: "https://www.india.gov.in/spotlight/rashtriya-swasthya-bima-yojana",
    infoUrl: "https://labour.gov.in/rsby",
  },
  {
    match: "Aam Aadmi Bima Yojana",
    applyUrl: "https://licindia.in/Products/Insurance-Plan/Aam-Aadmi-Bima-Yojana",
    infoUrl: "https://licindia.in/Products/Insurance-Plan/Aam-Aadmi-Bima-Yojana",
  },
  {
    match: "Karnataka Arogya Bhagya",
    applyUrl: "https://arogyabhagya.karnataka.gov.in/",
    infoUrl: "https://arogyabhagya.karnataka.gov.in/",
  },
  {
    match: "Chief Minister's Comprehensive Insurance",
    applyUrl: "https://www.cmchistn.com/",
    infoUrl: "https://www.cmchistn.com/",
  },
  {
    match: "Delhi Arogya Kosh",
    applyUrl: "https://health.delhi.gov.in/",
    infoUrl: "https://health.delhi.gov.in/",
  },
  {
    match: "Bhamashah Swasthya Bima Yojana",
    applyUrl: "https://bsby.rajasthan.gov.in/",
    infoUrl: "https://bsby.rajasthan.gov.in/",
  },
  {
    match: "Swasthya Sathi",
    applyUrl: "https://swasthyasathi.gov.in/",
    infoUrl: "https://swasthyasathi.gov.in/",
  },
  {
    match: "Arogyasri",
    applyUrl: "https://www.aarogyasri.telangana.gov.in/",
    infoUrl: "https://www.aarogyasri.telangana.gov.in/",
  },
]

function getSchemeLinks(schemeName: string) {
  const lower = schemeName.toLowerCase()
  const match = SCHEME_LINKS.find(s => lower.includes(s.match.toLowerCase()))
  return match ?? {
    applyUrl: `https://www.google.com/search?q=${encodeURIComponent(schemeName + ' apply online India')}`,
    infoUrl: `https://www.google.com/search?q=${encodeURIComponent(schemeName + ' official site India')}`,
  }
}

export default function InsuranceNavigatorPage() {
  const [query, setQuery] = useState("")
  const [state, setState] = useState("Maharashtra")
  const { loading, result, submitQuery } = useInsurance()

  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({})

  async function handleSubmit() {
    if (!query.trim()) {
      toast.error("Please describe your medical situation first.")
      return
    }
    try {
      await submitQuery(query, state)
      setCheckedDocs({}) // Reset checkboxes
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Insurance Navigator failed. Please try again.")
    }
  }

  const toggleDoc = (i: number) => {
    setCheckedDocs(prev => ({ ...prev, [i]: !prev[i] }))
  }

  return (
    <div className="w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">Insurance Navigator</h1>
            <p className="text-sm text-muted-foreground mt-1">Discover government schemes, estimate costs, and gather documents.</p>
          </div>
          <Link 
            href="/timeline" 
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-card hover:bg-muted border border-border text-foreground rounded-xl font-semibold text-sm shadow-sm transition-all active:scale-95"
          >
            <ShieldCheck size={18} className="text-sky-500" /> My Insurance Status
          </Link>
        </div>

        {/* Query Input Card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-1 border-b border-border bg-slate-50 dark:bg-slate-900/50">
            <Textarea
              placeholder='Describe your situation (e.g. "My doctor recommended knee replacement surgery")'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[120px] resize-none border-0 focus-visible:ring-0 bg-transparent text-foreground placeholder:text-muted-foreground shadow-none text-base"
            />
          </div>
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium text-sm transition-colors border border-transparent focus:border-slate-300 w-full sm:w-auto justify-between">
                  {state} <ChevronDown size={14} className="opacity-50" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="start" className="w-56 bg-card border border-border rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 sky-scrollbar max-h-64 overflow-y-auto">
                  {STATES.map((s) => (
                    <DropdownMenu.Item 
                      key={s} 
                      onClick={() => setState(s)}
                      className="flex items-center justify-between px-3 py-2.5 text-sm text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer outline-none transition-colors"
                    >
                      {s}
                      {state === s && <Check size={16} className="text-sky-500" />}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search size={18} /> Find Coverage
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                <Stethoscope size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Analysis Result</p>
                <h2 className="text-xl font-bold text-foreground">
                  Coverage for <span className="text-sky-600 dark:text-sky-400">{result.procedure_extracted}</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Schemes & Hospitals */}
              <div className="space-y-6">
                
                <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="text-emerald-500" size={20} /> Eligible Schemes
                </h3>
                
                <div className="space-y-4">
                  {result.schemes_suggested?.map((scheme: any, i: number) => {
                    const links = getSchemeLinks(scheme.name)
                    return (
                    <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110" />
                      
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h4 className="font-bold text-foreground text-lg">{scheme.name}</h4>
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-bold text-sm shrink-0 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
                          {typeof scheme.coverage_amount === "number"
                            ? `₹${scheme.coverage_amount.toLocaleString("en-IN")}`
                            : scheme.coverage_amount}
                        </div>
                      </div>
                      
                      <div className="space-y-3 mt-4">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Eligibility</p>
                          <p className="text-sm text-muted-foreground leading-snug">{scheme.eligibility}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">How to Apply</p>
                          <p className="text-sm text-muted-foreground leading-snug">{scheme.how_to_apply}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                        <a
                          href={links.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all active:scale-95"
                        >
                          <ArrowRight size={14} /> Apply Now
                        </a>
                        <a
                          href={links.infoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-card hover:bg-muted border border-border text-foreground text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all active:scale-95"
                        >
                          <ShieldCheck size={14} className="text-sky-500" /> Learn More
                        </a>
                      </div>
                    </div>
                    )
                  })}
                </div>

                {/* Network Hospitals CTA */}
                <NetworkHospitalMap stateName={state} />
              </div>

              {/* Right Column: Cost & Documents */}
              <div className="space-y-6">
                
                <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                  <IndianRupee className="text-amber-500" size={20} /> Estimated Cost Breakdown
                </h3>
                
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="space-y-4">
                    {Object.entries(result.cost_estimate || {}).map(([key, val]: any) => {
                      if (key === "total_estimate") return null
                      
                      // Calculate a rough percentage for visual bar
                      const totalMin = result.cost_estimate?.total_estimate?.min || 1
                      const perc = Math.max(5, Math.round(((val.min + val.max) / 2 / totalMin) * 100))
                      
                      return (
                        <div key={key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground capitalize">{key.replace("_", " ")}</span>
                            <span className="font-bold text-muted-foreground">₹{val.min?.toLocaleString("en-IN")} – ₹{val.max?.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 dark:bg-amber-500 rounded-full" style={{ width: `${perc}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-foreground text-lg">Total Estimate</span>
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                      ₹{result.cost_estimate?.total_estimate?.min?.toLocaleString("en-IN")} – ₹
                      {result.cost_estimate?.total_estimate?.max?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2 mt-8">
                  <FileCheck className="text-indigo-500" size={20} /> Document Checklist
                </h3>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  {result.documents_checklist?.map((doc: any, i: number) => {
                    const isChecked = !!checkedDocs[i]
                    return (
                      <div 
                        key={i} 
                        onClick={() => toggleDoc(i)}
                        className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-b border-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 ${isChecked ? 'opacity-60' : ''}`}
                      >
                        <button className={`mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${isChecked ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`}>
                          <Check size={14} className="stroke-[3]" />
                        </button>
                        <div className={`transition-all ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          <span className="font-semibold text-sm">{doc.document}</span>{" "}
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider ml-1">
                            {doc.required ? "Required" : "Optional"}
                          </span>
                          {doc.notes && <p className={`text-xs mt-1 leading-snug ${isChecked ? 'text-slate-400' : 'text-slate-500'}`}>{doc.notes}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {result.cashless_guidance && (
                  <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-900/50 rounded-xl p-5 mt-4">
                    <h4 className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-2 mb-2">
                      <Stethoscope size={18} /> Cashless Treatment Guidance
                    </h4>
                    <p className="text-sm text-sky-700 dark:text-sky-400/80 leading-relaxed">
                      {result.cashless_guidance}
                    </p>
                  </div>
                )}
                
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-12 mb-8 max-w-2xl mx-auto italic">
              {result.disclaimer}
            </p>
          </div>
        )}
    </div>
  )
}
