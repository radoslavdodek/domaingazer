export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getOrCreateStripeCustomerId } from '@/lib/billing'
import { createStripeBillingPortalSession } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/impersonation'

export async function POST(request: Request) {
  const supabase = createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stripeCustomerId = await getOrCreateStripeCustomerId(user.id, user.email)

    const forwardedProto = request.headers.get('x-forwarded-proto') || 'http'
    const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host
    const origin = `${forwardedProto}://${forwardedHost}`
    const session = await createStripeBillingPortalSession({
      customerId: stripeCustomerId,
      origin,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create billing portal session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
