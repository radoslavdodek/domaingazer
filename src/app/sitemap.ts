import type { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/blog'
import { getAllIndustryPages } from '@/lib/industry-pages'
import { getAllSeoPages } from '@/lib/seo-pages'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://domaingazer.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = getAllBlogPosts()
  const industryPages = getAllIndustryPages()
  const seoPages = getAllSeoPages()

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(blogPosts[0]?.updatedAt ?? '2026-03-03T08:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/domain-name-ideas`,
      lastModified: new Date(industryPages[0]?.generatedAt ?? '2026-03-11T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    ...seoPages.map((page) => ({
      url: `${siteUrl}/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...industryPages.map((page) => ({
      url: `${siteUrl}/domain-name-ideas/${page.slug}`,
      lastModified: new Date(page.generatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
