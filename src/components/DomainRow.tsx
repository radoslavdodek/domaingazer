'use client'

import { DOMAIN_STATUS_LABELS } from '@/lib/domainStatus'
import type { DomainStatus } from '@/lib/types'

type DisplayStatus = DomainStatus | 'PENDING'

interface DomainRowProps {
  domain: string
  status: DisplayStatus
  compact?: boolean
}

const badgeClassByStatus: Record<DisplayStatus, string> = {
  CHECKING: 'bg-gray-100 text-gray-500',
  STOPPED: 'bg-gray-100 text-gray-600',
  AVAILABLE: 'bg-green-100 text-green-700',
  UNAVAILABLE: 'bg-red-100 text-red-600',
  RESERVED: 'bg-yellow-100 text-yellow-700',
  UNSUPPORTED: 'bg-gray-100 text-gray-400',
  ERROR: 'bg-orange-100 text-orange-600',
  PENDING: 'bg-gray-100 text-gray-500',
}

const compactBadgeClassByStatus: Record<DisplayStatus, string> = {
  CHECKING: 'border border-gray-200 bg-gray-100 text-gray-600 font-medium',
  STOPPED: 'border border-gray-200 bg-gray-100 text-gray-600 font-medium',
  AVAILABLE: 'border border-green-200 bg-green-100 text-green-800 font-bold',
  UNAVAILABLE: 'border border-red-200 bg-red-50 text-red-700 font-semibold',
  RESERVED: 'border border-yellow-200 bg-yellow-50 text-yellow-700 font-medium',
  UNSUPPORTED: 'border border-gray-200 bg-gray-100 text-gray-500 font-medium',
  ERROR: 'border border-orange-200 bg-orange-50 text-orange-700 font-medium',
  PENDING: 'border border-gray-200 bg-gray-100 text-gray-500 font-medium',
}

function getStatusLabel(status: DisplayStatus): string {
  if (status === 'PENDING') return 'Pending'
  return DOMAIN_STATUS_LABELS[status]
}

export function DomainRow({ domain, status, compact = false }: DomainRowProps) {
  const label = getStatusLabel(status)
  const isChecking = status === 'CHECKING'
  const checkingContent = (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )

  if (compact) {
    return (
      <div className="flex flex-col gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="break-all font-mono text-[13px] leading-tight text-gray-700">{domain}</span>
        <span className={`inline-block w-fit rounded-full px-2 py-0.5 text-xs ${compactBadgeClassByStatus[status]}`}>
          {isChecking ? checkingContent : label}
        </span>
      </div>
    )
  }

  const isAvailable = status === 'AVAILABLE'
  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
        isAvailable ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-white'
      }`}
    >
      <span className={`font-mono text-sm ${isAvailable ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
        {domain}
      </span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClassByStatus[status]}`}>
        {isChecking ? checkingContent : label}
      </span>
    </div>
  )
}
