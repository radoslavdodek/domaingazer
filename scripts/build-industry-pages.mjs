import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import OpenAI from 'openai'
import {
  buildGenerateMessages,
  sanitizeGeneratedBaseNames,
} from '../src/lib/domain-generation-prompt.mjs'
import {
  CheckDomainAvailabilityCommand,
  DomainAvailability,
  Route53DomainsClient,
} from '@aws-sdk/client-route-53-domains'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const seedsPath = path.join(repoRoot, 'src/data/industry-seeds.json')
const envPath = path.join(repoRoot, '.env.local')
const outputDir = path.join(repoRoot, 'src/generated')
const outputPath = path.join(outputDir, 'industry-pages.ts')
const generatedAt = new Date().toISOString()
const VERIFIED_TLDS = ['.com', '.io', '.ai']
const MIN_AVAILABLE_NAMES = 5
const MAX_AVAILABLE_NAMES = 10
const BATCH_SIZE = 10
const MAX_BATCH_ATTEMPTS = 50
const NAME_MODEL = 'gpt-4.1'

const bannedPhrases = [
  'not thin ai spam',
  'revolutionary solution',
  'game-changing platform',
  'cutting-edge innovation',
]

let route53Client
let openAiClient

function logProgress(message) {
  console.log(`[industry-pages] ${message}`)
}

function formatProgress(current, total) {
  if (!total) {
    return '0/0 (0%)'
  }

  return `${current}/${total} (${Math.round((current / total) * 100)}%)`
}

async function loadLocalEnv() {
  const rawEnv = await readFile(envPath, 'utf8')

  for (const line of rawEnv.split('\n')) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const equalsIndex = trimmed.indexOf('=')

    if (equalsIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, equalsIndex).trim()
    let value = trimmed.slice(equalsIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

async function writeSeeds(seeds) {
  await writeFile(seedsPath, `${JSON.stringify(seeds, null, 2)}\n`)
}

function createLimiter(concurrency) {
  let running = 0
  const queue = []

  return async function limit(fn) {
    if (running >= concurrency) {
      await new Promise((resolve) => queue.push(resolve))
    }

    running += 1

    try {
      return await fn()
    } finally {
      running -= 1
      const next = queue.shift()
      if (next) {
        next()
      }
    }
  }
}

function getRoute53Client() {
  if (!route53Client) {
    route53Client = new Route53DomainsClient({
      region: process.env.AWS_REGION || 'us-east-1',
    })
  }

  return route53Client
}

function getOpenAiClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(`OPENAI_API_KEY is required to generate industry page name ideas with ${NAME_MODEL}`)
  }

  if (!openAiClient) {
    openAiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  return openAiClient
}

function mapAvailabilityStatus(availability) {
  switch (availability) {
    case DomainAvailability.AVAILABLE:
      return 'AVAILABLE'
    case DomainAvailability.RESERVED:
      return 'RESERVED'
    case DomainAvailability.UNAVAILABLE:
      return 'UNAVAILABLE'
    default:
      return 'ERROR'
  }
}

async function checkDomainAvailability(fullDomain) {
  const maxRetries = 5

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await getRoute53Client().send(
        new CheckDomainAvailabilityCommand({ DomainName: fullDomain })
      )

      return mapAvailabilityStatus(response.Availability)
    } catch (error) {
      const err = error

      if (
        err?.name === 'UnsupportedTLD' ||
        err?.__type === 'UnsupportedTLD' ||
        (error instanceof Error && error.message.includes('UnsupportedTLD'))
      ) {
        return 'UNSUPPORTED'
      }

      if (
        err?.code === 'ENOTFOUND' ||
        err?.code === 'ECONNRESET' ||
        err?.code === 'ECONNREFUSED'
      ) {
        throw error
      }

      if (
        (err?.name === 'ThrottlingException' || err?.__type === 'ThrottlingException') &&
        attempt < maxRetries
      ) {
        const delay = 800 * 2 ** attempt + Math.round(Math.random() * 250)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      console.error(`[industry-pages] failed to check ${fullDomain}`, error)
      return 'ERROR'
    }
  }

  return 'ERROR'
}

function toTitleCase(value) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function slugToLabel(slug) {
  return slug
    .split('-')
    .map((part) => toTitleCase(part))
    .join(' ')
}

