export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.is_admin !== true) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim() || ''

  const admin = createAdminClient()

  try {
    // Supabase admin.listUsers supports pagination but not email filtering,
    // so we fetch all and filter client-side
    const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 1000 })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let filtered = users
    if (search) {
      const q = search.toLowerCase()
      filtered = users.filter((u) =>
        u.email?.toLowerCase().includes(q) ||
        (u.user_metadata?.full_name as string)?.toLowerCase().includes(q) ||
        (u.user_metadata?.name as string)?.toLowerCase().includes(q)
      )
    }

    const result = filtered.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.user_metadata?.name || null,
      is_admin: u.app_metadata?.is_admin === true,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    }))

    // Sort by last sign-in descending (most recent first)
    result.sort((a, b) => {
      const da = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0
      const db = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0
      return db - da
    })

    return NextResponse.json({ users: result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list users'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
