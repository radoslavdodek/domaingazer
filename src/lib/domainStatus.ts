import type { DomainStatus } from '@/lib/types'

export const DOMAIN_STATUS_LABELS: Record<DomainStatus, string> = {
  CHECKING: 'Checking',
  STOPPED: 'Stopped',
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'TAKEN',
  RESERVED: 'Reserved',
  UNSUPPORTED: 'N/A',
  ERROR: 'Error',
}
