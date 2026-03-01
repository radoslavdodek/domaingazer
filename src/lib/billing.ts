import { createHmac } from 'node:crypto'
import type { User } from '@supabase/supabase-js'
import type { BillingInterval, BillingStatusResponse } from '@/lib/billing-types'
import type { StripeSubscription } from '@/lib/stripe'
import { createStripeCustomer, getStripeCustomer } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

type BillableFeature = 'search' | 'explain'
type AuthenticatedBillingUser = Pick<User, 'id' | 'email' | 'identities'>

type BillingCustomerRow = {
  stripe_customer_id: string
}

type FreeCreditEntitlementRow = {
  email_hash: string
  google_subject_hash: string | null
  lifetime_credits_used: number
  first_seen_at: string
  last_seen_at: string
  deleted_account_count: number
}

type FreeCreditIdentity = {
  emailHash: string
  googleSubjectHash: string | null
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

function getFreeCreditIdentitySalt() {
  return getRequiredEnv('FREE_CREDIT_IDENTITY_SALT')
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

function hashFreeCreditIdentity(rawValue: string) {
  return createHmac('sha256', getFreeCreditIdentitySalt())
    .update(rawValue)
    .digest('hex')
}

function getNormalizedBillingEmail(user: AuthenticatedBillingUser) {
  const email = user.email?.trim().toLowerCase()

  if (!email) {
    throw new Error('Authenticated user is missing an email address required for billing.')
  }

  return email
}

function getGoogleIdentitySubject(user: AuthenticatedBillingUser) {
  const googleIdentity = user.identities?.find((identity) => identity.provider === 'google')
  const identityData = googleIdentity?.identity_data as { sub?: unknown } | undefined

  if (typeof identityData?.sub === 'string' && identityData.sub.trim()) {
    return identityData.sub.trim()
  }

  if (typeof googleIdentity?.identity_id === 'string' && googleIdentity.identity_id.trim()) {
    return googleIdentity.identity_id.trim()
  }

  if (typeof googleIdentity?.id === 'string' && googleIdentity.id.trim()) {
    return googleIdentity.id.trim()
  }

  return null
}

export function getFreeCreditIdentity(user: AuthenticatedBillingUser): FreeCreditIdentity {
  const normalizedEmail = getNormalizedBillingEmail(user)
  const googleSubject = getGoogleIdentitySubject(user)

  return {
    emailHash: hashFreeCreditIdentity(`email:${normalizedEmail}`),
    googleSubjectHash: googleSubject ? hashFreeCreditIdentity(`google:${googleSubject}`) : null,
  }
}

async function ensureFreeCreditEntitlement(user: AuthenticatedBillingUser) {
  const identity = getFreeCreditIdentity(user)
  const supabase: any = createAdminClient()
  const { error: ensureError } = await supabase.rpc('ensure_free_credit_entitlement', {
    p_email_hash: identity.emailHash,
    p_google_subject_hash: identity.googleSubjectHash,
  })

  if (ensureError) {
    throw new Error(ensureError.message)
  }

  const { data, error } = await supabase
    .from('free_credit_entitlements')
    .select('email_hash, google_subject_hash, lifetime_credits_used, first_seen_at, last_seen_at, deleted_account_count')
    .eq('email_hash', identity.emailHash)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  let entitlement = data as FreeCreditEntitlementRow

  if (entitlement.first_seen_at !== entitlement.last_seen_at) {
    return entitlement
  }

  const { data: creditUsageData, error: creditUsageError } = await supabase
    .from('credit_usage')
    .select('credits_used')
    .eq('user_id', user.id)

  if (creditUsageError) {
    throw new Error(creditUsageError.message)
  }

  const legacyCreditsUsed = (creditUsageData ?? []).reduce(
    (sum: number, row: { credits_used?: number | null }) => sum + (row.credits_used ?? 0),
    0
  )

  if (legacyCreditsUsed > entitlement.lifetime_credits_used) {
    const { error: syncError } = await supabase.rpc('sync_free_credit_entitlement_floor', {
      p_email_hash: identity.emailHash,
      p_google_subject_hash: identity.googleSubjectHash,
      p_min_credits: legacyCreditsUsed,
    })

    if (syncError) {
      throw new Error(syncError.message)
    }

    entitlement = {
      ...entitlement,
      lifetime_credits_used: legacyCreditsUsed,
    }
  }

  return entitlement
}

async function consumeFreeCredits(user: AuthenticatedBillingUser, credits: number) {
  const identity = getFreeCreditIdentity(user)
  const supabase: any = createAdminClient()
  const { error } = await supabase.rpc('consume_free_credits', {
    p_email_hash: identity.emailHash,
    p_google_subject_hash: identity.googleSubjectHash,
    p_credits: credits,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function markFreeCreditEntitlementDeleted(user: AuthenticatedBillingUser) {
  const identity = getFreeCreditIdentity(user)
  const supabase: any = createAdminClient()
  const { error } = await supabase.rpc('mark_free_credit_entitlement_deleted', {
    p_email_hash: identity.emailHash,
    p_google_subject_hash: identity.googleSubjectHash,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function getUserBillingState(user: AuthenticatedBillingUser): Promise<BillingStatusResponse> {
  const supabase: any = createAdminClient()

  const [
    { data: subscriptionData, error: subscriptionError },
    entitlement,
  ] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('status, plan_interval, cancel_at_period_end, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle(),
    ensureFreeCreditEntitlement(user),
  ])

  if (subscriptionError) {
    throw new Error(subscriptionError.message)
  }

  const freeCreditsTotal = getFreeCreditsTotal()
  const freeCreditsUsed = entitlement.lifetime_credits_used ?? 0
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

export async function requireEntitlement(user: AuthenticatedBillingUser, feature: BillableFeature) {
  const billing = await getUserBillingState(user)
  const requiredCredits = getFeatureCreditCost(feature)

  if (!billing.isSubscribed && requiredCredits > billing.freeCreditsRemaining) {
    throw new SubscriptionRequiredError(billing)
  }

  return billing
}

export async function recordCreditUsage(
  user: AuthenticatedBillingUser,
  feature: BillableFeature,
  billingState?: BillingStatusResponse
) {
  const billing = billingState ?? await getUserBillingState(user)
  if (billing.isSubscribed) return

  const creditsUsed = getFeatureCreditCost(feature)
  if (creditsUsed <= 0) return

  await consumeFreeCredits(user, creditsUsed)

  const supabase = createAdminClient()
  const supabaseAdmin: any = supabase
  const { error } = await supabaseAdmin.from('credit_usage').insert({
    user_id: user.id,
    feature,
    credits_used: creditsUsed,
  })

  if (error) {
    throw new Error(error.message)
  }
}
