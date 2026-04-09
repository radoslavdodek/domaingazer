import type { Metadata } from 'next'
import Link from 'next/link'
import { AppIcon } from '@/components/AppIcon'
import { JsonLdScripts } from '@/components/JsonLdScripts'
import {
  getAllBlogPosts,
  getBlogListJsonLd,
  type BlogPostSummary,
} from '@/lib/blog'
import { getAllSeoPages } from '@/lib/seo-pages'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://domaingazer.com'
const posts = getAllBlogPosts()
const seoPages = getAllSeoPages()

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Read practical guides on choosing a domain name, checking live availability, and selecting the best TLD for a startup.',
  keywords: [
    'domain name blog',
    'domain naming guide',
    'domain availability articles',
    'startup domain tips',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/blog`,
    title: 'Domain Gazer Blog',
    description:
      'Actionable articles about startup naming, domain availability, and choosing the right extension.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Domain Gazer Blog',
    description:
      'Actionable articles about startup naming, domain availability, and choosing the right extension.',
  },
}

function FeaturedArticle({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-zinc-900/85 p-8 transition-all hover:border-cyan-400/40 hover:bg-zinc-900 lg:p-10"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_42%),linear-gradient(135deg,rgba(8,47,73,0.28),rgba(9,9,11,0.04)_45%,rgba(34,211,238,0.04))]" />
        <div className="absolute -right-20 top-8 h-48 w-48 rounded-full border border-cyan-300/10 bg-cyan-300/5 blur-3xl" />
      </div>

      <div className="relative lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.9fr)] lg:gap-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
              Featured
            </span>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
              <span>{post.category}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500 normal-case tracking-normal">{post.readTime}</span>
            </div>
          </div>

          <h2 className="mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-50 transition-colors group-hover:text-cyan-100 sm:text-4xl">
            {post.title}
          </h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-zinc-300">{post.description}</p>
        </div>

        <div className="mt-8 flex lg:mt-0">
          <div className="flex w-full flex-col justify-between rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div>
              <p className="text-sm leading-7 text-zinc-400">{post.excerpt}</p>
              <div className="mt-6 h-px w-full bg-gradient-to-r from-white/10 via-cyan-300/20 to-white/5" />
              <p className="mt-6 text-sm text-zinc-500">Actionable guide for startup naming and domain selection.</p>
            </div>
            <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.05] px-4 py-3">
              <span className="text-sm font-medium text-zinc-200">Open the full guide</span>
              <span className="text-sm font-semibold text-cyan-300">Read article {'->'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ArticleCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col rounded-[1.75rem] border border-zinc-800 bg-zinc-900/75 p-7 transition-all hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-zinc-900"
    >
      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
        <span>{post.category}</span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-500 normal-case tracking-normal">{post.readTime}</span>
      </div>
      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-50 transition-colors group-hover:text-cyan-200 sm:text-[2rem]">
        {post.title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-zinc-400">{post.description}</p>
      <p className="mt-5 text-sm leading-7 text-zinc-500">{post.excerpt}</p>
      <div className="mt-auto pt-8">
        <div className="flex items-center justify-between gap-4 border-t border-zinc-800 pt-5 text-sm">
          <span className="text-zinc-500">Practical founder-focused article</span>
          <span className="font-semibold text-cyan-300">Read article {'->'}</span>
        </div>
      </div>
    </Link>
  )
}

export default function BlogPage() {
  const [featuredPost, ...otherPosts] = posts
  const blogJsonLd = getBlogListJsonLd(posts)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-blue-600/10 blur-[130px]" />
      </div>

      <JsonLdScripts schemas={[blogJsonLd]} idPrefix="blog-list" />

      <header className="relative z-10 border-b border-zinc-800/70 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <AppIcon className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">Domain Gazer</span>
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <section className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Domain Gazer Blog</p>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">
              Domain naming insights that compound your SEO
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400 sm:text-xl">
              These articles target the questions founders search while choosing a domain: how to name a startup, how
              to check availability, and which extension best fits the product.
            </p>
          </div>

          <div className="mt-14">
            <FeaturedArticle post={featuredPost} />
          </div>

          <section className="mt-12 rounded-[2rem] border border-zinc-800 bg-zinc-900/70 p-8 sm:p-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Product Pages</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                Start with the exact workflow you need
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-400">
                If you already know the problem you are solving, jump straight into one of the dedicated pages for AI
                naming, live availability checks, or comparison shopping.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {seoPages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${page.slug}`}
                  className="group rounded-[1.5rem] border border-zinc-800 bg-zinc-950/60 p-6 transition-all hover:border-cyan-500/30 hover:bg-zinc-950"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                    {page.primaryKeyword}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100 transition-colors group-hover:text-cyan-200">
                    {page.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{page.description}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-cyan-300">Open page {'->'}</span>
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-12 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Latest Guides</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                More high-intent domain articles
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {otherPosts.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
