'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import type { BillingCurrency, BillingPlanPricing, CurrencyPricing } from '@/lib/billing-types'

function getCurrencyFromCookie(): BillingCurrency {
  if (typeof document === 'undefined') return 'eur'

  const match = document.cookie.match(/(?:^|;\s*)dg_region=([^;]*)/)
  const region = match?.[1]

  return region === 'non-eu' ? 'usd' : 'eur'
}

export function LandingPricingPlans({
  pricing,
}: {
  pricing: BillingPlanPricing | null
}) {
  const currencyPricing: CurrencyPricing | null = useMemo(() => {
    if (!pricing) return null
    return pricing[getCurrencyFromCookie()]
  }, [pricing])

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="flex h-full flex-col rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">Free</p>
        <h3 className="mt-4 text-3xl font-bold">Starter</h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          One-time free credits for trying domain generation and verification before you pay.
        </p>
        <div className="mt-auto pt-8">
          <Link
            href="/app"
            className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            Choose Starter
          </Link>
        </div>
      </div>

      <div className="flex h-full flex-col rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-500/10 to-zinc-900/80 p-7 shadow-lg shadow-blue-600/10">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">Pro Monthly</p>
        <h3 className="mt-4 text-3xl font-bold">Monthly</h3>
        {currencyPricing?.monthly && (
          <div className="mt-6 flex items-end gap-2">
            <span className="text-5xl font-black tracking-tight">{currencyPricing.monthly}</span>
            <span className="pb-1 text-sm font-medium text-zinc-400">/month</span>
          </div>
        )}
        <p className="mt-2 text-sm text-zinc-400">Unlimited searches. Cancel anytime.</p>
        <div className="mt-auto pt-8">
          <Link
            href="/login?next=%2Fbilling%3Fcheckout%3Dmonth"
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Choose Monthly
          </Link>
        </div>
      </div>

      <div className="flex h-full flex-col rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/10 to-zinc-900/80 p-7 shadow-lg shadow-cyan-600/10">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Pro Yearly</p>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-200">
            Best Value
          </span>
        </div>
        <h3 className="mt-4 text-3xl font-bold">Yearly</h3>
        {currencyPricing?.yearlyPerMonth && (
          <div className="mt-6 flex items-end gap-2">
            <span className="text-5xl font-black tracking-tight">{currencyPricing.yearlyPerMonth}</span>
            <span className="pb-1 text-sm font-medium text-zinc-400">/month</span>
          </div>
        )}
        {currencyPricing?.yearlyBillingNote && (
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-cyan-200/80">
            {currencyPricing.yearlyBillingNote}
          </p>
        )}
        <p className="mt-2 text-sm text-zinc-400">The same unlimited access with discounted annual billing.</p>
        <div className="mt-auto pt-8">
          <Link
            href="/login?next=%2Fbilling%3Fcheckout%3Dyear"
            className="inline-flex w-full items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-400/15"
          >
            Choose Yearly
          </Link>
        </div>
      </div>
    </div>
  )
}
