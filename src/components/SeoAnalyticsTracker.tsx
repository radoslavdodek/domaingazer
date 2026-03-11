'use client'

import { useEffect } from 'react'
import { trackAnalyticsEvent } from '@/lib/analytics'

type SeoAnalyticsTrackerProps = {
  slug: string
  primaryKeyword: string
}

export function SeoAnalyticsTracker({ slug, primaryKeyword }: SeoAnalyticsTrackerProps) {
  useEffect(() => {
    trackAnalyticsEvent('seo_page_view', {
      page_slug: slug,
      primary_keyword: primaryKeyword,
    })
  }, [slug, primaryKeyword])

  return null
}
