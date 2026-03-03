import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AppPage } from '@/components/AppPage'
import { LandingPage } from '@/components/LandingPage'
import { StructuredDataScripts } from '@/components/StructuredDataScripts'
import { getBillingPlanPricing } from '@/lib/billing-pricing'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    return (
      <>
        <StructuredDataScripts />
        <AppPage />
      </>
    )
  }

  const pricing = await getBillingPlanPricing()

  return (
    <>
      <StructuredDataScripts includeHowItWorks />
      <LandingPage pricing={pricing} />
    </>
  )
}
