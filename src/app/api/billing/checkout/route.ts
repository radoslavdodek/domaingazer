export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import type { BillingInterval } from '@/lib/billing-types'
import { getAppOrigin } from '@/lib/app-origin'
import {
  getOrCreateStripeCustomerId,
  getUserBillingState,
} from '@/lib/billing'
import { createStripeCheckoutSession } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/impersonation'

function isBillingInterval(value: unknown): value is BillingInterval {
  return value === 'month' || value === 'year'
}

function getCurrencyFromRequest(request: Request): 'eur' | 'usd' {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(/(?:^|;\s*)dg_region=([^;]*)/)
  const region = match?.[1]
  return region === 'non-eu' ? 'usd' : 'eur'
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null) as { interval?: unknown } | null
  const interval = body?.interval

  if (!isBillingInterval(interval)) {
    return NextResponse.json({ error: 'interval must be "month" or "year"' }, { status: 400 })
  }

  try {
    const billing = await getUserBillingState(user)
    if (billing.isSubscribed) {
      return NextResponse.json(
        { error: 'You already have an active subscription. Use the billing portal to manage it.' },
        { status: 409 }
      )
    }

    const stripeCustomerId = await getOrCreateStripeCustomerId(user.id, user.email)
    const currency = getCurrencyFromRequest(request)
    const session = await createStripeCheckoutSession({
      customerId: stripeCustomerId,
      interval,
      currency,
      userId: user.id,
      origin: getAppOrigin(),
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe checkout session did not return a URL' }, { status: 502 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
