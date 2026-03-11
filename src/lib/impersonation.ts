import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

export { IMPERSONATE_UID_COOKIE, IMPERSONATE_INFO_COOKIE } from '@/lib/impersonation-constants'
import { IMPERSONATE_UID_COOKIE } from '@/lib/impersonation-constants'

type EffectiveUserResult = {
  user: {
    id: string
    email?: string
    app_metadata?: Record<string, unknown>
    user_metadata?: Record<string, unknown>
  } | null
  isImpersonating: boolean
  /** Supabase client to use for data queries. When impersonating, this is
   *  the service-role admin client (bypasses RLS). Otherwise, the original
   *  client passed in. */
  supabaseClient: SupabaseClient
}

/**
 * Returns the effective user for the current request.
 * If the real user is an admin AND the impersonation cookie is set,
 * returns the impersonated user's profile AND the admin Supabase client
 * so that subsequent queries bypass RLS and can access the target user's data.
 */
export async function getEffectiveUser(supabase: SupabaseClient): Promise<EffectiveUserResult> {
  const { data: { user: realUser } } = await supabase.auth.getUser()

  if (!realUser) {
    return { user: null, isImpersonating: false, supabaseClient: supabase }
  }

  // Only admins can impersonate
  if (realUser.app_metadata?.is_admin !== true) {
    return { user: realUser, isImpersonating: false, supabaseClient: supabase }
  }

  const cookieStore = cookies()
  const targetUid = cookieStore.get(IMPERSONATE_UID_COOKIE)?.value

  if (!targetUid) {
    return { user: realUser, isImpersonating: false, supabaseClient: supabase }
  }

  try {
    const admin = createAdminClient()
    const { data: { user: targetUser }, error } = await admin.auth.admin.getUserById(targetUid)

    if (error || !targetUser) {
      console.warn('[impersonation] target user not found, ignoring cookie', { targetUid })
      return { user: realUser, isImpersonating: false, supabaseClient: supabase }
    }

    return { user: targetUser, isImpersonating: true, supabaseClient: admin }
  } catch (err) {
    console.error('[impersonation] failed to fetch target user', err)
    return { user: realUser, isImpersonating: false, supabaseClient: supabase }
  }
}
