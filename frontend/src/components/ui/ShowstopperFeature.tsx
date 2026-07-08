"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { MessageSquare, Database, Sparkles, BrainCircuit } from "lucide-react"

export function ShowstopperFeature() {
 const containerRef = useRef<HTMLDivElement>(null)
 
 const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start end", "end start"],
 })

 const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

 // Parallax for main phone/device mockup
 const yDevice = useTransform(springProgress, [0, 1], [150, -150])
 
 // Opacity and scale for text content
 const opacityText = useTransform(springProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0])
 const scaleText = useTransform(springProgress, [0.1, 0.3], [0.8, 1])

 // Floating UI elements
 const yFloat1 = useTransform(springProgress, [0, 1], [100, -250])
 const yFloat2 = useTransform(springProgress, [0, 1], [200, -100])
 const yFloat3 = useTransform(springProgress, [0, 1], [50, -300])

 return (
  <section ref={containerRef} className="relative py-32 lg:py-48 overflow-hidden bg-background">
   {/* Background Glows */}
   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

   <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center relative z-10">
    
    {/* Left: Text Content */}
    <motion.div 
     style={{ opacity: opacityText, scale: scaleText }}
     className="space-y-8"
    >
     <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 font-semibold text-sm">
      <Sparkles className="w-4 h-4" />
      Next-Gen AI Intelligence
     </div>
     
     <h2 className="text-4xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1]">
      A medical brain that <br/>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">remembers everything.</span>
     </h2>
     
     <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
      CareFlow AI doesn't just chat. It cross-references your entire medical history, past lab reports, and ongoing medications in real-time to provide hyper-personalized insights.
     </p>

     <div className="space-y-6 pt-4">
      <div className="flex items-start gap-4">
       <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center shrink-0">
        <Database className="w-6 h-6 text-sky-600 dark:text-sky-400" />
       </div>
       <div>
        <h3 className="text-lg font-bold text-foreground">Infinite Memory Context</h3>
        <p className="text-muted-foreground mt-1">We utilize advanced vector databases to recall your exact lipid profile from 3 years ago during today's conversation.</p>
       </div>
      </div>
      
      <div className="flex items-start gap-4">
       <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
        <BrainCircuit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
       </div>
       <div>
        <h3 className="text-lg font-bold text-foreground">Deep Medical Reasoning</h3>
        <p className="text-muted-foreground mt-1">Specialized LLM models trained on verified medical data, specifically tuned for Indian healthcare protocols.</p>
       </div>
      </div>
     </div>
    </motion.div>

    {/* Right: Kinetic Device Mockup */}
    <div className="relative h-[600px] w-full hidden md:block">
     
     <motion.div 
      style={{ y: yDevice }}
      className="absolute top-10 left-1/2 -translate-x-1/2 w-[340px] h-[680px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col z-20"
     >
      {/* Phone Header */}
      <div className="h-16 bg-slate-800/50 backdrop-blur-md flex items-center justify-center shrink-0 border-b border-slate-700/50">
       <div className="w-32 h-6 bg-slate-900 rounded-full" />
      </div>
      
      {/* Chat Mockup */}
      <div className="flex-1 bg-slate-900 p-4 space-y-4 flex flex-col justify-end pb-8">
       <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tl-sm p-4 text-sm w-[85%] self-start border border-slate-700/50">
        Based on your report from March 2023, your HbA1c has improved from 7.2% to 6.4%. Keep up the current diet!
       </div>
       <div className="bg-sky-600 text-white rounded-2xl rounded-tr-sm p-4 text-sm w-[75%] self-end shadow-lg shadow-sky-600/20">
        Should I continue taking Metformin 500mg?
       </div>
       <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tl-sm p-4 text-sm w-[90%] self-start border border-slate-700/50">
        <div className="flex gap-2 items-center mb-2">
         <Sparkles className="w-4 h-4 text-sky-400" />
         <span className="text-xs font-semibold text-sky-400">CareFlow AI</span>
        </div>
        Yes, your doctor prescribed it for 6 months. However, since your fasting sugar is now 98 mg/dL, you should consult them during your next visit on Friday to discuss dosage reduction.
       </div>
      </div>
     </motion.div>

     {/* Floating Badges */}
     <motion.div 
      style={{ y: yFloat1 }}
      className="absolute top-32 -left-10 bg-card border border-border shadow-xl rounded-2xl p-4 flex items-center gap-3 z-30"
     >
      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
       <MessageSquare className="w-5 h-5" />
      </div>
      <div>
       <p className="text-sm font-bold text-foreground">Streaming Responses</p>
       <p className="text-xs text-muted-foreground">0 latency feeling</p>
      </div>
     </motion.div>

     <motion.div 
      style={{ y: yFloat2 }}
      className="absolute bottom-48 -right-12 bg-card border border-border shadow-xl rounded-2xl p-4 flex items-center gap-3 z-30"
     >
      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
       <Database className="w-5 h-5" />
      </div>
      <div>
       <p className="text-sm font-bold text-foreground">RAG Architecture</p>
       <p className="text-xs text-muted-foreground">Fact-checked insights</p>
      </div>
     </motion.div>

     <motion.div 
      style={{ y: yFloat3 }}
      className="absolute -top-10 right-10 w-24 h-24 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full blur-[40px] opacity-60 z-10"
     />
    </div>
   </div>
  </section>
 )
}
