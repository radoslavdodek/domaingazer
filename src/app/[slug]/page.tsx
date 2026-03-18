import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SeoLandingPage } from '@/components/SeoLandingPage'
import { getSeoPageBySlug, SEO_PAGE_SLUGS } from '@/lib/seo-pages'
import {
  getBreadcrumbListJsonLd,
  getFaqPageJsonLd,
  getSoftwareApplicationJsonLd,
} from '@/lib/structuredData'
import { getSiteUrl } from '@/lib/site-config'

export const dynamicParams = false

export function generateStaticParams() {
  return SEO_PAGE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getSeoPageBySlug(slug)
  const siteUrl = getSiteUrl()

  if (!page) {
    return {}
  }

  const pageUrl = `${siteUrl}/${page.slug}`

  return {
    title: page.title,
    description: page.description,
    keywords: [page.primaryKeyword, ...page.secondaryKeywords],
    alternates: {
      canonical: `/${page.slug}`,
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

export default async function SeoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = getSeoPageBySlug(slug)
  const siteUrl = getSiteUrl()

  if (!page) {
    notFound()
  }

  const relatedPages = page.relatedSlugs
    .map((slug) => getSeoPageBySlug(slug))
    .filter((relatedPage): relatedPage is NonNullable<typeof relatedPage> => Boolean(relatedPage))

  const pageUrl = `${siteUrl}/${page.slug}`
  const softwareApplicationJsonLd = getSoftwareApplicationJsonLd({
    url: pageUrl,
    description: page.description,
  })
  const faqJsonLd = getFaqPageJsonLd(page.faqs)
  const breadcrumbJsonLd = getBreadcrumbListJsonLd([
    { name: 'Home', url: siteUrl },
    { name: page.title, url: pageUrl },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SeoLandingPage page={page} relatedPages={relatedPages} />
    </>
  )
}
