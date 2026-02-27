'use client'

import { DOMAIN_STATUS_LABELS } from '@/lib/domainStatus'
import type { DomainStatus } from '@/lib/types'
import { useTheme } from '@/contexts/ThemeContext'

type DisplayStatus = DomainStatus | 'PENDING'

interface DomainRowProps {
  domain: string
  status: DisplayStatus
  compact?: boolean
}

function getStatusLabel(status: DisplayStatus): string {
  if (status === 'PENDING') return 'Pending'
  return DOMAIN_STATUS_LABELS[status]
}

export function DomainRow({ domain, status, compact = false }: DomainRowProps) {
  const { theme } = useTheme()
  const label = getStatusLabel(status)
  const isChecking = status === 'CHECKING'
  const checkingContent = (
    <span className="inline-flex items-center gap-1.5">
      <span className={theme.domainRow.spinner} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )

  if (compact) {
    return (
      <div className={`flex flex-col gap-1.5 rounded-lg border px-2.5 py-1.5 sm:flex-row sm:items-center sm:justify-between ${
        status === 'AVAILABLE' ? theme.domainRow.compactRowAvailable : theme.domainRow.compactRowDefault
      }`}>
        <span className={`break-all font-mono text-[13px] leading-tight ${theme.domainRow.compactText}`}>{domain}</span>
        <span className={`inline-block w-fit rounded-full px-2 py-0.5 text-xs ${theme.domainRow.compactBadgeClassByStatus[status]}`}>
          {isChecking ? checkingContent : label}
        </span>
      </div>
    )
  }

  const isAvailable = status === 'AVAILABLE'
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
        isAvailable ? theme.domainRow.rowAvailable : theme.domainRow.rowDefault
      }`}
    >
      <span className={`font-mono text-sm ${isAvailable ? theme.domainRow.textAvailable : theme.domainRow.textDefault}`}>
        {domain}
      </span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${theme.domainRow.badgeClassByStatus[status]}`}>
        {isChecking ? checkingContent : label}
      </span>
    </div>
  )
}
