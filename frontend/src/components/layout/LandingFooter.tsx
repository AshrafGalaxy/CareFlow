import Link from "next/link"
import Image from "next/image"
import { MapPin, Mail, Phone } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="bg-slate-900 pt-20 pb-10 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
              <Image 
                src="/favicon.svg" 
                alt="CareFlow AI Logo" 
                width={32} 
                height={32} 
                className="h-8 w-8 opacity-90 grayscale brightness-200"
              />
              <span className="font-brand text-xl font-bold text-white tracking-tight">
                CareFlow <span className="text-sky-400">AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Making healthcare accessible and understandable for every Indian patient through the power of advanced AI.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <MapPin className="h-4 w-4 text-sky-400" />
                <span>Built with ❤️ in India</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail className="h-4 w-4 text-sky-400" />
                <span>support@careflow.ai</span>
              </div>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-white font-semibold mb-6">Product</h3>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">How it Works</Link></li>
              <li><Link href="#security" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">Security & HIPAA</Link></li>
              <li><Link href="/register" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-white font-semibold mb-6">Resources</h3>
            <ul className="space-y-4">
              <li><Link href="#faq" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">Help Center & FAQ</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">Patient Blog</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">PM-JAY Guide</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-sky-400 text-sm transition-colors">API Documentation</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-white font-semibold mb-6">Stay Updated</h3>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Subscribe to get the latest health insights and feature updates.
            </p>
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                required
              />
              <button 
                type="submit" 
                className="bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors btn-glow"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm text-center md:text-left">
            © 2026 CareFlow AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
