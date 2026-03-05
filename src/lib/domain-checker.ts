import type { DomainStatus } from './types'
import { checkDomainsBulk, isNamecheapConfigured } from './namecheap'
import { checkDomain } from './route53'

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

export async function checkDomains(
  pairs: { fullDomain: string }[],
  signal?: AbortSignal,
  emit?: (domain: string, status: DomainStatus) => void
): Promise<void> {
  if (pairs.length === 0) return

  const fullDomains = pairs.map((p) => p.fullDomain)

  if (isNamecheapConfigured()) {
    try {
      const results = await checkDomainsBulk(fullDomains, signal)
      const fallbackDomains: string[] = []

      for (const domain of fullDomains) {
        const status = results.get(domain.toLowerCase())
        if (status && status !== 'ERROR') {
          emit?.(domain, status)
        } else {
          fallbackDomains.push(domain)
        }
      }

      if (fallbackDomains.length > 0) {
        console.log(`[DomainChecker] Falling back to Route53 for ${fallbackDomains.length} domain(s)`)
        await checkDomainsViaRoute53(fallbackDomains, signal, emit)
      }

      return
    } catch (err) {
      console.error('[DomainChecker] Namecheap failed entirely, falling back to Route53:', err)
    }
  } else {
    console.log('[DomainChecker] Namecheap not configured, using Route53')
  }

  await checkDomainsViaRoute53(fullDomains, signal, emit)
}

async function checkDomainsViaRoute53(
  domains: string[],
  signal?: AbortSignal,
  emit?: (domain: string, status: DomainStatus) => void
): Promise<void> {
  const limit = createLimiter(3)
  await Promise.all(
    domains.map((domain) =>
      limit(async () => {
        if (signal?.aborted) return
        const status = await checkDomain(domain, signal)
        if (!signal?.aborted) {
          emit?.(domain, status)
        }
      })
    )
  )
}
