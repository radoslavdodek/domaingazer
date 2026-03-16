import Link from 'next/link'
import { AppIcon } from '@/components/AppIcon'
import type { IndustryPage } from '@/lib/industry-pages'
import { IndustryAnalyticsTracker } from '@/components/IndustryAnalyticsTracker'
import { IndustryTrackedLink } from '@/components/IndustryTrackedLink'
import type { DomainStatus } from '@/lib/types'

type IndustryLandingPageProps = {
  page: IndustryPage
  relatedPages: IndustryPage[]
}

export function IndustryLandingPage({ page, relatedPages }: IndustryLandingPageProps) {
  const keywords = [page.primaryKeyword, ...page.secondaryKeywords]
  const getCompactRowClassName = (status: DomainStatus) =>
    status === 'AVAILABLE'
      ? 'border-emerald-800 bg-emerald-950/50'
      : 'border-zinc-800 bg-zinc-900'

  const getCompactBadgeClassName = (status: DomainStatus) => {
    switch (status) {
      case 'CHECKING':
        return 'border border-sky-800 bg-sky-950 text-sky-400 font-medium'
      case 'STOPPED':
        return 'border border-zinc-700 bg-zinc-800 text-zinc-500 font-medium'
      case 'AVAILABLE':
        return 'border border-emerald-700 bg-emerald-950 text-emerald-400 font-bold'
      case 'UNAVAILABLE':
        return 'border border-red-800 bg-red-950 text-red-400 font-semibold'
      case 'RESERVED':
        return 'border border-amber-800 bg-amber-950 text-amber-400 font-medium'
      case 'UNSUPPORTED':
        return 'border border-zinc-700 bg-zinc-800 text-zinc-600 font-medium'
      default:
        return 'border border-orange-800 bg-orange-950 text-orange-400 font-medium'
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <IndustryAnalyticsTracker industrySlug={page.slug} primaryKeyword={page.primaryKeyword} />
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute bottom-0 left-0 h-[24rem] w-[24rem] rounded-full bg-emerald-600/10 blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-zinc-800/70 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <AppIcon className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">Domain Gazer</span>
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/domain-name-ideas"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              Industry hub
            </Link>
            <IndustryTrackedLink
              href="/login"
              linkLabel="Generate domain ideas"
              linkType="nav_cta"
              industrySlug={page.slug}
              primaryKeyword={page.primaryKeyword}
              className="rounded-lg bg-[linear-gradient(90deg,#2563eb_0%,#06b6d4_100%)] px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Try Domain Gazer
            </IndustryTrackedLink>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        <section className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              {page.heroEyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">{page.h1}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
              {page.intro}
            </p>
            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400">{page.audienceSummary}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <IndustryTrackedLink
              href="/login"
              linkLabel="Generate names for this industry"
              linkType="hero_cta"
              industrySlug={page.slug}
              primaryKeyword={page.primaryKeyword}
              className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(90deg,#2563eb_0%,#06b6d4_100%)] px-6 py-3 text-base font-semibold text-white shadow-[0_18px_48px_rgba(37,99,235,0.28)]"
            >
              Generate names for {page.industry}
            </IndustryTrackedLink>
            <Link
              href="/domain-name-ideas"
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-base font-semibold text-zinc-100"
            >
              Browse more industries
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-xs font-medium text-zinc-300"
              >
                {keyword}
              </span>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-cyan-500/20 bg-cyan-500/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Best-fit TLDs</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {page.recommendedTlds.map((tld) => (
                <span
                  key={tld}
                  className="rounded-xl border border-cyan-400/20 bg-zinc-950/60 px-4 py-2 text-sm font-semibold text-cyan-100"
                >
                  {tld}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.9fr)]">
            <div className="space-y-6">
              <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-8 sm:p-10">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                  How to name a {page.industry.toLowerCase()} brand
                </h2>
                <div className="mt-6 space-y-4">
                  {page.namingAngles.map((angle) => (
                    <article key={angle.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
                      <h3 className="text-lg font-semibold text-zinc-100">{angle.title}</h3>
                      <p className="mt-3 text-base leading-8 text-zinc-300">{angle.description}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-8 sm:p-10">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                  Example domain directions
                </h2>
                <p className="mt-4 text-base leading-8 text-zinc-400">
                  These are example directions to show the shapes that fit this market. Only names with an available `.com` at generation time are shown, and each one includes a snapshot for {page.verifiedAvailabilityTlds.join(', ')}. Re-check before you register.
                </p>
                {page.exampleGroups.length > 0 ? (
                  <div className="mt-6 grid gap-4">
                    {page.exampleGroups.map((group) => (
                      <article key={group.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
                        <h3 className="text-lg font-semibold text-zinc-100">{group.label}</h3>
                        <p className="mt-3 text-sm leading-7 text-zinc-400">{group.rationale}</p>
                        <div className="mt-4 grid gap-3">
                          {group.examples.map((example) => (
                            <div
                              key={example.name}
                              className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
                            >
                              <span className="text-sm font-semibold text-cyan-100">{example.name}</span>
                              <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                                {example.domains.map((domain) => (
                                  <div
                                    key={domain.fullDomain}
                                    className={`group flex flex-col gap-1.5 rounded-lg border px-2.5 py-1.5 sm:flex-row sm:items-center sm:justify-between ${getCompactRowClassName(domain.status)}`}
                                  >
                                    <span className="min-w-0 break-all font-mono text-[13px] leading-tight text-zinc-300">
                                      {domain.fullDomain}
                                    </span>
                                    <span className={`inline-block w-fit shrink-0 rounded-full px-2 py-0.5 text-xs ${getCompactBadgeClassName(domain.status)}`}>
                                      {domain.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-sm leading-7 text-zinc-400">
                    No verified `.com` examples are currently published for this industry. Use the suggested project brief below to generate fresh options and check them live in Domain Gazer.
                  </div>
                )}
              </section>

              <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-8 sm:p-10">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                  Suggested project brief for Domain Gazer
                </h2>
                <div className="mt-6 grid gap-4">
                  {page.promptRecipes.map((recipe) => (
                    <article key={recipe.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
                      <h3 className="text-lg font-semibold text-zinc-100">{recipe.title}</h3>
                      <p className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm leading-7 text-zinc-300">
                        {recipe.prompt}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-zinc-400">{recipe.whyItWorks}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-8 sm:p-10">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                  Mistakes to avoid in {page.industry.toLowerCase()} naming
                </h2>
                <ul className="mt-6 space-y-3 text-base text-zinc-300">
                  {page.namePatternsToAvoid.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[1.75rem] border border-cyan-500/20 bg-cyan-500/5 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                  Turn this into a shortlist
                </p>
                <ul className="mt-5 space-y-4 text-sm leading-7 text-zinc-200">
                  <li>Paste the suggested brief into Domain Gazer.</li>
                  <li>Generate a batch of names matched to this industry.</li>
                  <li>Check live availability across multiple TLDs.</li>
                </ul>
                <IndustryTrackedLink
                  href="/login"
                  linkLabel="Try Domain Gazer"
                  linkType="sidebar_cta"
                  industrySlug={page.slug}
                  primaryKeyword={page.primaryKeyword}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[linear-gradient(90deg,#2563eb_0%,#06b6d4_100%)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Try Domain Gazer
                </IndustryTrackedLink>
              </section>

              <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Related industries
                </p>
                <div className="mt-5 space-y-3">
                  {relatedPages.map((relatedPage) => (
                    <IndustryTrackedLink
                      key={relatedPage.slug}
                      href={`/domain-name-ideas/${relatedPage.slug}`}
                      linkLabel={relatedPage.title}
                      linkType="related_industry"
                      industrySlug={page.slug}
                      primaryKeyword={page.primaryKeyword}
                      className="block rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 transition-colors hover:border-cyan-500/30 hover:bg-zinc-950"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                        {relatedPage.category}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-zinc-100">{relatedPage.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{relatedPage.description}</p>
                    </IndustryTrackedLink>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Continue research</p>
                <div className="mt-5 space-y-3">
                  <Link
                    href="/domain-name-ideas"
                    className="block rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-cyan-500/30 hover:text-cyan-200"
                  >
                    Browse the full industry hub
                  </Link>
                  <Link
                    href="/blog"
                    className="block rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-cyan-500/30 hover:text-cyan-200"
                  >
                    Read domain naming guides
                  </Link>
                </div>
              </section>
            </aside>
          </div>

          <section className="mt-8 rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">
              Questions about {page.primaryKeyword}
            </h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {page.faqs.map((faq) => (
                <article key={faq.question} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
                  <h3 className="text-lg font-semibold text-zinc-100">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}
