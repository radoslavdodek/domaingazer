export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.is_admin !== true) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { searchParams } = new URL(request.url)
  const groupBy = searchParams.get('groupBy')
  const since = searchParams.get('since') ?? undefined
  const until = searchParams.get('until') ?? undefined

  if (groupBy === 'user') {
    let query = supabase
      .from('model_usage')
      .select('user_email, model, provider, total_tokens, cost_usd')
      .order('created_at', { ascending: false })
    if (since) query = query.gte('created_at', since)
    if (until) query = query.lt('created_at', until)

    const { data, error } = await query

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const map = new Map<string, { user_email: string; model: string; provider: string; total_tokens: number; cost_usd: number; request_count: number }>()
    for (const row of data ?? []) {
      const key = `${row.user_email}|${row.model}|${row.provider}`
      const existing = map.get(key)
      if (existing) {
        existing.total_tokens += row.total_tokens
        existing.cost_usd += row.cost_usd ?? 0
        existing.request_count += 1
      } else {
        map.set(key, { user_email: row.user_email, model: row.model, provider: row.provider, total_tokens: row.total_tokens, cost_usd: row.cost_usd ?? 0, request_count: 1 })
      }
    }
    const aggregated = Array.from(map.values()).sort((a, b) => b.total_tokens - a.total_tokens)
    return new Response(JSON.stringify(aggregated), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (groupBy === 'model') {
    let query = supabase
      .from('model_usage')
      .select('model, provider, total_tokens, cost_usd')
      .order('created_at', { ascending: false })
    if (since) query = query.gte('created_at', since)
    if (until) query = query.lt('created_at', until)

    const { data, error } = await query

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const map = new Map<string, { model: string; provider: string; total_tokens: number; cost_usd: number; request_count: number }>()
    for (const row of data ?? []) {
      const key = `${row.model}|${row.provider}`
      const existing = map.get(key)
      if (existing) {
        existing.total_tokens += row.total_tokens
        existing.cost_usd += row.cost_usd ?? 0
        existing.request_count += 1
      } else {
        map.set(key, { model: row.model, provider: row.provider, total_tokens: row.total_tokens, cost_usd: row.cost_usd ?? 0, request_count: 1 })
      }
    }
    const aggregated = Array.from(map.values()).sort((a, b) => b.total_tokens - a.total_tokens)
    return new Response(JSON.stringify(aggregated), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (groupBy === 'costs') {
    const granularity = searchParams.get('granularity') === 'hour' ? 'hour' : 'day'

    const now = new Date()
    const effectiveSince = since ? new Date(since) : (() => {
      const d = new Date(now)
      d.setUTCDate(d.getUTCDate() - 89)
      d.setUTCHours(0, 0, 0, 0)
      return d
    })()
    const effectiveUntil = until ? new Date(until) : now

    let query = supabase
      .from('model_usage')
      .select('created_at, cost_usd')
      .gte('created_at', effectiveSince.toISOString())
      .lt('created_at', effectiveUntil.toISOString())
      .order('created_at', { ascending: true })

    const { data, error } = await query

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const buckets: Record<string, number> = {}

    if (granularity === 'hour') {
      const start = new Date(effectiveSince)
      start.setUTCMinutes(0, 0, 0)
      for (let d = new Date(start); d < effectiveUntil; d = new Date(d.getTime() + 3_600_000)) {
        buckets[d.toISOString().slice(0, 13)] = 0
      }
      for (const row of data ?? []) {
        const key = (row.created_at as string).slice(0, 13)
        if (key in buckets) buckets[key] += row.cost_usd ?? 0
      }
    } else {
      const start = new Date(effectiveSince)
      start.setUTCHours(0, 0, 0, 0)
      const days = Math.ceil((effectiveUntil.getTime() - start.getTime()) / 86_400_000)
      for (let i = 0; i < days; i++) {
        const d = new Date(start)
        d.setUTCDate(start.getUTCDate() + i)
        buckets[d.toISOString().slice(0, 10)] = 0
      }
      for (const row of data ?? []) {
        const key = (row.created_at as string).slice(0, 10)
        if (key in buckets) buckets[key] += row.cost_usd ?? 0
      }
    }

    const result = Object.entries(buckets).map(([bucket, cost_usd]) => ({ bucket, cost_usd }))
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (groupBy === 'searches') {
    const CHART_MAX_DAYS = 90

    // Fetch all records in the selected period
    let dataQuery = supabase
      .from('search_history')
      .select('created_at')
      .order('created_at', { ascending: true })
    if (since) dataQuery = dataQuery.gte('created_at', since)
    if (until) dataQuery = dataQuery.lt('created_at', until)

    const { data, error } = await dataQuery

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const total = (data ?? []).length

    // Build chart: show at most CHART_MAX_DAYS days ending at `until` (or now)
    const chartUntil = until ? new Date(until) : new Date()
    const chartSince = new Date(chartUntil.getTime() - (CHART_MAX_DAYS - 1) * 24 * 60 * 60 * 1000)
    chartSince.setUTCHours(0, 0, 0, 0)

    // If the selected period is shorter than CHART_MAX_DAYS, use the actual start
    const effectiveChartSince = since && new Date(since) > chartSince ? new Date(since) : chartSince
    effectiveChartSince.setUTCHours(0, 0, 0, 0)

    const days = Math.ceil((chartUntil.getTime() - effectiveChartSince.getTime()) / (1000 * 60 * 60 * 24))

    const byDate: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(effectiveChartSince)
      d.setUTCDate(effectiveChartSince.getUTCDate() + i)
      byDate[d.toISOString().slice(0, 10)] = 0
    }
    for (const row of data ?? []) {
      const date = (row.created_at as string).slice(0, 10)
      if (date in byDate) byDate[date]++
    }

    const stats = Object.entries(byDate).map(([date, count]) => ({ date, count }))
    const chartTotal = stats.reduce((s, d) => s + d.count, 0)
    const chartTruncated = chartTotal < total

    return new Response(JSON.stringify({ stats, total, chartTruncated }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Default: most recent records filtered by date
  let query = supabase
    .from('model_usage')
    .select('id, created_at, user_email, provider, model, feature, prompt_tokens, completion_tokens, total_tokens, cost_usd')
    .order('created_at', { ascending: false })
    .limit(500)
  if (since) query = query.gte('created_at', since)
  if (until) query = query.lt('created_at', until)

  const { data, error } = await query

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
}
