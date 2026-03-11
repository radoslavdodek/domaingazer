export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/impersonation'

export async function GET(req: Request) {
  const supabase = createClient()
  const { user, supabaseClient } = await getEffectiveUser(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = Math.min(Math.max(parseInt(searchParams.get('days') ?? '7', 10) || 7, 1), 90)

  const since = new Date()
  since.setUTCDate(since.getUTCDate() - days + 1)
  since.setUTCHours(0, 0, 0, 0)

  const { data, error } = await supabaseClient
    .from('search_history')
    .select('created_at')
    .eq('user_id', user.id)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Pre-fill all days with 0
  const byDate: Record<string, number> = {}
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setUTCDate(since.getUTCDate() + i)
    byDate[d.toISOString().slice(0, 10)] = 0
  }

  for (const row of data ?? []) {
    const date = (row.created_at as string).slice(0, 10)
    if (date in byDate) byDate[date]++
  }

  const stats = Object.entries(byDate).map(([date, count]) => ({ date, count }))

  return NextResponse.json({ stats, total: (data ?? []).length })
}
