'use client'

import { useEffect } from 'react'
import { trackAnalyticsEvent } from '@/lib/analytics'

type IndustryAnalyticsTrackerProps = {
  industrySlug: string
  primaryKeyword: string
}

export function IndustryAnalyticsTracker({
  industrySlug,
  primaryKeyword,
}: IndustryAnalyticsTrackerProps) {
  useEffect(() => {
    trackAnalyticsEvent('industry_page_view', {
      page_type: 'industry',
      industry_slug: industrySlug,
      primary_keyword: primaryKeyword,
    })
  }, [industrySlug, primaryKeyword])

  return null
}
