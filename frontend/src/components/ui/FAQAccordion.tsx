"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
 {
  question: "Is my medical data secure?",
  answer: "Absolutely. CareFlow AI uses state-of-the-art encryption and is fully HIPAA-compliant. Your data is strictly private and never shared with third parties without your explicit consent.",
 },
 {
  question: "How accurate is the AI report analysis?",
  answer: "Our AI is trained on millions of clinical data points and provides highly accurate, easy-to-understand summaries. However, it is an assistive tool and should not replace professional medical advice from your doctor.",
 },
 {
  question: "Can it help me find PM-JAY hospitals?",
  answer: "Yes! Our Insurance Navigator connects directly with government databases to help you find empaneled hospitals for PM-JAY and other state schemes based on your specific required procedures.",
 },
 {
  question: "What types of lab reports can I upload?",
  answer: "You can upload blood tests (CBC, Lipid profiles, Thyroid), X-ray/MRI reports, and hospital discharge summaries in either PDF or image format (JPG/PNG).",
 },
]

export function FAQAccordion() {
 const [openIndex, setOpenIndex] = useState<number | null>(0)

 return (
  <div className="max-w-3xl mx-auto space-y-4">
   {faqs.map((faq, index) => {
    const isOpen = openIndex === index
    return (
     <div 
      key={index}
      className={cn(
       "border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300",
       isOpen ? "bg-card shadow-md border-sky-200" : "bg-card/50 hover:bg-card"
      )}
     >
      <button
       onClick={() => setOpenIndex(isOpen ? null : index)}
       className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
      >
       <span className="font-semibold text-foreground">{faq.question}</span>
       <ChevronDown 
        className={cn(
         "h-5 w-5 text-sky-500 transition-transform duration-300",
         isOpen ? "rotate-180" : ""
        )} 
       />
      </button>
      <div 
       className={cn(
        "px-6 overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
       )}
      >
       <p className="text-slate-500 text-sm leading-relaxed">{faq.answer}</p>
      </div>
     </div>
    )
   })}
  </div>
 )
}
