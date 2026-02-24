export const ALL_TLDS = ['.com', '.io', '.ai', '.app', '.dev', '.co', '.net', '.shop', '.store'] as const

export type TLD = (typeof ALL_TLDS)[number]

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
