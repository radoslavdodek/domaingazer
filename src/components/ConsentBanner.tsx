'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { RegionKind } from '@/lib/privacy/constants'
import { getConsentSnapshot, setConsentStatus } from '@/lib/privacy/client-consent'
import { PrivacyStorageControls } from './PrivacyStorageControls'

export function ConsentBanner({ initialRegion }: { initialRegion: RegionKind }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const snapshot = getConsentSnapshot()
    setIsVisible(snapshot.region === 'eu' && snapshot.status === 'unknown')
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-zinc-300 bg-white/95 px-4 py-4 shadow-2xl backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Privacy</p>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              We use essential authentication cookies to keep your session secure. For EU users, optional browser
              storage for theme preferences and saved search drafts stays off until you opt in.
              See our <Link href="/privacy" className="font-medium underline underline-offset-2">Privacy Policy</Link> and <Link href="/cookies" className="font-medium underline underline-offset-2">Cookie Policy</Link>.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setConsentStatus('accepted')
                setIsVisible(false)
              }}
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Accept optional storage
            </button>
            <button
              type="button"
              onClick={() => {
                setConsentStatus('declined')
                setIsVisible(false)
              }}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Decline optional storage
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              View privacy settings
            </button>
          </div>
        </div>

        {isExpanded && (
          <PrivacyStorageControls
            initialRegion={initialRegion}
            compact
            onDecision={() => {
              setIsExpanded(false)
              setIsVisible(false)
            }}
          />
        )}
      </div>
    </div>
  )
}
