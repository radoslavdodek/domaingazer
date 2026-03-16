export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/impersonation'
import { parseTldList } from '@/lib/tlds'
import type { TLD } from '@/lib/types'

function sanitizeSelectedTlds(value: unknown): TLD[] {
  return parseTldList(value).tlds
}

export async function GET() {
  const supabase = await createClient()
  const { user, supabaseClient } = await getEffectiveUser(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseClient
    .from('search_history')
    .select('id, description, selected_tlds, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const history = (data ?? []).map((entry) => ({
    ...entry,
    selected_tlds: sanitizeSelectedTlds(entry.selected_tlds),
  }))

  return NextResponse.json({ history })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { user, supabaseClient } = await getEffectiveUser(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { description, selected_tlds } = await req.json() as { description: string; selected_tlds: unknown }
  const normalizedSelectedTlds = sanitizeSelectedTlds(selected_tlds)

  if (normalizedSelectedTlds.length === 0) {
    return NextResponse.json({ error: 'At least one TLD is required' }, { status: 400 })
  }

  // Dedup: skip if most recent entry is identical
  const { data: recent } = await supabaseClient
    .from('search_history')
    .select('description, selected_tlds')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (recent && recent.length > 0) {
    const last = recent[0]
    const lastSelectedTlds = sanitizeSelectedTlds(last.selected_tlds)
    const sameTlds =
      lastSelectedTlds.length === normalizedSelectedTlds.length &&
      lastSelectedTlds.every((t) => normalizedSelectedTlds.includes(t))
    if (last.description === description && sameTlds) {
      return NextResponse.json({ ok: true })
    }
  }

  await supabaseClient.from('search_history').insert({
    user_id: user.id,
    description,
    selected_tlds: normalizedSelectedTlds,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { user, supabaseClient } = await getEffectiveUser(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload: { id?: string } = {}
  try {
    payload = await req.json() as { id?: string }
  } catch {
    payload = {}
  }

  const query = supabaseClient
    .from('search_history')
    .delete()
    .eq('user_id', user.id)

  if (payload.id) {
    await query.eq('id', payload.id)
  } else {
    await query
  }

  return NextResponse.json({ ok: true })
}
