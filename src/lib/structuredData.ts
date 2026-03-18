import { getSiteName, getSiteUrl } from '@/lib/site-config'

const siteName = getSiteName()
const siteUrl = getSiteUrl()

type SoftwareApplicationOptions = {
  description?: string
  featureList?: string[]
  name?: string
  url?: string
}

type FaqItem = {
  question: string
  answer: string
}

type BreadcrumbItem = {
  name: string
  url: string
}

type CollectionPageItem = {
  name: string
  url: string
}

type CollectionPageOptions = {
  name: string
  description: string
  url?: string
  items: ReadonlyArray<CollectionPageItem>
}

export const HOW_IT_WORKS_FAQS = [
  {
    question: `How do I find domain name ideas with ${siteName}?`,
    answer:
      `Describe your business or project in plain English, choose the TLDs you care about, and ${siteName} generates brandable domain ideas tailored to that description.`,
  },
  {
    question: `Does ${siteName} check domain availability in real time?`,
    answer:
      'Yes. Every suggested domain is checked live so you can immediately see whether a domain is available, taken, or still being checked.',
  },
  {
    question: 'Which domain extensions can I search?',
    answer:
      `${siteName} supports searches across .com, .io, .ai, .co, .net, .shop, .store, .de, and 300+ more, so you can compare multiple extensions in one search.`,
  },
] as const

export function getSoftwareApplicationJsonLd(options: SoftwareApplicationOptions = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: options.name ?? siteName,
    url: options.url ?? siteUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      options.description ??
      'AI-powered domain name finder that generates brandable domain ideas from a project description and checks live availability across multiple TLDs.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList:
      options.featureList ?? [
        'AI-powered domain name generation',
        'Real-time domain availability checks',
        'Multi-TLD search across .com, .io, .ai, .co, .net, .shop, .store, .de, and 300+ more',
        'Search history and follow-up refinement',
      ],
  }
}

export function getFaqPageJsonLd(items: ReadonlyArray<FaqItem> = HOW_IT_WORKS_FAQS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function getHowToJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to find an available domain name with ${siteName}`,
    description:
      `Use ${siteName} to turn a project description into available domain names you can register.`,
    step: [
      {
        '@type': 'HowToStep',
        name: 'Describe your project',
        text:
          `Enter a plain-English description of your business, startup, product, or idea so ${siteName} understands what you are building.`,
      },
      {
        '@type': 'HowToStep',
        name: 'Choose domain extensions',
        text:
          'Select the TLDs you want to search, including .com, .io, .ai, .co, .net, .shop, .store, .de, and 300+ more.',
      },
      {
        '@type': 'HowToStep',
        name: 'Generate domain ideas',
        text:
          `Let ${siteName} create brandable domain name candidates that match the description you entered.`,
      },
      {
        '@type': 'HowToStep',
        name: 'Review live availability',
        text:
          'Check which generated domains are available right now and keep refining until you find a strong option.',
      },
    ],
  }
}

export function getBreadcrumbListJsonLd(items: ReadonlyArray<BreadcrumbItem>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function getCollectionPageJsonLd(options: CollectionPageOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: options.name,
    description: options.description,
    url: options.url ?? siteUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: options.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  }
}
