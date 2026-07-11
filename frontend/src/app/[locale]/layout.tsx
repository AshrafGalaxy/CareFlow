import { Suspense } from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Outfit, Manrope, Plus_Jakarta_Sans, JetBrains_Mono, Noto_Sans_Devanagari, Noto_Nastaliq_Urdu, Noto_Sans_Telugu, Noto_Sans_Gujarati, Noto_Sans_Tamil, Noto_Sans_Bengali } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
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

const notoSansTelugu = Noto_Sans_Telugu({
 subsets: ["telugu"],
 variable: "--font-telugu",
 display: "swap",
})

const notoSansGujarati = Noto_Sans_Gujarati({
 subsets: ["gujarati"],
 variable: "--font-gujarati",
 display: "swap",
})

const notoSansTamil = Noto_Sans_Tamil({
 subsets: ["tamil"],
 variable: "--font-tamil",
 display: "swap",
})

const notoSansBengali = Noto_Sans_Bengali({
 subsets: ["bengali"],
 variable: "--font-bengali",
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
  <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
   <head>
     {/* Manual cookie logic removed to prevent overriding Google Translate widget state */}
    <style>{`
     iframe.skiptranslate { display: none !important; }
     body { top: 0px !important; }
     .VIpgJd-ZVi9od-ORHb-OEVmcd { display: none !important; }
    `}</style>
   </head>
   <body className={`${manrope.variable} ${jakarta.variable} ${jetbrainsMono.variable} ${outfit.variable} ${notoSansDevanagari.variable} ${notoNastaliqUrdu.variable} ${notoSansTelugu.variable} ${notoSansGujarati.variable} ${notoSansTamil.variable} ${notoSansBengali.variable} ${
    locale === 'hi' || locale === 'mr' ? 'font-devanagari' : 
    locale === 'ur' ? 'font-urdu' : 
    locale === 'te' ? 'font-telugu' :
    locale === 'gu' ? 'font-gujarati' :
    locale === 'ta' ? 'font-tamil' :
    locale === 'bn' ? 'font-bengali' : 'font-sans'
   } antialiased`} suppressHydrationWarning>
    <Script
     src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
     strategy="lazyOnload"
    />
    <Script
     id="google-translate-init"
     strategy="lazyOnload"
     dangerouslySetInnerHTML={{
      __html: `
       function googleTranslateElementInit() {
        new google.translate.TranslateElement({
         pageLanguage: 'en',
         autoDisplay: false
        }, 'google_translate_element');
       }
      `,
     }}
    />
    <ThemeProvider
     attribute="class"
     defaultTheme="system"
     enableSystem
     disableTransitionOnChange
    >
     <NextIntlClientProvider messages={messages}>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      <Suspense fallback={null}>
       <PageTransition />
      </Suspense>
      {children}
      <Toaster />
     </NextIntlClientProvider>
    </ThemeProvider>
   </body>
  </html>
 )
}
