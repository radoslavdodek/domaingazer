'use client'

import { useEffect, useState } from 'react'
import { FEATURED_TLDS, type TLD } from '@/lib/types'
import type { SupportedTldCatalog } from '@/lib/tlds'

const fallbackCatalog: SupportedTldCatalog = {
  featuredTlds: [...FEATURED_TLDS],
  supportedTlds: [...FEATURED_TLDS],
  fetchedAt: new Date(0).toISOString(),
}

let cachedCatalog: SupportedTldCatalog | null = null
let inFlightCatalogPromise: Promise<SupportedTldCatalog> | null = null

async function loadSupportedTldCatalog(): Promise<SupportedTldCatalog> {
  if (cachedCatalog) return cachedCatalog
  if (inFlightCatalogPromise) return inFlightCatalogPromise

  inFlightCatalogPromise = fetch('/api/tlds', { cache: 'no-store' })
    .then(async (response) => {
      const payload = await response.json().catch(() => null) as SupportedTldCatalog | { error?: unknown } | null
      if (!response.ok || !payload || !Array.isArray((payload as SupportedTldCatalog).supportedTlds)) {
        const message = typeof (payload as { error?: unknown } | null)?.error === 'string'
          ? (payload as { error: string }).error
          : 'Failed to load supported TLDs'
        throw new Error(message)
      }

      cachedCatalog = payload as SupportedTldCatalog
      return cachedCatalog
    })
    .finally(() => {
      inFlightCatalogPromise = null
    })

  return inFlightCatalogPromise
}

export function useSupportedTlds() {
  const [catalog, setCatalog] = useState<SupportedTldCatalog>(cachedCatalog ?? fallbackCatalog)
  const [isLoading, setIsLoading] = useState(!cachedCatalog)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    void loadSupportedTldCatalog()
      .then((nextCatalog) => {
        if (!isMounted) return
        setCatalog(nextCatalog)
        setError(null)
      })
      .catch((err) => {
        if (!isMounted) return
        setCatalog(fallbackCatalog)
        setError(err instanceof Error ? err.message : 'Failed to load supported TLDs')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return {
    catalog,
    supportedTlds: catalog.supportedTlds,
    featuredTlds: catalog.featuredTlds,
    fetchedAt: catalog.fetchedAt,
    isLoading,
    error,
  }
}

export function getFallbackSupportedTlds(): TLD[] {
  return [...FEATURED_TLDS]
}
