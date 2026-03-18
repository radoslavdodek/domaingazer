import { INDUSTRY_PAGES as GENERATED_INDUSTRY_PAGES } from '@/generated/industry-pages'
import { normalizeBrandReferences } from '@/lib/brand-copy'
import type { DomainStatus } from '@/lib/types'

export type IndustryNamingAngle = {
  title: string
  description: string
}

export type IndustryExampleGroup = {
  label: string
  rationale: string
  examples: IndustryExample[]
}

export type IndustryExampleAvailability = {
  tld: string
  fullDomain: string
  status: DomainStatus
}

export type IndustryExample = {
  name: string
  domains: IndustryExampleAvailability[]
}

export type IndustryPromptRecipe = {
  title: string
  prompt: string
  whyItWorks: string
}

export type IndustryPageFaq = {
  question: string
  answer: string
}

export type IndustryPage = {
  slug: string
  industry: string
  category: string
  title: string
  description: string
  h1: string
  heroEyebrow: string
  intro: string
  primaryKeyword: string
  secondaryKeywords: string[]
  audienceSummary: string
  recommendedTlds: string[]
  verifiedAvailabilityTlds: string[]
  namingAngles: IndustryNamingAngle[]
  namePatternsToAvoid: string[]
  exampleGroups: IndustryExampleGroup[]
  promptRecipes: IndustryPromptRecipe[]
  faqs: IndustryPageFaq[]
  relatedIndustries: string[]
  generatedAt: string
}

const INDUSTRY_PAGES: IndustryPage[] = [...GENERATED_INDUSTRY_PAGES].map((generatedPage) => {
  const page = normalizeBrandReferences(generatedPage) as IndustryPage

  return {
    ...page,
    promptRecipes: page.promptRecipes.slice(0, 1),
  exampleGroups: (() => {
    const examples = page.exampleGroups
      .flatMap((group) => group.examples)
      .filter((example) =>
        example.domains.some((domain) => domain.tld === '.com' && domain.status === 'AVAILABLE')
      )

    if (examples.length === 0) {
      return []
    }

    return [
      {
        label: `Verified ${page.industry} names`,
        rationale: `These are the strongest verified names found for ${page.industry.toLowerCase()} using the same free-form generation flow as the main app.`,
        examples,
      },
    ]
  })(),
  }
})

export const INDUSTRY_PAGE_SLUGS = INDUSTRY_PAGES.map((page) => page.slug)

export function getAllIndustryPages(): IndustryPage[] {
  return INDUSTRY_PAGES
}

export function getIndustryPageBySlug(slug: string): IndustryPage | undefined {
  return INDUSTRY_PAGES.find((page) => page.slug === slug)
}

export function getRelatedIndustryPages(slug: string): IndustryPage[] {
  const page = getIndustryPageBySlug(slug)

  if (!page) {
    return []
  }

  return page.relatedIndustries
    .map((relatedSlug) => getIndustryPageBySlug(relatedSlug))
    .filter((relatedPage): relatedPage is IndustryPage => Boolean(relatedPage))
}

export function getIndustryPagesByCategory(): Array<{
  category: string
  pages: IndustryPage[]
}> {
  const grouped = new Map<string, IndustryPage[]>()

  for (const page of INDUSTRY_PAGES) {
    const pages = grouped.get(page.category) ?? []
    pages.push(page)
    grouped.set(page.category, pages)
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, pages]) => ({
      category,
      pages: pages.sort((left, right) => left.industry.localeCompare(right.industry)),
    }))
}
