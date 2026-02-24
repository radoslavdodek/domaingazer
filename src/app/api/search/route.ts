export const runtime = 'nodejs'

import { generateDomainNames } from '@/lib/openai'
import { checkDomain } from '@/lib/route53'
import type { DomainResult, SseEvent, TLD } from '@/lib/types'

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
  const body = (await request.json()) as { description?: string; tlds?: TLD[]; exclude?: string[]; hint?: string }
  const description = body.description?.trim() ?? ''
  const tlds: TLD[] = Array.isArray(body.tlds) ? body.tlds : ['.com', '.io']
  const exclude: string[] = Array.isArray(body.exclude) ? body.exclude : []
  const hint = body.hint?.trim() || undefined

  if (!description || description.length < 5) {
    return new Response(
      JSON.stringify({ error: 'Description must be at least 5 characters' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
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

      const limit = createLimiter(3)
      const seenNames: string[] = [...exclude]
      const MAX_ROUNDS = 5

      try {
        for (let round = 1; round <= MAX_ROUNDS; round++) {
          if (signal.aborted) break
          emit({ type: 'round_start', round })

          const rawNames = await generateDomainNames(description, seenNames, signal, hint)
          if (signal.aborted) break
          const names = rawNames.filter((n) => !seenNames.includes(n))
          seenNames.push(...names)

          // Build all (name, tld) pairs
          const pairs: { baseName: string; tld: TLD; fullDomain: string }[] = []
          for (const name of names) {
            for (const tld of tlds) {
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

          // Check all domains in parallel with concurrency limit
          let foundAvailable = false
          await Promise.all(
            pairs.map((pair) =>
              limit(async () => {
                if (signal.aborted) return
                const status = await checkDomain(pair.fullDomain, signal)
                if (signal.aborted) return
                const result: DomainResult = { ...pair, status }
                emit({ type: 'domain_result', data: result })
                if (status === 'AVAILABLE') {
                  foundAvailable = true
                }
              })
            )
          )

          if (signal.aborted || foundAvailable) break
        }

        if (!signal.aborted) emit({ type: 'done' })
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
