export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/impersonation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserBillingState, markFreeCreditEntitlementDeleted } from '@/lib/billing'

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { user, isImpersonating } = await getEffectiveUser(supabase)

  if (!user) {
    return jsonError('Unauthorized', 401)
  }

  if (isImpersonating) {
    return jsonError('Account deletion is not allowed while impersonating a user', 403)
  }

  let body: { confirm?: string }
  try {
    body = await request.json() as { confirm?: string }
  } catch {
    return jsonError('Invalid request body', 400)
  }

  if (body.confirm !== 'DELETE') {
    return jsonError('Confirmation text must be DELETE', 400)
  }

  try {
    const billing = await getUserBillingState(user)

    if (billing.isSubscribed) {
      console.info('[privacy.delete_blocked_active_subscription]', { userId: user.id })
      return jsonError('Cancel your active subscription before deleting your account.', 409)
    }

    console.info('[privacy.delete_requested]', { userId: user.id })

    await markFreeCreditEntitlementDeleted(user)

    const admin: any = createAdminClient()

    const [
      searchHistoryResult,
      modelUsageResult,
      creditUsageResult,
      subscriptionsResult,
      billingCustomersResult,
    ] = await Promise.all([
      admin.from('search_history').delete().eq('user_id', user.id),
      admin.from('model_usage').delete().eq('user_id', user.id),
      admin.from('credit_usage').delete().eq('user_id', user.id),
      admin.from('subscriptions').delete().eq('user_id', user.id),
      admin.from('billing_customers').delete().eq('user_id', user.id),
    ])

    throwIfError(searchHistoryResult.error)
    throwIfError(modelUsageResult.error)
    throwIfError(creditUsageResult.error)
    throwIfError(subscriptionsResult.error)
    throwIfError(billingCustomersResult.error)

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id)
    throwIfError(deleteUserError)

    console.info('[privacy.delete_completed]', { userId: user.id })

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete account'
    return jsonError(message, 500)
  }
}
