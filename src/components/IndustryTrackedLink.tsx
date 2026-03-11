'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { trackAnalyticsEvent } from '@/lib/analytics'

type IndustryTrackedLinkProps = {
  href: string
  className?: string
  children: ReactNode
  linkLabel: string
  linkType: string
  industrySlug: string
  primaryKeyword: string
}

export function IndustryTrackedLink({
  href,
  className,
  children,
  linkLabel,
  linkType,
  industrySlug,
  primaryKeyword,
}: IndustryTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackAnalyticsEvent('industry_cta_click', {
          page_type: 'industry',
          industry_slug: industrySlug,
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
