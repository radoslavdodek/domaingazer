import { getSiteName, getSiteUrl } from '@/lib/site-config'

const siteName = getSiteName()
const siteUrl = getSiteUrl()

type BlogSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

type BlogFaq = {
  question: string
  answer: string
}

export type BlogPost = {
  slug: string
  title: string
  description: string
  excerpt: string
  intro: string
  category: string
  readTime: string
  publishedAt: string
  updatedAt: string
  keywords: string[]
  sections: BlogSection[]
  faqs: BlogFaq[]
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-choose-a-domain-name-for-your-startup',
    title: 'How to Choose a Domain Name for Your Startup',
    description:
      'A practical framework for choosing a startup domain name that is brandable, memorable, and easier to secure across major TLDs.',
    excerpt:
      'Use a repeatable process to evaluate clarity, memorability, availability, and extension fit before you commit to a startup domain.',
    intro:
      'If you are deciding how to choose a domain name for a startup, the goal is to find a name that is easy to remember, easy to say, and still available in an extension your audience will trust.',
    category: 'Naming Strategy',
    readTime: '6 min read',
    publishedAt: '2026-03-03T08:00:00.000Z',
    updatedAt: '2026-03-03T08:00:00.000Z',
    keywords: [
      'how to choose a domain name',
      'startup domain name',
      'brandable domain ideas',
      'domain naming tips',
    ],
    sections: [
      {
        heading: 'Start with the brand, not the keyword list',
        paragraphs: [
          'Founders often begin with keywords because they feel measurable. The problem is that keyword-first domains usually become long, generic, and easy to confuse with competitors.',
          'A stronger starting point is the brand promise. Write down how you want the company to sound: trusted, fast, premium, playful, technical, or simple. That tone should guide the shape of the name before you worry about the extension.',
        ],
      },
      {
        heading: 'Use a short evaluation checklist',
        paragraphs: [
          'Before you register anything, score each candidate using the same criteria. A good domain usually wins because it performs well across several small tests, not because one idea sounds clever in isolation.',
        ],
        bullets: [
          'Can someone spell it after hearing it once?',
          'Does it still sound credible without additional explanation?',
          'Can you say it in a pitch without slowing down?',
          'Is the name distinct from close competitors in your space?',
        ],
      },
      {
        heading: 'Check extension fit alongside availability',
        paragraphs: [
          'The best available domain is not always the best domain. You should compare the same base name across .com, .io, .ai, and other relevant TLDs to understand how much trust and positioning each option creates.',
          'For most companies, .com remains the clearest long-term default. For developer tools, AI products, and modern SaaS brands, .io and .ai can be strong if the name is clean and the audience expects those extensions.',
        ],
      },
      {
        heading: 'Avoid friction you will keep paying for',
        paragraphs: [
          'Every extra character, hyphen, or awkward spelling introduces support cost. You will repeat the domain in demos, investor updates, podcasts, social bios, and outbound emails.',
          'If a domain needs a sentence of explanation, keep searching. The cost of a weaker domain compounds over time because it affects recall, trust, and direct traffic.',
        ],
      },
      {
        heading: 'Make the final decision quickly',
        paragraphs: [
          'Once you have a shortlist with clear tradeoffs, move. The real goal is not to discover a perfect domain. It is to secure a strong, usable, credible name before someone else does.',
          'A practical workflow is to generate several brandable options, validate them against the checklist, then immediately verify live availability before you finalize your pick.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What makes a strong startup domain name?',
        answer:
          'A strong startup domain is clear, memorable, easy to spell, and aligned with the product positioning. It should also be realistic to secure in a TLD you are comfortable using long term.',
      },
      {
        question: 'Should a startup always buy the .com domain?',
        answer:
          'Not always. .com is usually the strongest mainstream default, but .io or .ai can be strong choices when they fit the audience and category better. The decision should balance trust, availability, and brand fit.',
      },
    ],
  },
  {
    slug: 'domain-availability-checker-what-founders-should-look-for',
    title: 'Domain Availability Checker: What Founders Should Look For',
    description:
      'Learn what matters in a domain availability checker, including live lookups, multi-TLD comparisons, and workflows that shorten the path to registration.',
    excerpt:
      'The right domain checker does more than say taken or available. It should speed up naming decisions and reduce dead ends.',
    intro:
      'A domain availability checker should help you validate names quickly, compare extensions in one pass, and avoid stale results that slow down registration decisions.',
    category: 'Availability',
    readTime: '5 min read',
    publishedAt: '2026-03-03T08:00:00.000Z',
    updatedAt: '2026-03-03T08:00:00.000Z',
    keywords: [
      'domain availability checker',
      'check if domain is available',
      'live domain availability',
      'domain search tool',
    ],
    sections: [
      {
        heading: 'Live results matter more than large databases',
        paragraphs: [
          'A domain tool is only useful when the availability signal is current. Cached or delayed results create false confidence and waste time when you try to register a name that looked open a few minutes earlier.',
          'Founders should prioritize tools that perform live availability checks. That matters more than a long feature list because the core job is accuracy at decision time.',
        ],
      },
      {
        heading: 'You need comparisons, not single-name lookups',
        paragraphs: [
          'Checking one domain at a time creates a slow and narrow workflow. Naming is usually a comparison task where you evaluate several base names across several extensions.',
          'A better workflow lets you review multiple generated candidates in one screen, then compare which variants are open in .com, .io, .ai, .co, and other relevant extensions.',
        ],
      },
      {
        heading: 'The best tools support iteration',
        paragraphs: [
          'Most strong startup names come from refinement. You start with a concept, see what is taken, then generate better alternatives that keep the original direction while improving availability.',
          'This is where AI-assisted domain research is useful. Instead of manually inventing dozens of alternatives, you can describe the business and iterate on groups of names much faster.',
        ],
      },
      {
        heading: 'A practical decision workflow',
        paragraphs: [
          'To move faster, narrow your process to a few steps and use the same order every time.',
        ],
        bullets: [
          'Generate a batch of names that match your positioning.',
          'Compare each name across the TLDs you would realistically use.',
          'Eliminate names with awkward spelling, weak brand fit, or poor availability.',
          'Shortlist the strongest options and register the winner immediately.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Why is live domain availability important?',
        answer:
          'Live domain availability checks reduce the risk of acting on outdated data. That matters when you are narrowing a shortlist and need to know whether a domain can actually be registered now.',
      },
      {
        question: 'Can a domain checker help with naming, not just validation?',
        answer:
          'Yes. The most useful tools support both workflows: they help generate multiple domain ideas and show availability across multiple TLDs so you can make naming decisions faster.',
      },
    ],
  },
  {
    slug: 'com-vs-io-vs-ai-which-domain-extension-is-best',
    title: '.com vs .io vs .ai: Which Domain Extension Is Best?',
    description:
      'Compare .com, .io, and .ai for trust, positioning, memorability, and startup fit so you can choose the right extension for a new product.',
    excerpt:
      'The best TLD depends on your audience, category, and brand goals. This guide breaks down when .com, .io, or .ai makes sense.',
    intro:
      'Choosing between .com, .io, and .ai is not just a branding preference. The extension changes how your product is perceived, who it feels built for, and how much explanation your domain will need.',
    category: 'TLD Guide',
    readTime: '7 min read',
    publishedAt: '2026-03-03T08:00:00.000Z',
    updatedAt: '2026-03-03T08:00:00.000Z',
    keywords: [
      '.com vs .io',
      '.ai domain',
      'best domain extension for startup',
      'which TLD should I choose',
    ],
    sections: [
      {
        heading: 'Why the extension changes perception',
        paragraphs: [
          'Users notice the extension even when founders pretend they do not. A TLD shapes how established, modern, technical, or niche a company feels on first impression.',
          'That makes extension choice a positioning decision, not just a technical detail. The same brand name can feel conservative on .com, startup-native on .io, or AI-specific on .ai.',
        ],
      },
      {
        heading: 'When .com is the best choice',
        paragraphs: [
          '.com remains the safest default when you want broad trust, easy recall, and fewer explanations. It is still the strongest fit for companies targeting mainstream buyers or larger long-term brands.',
          'The downside is availability. Many clean .com names are taken, which often pushes founders toward longer names or more abstract brand constructions.',
        ],
      },
      {
        heading: 'When .io works well',
        paragraphs: [
          '.io is common in software, developer tooling, infrastructure, and SaaS. It usually signals a modern product and can help keep the base name shorter when the matching .com is unavailable.',
          'It is less ideal for businesses serving a broad non-technical audience. Outside startup and product circles, some users still default to typing .com by habit.',
        ],
      },
      {
        heading: 'When .ai is the right move',
        paragraphs: [
          '.ai is strong when artificial intelligence is a core part of the product story, not just a minor feature. It immediately communicates category fit and can improve click intent from AI-aware audiences.',
          'If the business is not meaningfully AI-led, the extension can feel forced. In that case, it may age poorly as your positioning evolves.',
        ],
      },
      {
        heading: 'Choose based on audience and roadmap',
        paragraphs: [
          'The correct extension is the one that matches your buyers and the company you want to become. If you expect a mainstream market, prioritize trust. If you are targeting builders or launching an AI-native product, a modern TLD can be an advantage.',
          'The right process is to compare the same base name across extensions, then weigh clarity, availability, and positioning together instead of optimizing only for one variable.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is .com still the best domain extension for most startups?',
        answer:
          'For broad trust and mainstream audiences, .com is still the safest default. It remains easier for users to remember and less likely to require explanation.',
      },
      {
        question: 'When should a startup choose a .ai domain?',
        answer:
          'A startup should choose a .ai domain when AI is central to the product story and target users already recognize the category. Otherwise, the extension can feel less natural over time.',
      },
    ],
  },
]

export type BlogPostSummary = Pick<
  BlogPost,
  'slug' | 'title' | 'description' | 'excerpt' | 'category' | 'readTime' | 'publishedAt' | 'updatedAt'
>

export function getAllBlogPosts(): BlogPost[] {
  return BLOG_POSTS
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}

export function getRelatedBlogPosts(slug: string, limit = 2): BlogPostSummary[] {
  return BLOG_POSTS
    .filter((post) => post.slug !== slug)
    .slice(0, limit)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      excerpt: post.excerpt,
      category: post.category,
      readTime: post.readTime,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    }))
}

