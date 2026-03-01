export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import {
  constructStripeEvent,
  type StripeCheckoutSession,
  type StripeEvent,
  type StripeSubscription,
} from '@/lib/stripe'
import {
  findUserIdByStripeCustomerId,
  upsertBillingCustomer,
  upsertSubscriptionFromStripe,
} from '@/lib/billing'

async function handleCheckoutCompleted(event: StripeEvent<StripeCheckoutSession>) {
  const session = event.data.object
  const userId = session.metadata?.userId ?? session.client_reference_id ?? null

  if (!userId || !session.customer) return

  await upsertBillingCustomer(userId, session.customer)
}

async function handleSubscriptionUpdated(event: StripeEvent<StripeSubscription>) {
  const subscription = event.data.object
  let userId = subscription.metadata?.userId ?? null

  if (!userId) {
    userId = await findUserIdByStripeCustomerId(subscription.customer)
  }

  if (!userId) return

  await upsertBillingCustomer(userId, subscription.customer)
  await upsertSubscriptionFromStripe(userId, subscription)
}

export async function POST(request: Request) {
  const payload = await request.text()

  try {
    const event = constructStripeEvent(payload, request.headers.get('stripe-signature'))

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event as StripeEvent<StripeCheckoutSession>)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdated(event as StripeEvent<StripeSubscription>)
        break
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe webhook handling failed'
    const status = message.toLowerCase().includes('signature') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
