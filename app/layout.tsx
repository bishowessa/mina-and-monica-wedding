import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Amiri, Cormorant_Garamond, Great_Vibes, Pinyon_Script } from 'next/font/google'
import './globals.css'

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-arabic',
  display: 'swap',
})

const names = Pinyon_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-names',
  display: 'swap',
})

const script = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'دعوة زفاف',
  description: 'السبت ٣١ اكتوبر، الساعة ٧، كنيسة مارجرجس هليوبوليس',
}

export const viewport: Viewport = {
  themeColor: '#F9F5EF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${cormorant.variable} ${names.variable} ${script.variable} bg-background`}>
      <body className="min-h-dvh bg-[#F9F5EF] font-arabic text-[#5B1E2B] antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
