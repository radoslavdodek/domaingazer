import { BillingPageClient } from '@/components/BillingPageClient'
import { getBillingPlanPricing } from '@/lib/billing-pricing'

interface BillingPageProps {
  searchParams?: Promise<{
    checkout?: string | string[]
    portal?: string | string[]
  }>
}

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const pricing = await getBillingPlanPricing()
  const resolvedSearchParams = await searchParams
  const checkout = getSingleValue(resolvedSearchParams?.checkout)
  const portal = getSingleValue(resolvedSearchParams?.portal)
  const autoAction = checkout === 'month' || checkout === 'year'
    ? checkout
    : portal === '1'
      ? 'portal'
      : null

  return <BillingPageClient pricing={pricing} autoAction={autoAction} />
}
