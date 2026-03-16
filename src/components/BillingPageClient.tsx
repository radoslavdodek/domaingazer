'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { BillingPlans } from '@/components/BillingPlans'
import { openBillingPortal, startCheckout } from '@/lib/billing-client'
import type { BillingPlanPricing } from '@/lib/billing-types'

interface BillingPageClientProps {
  pricing: BillingPlanPricing | null
  autoAction?: 'month' | 'year' | 'portal' | null
}

export function BillingPageClient({ pricing, autoAction = null }: BillingPageClientProps) {
  const hasStartedRef = useRef(false)
  const [autoRedirectError, setAutoRedirectError] = useState<string | null>(null)
  const [isPreparing, setIsPreparing] = useState(autoAction !== null)

  useEffect(() => {
    if (!autoAction || hasStartedRef.current) return

    hasStartedRef.current = true

    const runRedirect = async () => {
      try {
        if (autoAction === 'portal') {
          await openBillingPortal()
          return
        }

        await startCheckout(autoAction)
      } catch (err) {
        setAutoRedirectError(err instanceof Error ? err.message : 'Failed to open billing')
        setIsPreparing(false)
      }
    }

    void runRedirect()
  }, [autoAction])

  if (isPreparing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-2xl shadow-black/40">
          <h1 className="text-2xl font-bold tracking-tight">Preparing billing</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Redirecting you to Stripe. This takes a moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">Billing</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Choose your Pro plan</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Pick monthly or yearly billing to unlock unlimited searches and explanations.
          </p>
        </div>

        <BillingPlans pricing={pricing} isSignedIn initialNotice={autoRedirectError} />

        <div className="mt-8 text-center">
          <Link
            href="/app"
            className="inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
