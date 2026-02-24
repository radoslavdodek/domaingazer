export type TLD =
  | '.com'
  | '.io'
  | '.ai'
  | '.app'
  | '.dev'
  | '.co'
  | '.net'
  | '.shop'
  | '.store'

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
  | { type: 'round_start'; round: number }
  | { type: 'done' }
  | { type: 'error'; message: string }
