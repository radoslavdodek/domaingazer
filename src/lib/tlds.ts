import { DEFAULT_SEARCH_TLDS, FEATURED_TLDS, type TLD } from './types'

export interface SupportedTldCatalog {
  featuredTlds: TLD[]
  supportedTlds: TLD[]
  fetchedAt: string
}

const TLD_PATTERN = /^\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*$/

export function normalizeTld(value: string): TLD | null {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return null
  const withDot = trimmed.startsWith('.') ? trimmed : `.${trimmed}`
  if (!TLD_PATTERN.test(withDot)) return null
  return withDot
}

export function parseTldList(values: unknown): { tlds: TLD[]; invalid: string[] } {
  if (!Array.isArray(values)) return { tlds: [], invalid: [] }

  const tlds: TLD[] = []
  const invalid: string[] = []
  const seen = new Set<string>()

  for (const value of values) {
    if (typeof value !== 'string') {
      invalid.push(String(value))
      continue
    }

    const normalized = normalizeTld(value)
    if (!normalized) {
      invalid.push(value)
      continue
    }

    if (seen.has(normalized)) continue
    seen.add(normalized)
    tlds.push(normalized)
  }

  return { tlds, invalid }
}

export function normalizeTldList(values: readonly unknown[] | Iterable<unknown>): TLD[] {
  const normalized: TLD[] = []
  const seen = new Set<string>()
  const iterableValues = Array.isArray(values) ? values : Array.from(values)

  for (const value of iterableValues) {
    if (typeof value !== 'string') continue
    const tld = normalizeTld(value)
    if (!tld || seen.has(tld)) continue
    seen.add(tld)
    normalized.push(tld)
  }

  return normalized
}

export function getDefaultSearchTlds(): TLD[] {
  return [...DEFAULT_SEARCH_TLDS]
}

export function getFeaturedTlds(): TLD[] {
  return [...FEATURED_TLDS]
}

export function createTldComparator(activeTlds: readonly TLD[] = []) {
  const normalizedActive = normalizeTldList(activeTlds)
  const activeOrder = new Map(normalizedActive.map((tld, index) => [tld, index]))
  const featuredOrder = new Map<string, number>(getFeaturedTlds().map((tld, index) => [tld, index]))

  return (a: TLD, b: TLD) => {
    const activeA = activeOrder.get(a)
    const activeB = activeOrder.get(b)
    if (activeA !== undefined || activeB !== undefined) {
      if (activeA === undefined) return 1
      if (activeB === undefined) return -1
      if (activeA !== activeB) return activeA - activeB
    }

    const featuredA = featuredOrder.get(a)
    const featuredB = featuredOrder.get(b)
    if (featuredA !== undefined || featuredB !== undefined) {
      if (featuredA === undefined) return 1
      if (featuredB === undefined) return -1
      if (featuredA !== featuredB) return featuredA - featuredB
    }

    return a.localeCompare(b)
  }
}

export function sortTldsByPriority(tlds: readonly TLD[], activeTlds: readonly TLD[] = []): TLD[] {
  return [...tlds].sort(createTldComparator(activeTlds))
}

function getQueryRank(tld: TLD, query: string) {
  if (tld === query) return 0
  if (tld.slice(1) === query) return 1
  if (tld.startsWith(query)) return 2
  if (tld.slice(1).startsWith(query.replace(/^\./, ''))) return 3
  return 4
}

export function searchTlds(
  supportedTlds: readonly TLD[],
  query: string,
  excludedTlds: readonly TLD[] = [],
  limit = 12,
): TLD[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return []

  const normalizedQuery = trimmed.startsWith('.') ? trimmed : `.${trimmed}`
  const plainQuery = normalizedQuery.slice(1)
  const excluded = new Set(normalizeTldList(excludedTlds))

  return supportedTlds
    .filter((tld) => !excluded.has(tld))
    .filter((tld) => tld.includes(normalizedQuery) || tld.slice(1).includes(plainQuery))
    .sort((a, b) => {
      const rankDiff = getQueryRank(a, normalizedQuery) - getQueryRank(b, normalizedQuery)
      if (rankDiff !== 0) return rankDiff
      return a.localeCompare(b)
    })
    .slice(0, limit)
}

export function getUnsupportedTlds(tlds: readonly TLD[], supportedTlds: ReadonlySet<TLD>): TLD[] {
  return tlds.filter((tld) => !supportedTlds.has(tld))
}
