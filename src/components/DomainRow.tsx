'use client'

import { useState } from 'react'
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

function CopyButton({ domain }: { domain: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(domain)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${domain}`}
      className="ml-1.5 rounded p-0.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-gray-600"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-green-600">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
          <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
        </svg>
      )}
    </button>
  )
}

export function DomainRow({ domain, status, compact = false }: DomainRowProps) {
  const { theme } = useTheme()
  const label = getStatusLabel(status)
  const isChecking = status === 'CHECKING'
  const isAvailable = status === 'AVAILABLE'
  const checkingContent = (
    <span className="inline-flex items-center gap-1.5">
      <span className={theme.domainRow.spinner} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )

  if (compact) {
    return (
      <div className={`group flex flex-col gap-1.5 rounded-lg border px-2.5 py-1.5 sm:flex-row sm:items-center sm:justify-between ${
        isAvailable ? theme.domainRow.compactRowAvailable : theme.domainRow.compactRowDefault
      }`}>
        <span className={`inline-flex items-center break-all font-mono text-[13px] leading-tight ${theme.domainRow.compactText}`}>
          {domain}
          {isAvailable && <CopyButton domain={domain} />}
        </span>
        <span className={`inline-block w-fit rounded-full px-2 py-0.5 text-xs ${theme.domainRow.compactBadgeClassByStatus[status]}`}>
          {isChecking ? checkingContent : label}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`group flex items-center justify-between rounded-xl border px-4 py-3 ${
        isAvailable ? theme.domainRow.rowAvailable : theme.domainRow.rowDefault
      }`}
    >
      <span className={`inline-flex items-center font-mono text-sm ${isAvailable ? theme.domainRow.textAvailable : theme.domainRow.textDefault}`}>
        {domain}
        {isAvailable && <CopyButton domain={domain} />}
      </span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${theme.domainRow.badgeClassByStatus[status]}`}>
        {isChecking ? checkingContent : label}
      </span>
    </div>
  )
}
