import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://domaingazer.app'

export const metadata: Metadata = {
  alternates: {
    canonical: siteUrl,
  },
}

export default function Landing() {
  return <LandingPage />
}
