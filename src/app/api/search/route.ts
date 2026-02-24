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
          const rawNames = await generateDomainNames(
            description,
            [...normalizedExclude, ...generatedNames],
            remaining,
            signal,
            hint
          )
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
        await Promise.all(
          pairs.map((pair) =>
            limit(async () => {
              if (signal.aborted) return
              const status = await checkDomain(pair.fullDomain, signal)
              if (signal.aborted) return
              const result: DomainResult = { ...pair, status }
              emit({ type: 'domain_result', data: result })
            })
          )
        )

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
