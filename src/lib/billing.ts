import type { BillingInterval, BillingStatusResponse } from '@/lib/billing-types'
import type { StripeSubscription } from '@/lib/stripe'
import { createStripeCustomer, getStripeCustomer } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

type BillableFeature = 'search' | 'explain'

type BillingCustomerRow = {
  stripe_customer_id: string
}

type SubscriptionRow = {
  status: string
  plan_interval: string | null
  cancel_at_period_end: boolean | null
  current_period_end: string | null
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due'])

function getRequiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function getNonNegativeIntegerEnv(name: string) {
  const rawValue = getRequiredEnv(name)
  const parsed = Number.parseInt(rawValue, 10)

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer`)
  }

  return parsed
}

function normalizePlanInterval(value: string | null): BillingInterval | null {
  return value === 'month' || value === 'year' ? value : null
}

function getSubscriptionDetails(subscription: StripeSubscription) {
  const firstPrice = subscription.items?.data?.[0]?.price ?? null
  const planInterval = normalizePlanInterval(firstPrice?.recurring?.interval ?? null)

  return {
    stripePriceId: firstPrice?.id ?? null,
    planInterval,
  }
}

export class SubscriptionRequiredError extends Error {
  readonly code = 'subscription_required'
  readonly status = 402
  readonly billing: BillingStatusResponse

  constructor(billing: BillingStatusResponse) {
    super('Free credits exhausted. A subscription is required to continue.')
    this.billing = billing
  }
}

export function getFreeCreditsTotal() {
  return getNonNegativeIntegerEnv('FREE_CREDITS_TOTAL')
}

export function getFeatureCreditCost(feature: BillableFeature) {
  if (feature === 'search') return getNonNegativeIntegerEnv('FREE_CREDITS_COST_SEARCH')
  return getNonNegativeIntegerEnv('FREE_CREDITS_COST_EXPLAIN')
}

export function hasActiveSubscription(status: string | null | undefined) {
  return Boolean(status && ACTIVE_SUBSCRIPTION_STATUSES.has(status))
}

function getUsagePercent(freeCreditsUsed: number, freeCreditsTotal: number) {
  if (freeCreditsTotal <= 0) return 100
  return Math.min(100, Math.max(0, Math.round((freeCreditsUsed / freeCreditsTotal) * 100)))
}

export async function getUserBillingState(userId: string): Promise<BillingStatusResponse> {
  const supabase: any = createAdminClient()

  const [{ data: subscriptionData, error: subscriptionError }, { data: creditUsageData, error: creditUsageError }] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('status, plan_interval, cancel_at_period_end, current_period_end')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('credit_usage')
      .select('credits_used')
      .eq('user_id', userId),
  ])

  if (subscriptionError) {
    throw new Error(subscriptionError.message)
  }

  if (creditUsageError) {
    throw new Error(creditUsageError.message)
  }

  const freeCreditsTotal = getFreeCreditsTotal()
  const freeCreditsUsed = (creditUsageData ?? []).reduce(
    (sum: number, row: { credits_used?: number | null }) => sum + (row.credits_used ?? 0),
    0
  )
  const freeCreditsRemaining = Math.max(freeCreditsTotal - freeCreditsUsed, 0)
  const subscriptionStatus = subscriptionData?.status ?? null

  return {
    isSubscribed: hasActiveSubscription(subscriptionStatus),
    subscriptionStatus,
    planInterval: normalizePlanInterval(subscriptionData?.plan_interval ?? null),
    cancelAtPeriodEnd: Boolean(subscriptionData?.cancel_at_period_end),
    currentPeriodEnd: subscriptionData?.current_period_end ?? null,
    freeCreditsTotal,
    freeCreditsUsed,
    freeCreditsRemaining,
    usagePercent: getUsagePercent(freeCreditsUsed, freeCreditsTotal),
  }
}

export async function getStoredStripeCustomerId(userId: string) {
  const supabase: any = createAdminClient()
  const { data, error } = await supabase
    .from('billing_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data as BillingCustomerRow | null)?.stripe_customer_id ?? null
}

export async function findUserIdByStripeCustomerId(stripeCustomerId: string) {
  const supabase: any = createAdminClient()
  const { data, error } = await supabase
    .from('billing_customers')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data as { user_id: string } | null)?.user_id ?? null
}

export async function upsertBillingCustomer(userId: string, stripeCustomerId: string) {
  const supabase: any = createAdminClient()
  const { error } = await supabase.from('billing_customers').upsert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
  }, {
    onConflict: 'user_id',
  })

  if (error) {
    throw new Error(error.message)
  }
}

function isMissingStripeCustomerError(error: unknown) {
  return error instanceof Error && error.message.includes('No such customer')
}

export async function getOrCreateStripeCustomerId(userId: string, email?: string | null) {
  const storedStripeCustomerId = await getStoredStripeCustomerId(userId)

  if (storedStripeCustomerId) {
    try {
      const customer = await getStripeCustomer(storedStripeCustomerId)

      if (!('deleted' in customer && customer.deleted)) {
        return storedStripeCustomerId
      }
    } catch (error) {
      if (!isMissingStripeCustomerError(error)) {
        throw error
      }
    }
  }

  const customer = await createStripeCustomer({
    email,
    userId,
  })

  await upsertBillingCustomer(userId, customer.id)

  return customer.id
}

export async function upsertSubscriptionFromStripe(userId: string, subscription: StripeSubscription) {
  const supabase: any = createAdminClient()
  const subscriptionDetails = getSubscriptionDetails(subscription)
  let stripePriceId = subscriptionDetails.stripePriceId
  let planInterval = subscriptionDetails.planInterval

  if (!stripePriceId || !planInterval) {
    const { data: existingData, error: existingError } = await supabase
      .from('subscriptions')
      .select('stripe_price_id, plan_interval')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingError) {
      throw new Error(existingError.message)
    }

    stripePriceId = stripePriceId ?? (existingData as { stripe_price_id?: string } | null)?.stripe_price_id ?? null
    planInterval = planInterval ?? normalizePlanInterval((existingData as { plan_interval?: string } | null)?.plan_interval ?? null)
  }

  if (!stripePriceId || !planInterval) {
    throw new Error('Stripe subscription is missing price details')
  }

  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null

  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: subscription.customer,
    stripe_subscription_id: subscription.id,
    stripe_price_id: stripePriceId,
    status: subscription.status,
    plan_interval: planInterval,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id',
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function requireEntitlement(userId: string, feature: BillableFeature) {
  const billing = await getUserBillingState(userId)
  const requiredCredits = getFeatureCreditCost(feature)

  if (!billing.isSubscribed && requiredCredits > billing.freeCreditsRemaining) {
    throw new SubscriptionRequiredError(billing)
  }

  return billing
}

export async function recordCreditUsage(
  userId: string,
  feature: BillableFeature,
  billingState?: BillingStatusResponse
) {
  const billing = billingState ?? await getUserBillingState(userId)
  if (billing.isSubscribed) return

  const creditsUsed = getFeatureCreditCost(feature)
  if (creditsUsed <= 0) return

  const supabase = createAdminClient()
  const supabaseAdmin: any = supabase
  const { error } = await supabaseAdmin.from('credit_usage').insert({
    user_id: userId,
    feature,
    credits_used: creditsUsed,
  })

  if (error) {
    throw new Error(error.message)
  }
}
