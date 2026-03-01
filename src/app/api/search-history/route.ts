export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { TLD } from '@/lib/types'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('search_history')
    .select('id, description, selected_tlds, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ history: data })
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { description, selected_tlds } = await req.json() as { description: string; selected_tlds: TLD[] }

  // Dedup: skip if most recent entry is identical
  const { data: recent } = await supabase
    .from('search_history')
    .select('description, selected_tlds')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (recent && recent.length > 0) {
    const last = recent[0]
    const sameTlds =
      last.selected_tlds.length === selected_tlds.length &&
      last.selected_tlds.every((t: string) => selected_tlds.includes(t as TLD))
    if (last.description === description && sameTlds) {
      return NextResponse.json({ ok: true })
    }
  }

  await supabase.from('search_history').insert({
    user_id: user.id,
    description,
    selected_tlds,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload: { id?: string } = {}
  try {
    payload = await req.json() as { id?: string }
  } catch {
    payload = {}
  }

  const query = supabase
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
