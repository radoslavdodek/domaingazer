import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import { StructuredDataScripts } from '@/components/StructuredDataScripts'
import { getBillingPlanPricing } from '@/lib/billing-pricing'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
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
