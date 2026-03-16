import type { Metadata } from 'next'
import Link from 'next/link'
import { AppIcon } from '@/components/AppIcon'
import {
  getAllIndustryPages,
  getIndustryPagesByCategory,
} from '@/lib/industry-pages'
import {
  getBreadcrumbListJsonLd,
  getCollectionPageJsonLd,
} from '@/lib/structuredData'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://domaingazer.com'

const groupedPages = getIndustryPagesByCategory()
const allPages = getAllIndustryPages()

export const metadata: Metadata = {
  title: 'Domain Name Ideas by Industry',
  description:
    'Browse industry-specific domain naming guides with examples, one suggested project brief per market, and brand angles for SaaS, fintech, recruiting, ecommerce, and more.',
  keywords: [
    'domain name ideas by industry',
    'industry domain name ideas',
    'business name ideas by industry',
    'domain naming guides',
  ],
  alternates: {
    canonical: '/domain-name-ideas',
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/domain-name-ideas`,
    title: 'Domain Name Ideas by Industry',
    description:
      'Industry-specific domain naming guides with one suggested project brief, examples, and practical naming advice.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Domain Name Ideas by Industry',
    description:
      'Industry-specific domain naming guides with one suggested project brief, examples, and practical naming advice.',
  },
}

export default function IndustryIdeasHubPage() {
  const collectionJsonLd = getCollectionPageJsonLd({
    name: 'Domain Name Ideas by Industry',
    description:
      'Industry-specific naming guides, example domain directions, and one suggested project brief for generating better domain ideas.',
    url: `${siteUrl}/domain-name-ideas`,
    items: allPages.map((page) => ({
      name: page.title,
      url: `${siteUrl}/domain-name-ideas/${page.slug}`,
    })),
  })
  const breadcrumbJsonLd = getBreadcrumbListJsonLd([
    { name: 'Home', url: siteUrl },
    { name: 'Domain Name Ideas by Industry', url: `${siteUrl}/domain-name-ideas` },
  ])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-blue-600/10 blur-[130px]" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className="relative z-10 border-b border-zinc-800/70 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <AppIcon className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">Domain Gazer</span>
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/blog"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              Blog
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-[linear-gradient(90deg,#2563eb_0%,#06b6d4_100%)] px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Try Domain Gazer
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        <section className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Industry Naming Hub
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
              Domain name ideas by industry
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
              Browse industry-specific naming guides with example domain directions, one ready-to-paste project brief per market, and advice on the patterns that fit each market.
            </p>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-cyan-500/20 bg-cyan-500/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">How to use this hub</p>
            <ul className="mt-5 space-y-3 text-base text-zinc-200">
              <li>Open the market that matches your product or client base.</li>
              <li>Use the examples to spot the naming patterns that already feel right.</li>
              <li>Paste the suggested project brief into Domain Gazer and validate the shortlist with live checks.</li>
            </ul>
          </div>

          <div className="mt-12 space-y-8">
            {groupedPages.map((group) => (
              <section key={group.category}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      {group.category}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">
                      {group.category} naming guides
                    </h2>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {group.pages.map((page) => (
                    <Link
                      key={page.slug}
                      href={`/domain-name-ideas/${page.slug}`}
                      className="group rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-7 transition-all hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-zinc-900"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                        {page.primaryKeyword}
                      </p>
                      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-100 transition-colors group-hover:text-cyan-200">
                        {page.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-zinc-400">{page.description}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {page.recommendedTlds.map((tld) => (
                          <span
                            key={tld}
                            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs font-semibold text-zinc-300"
                          >
                            {tld}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