function unique(values) {
  return Array.from(new Set(values))
}

function tokenize(value) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2)
  )
}

function jaccard(left, right) {
  const a = tokenize(left)
  const b = tokenize(right)
  const union = new Set([...a, ...b])

  if (union.size === 0) {
    return 0
  }

  let intersection = 0
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1
    }
  }

  return intersection / union.size
}

function buildExampleGroups(seed) {
  const examples = (seed.availableExamples ?? []).map((example) => ({
    name: example.name,
    domains: example.domains,
  }))

  if (examples.length === 0) {
    return []
  }

  return [
    {
      label: `Verified ${seed.industry} names`,
      rationale: `These are the strongest verified names found for ${seed.industry.toLowerCase()} using the same free-form generation flow as the main app. They are not forced into naming buckets or templates.`,
      examples,
    },
  ]
}

function hasSufficientAvailableExamples(seed) {
  if (!Array.isArray(seed.availableExamples)) {
    return false
  }

  if (
    seed.availableExamples.length < MIN_AVAILABLE_NAMES ||
    seed.availableExamples.length > MAX_AVAILABLE_NAMES
  ) {
    return false
  }

  return seed.availableExamples.every((example) =>
    Array.isArray(example.domains) &&
    example.domains.length === VERIFIED_TLDS.length &&
    example.domains.some((domain) => domain.tld === '.com' && domain.status === 'AVAILABLE')
  )
}

function getReservedNameConflicts(seed, reservedNames) {
  if (!Array.isArray(seed.availableExamples) || reservedNames.size === 0) {
    return []
  }

  return seed.availableExamples
    .map((example) => example?.name)
    .filter((name) => typeof name === 'string' && reservedNames.has(name))
}

function buildIndustryProjectDescription(seed) {
  const lowerIndustry = seed.industry.toLowerCase()

  return `A ${lowerIndustry} brand for ${seed.audience}. The product should ${seed.offer}, and buyers care because ${seed.problem}. The brand should feel ${seed.tone}, with room to expand beyond one narrow feature. Prefer real words when possible. Strong naming directions may draw inspiration from themes like ${seed.coreTerms.join(', ')}, ${seed.metaphorTerms.join(', ')}, or ${seed.trustTerms.join(', ')}, while avoiding ${seed.avoidTerms.join(', ')}.`
}

function buildPromptRecipes(seed) {
  const projectDescription = buildIndustryProjectDescription(seed)

  return [
    {
      title: `Suggested ${seed.industry} project brief`,
      prompt: projectDescription,
      whyItWorks: 'Paste this into Domain Gazer’s project description field and update it according to your needs.',
    },
  ]
}

function buildFaqs(seed) {
  const industryKeyword = seed.industry.toLowerCase()

  return [
    {
      question: `What makes a strong ${industryKeyword} domain name?`,
      answer: `A strong ${industryKeyword} domain feels aligned with the buyer problem, easy to say out loud, and credible enough to support sales conversations. It should signal the right level of trust without becoming generic.`,
    },
    {
      question: `Should a ${industryKeyword} brand use a descriptive or brandable name?`,
      answer: `Most ${industryKeyword} companies benefit from a middle ground: brandable enough to stand apart, but still anchored in a signal buyers can understand quickly. That is why the strongest options usually combine one clear category cue with a more distinctive word.`,
    },
    {
      question: `How should I use these ${industryKeyword} domain ideas?`,
      answer: `Treat the examples on this page as naming directions that cleared a point-in-time .com availability check. Use them to understand the patterns that fit your market, then run them through Domain Gazer to re-check live availability before you register anything.`,
    },
  ]
}

function buildNamingAngles(seed) {
  return [
    {
      title: 'Lead with the buyer outcome',
      description: `${seed.industry} names work better when they hint at the result the buyer wants, not just the raw category. For this market, that means signaling how the product will ${seed.offer}.`,
    },
    {
      title: 'Keep the trust signal proportional to the buying risk',
      description: `Because ${seed.problem}, the name should feel ${seed.tone}. A name that sounds too playful or too vague will make the product work harder in the first sales touch.`,
    },
    {
      title: 'Leave room for product expansion',
      description: `Avoid names that lock the brand into one feature or one narrow use case. The strongest ${seed.industry.toLowerCase()} brands can expand the product line without the domain sounding mismatched later.`,
    },
  ]
}

