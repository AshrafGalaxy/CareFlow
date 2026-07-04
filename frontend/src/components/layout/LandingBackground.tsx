"use client"

export function LandingBackground() {
 return (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
   {/* Base Background */}
   <div className="absolute inset-0 bg-background transition-colors duration-500" />
   
   {/* Mesh Gradient Orbs */}
   <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-sky-200/40 dark:bg-sky-500/10 warm:bg-amber-200/40 mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-[orbit_20s_linear_infinite]" />
   <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-100/40 dark:bg-emerald-500/10 warm:bg-rose-200/30 mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-[orbit_25s_linear_infinite_reverse]" />
   <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-100/40 dark:bg-blue-500/10 warm:bg-orange-200/30 mix-blend-multiply dark:mix-blend-screen filter blur-[150px] animate-[orbit_30s_linear_infinite]" />
   
   {/* Subtle Medical Grid Pattern */}
   <div 
    className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] warm:opacity-[0.04]" 
    style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
   />

   <style dangerouslySetInnerHTML={{__html: `
    @keyframes orbit {
     0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
     100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
    }
   `}} />
  </div>
 )
}
