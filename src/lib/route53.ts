import {
  Route53DomainsClient,
  CheckDomainAvailabilityCommand,
  DomainAvailability,
} from '@aws-sdk/client-route-53-domains'
import type { DomainStatus } from './types'

let _client: Route53DomainsClient | null = null
export function getRoute53Client() {
  if (!_client) _client = new Route53DomainsClient({ region: 'us-east-1' })
  return _client
}

function isThrottling(err: unknown): boolean {
  const e = err as { name?: string; __type?: string }
  return (
    e.name === 'ThrottlingException' ||
    e.__type === 'ThrottlingException' ||
    (err instanceof Error && err.message?.includes('Rate exceeded'))
  )
}

export async function checkDomain(fullDomain: string, signal?: AbortSignal): Promise<DomainStatus> {
  const maxRetries = 4
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) return 'ERROR'
    try {
      const command = new CheckDomainAvailabilityCommand({
        DomainName: fullDomain,
      })
      console.log(`[Route53] REQ  CheckDomainAvailability { DomainName: "${fullDomain}" } (attempt ${attempt + 1}/${maxRetries + 1})`)
      const response = await getRoute53Client().send(command, { abortSignal: signal })
      console.log(`[Route53] RES  ${fullDomain} → ${response.Availability}`)

      switch (response.Availability) {
        case DomainAvailability.AVAILABLE:
          return 'AVAILABLE'
        case DomainAvailability.RESERVED:
          return 'RESERVED'
        default:
          return 'UNAVAILABLE'
      }
    } catch (err: unknown) {
      const error = err as { name?: string; __type?: string }
      if (
        error.name === 'UnsupportedTLD' ||
        error.__type === 'UnsupportedTLD' ||
        (err instanceof Error && err.message?.includes('UnsupportedTLD'))
      ) {
        console.log(`[Route53] RES  ${fullDomain} → UnsupportedTLD`)
        return 'UNSUPPORTED'
      }
      if (isThrottling(err) && attempt < maxRetries && !signal?.aborted) {
        const delay = 500 * 2 ** attempt + Math.random() * 200
        console.log(`[Route53] THROTTLED ${fullDomain} — retrying in ${Math.round(delay)}ms`)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      if (signal?.aborted) return 'ERROR'
      console.error(`[Route53] ERROR ${fullDomain}:`, err)
      return 'ERROR'
    }
  }
  return 'ERROR'
}
