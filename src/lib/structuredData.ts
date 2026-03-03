const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://domaingazer.com'

export const HOW_IT_WORKS_FAQS = [
  {
    question: 'How do I find domain name ideas with Domain Gazer?',
    answer:
      'Describe your business or project in plain English, choose the TLDs you care about, and Domain Gazer generates brandable domain ideas tailored to that description.',
  },
  {
    question: 'Does Domain Gazer check domain availability in real time?',
    answer:
      'Yes. Every suggested domain is checked live so you can immediately see whether a domain is available, taken, or still being checked.',
  },
  {
    question: 'Which domain extensions can I search?',
    answer:
      'Domain Gazer supports searches across .com, .io, .ai, .co, .net, .shop, .store, and .de, so you can compare multiple extensions in one search.',
  },
] as const

export function getSoftwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Domain Gazer',
    url: siteUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'AI-powered domain name finder that generates brandable domain ideas from a project description and checks live availability across multiple TLDs.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'AI-powered domain name generation',
      'Real-time domain availability checks',
      'Multi-TLD search across .com, .io, .ai, .co, .net, .shop, .store, and .de',
      'Search history and follow-up refinement',
    ],
  }
}

export function getFaqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOW_IT_WORKS_FAQS.map((item) => ({
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
    name: 'How to find an available domain name with Domain Gazer',
    description:
      'Use Domain Gazer to turn a project description into available domain names you can register.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Describe your project',
        text:
          'Enter a plain-English description of your business, startup, product, or idea so Domain Gazer understands what you are building.',
      },
      {
        '@type': 'HowToStep',
        name: 'Choose domain extensions',
        text:
          'Select the TLDs you want to search, including .com, .io, .ai, .co, .net, .shop, .store, or .de.',
      },
      {
        '@type': 'HowToStep',
        name: 'Generate domain ideas',
        text:
          'Let Domain Gazer create brandable domain name candidates that match the description you entered.',
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
