import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AnalyticsScripts } from '@/components/AnalyticsScripts'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://domaingazer.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AI Domain Name Generator: Brandable Domains + Real-Time Availability',
    template: '%s | Domain Gazer',
  },
  description:
    'Describe your project in plain English. Our AI instantly generates brandable domain ideas and checks real-time availability across .com, .io, .ai & 10+ TLDs. Free to try.',
  keywords: [
    'domain name finder',
    'AI domain generator',
    'domain availability checker',
    'brandable domain names',
    'domain name search',
    'GPT domain generator',
    'startup domain names',
    'domain checker tool',
    'domain name ideas',
    'find domain name',
  ],
  authors: [{ name: 'Domain Gazer', url: siteUrl }],
  creator: 'Domain Gazer',
  publisher: 'Domain Gazer',
  applicationName: 'Domain Gazer',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Domain Gazer',
    title: 'Domain Gazer — AI Domain Name Finder',
    description:
      'Describe your project in plain English. Our AI generates brandable domain candidates and checks real-time availability across multiple TLDs — all in one shot.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Domain Gazer — AI Domain Name Finder',
    description:
      'Describe your project in plain English. Our AI generates brandable domain candidates and checks real-time availability across multiple TLDs — all in one shot.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="impact-site-verification" content="e0e806fe-1f3f-42c4-9ece-cf49ac5b79f3" />
      </head>
      <body className="min-h-screen font-sans">
        {children}
        <AnalyticsScripts
          gaMeasurementId="G-CD28TVE1XL"
          clarityProjectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}
        />
      </body>
    </html>
  )
}
