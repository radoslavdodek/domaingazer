import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppIcon } from '@/components/AppIcon'
import { JsonLdScripts } from '@/components/JsonLdScripts'
import {
  getAllBlogPosts,
  getBlogPostBreadcrumbJsonLd,
  getBlogPostFaqJsonLd,
  getBlogPostBySlug,
  getBlogPostJsonLd,
  getRelatedBlogPosts,
} from '@/lib/blog'
import { getSeoPagesForBlogPost } from '@/lib/seo-pages'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://domaingazer.com'

function getSectionId(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const dynamicParams = false

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    category: post.category,
    authors: [{ name: 'Domain Gazer', url: siteUrl }],
    creator: 'Domain Gazer',
    publisher: 'Domain Gazer',
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      url: `${siteUrl}/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      section: post.category,
      tags: post.keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const articleJsonLd = getBlogPostJsonLd(post)
  const faqJsonLd = getBlogPostFaqJsonLd(post)
  const breadcrumbJsonLd = getBlogPostBreadcrumbJsonLd(post)
  const relatedPosts = getRelatedBlogPosts(post.slug)
  const relatedSeoPages = getSeoPagesForBlogPost(post.slug)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-cyan-600/10 blur-[130px]" />
        <div className="absolute bottom-0 left-0 h-[24rem] w-[24rem] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <JsonLdScripts
        schemas={[articleJsonLd, faqJsonLd, breadcrumbJsonLd]}
        idPrefix="blog-post"
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
              Back to Blog
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-24 pt-14 sm:px-6 sm:pt-20">
        <article className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
              <span>{post.category}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500 normal-case tracking-normal">{post.readTime}</span>
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-zinc-400">{post.description}</p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300">{post.intro}</p>

            <div className="mt-8 flex flex-wrap gap-2">
              {post.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-zinc-700 bg-zinc-950/80 px-3 py-1 text-xs font-medium text-zinc-400"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <nav className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/55 p-8 sm:p-10" aria-label="Table of contents">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">In This Guide</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {post.sections.map((section, index) => (
                <a
                  key={section.heading}
                  href={`#${getSectionId(section.heading)}`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-cyan-500/30 hover:text-cyan-200"
                >
                  {index + 1}. {section.heading}
                </a>
              ))}
            </div>
          </nav>

          <div className="mt-8 space-y-8">
            {post.sections.map((section) => (
              <section
                key={section.heading}
                id={getSectionId(section.heading)}
                className="scroll-mt-24 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 sm:p-10"
              >
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">{section.heading}</h2>
                <div className="mt-5 space-y-4 text-base leading-8 text-zinc-300">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets ? (
                  <ul className="mt-5 space-y-3 text-base text-zinc-300">
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

          <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
              Frequently asked questions about {post.keywords[0]}
            </h2>
            <div className="mt-6 space-y-4">
              {post.faqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5"
                >
                  <h3 className="text-lg font-semibold text-zinc-100">{faq.question}</h3>
                  <p className="mt-3 text-base leading-8 text-zinc-300">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Turn the research into a shortlist</h2>
            <p className="mt-4 text-base leading-8 text-zinc-300">
              Once you have a direction, use Domain Gazer to generate brandable options and compare live availability
              across multiple TLDs without jumping between tools.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(90deg,#2563eb_0%,#06b6d4_100%)] px-5 py-3 text-sm font-semibold text-white"
              >
                Try Domain Gazer
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100"
              >
                Read more articles
              </Link>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 sm:p-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Related Product Pages</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
                  Continue with the matching workflow
                </h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {relatedSeoPages.map((relatedPage) => (
                <Link
                  key={relatedPage.slug}
                  href={`/${relatedPage.slug}`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 transition-colors hover:border-cyan-500/30 hover:bg-zinc-950"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                    {relatedPage.primaryKeyword}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-zinc-100">{relatedPage.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{relatedPage.description}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-cyan-300">Open page {'->'}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 sm:p-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Related Articles</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
                  Keep building topical authority
                </h2>
              </div>
              <Link href="/blog" className="text-sm font-semibold text-cyan-300">
                Browse all articles
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 transition-colors hover:border-cyan-500/30 hover:bg-zinc-950"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                    {relatedPost.category}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-zinc-100">{relatedPost.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{relatedPost.description}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-cyan-300">Read article {'->'}</span>
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
    </div>
  )
}
