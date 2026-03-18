import Link from 'next/link'
import { AppIcon } from '@/components/AppIcon'
import { LandingDemoPreview } from '@/components/LandingDemoPreview'
import { LandingPricingPlans } from '@/components/LandingPricingPlans'
import { MarketingAuthLink } from '@/components/MarketingAuthLink'
import type { BillingPlanPricing } from '@/lib/billing-types'
import { HOW_IT_WORKS_FAQS } from '@/lib/structuredData'
import { getAllSeoPages } from '@/lib/seo-pages'
import { getSiteName, getSocialShareLinks, getSiteTagline } from '@/lib/site-config'

type FeaturedBlogPost = {
  slug: string
  title: string
  description: string
  category: string
  readTime: string
}

const siteName = getSiteName()
const siteTagline = getSiteTagline()
const socialShareLinks = getSocialShareLinks()

const STEPS = [
  {
    number: '01',
    title: 'Describe Your Project',
    description: 'Tell us about your business or startup in plain English. No keywords, no brainstorming — just describe what you\'re building.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'AI Generates Names',
    description: 'AI creates dozens of creative, brandable domain candidates tailored to your description — names that actually sound like real companies.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Check Availability Live',
    description: 'Every domain candidate is checked for availability instantly, so you’ll know right away whether you can use the domain name or if it’s already taken',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const FEATURES = [
  {
    title: 'AI Powered',
    description: 'State-of-the-art language models generates creative, brandable names — not generic keyword combinations.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    accent: 'purple',
  },
  {
    title: 'Real-Time Availability',
    description: 'Live checks the availability of your domain, giving you fresh and accurate results every time',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    accent: 'yellow',
  },
  {
    title: 'Multiple TLDs Supported',
    description: 'Search across .com, .io, .ai, .co, .net, .shop, .store, .de, and 300+ more — mix and match freely.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    accent: 'blue',
  },
]

const ACCENT_CLASSES: Record<string, { icon: string; bg: string; border: string }> = {
  purple: { icon: 'text-purple-400', bg: 'bg-purple-950/50', border: 'border-purple-900/50' },
  yellow: { icon: 'text-yellow-400', bg: 'bg-yellow-950/50', border: 'border-yellow-900/50' },
  blue: { icon: 'text-blue-400', bg: 'bg-blue-950/50', border: 'border-blue-900/50' },
  cyan: { icon: 'text-cyan-400', bg: 'bg-cyan-950/50', border: 'border-cyan-900/50' },
  emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-900/50' },
  orange: { icon: 'text-orange-400', bg: 'bg-orange-950/50', border: 'border-orange-900/50' },
}

export function LandingPage({
  pricing,
  featuredPosts,
}: {
  pricing: BillingPlanPricing | null
  featuredPosts: FeaturedBlogPost[]
}) {
  const seoPages = getAllSeoPages()
  const focusRingClassName = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950'

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white antialiased">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute top-1/2 -right-64 h-[500px] w-[500px] rounded-full bg-cyan-600/8 blur-[120px]" />
        <div className="absolute bottom-0 -left-32 h-[400px] w-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2.5">
            <AppIcon className="h-7 w-7 text-blue-400" />
            <span className="text-lg font-bold tracking-tight">{siteName}</span>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href="/blog"
              className={`rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 ${focusRingClassName}`}
            >
              Blog
            </Link>
            <Link
              href="/domain-name-ideas"
              className={`rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 ${focusRingClassName}`}
            >
              Industry Guides
            </Link>
            <MarketingAuthLink
              className={`flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-100 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-sm transition-colors hover:bg-white/[0.08] ${focusRingClassName}`}
            />
          </div>
        </div>
      </nav>

      <main id="main-content">
        {/* ── Hero ── */}
        <section className="relative z-10 px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:pt-36">
          <div className="mx-auto max-w-6xl">
          {/* Heading block */}
          <div className="mx-auto max-w-3xl text-center">
            <div
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300">
              <span className="text-blue-400">✦</span>
              AI-powered
            </div>

            <h1 className="mb-6 text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Find Your Perfect{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                Domain Name with AI
              </span>
              {' '}Instantly
            </h1>

            <p className="mx-auto mb-4 max-w-xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
              Describe your project in plain English. Our AI generates brandable domain candidates
              and checks real-time availability across multiple TLDs — all in one shot.
            </p>

            {/* TLD pills */}
            <div className="mb-10 flex flex-col items-center gap-3">
              <div className="flex flex-wrap justify-center gap-2">
                {['.com', '.io', '.ai', '.co', '.net', '.shop', '.store', '.de'].map((tld) => (
                    <span key={tld}
                          className="rounded-md border border-zinc-700/60 bg-zinc-800/60 px-2.5 py-1 text-xs font-mono font-medium text-zinc-300">
                    {tld}
                  </span>
                ))}
              </div>
              <span className="text-sm text-zinc-300">and 300+ more</span>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <MarketingAuthLink
                signedInHref="/app"
                signedOutHref="/login?next=%2Fapp"
                signedInLabel="Search for free"
                signedOutLabel="Search for free"
                className={`flex w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(90deg,#6d28ff_0%,#4f46e5_28%,#2563eb_62%,#06b6d4_100%)] px-6 py-3 text-base font-semibold text-white shadow-[0_18px_48px_rgba(37,99,235,0.28)] transition-all hover:opacity-90 sm:w-auto ${focusRingClassName}`}
              />
            </div>
            <p className="mt-4 text-sm text-zinc-300">No credit card required · Cancel anytime</p>
          </div>

          <LandingDemoPreview focusRingClassName={focusRingClassName} />
        </div>
        </section>

        {/* ── How It Works ── */}
        <section className="relative z-10 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="text-zinc-300">From idea to domain in three steps</p>
          </div>

          <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-8">
            {/* Connector line — desktop only */}
            <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent sm:block" aria-hidden="true" />

            {STEPS.map((step) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400 ring-4 ring-zinc-950">
                  {step.icon}
                </div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-blue-300">{step.number}</p>
                <h3 className="mb-2.5 text-lg font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-300">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Common questions</h3>
              <p className="mt-3 text-zinc-300">The same details covered in the workflow, in plain language.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {HOW_IT_WORKS_FAQS.map((item) => (
                <article
                  key={item.question}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
                >
                  <h4 className="text-lg font-semibold text-zinc-100">{item.question}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Everything you need</h2>
            <p className="text-zinc-300">Powerful features built for founders and makers</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const a = ACCENT_CLASSES[feature.accent]
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${a.bg} ${a.border} ${a.icon}`}>
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-zinc-100">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-300">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">SEO Content Hub</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Fresh articles for founders choosing a domain</h2>
              <p className="mt-4 text-zinc-300">
                Browse practical guides built around the exact search intent {siteName} solves: naming, domain availability,
                and picking the right extension for a new brand.
              </p>
            </div>
            <Link
              href="/blog"
              className={`inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-800 ${focusRingClassName}`}
            >
              Explore the blog
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`group rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 transition-all hover:border-cyan-500/40 hover:bg-zinc-900 ${focusRingClassName}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    {post.category}
                  </span>
                  <span className="text-xs font-medium text-zinc-300">{post.readTime}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-zinc-100 transition-colors group-hover:text-cyan-200">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{post.description}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-cyan-300">Read article →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">Search Intent Pages</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                Dedicated guides for the exact searches founders make
              </h2>
              <p className="mt-4 text-zinc-300">
                These pages break down the main workflows behind {siteName}, from AI naming to live availability
                checks and comparison-driven research.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {seoPages.map((page) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                className={`group rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 transition-all hover:border-cyan-500/40 hover:bg-zinc-900 ${focusRingClassName}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                  {page.primaryKeyword}
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-zinc-100 transition-colors group-hover:text-cyan-200">
                  {page.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">{page.description}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-cyan-300">Open page →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Simple pricing</h2>
            <p className="text-zinc-300">
              Start with one-time free credits, then unlock unlimited usage with a monthly or yearly subscription.
            </p>
          </div>

          <LandingPricingPlans pricing={pricing} />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative z-10 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-700/60 bg-zinc-900 px-8 py-16 text-center sm:px-16">
            {/* Inner glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute -top-24 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[90px]" />
            </div>

            <div className="relative mx-auto flex w-full max-w-xl flex-col items-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                ✦ Free to get started
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to find your domain?
              </h2>
              <p className="mb-8 text-zinc-300">
                Join founders who&apos;ve found their perfect domain with {siteName}.
                Sign in and start searching in seconds.
              </p>
              <MarketingAuthLink
                signedInHref="/app"
                signedOutHref="/login?next=%2Fapp"
                signedInLabel="Search for free"
                signedOutLabel="Search for free"
                className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(90deg,#6d28ff_0%,#4f46e5_28%,#2563eb_62%,#06b6d4_100%)] px-6 py-3 text-base font-semibold text-white shadow-[0_18px_48px_rgba(37,99,235,0.28)] transition-all hover:opacity-90 sm:w-auto ${focusRingClassName}`}
              />
              <p className="mt-4 text-sm text-zinc-300">No credit card required · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-zinc-800/60 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5 text-zinc-400">
            <AppIcon className="h-5 w-5" />
            <span className="text-sm font-semibold text-zinc-400">{siteName}</span>
          </div>
          <div className="flex flex-col items-center gap-3 sm:items-end">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-300">
              <Link href="/blog" className={`underline underline-offset-2 ${focusRingClassName}`}>
                Blog
              </Link>
              <Link href="/privacy" className={`underline underline-offset-2 ${focusRingClassName}`}>
                Privacy
              </Link>
              <Link href="/cookies" className={`underline underline-offset-2 ${focusRingClassName}`}>
                Cookies
              </Link>
              <Link href="/terms" className={`underline underline-offset-2 ${focusRingClassName}`}>
                Terms
              </Link>
              <span className="mx-1 text-zinc-700">|</span>
              <div className="flex items-center gap-2">
                <a href={socialShareLinks.x} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-zinc-300 transition-colors hover:text-zinc-100 ${focusRingClassName}`} aria-label="Share on X">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href={socialShareLinks.linkedIn} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-zinc-300 transition-colors hover:text-zinc-100 ${focusRingClassName}`} aria-label="Share on LinkedIn">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href={socialShareLinks.facebook} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-zinc-300 transition-colors hover:text-zinc-100 ${focusRingClassName}`} aria-label="Share on Facebook">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>
            <p className="text-sm text-zinc-300">© 2026 {siteName} · {siteTagline}</p>
          </div>
        </div>
      </footer>
      </main>
    </div>
  )
}
