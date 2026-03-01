import type { BillingInterval } from '@/lib/billing-types'

type BillingRedirectPayload = {
  url?: unknown
  error?: unknown
}

async function getRedirectUrl(path: string, body?: object) {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => null) as BillingRedirectPayload | null

  if (!response.ok) {
    const message = typeof payload?.error === 'string' ? payload.error : 'Billing request failed'
    throw new Error(message)
  }

  if (typeof payload?.url !== 'string' || !payload.url) {
    throw new Error('Billing redirect URL is missing')
  }

  return payload.url
}

export async function startCheckout(interval: BillingInterval) {
  const url = await getRedirectUrl('/api/billing/checkout', { interval })
  window.location.assign(url)
}

export async function openBillingPortal() {
  const url = await getRedirectUrl('/api/billing/portal')
  window.location.assign(url)
}
