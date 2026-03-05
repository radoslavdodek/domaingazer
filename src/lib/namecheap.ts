import { XMLParser } from 'fast-xml-parser'
import type { DomainStatus } from './types'

const API_URL = 'https://api.namecheap.com/xml.response'

export function isNamecheapConfigured(): boolean {
  return !!(
    process.env.NAMECHEAP_API_USER &&
    process.env.NAMECHEAP_API_KEY &&
    process.env.NAMECHEAP_CLIENT_IP
  )
}

interface DomainCheckResult {
  '@_Domain': string
  '@_Available': string
  '@_IsPremiumName'?: string
  '@_PremiumRegistrationPrice'?: string
}

interface NamecheapResponse {
  ApiResponse: {
    '@_Status': string
    Errors?: {
      Error?: { '#text': string; '@_Number': string } | { '#text': string; '@_Number': string }[]
    }
    CommandResponse?: {
      DomainCheckResult?: DomainCheckResult | DomainCheckResult[]
    }
  }
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
})

export async function checkDomainsBulk(
  fullDomains: string[],
  signal?: AbortSignal
): Promise<Map<string, DomainStatus>> {
  const results = new Map<string, DomainStatus>()
  if (fullDomains.length === 0) return results

  const params = new URLSearchParams({
    ApiUser: process.env.NAMECHEAP_API_USER!,
    ApiKey: process.env.NAMECHEAP_API_KEY!,
    UserName: process.env.NAMECHEAP_API_USER!,
    ClientIp: process.env.NAMECHEAP_CLIENT_IP!,
    Command: 'namecheap.domains.check',
    DomainList: fullDomains.join(','),
  })

  const url = `${API_URL}?${params.toString()}`
  const maxRetries = 3

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) {
      for (const d of fullDomains) results.set(d, 'ERROR')
      return results
    }

    try {
      console.log(`[Namecheap] REQ domains.check (${fullDomains.length} domains, attempt ${attempt + 1}/${maxRetries + 1})`)
      const response = await fetch(url, { signal })
      const text = await response.text()
      const parsed = parser.parse(text) as NamecheapResponse
      const apiResponse = parsed.ApiResponse

      if (apiResponse['@_Status'] === 'ERROR') {
        const errors = apiResponse.Errors?.Error
        const errorList = Array.isArray(errors) ? errors : errors ? [errors] : []
        const errorMsg = errorList.map((e) => e['#text']).join('; ')
        console.error(`[Namecheap] API error: ${errorMsg}`)

        // Rate limit or transient errors — retry
        if (attempt < maxRetries) {
          const delay = 1000 * 2 ** attempt + Math.random() * 500
          console.log(`[Namecheap] Retrying in ${Math.round(delay)}ms`)
          await new Promise((r) => setTimeout(r, delay))
          continue
        }

        throw new Error(`Namecheap API error: ${errorMsg}`)
      }

      const checkResults = apiResponse.CommandResponse?.DomainCheckResult
      if (!checkResults) {
        throw new Error('No DomainCheckResult in Namecheap response')
      }

      const resultList = Array.isArray(checkResults) ? checkResults : [checkResults]
      for (const r of resultList) {
        const domain = r['@_Domain'].toLowerCase()
        const available = r['@_Available']?.toLowerCase() === 'true'
        const status: DomainStatus = available ? 'AVAILABLE' : 'UNAVAILABLE'
        console.log(`[Namecheap] RES  ${domain} → ${status}`)
        results.set(domain, status)
      }

      // Fill in any domains not in the response
      for (const d of fullDomains) {
        if (!results.has(d.toLowerCase())) {
          console.log(`[Namecheap] MISSING ${d} — marking as ERROR`)
          results.set(d.toLowerCase(), 'ERROR')
        }
      }

      return results
    } catch (err) {
      if (signal?.aborted) {
        for (const d of fullDomains) results.set(d, 'ERROR')
        return results
      }

      if (attempt < maxRetries) {
        const delay = 1000 * 2 ** attempt + Math.random() * 500
        console.log(`[Namecheap] Error (attempt ${attempt + 1}), retrying in ${Math.round(delay)}ms:`, err)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }

      console.error('[Namecheap] All retries exhausted:', err)
      throw err
    }
  }

  return results
}
