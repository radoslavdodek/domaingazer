export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { purgeExpiredModelUsage } from '@/lib/privacy/server'

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return jsonError('Unauthorized', 401)
  }

  await purgeExpiredModelUsage()

  try {
    const admin: any = createAdminClient()

    const [
      searchHistoryResult,
      creditUsageResult,
      billingCustomerResult,
      subscriptionResult,
      modelUsageResult,
    ] = await Promise.all([
      admin
        .from('search_history')
        .select('id, description, selected_tlds, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      admin
        .from('credit_usage')
        .select('id, feature, credits_used, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      admin
        .from('billing_customers')
        .select('stripe_customer_id, created_at')
        .eq('user_id', user.id)
        .maybeSingle(),
      admin
        .from('subscriptions')
        .select('stripe_customer_id, stripe_subscription_id, stripe_price_id, status, plan_interval, current_period_end, cancel_at_period_end, created_at, updated_at')
        .eq('user_id', user.id)
        .maybeSingle(),
      admin
        .from('model_usage')
        .select('id, provider, model, feature, prompt_tokens, completion_tokens, total_tokens, cost_usd, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    throwIfError(searchHistoryResult.error)
    throwIfError(creditUsageResult.error)
    throwIfError(billingCustomerResult.error)
    throwIfError(subscriptionResult.error)
    throwIfError(modelUsageResult.error)

    console.info('[privacy.export_requested]', { userId: user.id })

    const payload = {
      formatVersion: 1,
      generatedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        email: user.email ?? null,
        appMetadata: user.app_metadata ?? {},
        userMetadata: {
          full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
        },
      },
      searchHistory: searchHistoryResult.data ?? [],
      creditUsage: creditUsageResult.data ?? [],
      billing: {
        customer: billingCustomerResult.data ?? null,
        subscription: subscriptionResult.data ?? null,
      },
      modelUsage: modelUsageResult.data ?? [],
      consent: {
        scope: 'browser-managed',
      },
    }

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="domain-gazer-export.json"',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to export data'
    return jsonError(message, 500)
  }
}
