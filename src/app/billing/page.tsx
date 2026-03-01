'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { openBillingPortal, startCheckout } from '@/lib/billing-client'

export default function BillingPage() {
  const router = useRouter()
  const hasStartedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hasStartedRef.current) return

    const searchParams = new URLSearchParams(window.location.search)
    const checkout = searchParams.get('checkout')
    const portal = searchParams.get('portal')

    hasStartedRef.current = true

    if (checkout === 'month' || checkout === 'year') {
      void startCheckout(checkout).catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to start checkout')
      })
      return
    }

    if (portal === '1') {
      void openBillingPortal().catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to open the billing portal')
      })
      return
    }

    router.replace('/')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-2xl shadow-black/40">
        <h1 className="text-2xl font-bold tracking-tight">Preparing billing</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Redirecting you to Stripe. This takes a moment.
        </p>
        {error && (
          <>
            <p className="mt-5 rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              Return to dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
