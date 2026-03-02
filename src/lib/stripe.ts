import { createHmac, timingSafeEqual } from 'node:crypto'
import type { BillingInterval } from '@/lib/billing-types'

type StripeRequestValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | StripeRequestValue[]
  | { [key: string]: StripeRequestValue }

type StripeApiError = {
  error?: {
    message?: unknown
  }
}

export type StripeCustomer = {
  id: string
  email?: string | null
}

export type StripeDeletedCustomer = {
  id: string
  deleted: true
}

export type StripeCheckoutSession = {
  id: string
  url: string | null
  customer: string | null
  subscription?: string | null
  client_reference_id?: string | null
  metadata?: Record<string, string> | null
}

export type StripeBillingPortalSession = {
  id: string
  url: string
}

export type StripeSubscription = {
  id: string
  customer: string
  status: string
  cancel_at_period_end: boolean
  current_period_end: number | null
  metadata?: Record<string, string> | null
  items?: {
    data?: Array<{
      price?: {
        id: string
        recurring?: {
          interval?: string | null
        } | null
      } | null
    }>
  } | null
}

export type StripeEvent<T = Record<string, unknown>> = {
  id: string
  type: string
  data: {
    object: T
  }
}

export type StripePrice = {
  id: string
  unit_amount: number | null
  currency: string
  recurring?: {
    interval?: string | null
    interval_count?: number | null
  } | null
}

function getRequiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function appendFormValue(searchParams: URLSearchParams, key: string, value: StripeRequestValue): void {
  if (value === null || value === undefined) return

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendFormValue(searchParams, `${key}[${index}]`, item)
    })
    return
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
      appendFormValue(searchParams, `${key}[${nestedKey}]`, nestedValue)
    })
    return
  }

  searchParams.append(key, String(value))
}

async function stripeRequest<T>(
  path: string,
  options?: {
    method?: 'GET' | 'POST'
    body?: Record<string, StripeRequestValue>
  }
): Promise<T> {
  const secretKey = getRequiredEnv('STRIPE_SECRET_KEY')
  const normalizedPath = path.replace(/^\/+/, '')
  const url = new URL(`/v1/${normalizedPath}`, 'https://api.stripe.com')
  const formBody = new URLSearchParams()
  const method = options?.method ?? 'POST'

  if (options?.body) {
    Object.entries(options.body).forEach(([key, value]) => {
      appendFormValue(formBody, key, value)
    })
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: method === 'POST' ? formBody : undefined,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as StripeApiError | null
    const message = typeof payload?.error?.message === 'string'
      ? payload.error.message
      : `Stripe request failed with status ${response.status}`
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export function getStripePriceId(interval: BillingInterval, currency: 'eur' | 'usd') {
  const suffix = currency === 'eur' ? 'EUR' : 'USD'
  return interval === 'month'
    ? getRequiredEnv(`STRIPE_PRICE_MONTHLY_${suffix}_ID`)
    : getRequiredEnv(`STRIPE_PRICE_YEARLY_${suffix}_ID`)
}

export async function getStripePrice(priceId: string) {
  return stripeRequest<StripePrice>(`/prices/${priceId}`, {
    method: 'GET',
  })
}

export async function createStripeCustomer(params: { email?: string | null; userId: string }) {
  return stripeRequest<StripeCustomer>('/customers', {
    body: {
      email: params.email ?? undefined,
      metadata: {
        userId: params.userId,
      },
    },
  })
}

export async function getStripeCustomer(customerId: string) {
  return stripeRequest<StripeCustomer | StripeDeletedCustomer>(`/customers/${customerId}`, {
    method: 'GET',
  })
}

export async function createStripeCheckoutSession(params: {
  customerId: string
  interval: BillingInterval
  currency: 'eur' | 'usd'
  userId: string
  origin: string
}) {
  return stripeRequest<StripeCheckoutSession>('/checkout/sessions', {
    body: {
      mode: 'subscription',
      customer: params.customerId,
      client_reference_id: params.userId,
      allow_promotion_codes: true,
      success_url: `${params.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${params.origin}/billing/cancel`,
      line_items: [
        {
          price: getStripePriceId(params.interval, params.currency),
          quantity: 1,
        },
      ],
      metadata: {
        userId: params.userId,
      },
      subscription_data: {
        metadata: {
          userId: params.userId,
        },
      },
    },
  })
}

export async function createStripeBillingPortalSession(params: {
  customerId: string
  origin: string
}) {
  return stripeRequest<StripeBillingPortalSession>('/billing_portal/sessions', {
    body: {
      customer: params.customerId,
      return_url: `${params.origin}/`,
    },
  })
}

export function constructStripeEvent<T = Record<string, unknown>>(
  payload: string,
  signatureHeader: string | null
) {
  const webhookSecret = getRequiredEnv('STRIPE_WEBHOOK_SECRET')

  if (!signatureHeader) {
    throw new Error('Missing Stripe-Signature header')
  }

  let timestamp: string | null = null
  const signatures: string[] = []

  signatureHeader.split(',').forEach((part) => {
    const [key, value] = part.split('=')
    if (key === 't' && value) timestamp = value
    if (key === 'v1' && value) signatures.push(value)
  })

  if (!timestamp || signatures.length === 0) {
    throw new Error('Invalid Stripe-Signature header')
  }

  const timestampNumber = Number.parseInt(timestamp, 10)
  if (!Number.isFinite(timestampNumber)) {
    throw new Error('Invalid Stripe-Signature timestamp')
  }

  const ageInSeconds = Math.abs(Math.floor(Date.now() / 1000) - timestampNumber)
  if (ageInSeconds > 300) {
    throw new Error('Stripe webhook signature has expired')
  }

  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(`${timestamp}.${payload}`)
    .digest('hex')
  const expectedBuffer = Buffer.from(expectedSignature, 'hex')

  const isValid = signatures.some((signature) => {
    try {
      const signatureBuffer = Buffer.from(signature, 'hex')
      return signatureBuffer.length === expectedBuffer.length
        && timingSafeEqual(signatureBuffer, expectedBuffer)
    } catch {
      return false
    }
  })

  if (!isValid) {
    throw new Error('Stripe webhook signature verification failed')
  }

  return JSON.parse(payload) as StripeEvent<T>
}
