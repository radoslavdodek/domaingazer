export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getUserBillingState } from '@/lib/billing'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/impersonation'

export async function GET() {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const billing = await getUserBillingState(user)
    return NextResponse.json(billing)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load billing status'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
