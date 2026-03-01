'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import {
  CONSENT_CHANGED_EVENT,
  type ConsentStatus,
  type RegionKind,
} from '@/lib/privacy/constants'
import {
  getConsentSnapshot,
  setConsentStatus,
} from '@/lib/privacy/client-consent'

interface PrivacyStorageControlsProps {
  initialRegion?: RegionKind
  onDecision?: () => void
  compact?: boolean
}

function getStatusCopy(region: RegionKind, status: ConsentStatus) {
  if (status === 'accepted') {
    return 'Optional browser storage is enabled for your device. Theme and draft searches can be remembered locally.'
  }

  if (status === 'declined') {
    return 'Optional browser storage is disabled for your device. Theme and draft searches will not be stored locally.'
  }

  if (region === 'eu') {
    return 'Only essential authentication cookies are active by default. Theme and draft-search storage stay off until you opt in.'
  }

  return 'Optional browser storage is currently allowed by default on this device. You can disable it here at any time.'
}

export function PrivacyStorageControls({
  initialRegion = 'non-eu',
  onDecision,
  compact = false,
}: PrivacyStorageControlsProps) {
  const { themeName } = useTheme()
  const [region, setRegion] = useState<RegionKind>(initialRegion)
  const [status, setStatus] = useState<ConsentStatus>('unknown')
  const isMidnight = themeName === 'midnight'

  useEffect(() => {
    const sync = () => {
      const snapshot = getConsentSnapshot()
      setRegion(snapshot.region)
      setStatus(snapshot.status)
    }

    sync()
    window.addEventListener(CONSENT_CHANGED_EVENT, sync)
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, sync)
  }, [])

  const containerClassName = compact
    ? isMidnight
      ? 'rounded-2xl border border-zinc-700 bg-zinc-900/80 px-4 py-4 text-sm text-zinc-300'
      : 'rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700'
    : isMidnight
      ? 'rounded-3xl border border-zinc-800 bg-zinc-900 px-5 py-5 text-zinc-100 shadow-lg shadow-black/20'
      : 'rounded-3xl border border-zinc-200 bg-white px-5 py-5 text-zinc-900 shadow-sm'
  const eyebrowClassName = isMidnight ? 'text-zinc-400' : 'text-zinc-500'
  const descriptionClassName = isMidnight ? 'text-zinc-300' : 'text-zinc-700'
  const primaryButtonClassName = isMidnight
    ? 'inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500'
    : 'inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800'
  const secondaryButtonClassName = isMidnight
    ? 'inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700'
    : 'inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50'
  const legalCopyClassName = isMidnight ? 'text-zinc-400' : 'text-zinc-500'
  const legalLinkClassName = isMidnight ? 'font-medium text-zinc-200 underline underline-offset-2' : 'font-medium text-zinc-700 underline underline-offset-2'

  return (
    <section className={containerClassName}>
      <div className="flex flex-col gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${eyebrowClassName}`}>Optional Storage</p>
          <p className={`mt-2 text-sm leading-6 ${descriptionClassName}`}>{getStatusCopy(region, status)}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setConsentStatus('accepted')
              onDecision?.()
            }}
            className={primaryButtonClassName}
          >
            Enable optional storage
          </button>
          <button
            type="button"
            onClick={() => {
              setConsentStatus('declined')
              onDecision?.()
            }}
            className={secondaryButtonClassName}
          >
            Disable optional storage
          </button>
        </div>

        <p className={`text-xs leading-5 ${legalCopyClassName}`}>
          Essential authentication cookies remain active so sign-in and account security continue to work.
          Read our <Link href="/privacy" className={legalLinkClassName}>Privacy Policy</Link> and <Link href="/cookies" className={legalLinkClassName}>Cookie Policy</Link>.
        </p>
      </div>
    </section>
  )
}
