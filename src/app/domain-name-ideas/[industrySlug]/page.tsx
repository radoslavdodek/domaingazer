import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IndustryLandingPage } from '@/components/IndustryLandingPage'
import {
  getIndustryPageBySlug,
  getRelatedIndustryPages,
  INDUSTRY_PAGE_SLUGS,
} from '@/lib/industry-pages'
import {
  getBreadcrumbListJsonLd,
  getCollectionPageJsonLd,
  getFaqPageJsonLd,
} from '@/lib/structuredData'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://domaingazer.com'

export const dynamicParams = false

export function generateStaticParams() {
  return INDUSTRY_PAGE_SLUGS.map((industrySlug) => ({ industrySlug }))
}

export function generateMetadata({
  params,
}: {
  params: { industrySlug: string }
}): Metadata {
  const page = getIndustryPageBySlug(params.industrySlug)

  if (!page) {
    return {}
  }

  const pageUrl = `${siteUrl}/domain-name-ideas/${page.slug}`

  return {
    title: page.title,
    description: page.description,
    keywords: [page.primaryKeyword, ...page.secondaryKeywords],
    alternates: {
      canonical: `/domain-name-ideas/${page.slug}`,
    },
    openGraph: {
      type: 'website',
      url: pageUrl,
      title: page.title,
      description: page.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function IndustryPage({
  params,
}: {
  params: { industrySlug: string }
}) {
  const page = getIndustryPageBySlug(params.industrySlug)

  if (!page) {
    notFound()
  }

  const pageUrl = `${siteUrl}/domain-name-ideas/${page.slug}`
  const relatedPages = getRelatedIndustryPages(page.slug)
  const faqJsonLd = getFaqPageJsonLd(page.faqs)
  const breadcrumbJsonLd = getBreadcrumbListJsonLd([
    { name: 'Home', url: siteUrl },
    { name: 'Domain Name Ideas by Industry', url: `${siteUrl}/domain-name-ideas` },
    { name: page.title, url: pageUrl },
  ])
  const collectionJsonLd = getCollectionPageJsonLd({
    name: page.title,
    description: page.description,
    url: pageUrl,
    items: page.exampleGroups.flatMap((group) =>
      group.examples.map((example) => ({
        name: example.name,
        url: pageUrl,
      }))
    ),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <IndustryLandingPage page={page} relatedPages={relatedPages} />
    </>
  )
}
