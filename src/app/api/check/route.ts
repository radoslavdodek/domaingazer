export const runtime = 'nodejs'

import { checkDomains } from '@/lib/domain-checker'
import { createClient } from '@/lib/supabase/server'
import type {SseEvent, TLD} from '@/lib/types'

function encodeEvent(event: SseEvent): string {
    return `data: ${JSON.stringify(event)}\n\n`
}

export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const body = (await request.json()) as { baseName?: string; tlds?: TLD[] }
    const baseName = (body.baseName ?? '').trim().toLowerCase().replace(/\s+/g, '').replace(/\.$/, '')
    const tlds: TLD[] = Array.isArray(body.tlds) ? body.tlds : []

    if (!baseName || tlds.length === 0) {
        return new Response(
            JSON.stringify({error: 'baseName and tlds are required'}),
            {status: 400, headers: {'Content-Type': 'application/json'}}
        )
    }

    const pairs: { baseName: string; tld: TLD; fullDomain: string }[] = tlds.map((tld) => ({
        baseName,
        tld,
        fullDomain: `${baseName}${tld}`,
    }))

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            const emit = (event: SseEvent) => {
                controller.enqueue(encoder.encode(encodeEvent(event)))
            }

            try {
                // Emit CHECKING for all pairs first
                for (const p of pairs) {
                    emit({type: 'domain_result', data: {...p, status: 'CHECKING'}})
                }

                const pairMap = new Map(pairs.map((p) => [p.fullDomain, p]))
                await checkDomains(pairs, undefined, (domain, status) => {
                    const pair = pairMap.get(domain)
                    if (pair) {
                        emit({type: 'domain_result', data: {...pair, status}})
                    }
                })

                emit({type: 'done'})
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error'
                emit({type: 'error', message})
            } finally {
                controller.close()
            }
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
