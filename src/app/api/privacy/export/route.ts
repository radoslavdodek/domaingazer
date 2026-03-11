export const runtime = 'nodejs'

import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/impersonation'
import { createAdminClient } from '@/lib/supabase/admin'

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function GET() {
  const supabase = createClient()
  const { user } = await getEffectiveUser(supabase)

  if (!user) {
    return jsonError('Unauthorized', 401)
  }

  try {
    const admin: any = createAdminClient()

    const { data, error } = await admin
      .from('search_history')
      .select('id, description, selected_tlds, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    console.info('[privacy.export_requested]', { userId: user.id })

    const payload = {
      formatVersion: 1,
      generatedAt: new Date().toISOString(),
      searchHistory: data ?? [],
    }

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="domain-gazer-export.json"',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to export data'
    return jsonError(message, 500)
  }
}
