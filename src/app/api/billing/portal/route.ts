export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getStoredStripeCustomerId, upsertBillingCustomer } from '@/lib/billing'
import { createStripeBillingPortalSession, createStripeCustomer } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let stripeCustomerId = await getStoredStripeCustomerId(user.id)

    if (!stripeCustomerId) {
      const customer = await createStripeCustomer({
        email: user.email,
        userId: user.id,
      })
      stripeCustomerId = customer.id
      await upsertBillingCustomer(user.id, stripeCustomerId)
    }

    const origin = new URL(request.url).origin
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
