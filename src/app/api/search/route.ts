export const runtime = 'nodejs'

import {
  recordCreditUsage,
  requireEntitlement,
  SubscriptionRequiredError,
} from '@/lib/billing'
import type { BillingStatusResponse } from '@/lib/billing-types'
import { checkDomains } from '@/lib/domain-checker'
import { generateDomainNames } from '@/lib/openai'
import { getSupportedTldCatalog } from '@/lib/tldCatalog'
import { getDefaultSearchTlds, getUnsupportedTlds, parseTldList } from '@/lib/tlds'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUser } from '@/lib/impersonation'
import { trackUsage } from '@/lib/track-usage'
import type { DomainResult, SseEvent, TLD } from '@/lib/types'

function encodeEvent(event: SseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { user } = await getEffectiveUser(supabase)
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = (await request.json()) as {
    description?: string
    tlds?: unknown
    exclude?: string[]
    hint?: string
    primaryTldOnly?: boolean
  }
  const description = body.description?.trim() ?? ''
  const exclude: string[] = Array.isArray(body.exclude) ? body.exclude : []
  const hint = body.hint?.trim() || undefined
  const primaryTldOnly = body.primaryTldOnly === true
  const { tlds: normalizedTlds, invalid } = parseTldList(Array.isArray(body.tlds) ? body.tlds : getDefaultSearchTlds())

  if (!description || description.length < 5) {
    return new Response(
      JSON.stringify({ error: 'Description must be at least 5 characters' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (description.length > 1000) {
    return new Response(
      JSON.stringify({ error: 'Description must be at most 1000 characters' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (hint && hint.length > 200) {
    return new Response(
      JSON.stringify({ error: 'Hint must be at most 200 characters' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (invalid.length > 0) {
    return new Response(
      JSON.stringify({ error: `Invalid TLD selection: ${invalid.join(', ')}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (normalizedTlds.length === 0) {
    return new Response(
      JSON.stringify({ error: 'At least one TLD is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { supportedTlds } = await getSupportedTldCatalog()
  const supportedTldSet = new Set(supportedTlds)
  const unsupportedTlds = getUnsupportedTlds(normalizedTlds, supportedTldSet)

  if (unsupportedTlds.length > 0) {
    return new Response(
      JSON.stringify({ error: `Unsupported TLD selection: ${unsupportedTlds.join(', ')}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const tldsToCheck = primaryTldOnly
    ? normalizedTlds.slice(0, 1)
    : normalizedTlds

  let billingState: BillingStatusResponse
  try {
    billingState = await requireEntitlement(user, 'search')
  } catch (err) {
    if (err instanceof SubscriptionRequiredError) {
      return new Response(
        JSON.stringify({
          error: err.message,
          code: err.code,
          billing: err.billing,
        }),
        { status: err.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const message = err instanceof Error ? err.message : 'Failed to validate billing access'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const abortController = new AbortController()
  const { signal } = abortController

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const emit = (event: SseEvent) => {
        if (signal.aborted) return
        controller.enqueue(encoder.encode(encodeEvent(event)))
      }

      const normalizedExclude = Array.from(new Set(exclude.map((name) => name.trim().toLowerCase()).filter(Boolean)))
      const seenNames = new Set(normalizedExclude)
      const generatedNames: string[] = []
      const generatedNameSet = new Set<string>()
      const TARGET_NAME_COUNT = 10
      const MAX_GENERATION_ATTEMPTS = 6

      try {
        for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
          if (signal.aborted || generatedNames.length >= TARGET_NAME_COUNT) break
          const remaining = TARGET_NAME_COUNT - generatedNames.length
          const { names: rawNames, usage } = await generateDomainNames(
            description,
            [...normalizedExclude, ...generatedNames],
            remaining,
            signal,
            hint
          )
          trackUsage(user.id, user.email ?? '', 'generateDomains', usage)
          if (signal.aborted) break
          for (const name of rawNames) {
            if (seenNames.has(name) || generatedNameSet.has(name)) continue
            generatedNames.push(name)
            generatedNameSet.add(name)
            if (generatedNames.length >= TARGET_NAME_COUNT) break
          }
        }

        // Build all (name, tld) pairs
        const pairs: { baseName: string; tld: TLD; fullDomain: string }[] = []
        for (const name of generatedNames) {
          for (const tld of tldsToCheck) {
            pairs.push({ baseName: name, tld, fullDomain: `${name}${tld}` })
          }
        }

        // Emit CHECKING status for all pairs first
        const checkingResults: DomainResult[] = pairs.map((p) => ({
          ...p,
          status: 'CHECKING',
        }))
        for (const result of checkingResults) {
          emit({ type: 'domain_result', data: result })
        }

        // Check all domains via Namecheap (primary) with Route53 fallback
        const pairMap = new Map(pairs.map((p) => [p.fullDomain, p]))
        await checkDomains(pairs, signal, (domain, status) => {
          const pair = pairMap.get(domain)
          if (pair && !signal.aborted) {
            emit({ type: 'domain_result', data: { ...pair, status } })
          }
        })

        if (!signal.aborted) {
          try {
            await recordCreditUsage(user, 'search', billingState)
          } catch (creditError) {
            console.error('[credit_usage.error]', creditError)
          }

          emit({ type: 'done' })
        }
      } catch (err) {
        if (signal.aborted) return
        const message = err instanceof Error ? err.message : 'Unknown error'
        emit({ type: 'error', message })
      } finally {
        controller.close()
      }
    },
    cancel() {
      abortController.abort()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
