import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import { StructuredDataScripts } from '@/components/StructuredDataScripts'
import { getBillingPlanPricing } from '@/lib/billing-pricing'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://domaingazer.com'

export const metadata: Metadata = {
  alternates: {
    canonical: siteUrl,
  },
}

export const revalidate = 3600

export default async function Landing() {
  const pricing = await getBillingPlanPricing()

  return (
    <>
      <StructuredDataScripts includeHowItWorks />
      <LandingPage pricing={pricing} />
    </>
  )
}
