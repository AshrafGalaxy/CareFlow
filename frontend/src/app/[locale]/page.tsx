"use client"

import { Link } from "@/i18n/routing"
import {
 ShieldCheck,
 Zap,
 MapPin,
 FlaskConical,
 Pill,
 ClipboardList,
 Upload,
 Cpu,
 Lightbulb,
 FileText,
 MessageSquare,
 Shield,
 CalendarDays,
 Stethoscope,
 Lock,
 UserCheck,
 FileKey
} from "lucide-react"

import { LandingNavbar } from "@/components/layout/LandingNavbar"
import { LandingFooter } from "@/components/layout/LandingFooter"
import { LandingBackground } from "@/components/layout/LandingBackground"
import { InteractiveBot } from "@/components/layout/InteractiveBot"
import { TiltFeatureCard } from "@/components/ui/TiltFeatureCard"
import { FAQAccordion } from "@/components/ui/FAQAccordion"
import { EcgLineAnimation } from "@/components/ui/EcgLineAnimation"
import Image from "next/image"
import { useTranslations } from "next-intl"

export default function LandingPage() {
 const t = useTranslations("Landing")

 const trustBadges = [
  { icon: ShieldCheck, label: "HIPAA-compliant" },
  { icon: MapPin, label: "Built for India" },
  { icon: Zap, label: "Instant AI Analysis" },
 ]

 const painPoints = [
  {
   icon: FlaskConical,
   title: t("gap1Title"),
   desc: t("gap1Desc"),
  },
  {
   icon: Pill,
   title: t("gap2Title"),
   desc: t("gap2Desc"),
  },
  {
   icon: ClipboardList,
   title: t("gap3Title"),
   desc: t("gap3Desc"),
  },
 ]

 const steps = [
  {
   step: "01",
   icon: Upload,
   title: t("step1Title"),
   desc: t("step1Desc"),
  },
  {
   step: "02",
   icon: Cpu,
   title: t("step2Title"),
   desc: t("step2Desc"),
  },
  {
   step: "03",
   icon: Lightbulb,
   title: t("step3Title"),
   desc: t("step3Desc"),
  },
 ]

 const features = [
  { icon: FileText, title: t("feature1Title"), desc: t("feature1Desc") },
  { icon: MessageSquare, title: t("feature2Title"), desc: t("feature2Desc") },
  { icon: Pill, title: t("feature3Title"), desc: t("feature3Desc") },
  { icon: Shield, title: t("feature4Title"), desc: t("feature4Desc") },
  { icon: CalendarDays, title: t("feature5Title"), desc: t("feature5Desc") },
  { icon: Stethoscope, title: t("feature6Title"), desc: t("feature6Desc") },
 ]

 const testimonials = [
  { quote: "I finally understand what my thyroid reports mean without waiting 3 hours at the clinic.", author: "Priya S.", role: "Patient" },
  { quote: "The medication reminders literally saved my father's life. The interface is so simple even he uses it.", author: "Rahul M.", role: "Caregiver" },
  { quote: "CareFlow helped me find a PM-JAY hospital for my surgery in minutes. Absolutely incredible.", author: "Amit K.", role: "Patient" },
  { quote: "The best part is having all my lab reports in one timeline. No more carrying paper files.", author: "Sunita D.", role: "Patient" },
  { quote: "I trust the AI more than Google. It's specific to my actual reports, not general symptoms.", author: "Vikram R.", role: "Patient" },
 ]

 return (
  <div className="min-h-screen font-sans relative overflow-x-hidden">
   <LandingBackground />
   <LandingNavbar />
   <InteractiveBot />

   {/* ── Hero ── */}
   <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32">
    {/* Premium Ambient Dark Mode Glow */}
    <div className="hidden dark:block absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-sky-900/20 rounded-full blur-[120px] pointer-events-none -z-10" />
    <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
     <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 animate-fade-in-up">
      <MapPin className="h-3.5 w-3.5" />
      {t("badgeText")}
     </div>

     <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6 animate-fade-in-up-delay-1">
      {t("heroTitle1")}
      <br />
      <span className="relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-300 dark:to-blue-400 pb-2">
       {t("heroTitle2")}
       <svg className="absolute -bottom-2 left-0 w-full h-3 text-sky-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
       </svg>
      </span>
     </h1>

     <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up-delay-2">
      {t("heroSubtitle")}
     </p>

     <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up-delay-3">
      <Link
       href="/register"
       className="btn-glow w-full sm:w-auto bg-sky-500 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-sky-600 transition-all hover:scale-105 active:scale-95"
      >
       {t("btnStart")}
      </Link>
      <a
       href="#how-it-works"
       className="w-full sm:w-auto bg-card/80 backdrop-blur-sm border border-border text-foreground font-semibold text-lg px-8 py-4 rounded-xl hover:border-sky-400 hover:text-sky-600 transition-all hover:scale-105"
      >
       {t("btnHowItWorks")}
      </a>
     </div>

     {/* Trust Badges */}
     <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up-delay-4">
      {trustBadges.map((badge) => (
       <div
        key={badge.label}
        className="flex items-center gap-2 bg-card/60 backdrop-blur-md rounded-full px-5 py-2.5 shadow-sm border border-border text-sm text-foreground"
       >
        <badge.icon className="h-4 w-4 text-emerald-500 shrink-0" />
        <span className="font-medium">{badge.label}</span>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* ── Pain Points ── */}
   <section className="bg-slate-900 dark:bg-black/80 py-24 relative overflow-hidden">
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-30" />
    <div className="max-w-6xl mx-auto px-6 relative z-10">
     <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
       {t("sectionGapsTitle")}
      </h2>
      <p className="text-slate-400 text-lg">
       {t("sectionGapsSubtitle")}
      </p>
     </div>
     <div className="grid md:grid-cols-3 gap-8">
      {painPoints.map((item) => (
       <div
        key={item.title}
        className="group bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800 hover:border-sky-500/50 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
       >
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-5 relative z-10 group-hover:scale-110 transition-transform duration-500">
         <item.icon className="h-6 w-6 text-sky-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3 relative z-10">{item.title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm relative z-10">{item.desc}</p>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* ── How It Works ── */}
   <section id="how-it-works" className="py-32 relative overflow-hidden">
    <div className="max-w-6xl mx-auto px-6 relative z-10">
     <div className="text-center mb-24">
      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">{t("sectionStepsTitle")}</h2>
      <p className="text-muted-foreground text-xl max-w-2xl mx-auto">{t("sectionStepsSubtitle")}</p>
     </div>
     
     <div className="relative">
      {/* Straight dashed baseline */}
      <div className="hidden md:block absolute top-[64px] left-[15%] right-[15%] border-t-2 border-dashed border-border opacity-50 z-0" />
      
      {/* Traveling glowing EKG spike */}
      <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[72px] z-10">
       <EcgLineAnimation color="#0ea5e9" speed={3} lineWidth={3} />
      </div>

      <div className="grid md:grid-cols-3 gap-16 md:gap-12 relative z-20">
       {steps.map((item, i) => (
        <div key={item.title} className="text-center relative group">
         <div className="relative inline-block mb-8 z-10 px-4">
          {/* Organic Glow instead of white square */}
          <div className="absolute inset-0 bg-sky-200/50 dark:bg-sky-900/40 rounded-full blur-2xl group-hover:bg-sky-300/60 dark:group-hover:bg-sky-800/50 transition-colors duration-500" />
          
          <div className="relative h-32 w-32 rounded-full bg-card/60 backdrop-blur-md border border-sky-100 dark:border-sky-800/50 flex items-center justify-center mx-auto shadow-sm dark:shadow-[inset_0_0_20px_rgba(14,165,233,0.1)] group-hover:shadow-sky-200 dark:group-hover:shadow-sky-900/40 group-hover:-translate-y-2 transition-all duration-500">
           <item.icon className="h-12 w-12 text-sky-500" />
          </div>
          <div className="absolute top-0 right-2 h-10 w-10 rounded-full bg-slate-900 dark:bg-foreground text-white dark:text-background font-bold flex items-center justify-center shadow-lg group-hover:bg-sky-500 transition-colors duration-300 z-20">
           {item.step}
          </div>
         </div>
         <h3 className="text-2xl font-semibold text-foreground mb-3">{item.title}</h3>
         <p className="text-muted-foreground leading-relaxed text-base px-4">{item.desc}</p>
        </div>
       ))}
      </div>
     </div>
    </div>
   </section>

   {/* ── Bento Box Features ── */}
   <section id="features" className="py-32 bg-muted/30">
    <div className="max-w-6xl mx-auto px-6 relative z-10">
     <div className="text-center mb-20">
      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
       {t("sectionFeaturesTitle")}
      </h2>
      <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
       {t("sectionFeaturesSubtitle")}
      </p>
     </div>
     
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((item) => (
       <TiltFeatureCard key={item.title} {...item} />
      ))}
     </div>
    </div>
   </section>

   {/* ── Security & Privacy ── */}
   <section id="security" className="py-24 bg-slate-900 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('/favicon.svg')] bg-center bg-no-repeat opacity-5 blur-3xl scale-150 pointer-events-none" />
    <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
     <div className="md:w-1/2">
      <h2 className="text-3xl md:text-5xl font-bold mb-6">Bank-Grade Security for Your Health Data</h2>
      <p className="text-slate-400 text-lg leading-relaxed mb-8">
       Your health information is extremely sensitive. That's why we engineered CareFlow AI with the highest standard of data protection protocols.
      </p>
      <div className="space-y-6">
       <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0">
         <Lock className="h-6 w-6 text-sky-400" />
        </div>
        <div>
         <h4 className="font-semibold text-lg">End-to-End Encryption</h4>
         <p className="text-slate-400 text-sm">All reports and chats are heavily encrypted at rest and in transit.</p>
        </div>
       </div>
       <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
         <UserCheck className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
         <h4 className="font-semibold text-lg">HIPAA Compliant Architecture</h4>
         <p className="text-slate-400 text-sm">We strictly adhere to global health privacy standards.</p>
        </div>
       </div>
       <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0">
         <FileKey className="h-6 w-6 text-sky-500" />
        </div>
        <div>
         <h4 className="font-semibold text-lg">100% Data Ownership</h4>
         <p className="text-slate-400 text-sm">You control your data. Export or delete it permanently at any time.</p>
        </div>
       </div>
      </div>
     </div>
     <div className="md:w-1/2 flex justify-center">
      <div className="relative w-72 h-72">
       <div className="absolute inset-0 bg-sky-500 rounded-full blur-[80px] opacity-20 animate-pulse" />
       <ShieldCheck className="w-full h-full text-sky-400 relative z-10" strokeWidth={1} />
      </div>
     </div>
    </div>
   </section>

   {/* ── Testimonials (Infinite Marquee) ── */}
   <section id="testimonials" className="py-32 relative overflow-hidden">
    <div className="max-w-6xl mx-auto px-6 relative z-10 mb-16">
     <div className="text-center">
      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Patient Stories</h2>
      <p className="text-slate-500 dark:text-slate-400 text-xl">See how CareFlow AI is changing lives.</p>
     </div>
    </div>

    <div className="flex w-[200vw] animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] gap-8 px-4">
     {/* Double the array for seamless infinite scroll */}
     {[...testimonials, ...testimonials].map((test, i) => (
      <div key={i} className="w-[400px] shrink-0 bg-card/80 dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-8 rounded-3xl shadow-sm hover:shadow-xl dark:hover:shadow-sky-900/20 hover:-translate-y-2 transition-all duration-300">
       <div className="text-4xl text-sky-200 dark:text-sky-800/50 font-serif mb-4">"</div>
       <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed mb-8 italic">"{test.quote}"</p>
       <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900/40 dark:to-sky-800/40 flex items-center justify-center font-bold text-sky-700 dark:text-sky-300">
         {test.author[0]}
        </div>
        <div>
         <h4 className="font-semibold text-foreground">{test.author}</h4>
         <p className="text-sm text-slate-500 dark:text-slate-400">{test.role}</p>
        </div>
       </div>
      </div>
     ))}
    </div>

    <style dangerouslySetInnerHTML={{__html: `
     @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
     }
    `}} />
   </section>

   {/* ── FAQ ── */}
   <section id="faq" className="py-32 bg-slate-50/50 dark:bg-slate-900/50">
    <div className="max-w-6xl mx-auto px-6 relative z-10">
     <div className="text-center mb-16">
      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
      <p className="text-slate-500 dark:text-slate-400 text-xl">Everything you need to know about the platform.</p>
     </div>
     <FAQAccordion />
    </div>
   </section>

   {/* ── Footer CTA ── */}
   <section className="bg-sky-500 dark:bg-slate-900 relative overflow-hidden py-24 border-t dark:border-slate-800">
    {/* Decorative background elements */}
    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-400 dark:bg-sky-500/10 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-600 dark:bg-sky-500/10 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3 pointer-events-none" />
    
    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
     <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
      Take Control of Your Health Today
     </h2>
     <p className="text-sky-100 dark:text-slate-300 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
      Join thousands of patients across India who are making informed healthcare decisions with our AI-powered platform.
     </p>
     <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link
       href="/register"
       className="w-full sm:w-auto bg-card text-sky-600 dark:text-sky-400 font-bold text-lg px-10 py-4 rounded-xl shadow-xl shadow-sky-900/20 dark:shadow-sky-500/10 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 transition-all duration-300 border dark:border-slate-700"
      >
       Create Free Account
      </Link>
      <Link
       href="/login"
       className="w-full sm:w-auto bg-transparent border-2 border-white/30 dark:border-slate-700 text-white dark:text-slate-300 font-semibold text-lg px-10 py-4 rounded-xl hover:border-white dark:hover:border-slate-500 hover:bg-card/10 dark:hover:bg-slate-800 transition-all duration-300"
      >
       Log In
      </Link>
     </div>
    </div>
   </section>

   <LandingFooter />
  </div>
 )
}
