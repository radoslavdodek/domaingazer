import type { Metadata } from 'next'
import { LandingPage } from '@/components/LandingPage'
import { StructuredDataScripts } from '@/components/StructuredDataScripts'
import { getBillingPlanPricing } from '@/lib/billing-pricing'
import { getFeaturedBlogPostSummaries } from '@/lib/blog'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export const revalidate = 3600

export default async function Landing() {
  const pricing = await getBillingPlanPricing()
  const featuredPosts = getFeaturedBlogPostSummaries()

  return (
    <>
      <StructuredDataScripts includeHowItWorks />
      <LandingPage pricing={pricing} featuredPosts={featuredPosts} />
    </>
  )
}
