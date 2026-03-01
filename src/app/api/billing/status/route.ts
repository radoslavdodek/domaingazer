export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getUserBillingState } from '@/lib/billing'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const billing = await getUserBillingState(user.id)
    return NextResponse.json(billing)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load billing status'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
