'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BillingStatusResponse } from '@/lib/billing-types'

type BillingErrorPayload = { error?: unknown }

export function useBillingStatus(enabled = true) {
  const [billing, setBilling] = useState<BillingStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async (showLoading: boolean) => {
    if (!enabled) {
      setBilling(null)
      setError(null)
      setIsLoading(false)
      return null
    }

    if (showLoading) setIsLoading(true)

    try {
      const response = await fetch('/api/billing/status', {
        cache: 'no-store',
      })
      const payload = await response.json().catch(() => null) as BillingStatusResponse | BillingErrorPayload | null

      if (!response.ok) {
        const errorPayload = payload as BillingErrorPayload | null
        const message = typeof errorPayload?.error === 'string' ? errorPayload.error : 'Failed to load billing status'
        throw new Error(message)
      }

      setBilling(payload as BillingStatusResponse)
      setError(null)
      return payload as BillingStatusResponse
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing status')
      return null
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void fetchStatus(true)
  }, [fetchStatus])

  return {
    billing,
    isLoading,
    error,
    refresh: () => fetchStatus(false),
  }
}