function buildPage(seed) {
  const keyword = `domain name ideas for ${seed.industry.toLowerCase()}`
  const signatureTerms = [seed.coreTerms[0], seed.metaphorTerms[0], seed.trustTerms[0]].join(', ')

  return {
    slug: seed.slug,
    industry: seed.industry,
    category: seed.category,
    title: `Domain Name Ideas for ${seed.industry}`,
    description: `Find domain name ideas for ${seed.industry.toLowerCase()} brands, including naming angles, example domains, and prompts you can use to generate better options.`,
    h1: `Domain Name Ideas for ${seed.industry}`,
    heroEyebrow: `${seed.category} Naming`,
    intro: `${seed.industry} buyers expect brands that feel ${seed.tone}, especially when the product promise is to ${seed.offer}. This guide focuses on naming territory around ${signatureTerms} so you can move toward a shortlist that sounds native to the market instead of generic.`,
    primaryKeyword: keyword,
    secondaryKeywords: [
      `${seed.industry.toLowerCase()} domain ideas`,
      `${seed.industry.toLowerCase()} business name ideas`,
      `brandable ${seed.industry.toLowerCase()} domain names`,
    ],
    audienceSummary: `This market targets ${seed.audience}. Because ${seed.problem}, the name has to support the story that the brand can ${seed.offer}. That usually means balancing recognisable category cues with a more ownable term.`,
    recommendedTlds: seed.recommendedTlds,
    verifiedAvailabilityTlds: VERIFIED_TLDS,
    namingAngles: buildNamingAngles(seed),
    namePatternsToAvoid: seed.avoidTerms,
    exampleGroups: buildExampleGroups(seed),
    promptRecipes: buildPromptRecipes(seed),
    faqs: buildFaqs(seed),
    relatedIndustries: [],
    generatedAt,
  }
}

function sanitizeBaseName(value) {
  return value
    .toLowerCase()
    .replace(/\.(com|io|ai|co)\b/g, ' ')
    .replace(/\b(com|io|ai|co)\b/g, ' ')
    .replace(/[^a-z]/g, '')
}

function isReasonableBaseName(name) {
  return name.length >= 5 && name.length <= 30
}

function buildNgrams(value, size = 3) {
  const normalized = sanitizeBaseName(value)

  if (normalized.length <= size) {
    return new Set([normalized])
  }

  const grams = new Set()
  for (let index = 0; index <= normalized.length - size; index += 1) {
    grams.add(normalized.slice(index, index + size))
  }
  return grams
}

function ngramSimilarity(left, right) {
  const leftGrams = buildNgrams(left)
  const rightGrams = buildNgrams(right)
  const union = new Set([...leftGrams, ...rightGrams])

  if (union.size === 0) {
    return 0
  }

  let intersection = 0
  for (const gram of leftGrams) {
    if (rightGrams.has(gram)) {
      intersection += 1
    }
  }

  return intersection / union.size
}

function sharedPrefixLength(left, right) {
  const leftName = sanitizeBaseName(left)
  const rightName = sanitizeBaseName(right)
  let length = 0

  while (
    length < leftName.length &&
    length < rightName.length &&
    leftName[length] === rightName[length]
  ) {
    length += 1
  }

  return length
}

function sharedSuffixLength(left, right) {
  const leftName = sanitizeBaseName(left)
  const rightName = sanitizeBaseName(right)
  let length = 0

  while (
    length < leftName.length &&
    length < rightName.length &&
    leftName[leftName.length - 1 - length] === rightName[rightName.length - 1 - length]
  ) {
    length += 1
  }

  return length
}

function areNamesTooSimilar(left, right) {
  const leftName = sanitizeBaseName(left)
  const rightName = sanitizeBaseName(right)

  if (!leftName || !rightName) {
    return false
  }

  if (leftName === rightName) {
    return true
  }

  if (leftName.includes(rightName) || rightName.includes(leftName)) {
    return true
  }

  if (sharedPrefixLength(leftName, rightName) >= 5) {
    return true
  }

  if (sharedSuffixLength(leftName, rightName) >= 4) {
    return true
  }

  return ngramSimilarity(leftName, rightName) >= 0.7
}

