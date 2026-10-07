"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { MessageSquare, Database, Sparkles, BrainCircuit } from "lucide-react"
import { Iphone } from "@/components/ui/iphone"

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
      className="absolute top-6 left-1/2 -translate-x-1/2 w-[340px] z-20"
     >
      <Iphone className="w-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.4)]">
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col justify-between pt-10 pb-4 px-3.5 select-none font-sans">
          {/* iOS Status Bar */}
          <div className="absolute top-3.5 left-6 right-6 flex items-center justify-between text-[11px] font-semibold text-slate-200 pointer-events-none z-20">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="font-bold text-[9px] tracking-tight">5G</span>
              <div className="w-4 h-2 rounded-[3px] border border-slate-300 p-0.5 flex items-center">
                <div className="w-full h-full bg-emerald-400 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Clinical Assistant Header */}
          <div className="pt-2 pb-2.5 px-1 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white tracking-tight">CareFlow AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400 leading-none">Clinical Assistant</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-sky-400 border border-slate-700/50">
              Verified
            </span>
          </div>

          {/* Interactive Clinical Chat Bubbles */}
          <div className="flex-1 py-2.5 space-y-2.5 flex flex-col justify-end text-[11px] leading-relaxed">
            {/* AI Report Alert */}
            <div className="bg-slate-900/90 text-slate-200 rounded-2xl rounded-tl-sm p-3 border border-slate-800/80 shadow-xs self-start max-w-[88%]">
              <p className="text-[9px] font-bold text-sky-400 uppercase tracking-wider mb-1">HbA1c Analysis</p>
              Based on your report from March 2023, your HbA1c has improved from <span className="text-rose-400 font-semibold">7.2%</span> to <span className="text-emerald-400 font-semibold">6.4%</span>. Keep up the current diet!
            </div>

            {/* Patient Message */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-2xl rounded-tr-sm p-2.5 shadow-md shadow-sky-600/20 self-end max-w-[80%] font-medium text-[11px]">
              Should I continue taking Metformin 500mg?
            </div>

            {/* AI Response */}
            <div className="bg-slate-900/90 text-slate-200 rounded-2xl rounded-tl-sm p-3 border border-slate-800/80 shadow-xs self-start max-w-[92%]">
              <div className="flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span className="text-[10px] font-bold text-sky-400">Care Guidance</span>
              </div>
              Yes, prescribed for 6 months. With your fasting sugar now at <span className="text-emerald-400 font-semibold">98 mg/dL</span>, consult Dr. Rajesh on Friday to discuss dosage reduction.
            </div>
          </div>

          {/* Bottom Chat Input Bar & Home Indicator */}
          <div className="pt-1.5">
            <div className="h-7 rounded-full bg-slate-900 border border-slate-800 px-2.5 flex items-center justify-between text-[10px] text-slate-400">
              <span className="truncate">Ask about symptoms or lab tests...</span>
              <div className="w-4.5 h-4.5 rounded-full bg-sky-500 flex items-center justify-center text-white shrink-0 ml-1">
                <span className="text-[9px] leading-none font-bold">↑</span>
              </div>
            </div>
            {/* iOS Home Indicator */}
            <div className="w-24 h-1 bg-slate-600/60 rounded-full mx-auto mt-2" />
          </div>
        </div>
      </Iphone>
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
