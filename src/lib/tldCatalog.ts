import { ListPricesCommand } from '@aws-sdk/client-route-53-domains'
import { getRoute53Client } from './route53'
import { getRoute53SupportedTldsSnapshot } from './route53SupportedTlds'
import { getFeaturedTlds, normalizeTld, sortTldsByPriority, type SupportedTldCatalog } from './tlds'
import type { TLD } from './types'

const CATALOG_TTL_MS = 12 * 60 * 60 * 1000
const PAGE_SIZE = 100

interface CachedCatalog {
  supportedTlds: TLD[]
  fetchedAt: string
  expiresAt: number
}

let cachedCatalog: CachedCatalog | null = null
let inFlightCatalogPromise: Promise<SupportedTldCatalog> | null = null

function buildCatalog(supportedTlds: TLD[], fetchedAt: string): SupportedTldCatalog {
  return {
    featuredTlds: getFeaturedTlds(),
    supportedTlds,
    fetchedAt,
  }
}

function getFallbackCatalog(): SupportedTldCatalog {
  return buildCatalog(getRoute53SupportedTldsSnapshot(), new Date().toISOString())
}

export async function listSupportedTlds(): Promise<TLD[]> {
  const collected = new Set<TLD>()
  let marker: string | undefined

  do {
    const response = await getRoute53Client().send(new ListPricesCommand({
      Marker: marker,
      MaxItems: PAGE_SIZE,
    }))

    for (const price of response.Prices ?? []) {
      const normalized = price.Name ? normalizeTld(price.Name) : null
      if (normalized) collected.add(normalized)
    }

    marker = response.NextPageMarker
  } while (marker)

  return sortTldsByPriority(Array.from(collected))
}

export async function getSupportedTldCatalog(): Promise<SupportedTldCatalog> {
  const now = Date.now()

  if (cachedCatalog && cachedCatalog.expiresAt > now) {
    return buildCatalog(cachedCatalog.supportedTlds, cachedCatalog.fetchedAt)
  }

  if (inFlightCatalogPromise) return inFlightCatalogPromise

  inFlightCatalogPromise = (async () => {
    try {
      const supportedTlds = await listSupportedTlds()
      const fetchedAt = new Date().toISOString()
      cachedCatalog = {
        supportedTlds,
        fetchedAt,
        expiresAt: now + CATALOG_TTL_MS,
      }
      return buildCatalog(supportedTlds, fetchedAt)
    } catch (error) {
      console.error('[route53.tld_catalog.error]', error)
      if (cachedCatalog) {
        return buildCatalog(cachedCatalog.supportedTlds, cachedCatalog.fetchedAt)
      }
      return getFallbackCatalog()
    } finally {
      inFlightCatalogPromise = null
    }
  })()

  return inFlightCatalogPromise
}
