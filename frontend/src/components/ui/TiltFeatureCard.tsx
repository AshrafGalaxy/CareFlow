"use client"

import { useEffect, useRef, useState } from "react"
import { LucideIcon } from "lucide-react"

interface TiltFeatureCardProps {
 title: string
 desc: string
 icon: LucideIcon
}

export function TiltFeatureCard({ title, desc, icon: Icon }: TiltFeatureCardProps) {
 const cardRef = useRef<HTMLDivElement>(null)
 const [rotation, setRotation] = useState({ x: 0, y: 0 })
 const [isHovered, setIsHovered] = useState(false)

 const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!cardRef.current) return
  const rect = cardRef.current.getBoundingClientRect()
  
  // Mouse position relative to card center
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  
  // Max rotation in degrees
  const maxRotate = 10
  
  // Calculate rotation
  const rotateX = (y / (rect.height / 2)) * -maxRotate
  const rotateY = (x / (rect.width / 2)) * maxRotate
  
  setRotation({ x: rotateX, y: rotateY })
 }

 const handleMouseLeave = () => {
  setRotation({ x: 0, y: 0 })
  setIsHovered(false)
 }

 return (
  <div
   ref={cardRef}
   onMouseMove={handleMouseMove}
   onMouseEnter={() => setIsHovered(true)}
   onMouseLeave={handleMouseLeave}
   className="relative group perspective-1000"
   style={{ perspective: 1000 }}
  >
   {/* Heartbeat glowing border effect on hover */}
   <div 
    className={`absolute -inset-0.5 bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-400 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500 ${isHovered ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''}`} 
   />

   {/* Actual Card */}
   <div
    className="relative h-full bg-card rounded-2xl p-8 transition-transform duration-200 ease-out border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden group-hover:dark:border-sky-900/50"
    style={{
     transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.02 : 1})`,
     transformStyle: "preserve-3d",
    }}
   >
    <div 
     className="h-12 w-12 rounded-xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center mb-5"
     style={{ transform: "translateZ(30px)" }}
    >
     <Icon className="h-6 w-6 text-sky-500" />
    </div>
    
    <h3 
     className="text-lg font-semibold text-foreground mb-2"
     style={{ transform: "translateZ(20px)" }}
    >
     {title}
    </h3>
    
    <p 
     className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed"
     style={{ transform: "translateZ(10px)" }}
    >
     {desc}
    </p>

    <div className="mt-5 h-0.5 w-0 group-hover:w-10 bg-sky-500 transition-all duration-300 rounded-full" />
   </div>
  </div>
 )
}
