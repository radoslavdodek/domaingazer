'use client'

import { canUseOptionalServices } from '@/lib/privacy/client-consent'

export type AnalyticsEventParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function trackAnalyticsEvent(eventName: string, params: AnalyticsEventParams) {
  if (typeof window === 'undefined' || !canUseOptionalServices()) {
    return
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
    return
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    })
  }
}
