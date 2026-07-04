"use client"

import { useEffect, useRef, useState } from "react"
import { Bot } from "lucide-react"

export function FloatingCompanion() {
 const containerRef = useRef<HTMLDivElement>(null)
 const [rotation, setRotation] = useState({ x: 0, y: 0 })

 useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
   if (!containerRef.current) return
   const rect = containerRef.current.getBoundingClientRect()
   
   // Calculate center of the bot
   const centerX = rect.left + rect.width / 2
   const centerY = rect.top + rect.height / 2

   // Calculate distance from center (normalized between -1 and 1)
   const deltaX = (e.clientX - centerX) / window.innerWidth
   const deltaY = (e.clientY - centerY) / window.innerHeight

   // Max rotation angle
   const maxRotate = 25

   setRotation({
    x: deltaY * -maxRotate, // Pitch
    y: deltaX * maxRotate, // Yaw
   })
  }

  window.addEventListener("mousemove", handleMouseMove)
  return () => window.removeEventListener("mousemove", handleMouseMove)
 }, [])

 return (
  <div 
   className="fixed bottom-8 right-8 z-40 hidden md:flex"
   style={{ perspective: 1000 }}
  >
   <div
    ref={containerRef}
    className="relative group cursor-pointer"
    style={{
     transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
     transition: "transform 0.1s ease-out",
     transformStyle: "preserve-3d",
    }}
   >
    {/* Glow effect matching the heartbeat */}
    <div className="absolute inset-0 bg-sky-400 rounded-full blur-[20px] opacity-40 animate-[pulse_2s_ease-in-out_infinite]" />
    
    {/* Floating Ring 1 */}
    <div 
     className="absolute inset-[-10px] border border-sky-300/30 rounded-full animate-[spin_4s_linear_infinite]"
     style={{ transform: "translateZ(-20px)" }}
    />
    
    {/* Floating Ring 2 */}
    <div 
     className="absolute inset-[-20px] border border-emerald-300/20 rounded-full animate-[spin_6s_linear_infinite_reverse]"
     style={{ transform: "translateZ(-40px)" }}
    />

    {/* Core Bot */}
    <div 
     className="relative h-16 w-16 bg-gradient-to-br from-white to-sky-50 rounded-full shadow-[0_8px_30px_rgb(14,165,233,0.3)] flex items-center justify-center border border-white/50 backdrop-blur-xl animate-bounce"
     style={{ transform: "translateZ(20px)" }}
    >
     <Bot className="h-8 w-8 text-sky-500" />
     
     {/* Status Indicator */}
     <div className="absolute top-1 right-1 h-3 w-3 bg-emerald-400 rounded-full ring-2 ring-white" />
    </div>

    {/* Hover Tooltip */}
    <div 
     className="absolute bottom-full right-1/2 translate-x-1/2 mb-4 w-48 bg-card text-slate-700 text-xs font-medium py-2 px-3 rounded-lg shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center"
     style={{ transform: "translateZ(50px) translateX(50%)" }}
    >
     Hi! I&apos;m your CareFlow AI Companion.
    </div>
   </div>
  </div>
 )
}
