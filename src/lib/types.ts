export const FEATURED_TLDS = ['.com', '.io', '.ai', '.co', '.net', '.shop', '.store', '.de'] as const
export const DEFAULT_SEARCH_TLDS = ['.com', '.io'] as const

export type TLD = string

export type DomainStatus =
  | 'CHECKING'
  | 'STOPPED'
  | 'AVAILABLE'
  | 'UNAVAILABLE'
  | 'RESERVED'
  | 'UNSUPPORTED'
  | 'ERROR'

export interface DomainResult {
  baseName: string
  tld: TLD
  fullDomain: string
  status: DomainStatus
}

export type SseEvent =
  | { type: 'domain_result'; data: DomainResult }
  | { type: 'done' }
  | { type: 'error'; message: string }
