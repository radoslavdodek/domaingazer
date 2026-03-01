export const runtime = 'nodejs'

import { explainDomainName } from '@/lib/openai'
import { createClient } from '@/lib/supabase/server'
import { trackUsage } from '@/lib/track-usage'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = (await request.json()) as { description?: string; baseName?: string }
  const description = (body.description ?? '').trim()
  const baseName = (body.baseName ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  if (!description || description.length < 5) {
    return new Response(
      JSON.stringify({ error: 'Description must be at least 5 characters' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!baseName) {
    return new Response(
      JSON.stringify({ error: 'baseName is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { explanation, usage } = await explainDomainName(description, baseName)
    trackUsage(user.id, user.email ?? '', 'explain', usage)
    if (!explanation) {
      return new Response(
        JSON.stringify({ error: 'AI did not return an explanation' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ explanation }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
