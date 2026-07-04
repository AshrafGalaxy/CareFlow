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
import Image from "next/image"

export default function LandingPage() {
  const trustBadges = [
    { icon: ShieldCheck, label: "HIPAA-compliant" },
    { icon: MapPin, label: "Built for India" },
    { icon: Zap, label: "Instant AI Analysis" },
  ]

  const painPoints = [
    {
      icon: FlaskConical,
      title: "Jargon Barriers",
      desc: "Lab reports filled with medical terms your doctor never has time to explain clearly.",
    },
    {
      icon: Pill,
      title: "Missed Medications",
      desc: "Critical doses forgotten with no smart reminders to keep adherence on track.",
    },
    {
      icon: ClipboardList,
      title: "Insurance Chaos",
      desc: "PM-JAY and state schemes that nobody can navigate without expert guidance.",
    },
  ]

  const steps = [
    {
      step: "01",
      icon: Upload,
      title: "Upload Your Report",
      desc: "Snap a photo or upload a PDF. Any lab report, X-ray, or discharge summary works.",
    },
    {
      step: "02",
      icon: Cpu,
      title: "AI Analyzes It",
      desc: "Our AI reads the medical jargon and translates every finding into simple language.",
    },
    {
      step: "03",
      icon: Lightbulb,
      title: "Understand & Act",
      desc: "Get clear summaries, questions to ask your doctor, and insurance scheme guidance.",
    },
  ]

  const features = [
    { icon: FileText, title: "Report Analysis", desc: "AI explains your lab results in plain language you can actually understand." },
    { icon: MessageSquare, title: "AI Health Chat", desc: "Ask anything about your health history. Get context-aware answers." },
    { icon: Pill, title: "Medication Tracker", desc: "Never miss a dose. Smart schedules with adherence logging." },
    { icon: Shield, title: "Insurance Navigator", desc: "Find PM-JAY schemes that cover your specific procedure effortlessly." },
    { icon: CalendarDays, title: "Health Timeline", desc: "Your complete medical journey visualized in a single chronological view." },
    { icon: Stethoscope, title: "Doctor Dashboard", desc: "Providers monitor patient adherence and flag at-risk patients instantly." },
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
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 animate-fade-in-up">
            <MapPin className="h-3.5 w-3.5" />
            Built for Indian Patients · Powered by AI
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 animate-fade-in-up-delay-1">
            Your Medical Reports,
            <br />
            <span className="text-sky-500 relative inline-block">
              Explained Simply.
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-sky-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up-delay-2">
            Upload lab reports, track medications, and navigate PM-JAY insurance
            schemes — all in plain language you can actually understand.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up-delay-3">
            <Link
              href="/register"
              className="btn-glow w-full sm:w-auto bg-sky-500 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-sky-600 transition-all hover:scale-105 active:scale-95"
            >
              Start for Free
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 font-semibold text-lg px-8 py-4 rounded-xl hover:border-sky-400 hover:text-sky-600 transition-all hover:scale-105"
            >
              See How It Works
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up-delay-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-full px-5 py-2.5 shadow-sm border border-slate-200/50 text-sm text-slate-700"
              >
                <badge.icon className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-30" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              The 3 Healthcare Gaps We Solve
            </h2>
            <p className="text-slate-400 text-lg">
              Common problems every Indian patient faces — and how we fix them.
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
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">How It Works</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto">Three simple steps to take absolute control of your health journey.</p>
          </div>
          
          <div className="relative">
            {/* Straight dashed baseline */}
            <div className="hidden md:block absolute top-[64px] left-[15%] right-[15%] border-t-2 border-dashed border-slate-300 opacity-50 z-0" />
            
            {/* Traveling glowing EKG spike */}
            <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[72px] pointer-events-none overflow-hidden z-10">
              <svg 
                className="h-full absolute left-0 text-sky-500 w-[120px] drop-shadow-[0_0_10px_rgba(14,165,233,0.8)] animate-[travelEKG_4s_linear_infinite]"
                viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              >
                {/* A realistic EKG pulse shape */}
                <path d="M0,25 L30,25 L35,15 L45,45 L55,5 L65,30 L70,25 L100,25" />
              </svg>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
              @keyframes travelEKG {
                0% { transform: translateX(0); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateX(calc(80vw - 120px)); opacity: 0; }
              }
            `}} />

            <div className="grid md:grid-cols-3 gap-16 md:gap-12 relative z-20">
              {steps.map((item, i) => (
                <div key={item.title} className="text-center relative group">
                  <div className="relative inline-block mb-8 z-10 px-4">
                    {/* Organic Glow instead of white square */}
                    <div className="absolute inset-0 bg-sky-200/50 rounded-full blur-2xl group-hover:bg-sky-300/60 transition-colors duration-500" />
                    
                    <div className="relative h-32 w-32 rounded-full bg-white/60 backdrop-blur-md border border-sky-100 flex items-center justify-center mx-auto shadow-sm group-hover:shadow-sky-200 group-hover:-translate-y-2 transition-all duration-500">
                      <item.icon className="h-12 w-12 text-sky-500" />
                    </div>
                    <div className="absolute top-0 right-2 h-10 w-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shadow-lg group-hover:bg-sky-500 transition-colors duration-300 z-20">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-base px-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Box Features ── */}
      <section id="features" className="py-32 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Everything you need in one place
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto">
              A comprehensive suite of tools designed specifically for the modern Indian healthcare experience.
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
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <FileKey className="h-6 w-6 text-purple-400" />
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
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Patient Stories</h2>
            <p className="text-slate-500 text-xl">See how CareFlow AI is changing lives.</p>
          </div>
        </div>

        <div className="flex w-[200vw] animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] gap-8 px-4">
          {/* Double the array for seamless infinite scroll */}
          {[...testimonials, ...testimonials].map((test, i) => (
            <div key={i} className="w-[400px] shrink-0 bg-white/80 backdrop-blur-xl border border-slate-200/60 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-4xl text-sky-200 font-serif mb-4">"</div>
              <p className="text-slate-700 text-lg leading-relaxed mb-8 italic">"{test.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center font-bold text-sky-700">
                  {test.author[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{test.author}</h4>
                  <p className="text-sm text-slate-500">{test.role}</p>
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
      <section id="faq" className="py-32 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-xl">Everything you need to know about the platform.</p>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="bg-sky-500 relative overflow-hidden py-24">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-400 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-600 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Take Control of Your Health Today
          </h2>
          <p className="text-sky-100 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of patients across India who are making informed healthcare decisions with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto bg-white text-sky-600 font-bold text-lg px-10 py-4 rounded-xl shadow-xl shadow-sky-900/20 hover:bg-slate-50 hover:scale-105 transition-all duration-300"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white font-semibold text-lg px-10 py-4 rounded-xl hover:border-white hover:bg-white/10 transition-all duration-300"
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