function normalizeLlmNames(rawNames) {
  return unique(
    sanitizeGeneratedBaseNames(rawNames)
      .map((name) => sanitizeBaseName(name))
      .filter((name) => isReasonableBaseName(name))
  )
}

function filterDiverseCandidates(candidates, existingNames) {
  const accepted = []
  const anchors = [...existingNames]

  for (const candidate of candidates) {
    if (anchors.some((name) => areNamesTooSimilar(name, candidate))) {
      continue
    }

    accepted.push(candidate)
    anchors.push(candidate)
  }

  return accepted
}

function buildIndustryGenerationMessages(seed, seenNames) {
  return buildGenerateMessages({
    targetCount: BATCH_SIZE,
    description: buildIndustryProjectDescription(seed),
    alreadySeen: seenNames,
  })
}

function logNameGenerationPrompt(seed, seenNames) {
  const messages = buildIndustryGenerationMessages(seed, seenNames)

  logProgress(`  First-round ${NAME_MODEL} prompt for ${seed.industry}:`)
  for (const message of messages) {
    logProgress(`    ${message.role.toUpperCase()}: ${message.content}`)
  }
}

async function generateCandidateBatch(seed, seenNames, batchNumber) {
  logProgress(
    `  Batch ${batchNumber}: requesting ${BATCH_SIZE} fresh names from ${NAME_MODEL} for ${seed.industry}`
  )

  const response = await getOpenAiClient().chat.completions.create({
    model: NAME_MODEL,
    temperature: 1,
    response_format: { type: 'json_object' },
    messages: buildIndustryGenerationMessages(seed, seenNames),
  })

  const content = response.choices[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(content)
  const normalized = normalizeLlmNames(Array.isArray(parsed?.names) ? parsed.names : [])
  logProgress(
    `  Batch ${batchNumber}: ${NAME_MODEL} returned ${normalized.length} normalized candidates`
  )
  logProgress(
    `  Batch ${batchNumber}: generated names -> ${normalized.join(', ')}`
  )
  return normalized
}

async function findAvailableExamplesForSeed(seed, seedIndex, totalSeeds, globallyReservedNames = []) {
  const limit = createLimiter(1)
  const availabilityCache = new Map()
  const progress = {
    completedComChecks: 0,
    keptExamples: 0,
    completedBatches: 0,
  }
  const availableExamples = []
  const seenNames = new Set(globallyReservedNames)
  const diversityAnchors = [...globallyReservedNames]

  const getAvailability = async (baseName, tld) => {
    const fullDomain = `${baseName}${tld}`

    if (!availabilityCache.has(fullDomain)) {
      availabilityCache.set(
        fullDomain,
        limit(async () => ({
          tld,
          fullDomain,
          status: await checkDomainAvailability(fullDomain),
        }))
      )
    }

    return availabilityCache.get(fullDomain)
  }

  logProgress(
    `Industry ${seedIndex + 1}/${totalSeeds}: ${seed.industry} (LLM batches of ${BATCH_SIZE}, target ${MIN_AVAILABLE_NAMES}-${MAX_AVAILABLE_NAMES} kept names)`
  )
  if (globallyReservedNames.length > 0) {
    logProgress(
      `  Carrying forward ${globallyReservedNames.length} names reserved by earlier industries`
    )
  }
  logNameGenerationPrompt(seed, [...seenNames])

  while (
    availableExamples.length < MIN_AVAILABLE_NAMES &&
    progress.completedBatches < MAX_BATCH_ATTEMPTS
  ) {
    progress.completedBatches += 1
    const rawBatch = await generateCandidateBatch(seed, [...seenNames], progress.completedBatches)

    for (const candidate of rawBatch) {
      seenNames.add(candidate)
    }

    const batch = filterDiverseCandidates(rawBatch, diversityAnchors)
    logProgress(
      `  Batch ${progress.completedBatches}: ${batch.length}/${rawBatch.length} candidates survived normalization and diversity filters`
    )

    for (const candidate of batch) {
      if (availableExamples.length >= MAX_AVAILABLE_NAMES) {
        break
      }

      const comDomain = await getAvailability(candidate, '.com')
      progress.completedComChecks += 1
      diversityAnchors.push(candidate)

      if (comDomain.status !== 'AVAILABLE') {
        if (
          progress.completedComChecks === 1 ||
          progress.completedComChecks % 10 === 0
        ) {
          logProgress(
            `    .com checks completed: ${progress.completedComChecks} | kept names: ${progress.keptExamples}`
          )
        }
        continue
      }

      const otherDomains = await Promise.all(
        VERIFIED_TLDS
          .filter((tld) => tld !== '.com')
          .map((tld) => getAvailability(candidate, tld))
      )

      availableExamples.push({
        groupKey: 'suggested',
        name: candidate,
        domains: [comDomain, ...otherDomains],
      })
      progress.keptExamples += 1
      logProgress(
        `    kept ${candidate} (${availableExamples.length}/${MAX_AVAILABLE_NAMES} for ${seed.industry})`
      )
    }

    logProgress(
      `  Completed batch ${progress.completedBatches}: kept ${availableExamples.length} verified names so far`
    )
  }

  assert(
    availableExamples.length >= MIN_AVAILABLE_NAMES,
    `Expected at least ${MIN_AVAILABLE_NAMES} available names for ${seed.slug}, received ${availableExamples.length} after ${progress.completedBatches} LLM batches`
  )

  logProgress(
    `Finished ${seed.industry}: kept ${availableExamples.length} verified names after ${progress.completedComChecks} .com checks`
  )

  return {
    ...seed,
    availableExamples,
  }
}

function assignRelatedIndustries(pages) {
  return pages.map((page) => {
    const sameCategory = pages
      .filter((candidate) => candidate.slug !== page.slug && candidate.category === page.category)
      .slice(0, 2)
      .map((candidate) => candidate.slug)

    const fallback = pages
      .filter((candidate) => candidate.slug !== page.slug && !sameCategory.includes(candidate.slug))
      .slice(0, 1)
      .map((candidate) => candidate.slug)

    return {
      ...page,
      relatedIndustries: [...sameCategory, ...fallback].slice(0, 3),
    }
  })
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function validatePages(pages) {
  const slugSet = new Set()
  const introSet = new Set()
  const exampleNameToSlug = new Map()

  for (const page of pages) {
    assert(page.slug, 'Every industry page must have a slug')
    assert(!slugSet.has(page.slug), `Duplicate industry slug: ${page.slug}`)
    slugSet.add(page.slug)

    assert(page.namingAngles.length === 3, `Expected exactly 3 naming angles for ${page.slug}`)
    assert(page.promptRecipes.length === 1, `Expected exactly 1 suggested project brief for ${page.slug}`)
    assert(page.exampleGroups.length >= 1, `Expected at least 1 example group for ${page.slug}`)
    assert(page.faqs.length >= 3, `Expected at least 3 FAQs for ${page.slug}`)
    assert(page.recommendedTlds.length >= 2, `Expected at least 2 TLDs for ${page.slug}`)
    assert(page.namePatternsToAvoid.length >= 3, `Expected at least 3 avoid patterns for ${page.slug}`)

    const introKey = page.intro.toLowerCase()
    assert(!introSet.has(introKey), `Duplicate intro detected for ${page.slug}`)
    introSet.add(introKey)

    const fullText = [
      page.title,
      page.description,
      page.h1,
      page.intro,
      page.audienceSummary,
      ...page.namePatternsToAvoid,
      ...page.namingAngles.flatMap((angle) => [angle.title, angle.description]),
      ...page.promptRecipes.flatMap((recipe) => [recipe.title, recipe.prompt, recipe.whyItWorks]),
      ...page.exampleGroups.flatMap((group) => [
        group.label,
        group.rationale,
        ...group.examples.flatMap((example) => [
          example.name,
          ...example.domains.map((domain) => `${domain.fullDomain} ${domain.status}`),
        ]),
      ]),
      ...page.faqs.flatMap((faq) => [faq.question, faq.answer]),
    ].join(' ')

    for (const phrase of bannedPhrases) {
      assert(!fullText.toLowerCase().includes(phrase), `Banned phrase "${phrase}" found in ${page.slug}`)
    }

    let pageExampleCount = 0

    for (const group of page.exampleGroups) {
      assert(group.examples.length >= 1, `Expected at least 1 example in each rendered group for ${page.slug}`)

      for (const example of group.examples) {
        pageExampleCount += 1
        const owner = exampleNameToSlug.get(example.name)
        assert(!owner, `Example name "${example.name}" is reused by ${owner} and ${page.slug}`)
        exampleNameToSlug.set(example.name, page.slug)
        assert(
          example.domains.length === VERIFIED_TLDS.length,
          `Expected ${VERIFIED_TLDS.length} availability checks for ${example.name}`
        )
      }
    }

    assert(
      pageExampleCount >= MIN_AVAILABLE_NAMES,
      `Expected at least ${MIN_AVAILABLE_NAMES} verified example names for ${page.slug}`
    )
  }

  for (let index = 0; index < pages.length; index += 1) {
    for (let offset = index + 1; offset < pages.length; offset += 1) {
      const left = pages[index]
      const right = pages[offset]
      assert(
        jaccard(left.intro, right.intro) < 0.72,
        `Intro overlap too high between ${left.slug} and ${right.slug}`
      )
      assert(
        jaccard(left.audienceSummary, right.audienceSummary) < 0.72,
        `Audience summary overlap too high between ${left.slug} and ${right.slug}`
      )
    }
  }
}

async function main() {
  logProgress('Phase 1/5: loading local environment')
  await loadLocalEnv()
  logProgress('Phase 1/5 complete')

  logProgress('Phase 2/5: loading industry seeds')
  const rawSeeds = await readFile(seedsPath, 'utf8')
  const seeds = JSON.parse(rawSeeds)
  logProgress(`Phase 2/5 complete: loaded ${seeds.length} industry seeds`)

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials are required to verify .com, .io, and .ai availability for industry pages')
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(`OPENAI_API_KEY is required to generate industry page name ideas with ${NAME_MODEL}`)
  }

  logProgress('Phase 3/5: enriching industry seeds with verified available names')
  const enrichedSeeds = []
  const reservedNames = new Set()
  for (const [seedIndex, seed] of seeds.entries()) {
    let enrichedSeed
    const conflictingNames = getReservedNameConflicts(seed, reservedNames)

    if (hasSufficientAvailableExamples(seed) && conflictingNames.length === 0) {
      logProgress(
        `Industry ${seedIndex + 1}/${seeds.length}: ${seed.industry} already has ${seed.availableExamples.length} verified names in ${path.relative(repoRoot, seedsPath)}; skipping regeneration`
      )
      enrichedSeed = seed
    } else {
      if (hasSufficientAvailableExamples(seed) && conflictingNames.length > 0) {
        logProgress(
          `Industry ${seedIndex + 1}/${seeds.length}: ${seed.industry} has conflicting saved names (${conflictingNames.join(', ')}); regenerating`
        )
      }
      enrichedSeed = await findAvailableExamplesForSeed(
        seed,
        seedIndex,
        seeds.length,
        [...reservedNames]
      )
    }

    enrichedSeeds.push(enrichedSeed)
    for (const example of enrichedSeed.availableExamples ?? []) {
      reservedNames.add(example.name)
    }
    const updatedSeeds = [
      ...enrichedSeeds,
      ...seeds.slice(seedIndex + 1),
    ]
    await writeSeeds(updatedSeeds)
    logProgress(`Saved seed progress after ${enrichedSeed.industry} -> ${path.relative(repoRoot, seedsPath)}`)
  }
  logProgress('Phase 3/5 complete')

  logProgress('Phase 4/5: building page structures from enriched seeds')
  const pages = assignRelatedIndustries(enrichedSeeds.map(buildPage))
  logProgress(`Phase 4/5 complete: built ${pages.length} page structures`)

  logProgress('Phase 5/5: validating and writing generated output')
  validatePages(pages)

  const fileContents = `export const INDUSTRY_PAGES = ${JSON.stringify(pages, null, 2)}
`

  await mkdir(outputDir, { recursive: true })
  await writeFile(outputPath, fileContents)

  logProgress(`Phase 5/5 complete: generated ${pages.length} industry pages -> ${path.relative(repoRoot, outputPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
