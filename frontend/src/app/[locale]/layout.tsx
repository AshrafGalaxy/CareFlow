import { Suspense } from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Outfit, Manrope, Plus_Jakarta_Sans, JetBrains_Mono, Noto_Sans_Devanagari, Noto_Nastaliq_Urdu } from "next/font/google"
import { Toaster } from "sonner"
import { PageTransition } from "@/components/ui/page-transition"
import "../globals.css"

const manrope = Manrope({
 subsets: ["latin"],
 variable: "--font-manrope",
 display: "swap",
})

const jakarta = Plus_Jakarta_Sans({
 subsets: ["latin"],
 variable: "--font-jakarta",
 display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
 subsets: ["latin"],
 variable: "--font-jetbrains",
 display: "swap",
})

const outfit = Outfit({
 subsets: ["latin"],
 variable: "--font-outfit",
 display: "swap",
})

const notoSansDevanagari = Noto_Sans_Devanagari({
 subsets: ["devanagari"],
 variable: "--font-devanagari",
 display: "swap",
})

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
 weight: ["400", "700"],
 subsets: ["arabic"],
 variable: "--font-urdu",
 display: "swap",
})

export const metadata: Metadata = {
 title: "CareFlow AI — Your Intelligent Healthcare Companion",
 description:
  "Upload lab reports, track medications, and navigate PM-JAY insurance schemes with the power of AI. Built for Indian patients.",
 keywords: ["healthcare", "lab reports", "medications", "PM-JAY", "India", "AI health"],
 authors: [{ name: "CareFlow AI" }],
 openGraph: {
  title: "CareFlow AI — Healthcare Companion for Indian Patients",
  description:
   "Upload lab reports, get plain-language AI explanations, track medications, and navigate insurance — all in one place.",
  type: "website",
  locale: "en_IN",
  siteName: "CareFlow AI",
 },
 twitter: {
  card: "summary_large_image",
  title: "CareFlow AI",
  description: "Your intelligent healthcare companion for Indian patients.",
 },
 icons: {
  icon: [
   { url: '/favicon.svg', type: 'image/svg+xml' }
  ],
  apple: "/favicon.svg",
 },
}

import { ThemeProvider } from "@/components/theme-provider"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export default async function RootLayout({
 children,
 params
}: Readonly<{
 children: React.ReactNode
 params: Promise<{ locale: string }>
}>) {
 const { locale } = await params
 const messages = await getMessages()

 return (
  <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
   <head>
    <Script
     id="theme-script"
     strategy="beforeInteractive"
     dangerouslySetInnerHTML={{
      __html: `
       try {
        const theme = localStorage.getItem('careflow-theme') || 'system';
        const resolved = theme === 'system'
         ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
         : theme;
        document.documentElement.classList.remove('light','dark','warm');
        document.documentElement.classList.add(resolved);
       } catch (e) {}
      `,
     }}
    />
   </head>
   <body className={`${manrope.variable} ${jakarta.variable} ${jetbrainsMono.variable} ${outfit.variable} ${notoSansDevanagari.variable} ${notoNastaliqUrdu.variable} ${
    locale === 'hi' || locale === 'mr' ? 'font-devanagari' : 
    locale === 'ur' ? 'font-urdu' : 'font-sans'
   } antialiased`} suppressHydrationWarning>
    <ThemeProvider
     attribute="class"
     defaultTheme="system"
     enableSystem
     disableTransitionOnChange
    >
     <NextIntlClientProvider messages={messages}>
      <Suspense fallback={null}>
       <PageTransition />
      </Suspense>
      {children}
      <Toaster
       position="top-right"
       richColors
       closeButton
       toastOptions={{
        classNames: {
         toast: "font-sans text-[15px] font-medium shadow-xl border-slate-200/60 rounded-xl px-5 py-4 backdrop-blur-xl bg-card/80 /80 dark:border-slate-800",
         title: "font-heading font-bold text-foreground ",
         description: "text-slate-600 font-medium text-sm leading-relaxed dark:text-slate-300",
         actionButton: "bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-sm transition-colors",
         cancelButton: "bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors dark:text-slate-300 dark:hover:bg-slate-700",
        },
       }}
      />
     </NextIntlClientProvider>
    </ThemeProvider>
   </body>
  </html>
 )
}
