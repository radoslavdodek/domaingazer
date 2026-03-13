export type SeoPageSection = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export type SeoPageFaq = {
  question: string
  answer: string
}

export type SeoPage = {
  slug: string
  title: string
  description: string
  h1: string
  intro: string
  heroEyebrow: string
  primaryKeyword: string
  secondaryKeywords: string[]
  ctaHref: string
  ctaLabel: string
  relatedSlugs: string[]
  sections: SeoPageSection[]
  faqs: SeoPageFaq[]
}

const BLOG_TO_SEO_PAGE_SLUGS: Record<string, string[]> = {
  'how-to-choose-a-domain-name-for-your-startup': [
    'ai-domain-name-generator',
    'domain-name-ideas-from-business-description',
    'real-time-domain-availability-checker',
  ],
  'domain-availability-checker-what-founders-should-look-for': [
    'real-time-domain-availability-checker',
    'ai-domain-name-generator',
    'namelix-alternative',
  ],
  'com-vs-io-vs-ai-which-domain-extension-is-best': [
    'ai-domain-name-generator',
    'domain-name-ideas-from-business-description',
    'real-time-domain-availability-checker',
  ],
}

const SEO_PAGES: SeoPage[] = [
  {
    slug: 'ai-domain-name-generator',
    title: 'AI Domain Name Generator with Real-Time Availability',
    description:
      'Generate brandable domain names with AI and verify live availability across .com, .io, .ai, and other startup-friendly TLDs in one workflow.',
    h1: 'AI Domain Name Generator for Brandable Domains You Can Actually Register',
    intro:
      'Domain Gazer turns a plain-English product description into startup-ready domain ideas, then checks live availability before you waste time on dead ends.',
    heroEyebrow: 'AI Domain Name Generator',
    primaryKeyword: 'ai domain name generator',
    secondaryKeywords: [
      'brandable domain generator',
      'generate available domain names',
      'ai business name and domain generator',
    ],
    ctaHref: '/login',
    ctaLabel: 'Generate domain ideas',
    relatedSlugs: [
      'domain-name-ideas-from-business-description',
      'real-time-domain-availability-checker',
      'namelix-alternative',
    ],
    sections: [
      {
        title: 'Start with the product description, not a keyword spreadsheet',
        paragraphs: [
          'Most domain tools force founders into manual brainstorming before they have enough clarity. Domain Gazer reverses that flow by accepting a short description of the business, audience, and tone you want.',
          'That gives you candidate names that sound like brands instead of stitched-together keywords. It is a faster path from idea to shortlist when you are still shaping positioning.',
        ],
      },
      {
        title: 'Review domain ideas with live availability in the same screen',
        paragraphs: [
          'A useful AI domain name generator should not stop at naming. The practical question is whether the name is open in a TLD you would actually use.',
          'Domain Gazer checks availability across multiple extensions so you can compare .com, .io, .ai, .co, and more without tab-hopping between registrars.',
        ],
        bullets: [
          'Generate multiple brand directions from one prompt.',
          'Compare extension fit before you commit to a name.',
          'Filter out taken domains before the shortlist gets crowded.',
        ],
      },
      {
        title: 'Use AI to accelerate naming, then move quickly',
        paragraphs: [
          'The goal is not infinite ideation. It is to find several credible, memorable options and register the strongest one before someone else does.',
          'That workflow is where Domain Gazer is strongest: fast input, fast iteration, and an immediate signal on what is still available right now.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How does an AI domain name generator work?',
        answer:
          'It uses your product description, audience, and naming direction to generate domain ideas that are more brandable than a simple keyword combiner. Domain Gazer then checks whether those ideas are available.',
      },
      {
        question: 'Can I check multiple TLDs at the same time?',
        answer:
          'Yes. Domain Gazer compares live availability across multiple extensions, including .com, .io, .ai, .co, .net, .shop, .store, .de, and 300+ more',
      },
      {
        question: 'Is Domain Gazer useful for startup naming?',
        answer:
          'Yes. It is designed for founder workflows where you start with a product idea, need a shortlist quickly, and want names that sound credible in a startup context.',
      },
    ],
  },
  {
    slug: 'domain-name-ideas-from-business-description',
    title: 'Domain Name Ideas from a Business Description',
    description:
      'Describe your startup or business in plain English and get domain name ideas that fit the product, audience, and tone you want to project.',
    h1: 'Generate Domain Name Ideas from a Business Description',
    intro:
      'If you can explain what the business does, Domain Gazer can turn that description into domain ideas that match your positioning and are easier to evaluate across modern TLDs.',
    heroEyebrow: 'Plain-English Naming',
    primaryKeyword: 'domain name ideas from business description',
    secondaryKeywords: [
      'domain ideas from startup description',
      'business description to domain name',
      'plain english domain generator',
    ],
    ctaHref: '/login',
    ctaLabel: 'Describe your business',
    relatedSlugs: [
      'ai-domain-name-generator',
      'real-time-domain-availability-checker',
      'namelix-alternative',
    ],
    sections: [
      {
        title: 'Plain-English prompts produce better naming directions',
        paragraphs: [
          'Founders usually know the product better than the final name. A good domain workflow should let you describe the problem you solve, the audience you serve, and the tone you want without translating that into keyword fragments first.',
          'That gives the model enough context to generate names that feel aligned with the business instead of generic search terms with odd spellings.',
        ],
      },
      {
        title: 'The strongest names still need a structured review',
        paragraphs: [
          'A business description helps create better starting points, but the shortlist should still be filtered for clarity, memorability, and extension fit.',
          'Domain Gazer makes that review easier by pairing generated names with live availability checks, so the practical options surface quickly.',
        ],
        bullets: [
          'Start with the business promise and buyer outcome.',
          'Shortlist names that are easy to say and easy to spell.',
          'Compare the same base name across .com, .io, and .ai.',
        ],
      },
      {
        title: 'Move from description to registration in one workflow',
        paragraphs: [
          'The real benefit of a business-description workflow is speed. Instead of brainstorming, checking, and restarting across multiple tools, you can move from concept to shortlist in one pass.',
          'That is especially useful early in a launch when naming decisions are blocking landing pages, email setup, and product rollout.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I get domain ideas without entering keywords?',
        answer:
          'Yes. Domain Gazer is designed for plain-English inputs, so you can describe the business naturally and let the tool generate naming options from that context.',
      },
      {
        question: 'What should I include in the business description?',
        answer:
          'Include what the product does, who it is for, and the tone you want the brand to project. Those three inputs usually improve the quality of the names significantly.',
      },
      {
        question: 'Why is plain-English input better than manual brainstorming?',
        answer:
          'It reduces the time spent inventing raw ideas and tends to produce names that are closer to the product positioning. That makes the evaluation step faster and more consistent.',
      },
    ],
  },
  {
    slug: 'real-time-domain-availability-checker',
    title: 'Real-Time Domain Availability Checker for Founders',
    description:
      'Check domain availability in real time across multiple TLDs and compare which brandable names are still open before you go to a registrar.',
    h1: 'Real-Time Domain Availability Checker for Startup Shortlists',
    intro:
      'A domain checker should help you make a decision now, not confirm a stale result later. Domain Gazer combines live checks with AI-generated options so the shortlist stays useful.',
    heroEyebrow: 'Live Domain Checks',
    primaryKeyword: 'real-time domain availability checker',
    secondaryKeywords: [
      'live domain availability',
      'instant domain checker',
      'check if domain is available now',
    ],
    ctaHref: '/login',
    ctaLabel: 'Check live availability',
    relatedSlugs: [
      'ai-domain-name-generator',
      'domain-name-ideas-from-business-description',
      'namelix-alternative',
    ],
    sections: [
      {
        title: 'Live availability is the difference between research and action',
        paragraphs: [
          'A domain can look promising until the moment you try to register it. That is why cached or delayed results are not enough when you are narrowing a shortlist.',
          'Domain Gazer performs live checks so the names you keep on screen are grounded in what you can act on immediately.',
        ],
      },
      {
        title: 'Compare several names and extensions in one pass',
        paragraphs: [
          'Checking one name at a time creates unnecessary drag. Most founders need to compare several brand directions across the extensions they would realistically consider.',
          'The faster workflow is a table of options with current status across .com, .io, .ai, .co, and other relevant TLDs. That gives you better decisions with less manual work.',
        ],
        bullets: [
          'Spot available names before you invest in them emotionally.',
          'See which extensions are open for the same base name.',
          'Refine the prompt and re-check without leaving the app.',
        ],
      },
      {
        title: 'Use the checker as part of a naming loop',
        paragraphs: [
          'Availability should not be the last step. It should shape the shortlist as you generate names so you avoid wasting time on options that were never realistic.',
          'That is why Domain Gazer pairs AI generation and live lookup together instead of separating them into two disconnected tools.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does Domain Gazer check domains in real time?',
        answer:
          'Yes. Each generated domain is checked live so you can see whether it is available, taken, or still being processed right now.',
      },
      {
        question: 'Which TLDs can I compare?',
        answer:
          'You can compare multiple extensions in one search, including .com, .io, .ai, .co, .net, .shop, .store, and .de.',
      },
      {
        question: 'Is this better than checking domains one by one?',
        answer:
          'Yes. It removes repetitive lookups and makes it easier to compare a full shortlist, which is how most domain decisions are actually made.',
      },
    ],
  },
  {
    slug: 'namelix-alternative',
    title: 'Namelix Alternative with Live Domain Availability',
    description:
      'Compare Domain Gazer as a Namelix alternative when you want plain-English prompts and live multi-TLD availability instead of name ideas alone.',
    h1: 'A Namelix Alternative for Founders Who Need Live Availability',
    intro:
      'If you like AI-assisted naming but need a faster path to domains you can actually register, Domain Gazer gives you plain-English prompts and live availability checks in the same workflow.',
    heroEyebrow: 'Comparison Page',
    primaryKeyword: 'namelix alternative',
    secondaryKeywords: [
      'ai naming tool with domain availability',
      'namelix vs domaingazer',
      'domain name generator alternative',
    ],
    ctaHref: '/login',
    ctaLabel: 'Try the alternative',
    relatedSlugs: [
      'ai-domain-name-generator',
      'domain-name-ideas-from-business-description',
      'real-time-domain-availability-checker',
    ],
    sections: [
      {
        title: 'The main difference is workflow, not just output',
        paragraphs: [
          'Many AI naming tools help you brainstorm names. The practical bottleneck comes after that, when you still need to verify availability and compare extensions fast enough to make a decision.',
          'Domain Gazer is built around that founder workflow. You describe the business, review brandable options, and see live availability without bouncing to another tool.',
        ],
      },
      {
        title: 'Use plain-English context to get more relevant suggestions',
        paragraphs: [
          'A strong alternative should reduce setup friction. Domain Gazer lets you explain the product in natural language so the generator has more context about the market, audience, and tone.',
          'That tends to be more useful than forcing abstract style filters when you already know what the business does and who it serves.',
        ],
        bullets: [
          'Plain-English prompts for startup ideas and new products.',
          'Live availability checks across multiple TLDs.',
          'Fewer dead ends when the goal is registration, not endless ideation.',
        ],
      },
      {
        title: 'Choose the tool that gets you to a registrable shortlist faster',
        paragraphs: [
          'If your priority is high-volume brainstorming, one tool may be enough. If your priority is shipping a landing page, registering a domain, and moving the launch forward, Domain Gazer is the tighter fit.',
          'That is the standard worth optimizing for: how quickly you can move from an idea to a domain you can actually buy.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What makes Domain Gazer a Namelix alternative?',
        answer:
          'It combines AI-generated naming with live domain availability, which shortens the path from idea generation to a domain shortlist you can register.',
      },
      {
        question: 'Can I describe my startup in plain English?',
        answer:
          'Yes. Domain Gazer is built for that input style, so you can describe the product naturally instead of relying on fragmented keyword prompts.',
      },
      {
        question: 'Who should use Domain Gazer instead of another naming tool?',
        answer:
          'Founders who care about speed to launch and want naming plus live availability in one place are the best fit.',
      },
    ],
  },
]

export const SEO_PAGE_SLUGS = SEO_PAGES.map((page) => page.slug)

export function getAllSeoPages(): SeoPage[] {
  return SEO_PAGES
}

export function getSeoPageBySlug(slug: string): SeoPage | undefined {
  return SEO_PAGES.find((page) => page.slug === slug)
}

export function getSeoPagesForBlogPost(slug: string): SeoPage[] {
  const relatedSlugs = BLOG_TO_SEO_PAGE_SLUGS[slug] ?? SEO_PAGE_SLUGS.slice(0, 3)
  return relatedSlugs
    .map((pageSlug) => getSeoPageBySlug(pageSlug))
    .filter((page): page is SeoPage => Boolean(page))
}
