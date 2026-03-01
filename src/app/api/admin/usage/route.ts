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

  if (groupBy === 'user') {
    const { data, error } = await supabase
      .from('model_usage')
      .select('user_email, model, provider, total_tokens')
      .order('created_at', { ascending: false })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Aggregate by user_email + model + provider
    const map = new Map<string, { user_email: string; model: string; provider: string; total_tokens: number; request_count: number }>()
    for (const row of data ?? []) {
      const key = `${row.user_email}|${row.model}|${row.provider}`
      const existing = map.get(key)
      if (existing) {
        existing.total_tokens += row.total_tokens
        existing.request_count += 1
      } else {
        map.set(key, { user_email: row.user_email, model: row.model, provider: row.provider, total_tokens: row.total_tokens, request_count: 1 })
      }
    }
    const aggregated = Array.from(map.values()).sort((a, b) => b.total_tokens - a.total_tokens)
    return new Response(JSON.stringify(aggregated), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (groupBy === 'model') {
    const { data, error } = await supabase
      .from('model_usage')
      .select('model, provider, total_tokens')
      .order('created_at', { ascending: false })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Aggregate by model + provider
    const map = new Map<string, { model: string; provider: string; total_tokens: number; request_count: number }>()
    for (const row of data ?? []) {
      const key = `${row.model}|${row.provider}`
      const existing = map.get(key)
      if (existing) {
        existing.total_tokens += row.total_tokens
        existing.request_count += 1
      } else {
        map.set(key, { model: row.model, provider: row.provider, total_tokens: row.total_tokens, request_count: 1 })
      }
    }
    const aggregated = Array.from(map.values()).sort((a, b) => b.total_tokens - a.total_tokens)
    return new Response(JSON.stringify(aggregated), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Default: most recent 500 records
  const { data, error } = await supabase
    .from('model_usage')
    .select('id, created_at, user_email, provider, model, feature, prompt_tokens, completion_tokens, total_tokens')
    .order('created_at', { ascending: false })
    .limit(500)

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
