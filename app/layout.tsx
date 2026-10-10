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

const siteUrl = 'https://mina-and-monica-wedding.vercel.app'
const shareTitle = 'Mina & Monica'
const shareDescription = 'دعوة زفاف · السبت ٣١ اكتوبر · الساعة ٧ · كنيسة مارجرجس هليوبوليس'
const shareImage = {
  url: `${siteUrl}/og-hero.jpg`,
  width: 1080,
  height: 1452,
  alt: 'Mina & Monica',
  type: 'image/jpeg',
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: shareTitle,
  description: shareDescription,
  applicationName: shareTitle,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: siteUrl,
    siteName: shareTitle,
    title: shareTitle,
    description: shareDescription,
    images: [shareImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: shareTitle,
    description: shareDescription,
    images: [shareImage.url],
  },
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
