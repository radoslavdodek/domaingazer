import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { cookies } from 'next/headers'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ConsentBanner } from '@/components/ConsentBanner'
import { PRIVACY_REGION_COOKIE, type RegionKind } from '@/lib/privacy/constants'
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
    default: 'Domain Gazer — AI Domain Name Finder',
    template: '%s | Domain Gazer',
  },
  description:
    'Describe your project in plain English and instantly find available domain names. AI-powered by GPT-4.1 with real-time availability checks across .com, .io, .ai, .co, .net and more.',
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
      'Describe your project in plain English and instantly find available domain names. AI-powered by GPT-4.1 with real-time availability checks across .com, .io, .ai, .co, .net and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Domain Gazer — AI Domain Name Finder',
    description:
      'Describe your project and instantly find available, brandable domain names. AI-powered by GPT-4.1.',
  },
  alternates: {
    canonical: siteUrl,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Domain Gazer',
  url: siteUrl,
  description:
    'AI-powered domain name finder. Describe your project in plain English and instantly discover available, brandable domain names across multiple TLDs.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  featureList: [
    'AI-powered domain name generation using GPT-4.1',
    'Real-time domain availability checking via AWS Route 53',
    'Multi-TLD search (.com, .io, .ai, .co, .net, .shop, .store, .de)',
    'Smart multi-round search up to 5 rounds',
    'Search history',
    'CSV export',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const regionCookie = cookies().get(PRIVACY_REGION_COOKIE)?.value
  const initialRegion: RegionKind = regionCookie === 'eu' ? 'eu' : 'non-eu'

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen font-sans">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CD28TVE1XL"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CD28TVE1XL');
          `}
        </Script>
        <ThemeProvider>
          {children}
          <ConsentBanner initialRegion={initialRegion} />
        </ThemeProvider>
      </body>
    </html>
  )
}
