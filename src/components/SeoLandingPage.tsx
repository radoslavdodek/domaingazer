import Link from 'next/link'
import { AppIcon } from '@/components/AppIcon'
import { SeoAnalyticsTracker } from '@/components/SeoAnalyticsTracker'
import { SeoTrackedLink } from '@/components/SeoTrackedLink'
import type { SeoPage } from '@/lib/seo-pages'

type SeoLandingPageProps = {
  page: SeoPage
  relatedPages: SeoPage[]
}

export function SeoLandingPage({ page, relatedPages }: SeoLandingPageProps) {
  const keywords = [page.primaryKeyword, ...page.secondaryKeywords]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <SeoAnalyticsTracker slug={page.slug} primaryKeyword={page.primaryKeyword} />
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute bottom-0 left-0 h-[24rem] w-[24rem] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-zinc-800/70 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <AppIcon className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">Domain Gazer</span>
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SeoTrackedLink
              href="/blog"
              eventName="seo_internal_link_click"
              linkLabel="Blog"
              linkType="nav"
              pageSlug={page.slug}
              primaryKeyword={page.primaryKeyword}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              Blog
            </SeoTrackedLink>
            <SeoTrackedLink
              href={page.ctaHref}
              eventName="seo_cta_click"
              linkLabel="Try free"
              linkType="nav_cta"
              pageSlug={page.slug}
              primaryKeyword={page.primaryKeyword}
              className="rounded-lg bg-[linear-gradient(90deg,#2563eb_0%,#06b6d4_100%)] px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Try free
            </SeoTrackedLink>
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
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SeoTrackedLink
              href={page.ctaHref}
              eventName="seo_cta_click"
              linkLabel={page.ctaLabel}
              linkType="hero_cta"
              pageSlug={page.slug}
              primaryKeyword={page.primaryKeyword}
              className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(90deg,#2563eb_0%,#06b6d4_100%)] px-6 py-3 text-base font-semibold text-white shadow-[0_18px_48px_rgba(37,99,235,0.28)]"
            >
              {page.ctaLabel}
            </SeoTrackedLink>
            <SeoTrackedLink
              href="/"
              eventName="seo_internal_link_click"
              linkLabel="See the main product page"
              linkType="hero_secondary"
              pageSlug={page.slug}
              primaryKeyword={page.primaryKeyword}
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-base font-semibold text-zinc-100"
            >
              See the main product page
            </SeoTrackedLink>
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

          <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.9fr)]">
            <div className="space-y-6">
              {page.sections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-8 sm:p-10"
                >
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                    {section.title}
                  </h2>
                  <div className="mt-5 space-y-4 text-base leading-8 text-zinc-300">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {section.bullets ? (
                    <ul className="mt-6 space-y-3 text-base text-zinc-300">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <aside className="space-y-6">
              <section className="rounded-[1.75rem] border border-cyan-500/20 bg-cyan-500/5 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                  Why founders use it
                </p>
                <ul className="mt-5 space-y-4 text-sm leading-7 text-zinc-200">
                  <li>Generate names from a real business description instead of isolated keywords.</li>
                  <li>Compare multiple TLDs while the shortlist is still forming.</li>
                  <li>Move from idea to registrable domain options in one pass.</li>
                </ul>
                <SeoTrackedLink
                  href={page.ctaHref}
                  eventName="seo_cta_click"
                  linkLabel={page.ctaLabel}
                  linkType="sidebar_cta"
                  pageSlug={page.slug}
                  primaryKeyword={page.primaryKeyword}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[linear-gradient(90deg,#2563eb_0%,#06b6d4_100%)] px-5 py-3 text-sm font-semibold text-white"
                >
                  {page.ctaLabel}
                </SeoTrackedLink>
              </section>

              <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Related pages
                </p>
                <div className="mt-5 space-y-3">
                  {relatedPages.map((relatedPage) => (
                    <SeoTrackedLink
                      key={relatedPage.slug}
                      href={`/${relatedPage.slug}`}
                      eventName="seo_internal_link_click"
                      linkLabel={relatedPage.title}
                      linkType="related_page"
                      pageSlug={page.slug}
                      primaryKeyword={page.primaryKeyword}
                      className="block rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 transition-colors hover:border-cyan-500/30 hover:bg-zinc-950"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                        {relatedPage.primaryKeyword}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-zinc-100">{relatedPage.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{relatedPage.description}</p>
                    </SeoTrackedLink>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-900/70 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Continue research</p>
                <div className="mt-5 space-y-3">
                  <SeoTrackedLink
                    href="/blog"
                    eventName="seo_internal_link_click"
                    linkLabel="Read domain naming guides"
                    linkType="continue_research"
                    pageSlug={page.slug}
                    primaryKeyword={page.primaryKeyword}
                    className="block rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-cyan-500/30 hover:text-cyan-200"
                  >
                    Read domain naming guides
                  </SeoTrackedLink>
                  <SeoTrackedLink
                    href="/"
                    eventName="seo_internal_link_click"
                    linkLabel="Visit the main landing page"
                    linkType="continue_research"
                    pageSlug={page.slug}
                    primaryKeyword={page.primaryKeyword}
                    className="block rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-cyan-500/30 hover:text-cyan-200"
                  >
                    Visit the main landing page
                  </SeoTrackedLink>
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
