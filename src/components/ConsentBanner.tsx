'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getConsentSnapshot, setConsentStatus } from '@/lib/privacy/client-consent'
import { PrivacyStorageControls } from './PrivacyStorageControls'

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [region, setRegion] = useState<'eu' | 'non-eu'>('non-eu')

  useEffect(() => {
    const snapshot = getConsentSnapshot()
    setRegion(snapshot.region)
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
              We use essential authentication cookies to keep your session secure. Optional services include browser
              storage for preferences and drafts, Google Analytics measurement, and Microsoft Clarity session recording
              when configured. For EU users, these optional services stay off until you opt in.
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
              Accept optional services
            </button>
            <button
              type="button"
              onClick={() => {
                setConsentStatus('declined')
                setIsVisible(false)
              }}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Decline optional services
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
            initialRegion={region}
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
