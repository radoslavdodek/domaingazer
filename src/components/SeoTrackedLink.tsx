'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { trackAnalyticsEvent } from '@/lib/analytics'

type SeoTrackedLinkProps = {
  href: string
  className?: string
  children: ReactNode
  eventName: 'seo_cta_click' | 'seo_internal_link_click'
  linkLabel: string
  linkType: string
  pageSlug: string
  primaryKeyword: string
}

export function SeoTrackedLink({
  href,
  className,
  children,
  eventName,
  linkLabel,
  linkType,
  pageSlug,
  primaryKeyword,
}: SeoTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackAnalyticsEvent(eventName, {
          page_slug: pageSlug,
          primary_keyword: primaryKeyword,
          destination: href,
          link_label: linkLabel,
          link_type: linkType,
        })
      }
    >
      {children}
    </Link>
  )
}
