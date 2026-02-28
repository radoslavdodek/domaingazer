export const runtime = 'nodejs'

import {checkDomain} from '@/lib/route53'
import { createClient } from '@/lib/supabase/server'
import type {DomainResult, SseEvent, TLD} from '@/lib/types'

function createLimiter(concurrency: number) {
    let running = 0
    const queue: (() => void)[] = []

    return function limit<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            const run = async () => {
                running++
                try {
                    resolve(await fn())
                } catch (err) {
                    reject(err)
                } finally {
                    running--
                    if (queue.length > 0) queue.shift()!()
                }
            }
            if (running < concurrency) {
                run()
            } else {
                queue.push(run)
            }
        })
    }
}

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

            const limit = createLimiter(3)

            try {
                // Emit CHECKING for all pairs first
                for (const p of pairs) {
                    emit({type: 'domain_result', data: {...p, status: 'CHECKING'}})
                }

                await Promise.all(
                    pairs.map((pair) =>
                        limit(async () => {
                            const status = await checkDomain(pair.fullDomain)
                            emit({type: 'domain_result', data: {...pair, status}})
                        })
                    )
                )

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
