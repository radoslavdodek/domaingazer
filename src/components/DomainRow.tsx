'use client'

import type { DomainResult, DomainStatus } from '@/lib/types'

interface DomainRowProps {
  result: DomainResult
}

const statusConfig: Record<DomainStatus, { label: string; className: string }> = {
  CHECKING: {
    label: 'Checking…',
    className: 'bg-gray-100 text-gray-500 animate-pulse',
  },
  STOPPED: {
    label: 'Stopped',
    className: 'bg-gray-100 text-gray-600',
  },
  AVAILABLE: {
    label: 'Available',
    className: 'bg-green-100 text-green-700',
  },
  UNAVAILABLE: {
    label: 'Taken',
    className: 'bg-red-100 text-red-600',
  },
  RESERVED: {
    label: 'Reserved',
    className: 'bg-yellow-100 text-yellow-700',
  },
  UNSUPPORTED: {
    label: 'Unsupported',
    className: 'bg-gray-100 text-gray-400',
  },
  ERROR: {
    label: 'Error',
    className: 'bg-orange-100 text-orange-600',
  },
}

export function DomainRow({ result }: DomainRowProps) {
  const { label, className: badgeClass } = statusConfig[result.status]
  const isAvailable = result.status === 'AVAILABLE'

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
        isAvailable
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-100'
      }`}
    >
      <span className={`font-mono text-sm ${isAvailable ? 'font-semibold text-green-800' : 'text-gray-700'}`}>
        {result.fullDomain}
      </span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
        {label}
      </span>
    </div>
  )
}
