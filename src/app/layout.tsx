import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AnalyticsScripts } from '@/components/AnalyticsScripts'
import {
  getClarityProjectId,
  getGaMeasurementId,
  getImpactSiteVerification,
  getSiteName,
  getSiteUrl,
} from '@/lib/site-config'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const siteName = getSiteName()
const siteUrl = getSiteUrl()
const gaMeasurementId = getGaMeasurementId()
const clarityProjectId = getClarityProjectId()
const impactSiteVerification = getImpactSiteVerification()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AI Domain Name Generator: Brandable Domains + Real-Time Availability',
    template: `%s | ${siteName}`,
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
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  applicationName: siteName,
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
    siteName,
    title: `${siteName} — AI Domain Name Finder`,
    description:
      'Describe your project in plain English. Our AI generates brandable domain candidates and checks real-time availability across multiple TLDs — all in one shot.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} — AI Domain Name Finder`,
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {impactSiteVerification ? (
          <meta name="impact-site-verification" content={impactSiteVerification} />
        ) : null}
      </head>
      <body className="min-h-screen font-sans">
        <a
          href="#main-content"
          className="sr-only absolute left-4 top-4 z-[100] rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        {children}
        <AnalyticsScripts
          gaMeasurementId={gaMeasurementId}
          clarityProjectId={clarityProjectId}
        />
      </body>
    </html>
  )
}