export function getFeaturedBlogPostSummaries(limit = 3): BlogPostSummary[] {
  return BLOG_POSTS.slice(0, limit).map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    excerpt: post.excerpt,
    category: post.category,
    readTime: post.readTime,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
  }))
}

export function getBlogListJsonLd(posts: BlogPostSummary[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${siteName} Blog`,
    url: `${siteUrl}/blog`,
    description:
      'SEO-focused articles about choosing brandable domain names, checking availability, and selecting the right TLD for a startup.',
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      description: post.description,
    })),
  }
}

export function getBlogPostWordCount(post: BlogPost) {
  const textBlocks = [
    post.title,
    post.description,
    post.excerpt,
    post.intro,
    ...post.keywords,
    ...post.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.bullets ?? []),
    ]),
    ...post.faqs.flatMap((faq) => [faq.question, faq.answer]),
  ]

  return textBlocks
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

export function getBlogPostJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
    headline: post.title,
    description: post.description,
    keywords: post.keywords.join(', '),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    wordCount: getBlogPostWordCount(post),
    about: post.keywords,
    author: {
      '@type': 'Organization',
      name: siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    articleSection: post.category,
  }
}

export function getBlogPostFaqJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function getBlogPostBreadcrumbJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${siteUrl}/blog/${post.slug}`,
      },
    ],
  }
}
