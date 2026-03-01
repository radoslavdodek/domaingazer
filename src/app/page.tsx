import { createClient } from '@/lib/supabase/server'
import { AppPage } from '@/components/AppPage'
import { LandingPage } from '@/components/LandingPage'
import { getBillingPlanPricing } from '@/lib/billing-pricing'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    return <AppPage />
  }

  const pricing = await getBillingPlanPricing()

  return <LandingPage pricing={pricing} />
}
