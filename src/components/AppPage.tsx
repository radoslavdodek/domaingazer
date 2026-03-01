'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { startCheckout, openBillingPortal } from '@/lib/billing-client'
import { SearchForm } from '@/components/SearchForm'
import { ResultsPanel } from '@/components/ResultsPanel'
import { ClearResultsModal } from '@/components/results/ClearResultsModal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserMenu } from '@/components/UserMenu'
import { useBillingStatus } from '@/hooks/useBillingStatus'
import { useDomainSearch } from '@/hooks/useDomainSearch'
import { useTheme } from '@/contexts/ThemeContext'
import type { TLD } from '@/lib/types'

interface SearchHistoryEntry {
  id: string
  description: string
  selected_tlds: TLD[]
}

export function AppPage() {
  const { theme } = useTheme()
  const { results, nameBatches, status, errorMessage, isCheckingCustom, isWaitingForNewRows, search, generateMore, cancel, clearResults, checkCustom, checkNewTld } = useDomainSearch()
  const { billing, isLoading: isBillingLoading, error: billingError, refresh: refreshBilling } = useBillingStatus()
  const [selectedTlds, setSelectedTlds] = useState<TLD[]>([])
  const [searchDescription, setSearchDescription] = useState('')
  const [isTldSelectionLocked, setIsTldSelectionLocked] = useState(false)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([])
  const [initialDescription, setInitialDescription] = useState<string | undefined>(undefined)
  const [initialTlds, setInitialTlds] = useState<TLD[] | undefined>(undefined)
  const [billingAction, setBillingAction] = useState<'month' | 'year' | 'portal' | null>(null)
  const [billingActionError, setBillingActionError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/search-history')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.history?.length) return
        const history: SearchHistoryEntry[] = data.history
        setSearchHistory(history)
        setInitialDescription(history[0].description)
        setInitialTlds(history[0].selected_tlds)
      })
      .catch(() => {/* ignore — user may not be logged in */})
  }, [])

  const handleSearch = (description: string, tlds: TLD[]) => {
    setSelectedTlds(tlds)
    setSearchDescription(description)
    setIsTldSelectionLocked(true)
    void search(description, tlds).finally(() => {
      void refreshBilling()
    })

    // Fire-and-forget save + optimistic prepend (skip if description already in history)
    setSearchHistory((prev) => {
      if (prev.some((e) => e.description === description)) return prev
      const newEntry: SearchHistoryEntry = { id: crypto.randomUUID(), description, selected_tlds: tlds }
      fetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, selected_tlds: tlds }),
      }).catch(() => {/* ignore */})
      return [newEntry, ...prev].slice(0, 10)
    })
  }

  const handleAddTldForBase = (baseName: string, tld: TLD) => {
    checkNewTld(tld, [baseName])
  }

  const handleGenerateMore = (hint: string) => {
    const baseNames = Array.from(new Set(results.map((r) => r.baseName)))
    void generateMore(baseNames, hint || undefined).finally(() => {
      void refreshBilling()
    })
  }

  const handleDeleteHistory = (id: string) => {
    setSearchHistory((prev) => prev.filter((e) => e.id !== id))
    fetch('/api/search-history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {/* ignore */})
  }

  const handleClear = () => {
    clearResults()
    setSearchDescription('')
    setSelectedTlds([])
    setIsTldSelectionLocked(false)
  }

  const handleCheckout = async (interval: 'month' | 'year') => {
    setBillingAction(interval)
    setBillingActionError(null)

    try {
      await startCheckout(interval)
    } catch (err) {
      setBillingAction(null)
      setBillingActionError(err instanceof Error ? err.message : 'Failed to start checkout')
    }
  }

  const handleManageBilling = async () => {
    setBillingAction('portal')
    setBillingActionError(null)

    try {
      await openBillingPortal()
    } catch (err) {
      setBillingAction(null)
      setBillingActionError(err instanceof Error ? err.message : 'Failed to open billing portal')
    }
  }

  const planLabel = billing?.isSubscribed
    ? billing.planInterval === 'year' ? 'Pro Yearly' : 'Pro Monthly'
    : 'Free'
  const isCreditsExhausted = Boolean(billing && !billing.isSubscribed && billing.freeCreditsRemaining <= 0)
  const billingNotice = billingActionError ?? billingError
  const renewalDate = billing?.currentPeriodEnd
    ? new Date(billing.currentPeriodEnd).toLocaleDateString()
    : null

  return (
    <div className={theme.layout.body}>
      <main className="mx-auto w-full max-w-4xl">
        <nav className={theme.navbar.wrapper}>
          <Link href="/landing" className={theme.navbar.brand}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={theme.navbar.icon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <span>Domain Gazer</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu
              planLabel={planLabel}
              isSubscribed={billing?.isSubscribed}
              billingDisabled={billingAction !== null}
              onUpgrade={() => { void handleCheckout('month') }}
              onManageBilling={() => { void handleManageBilling() }}
            />
          </div>
        </nav>

        <div className="px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-10 text-center sm:mb-12">
            <div className="mb-3">
              <span className={theme.page.heroBadge}>✦ AI-Powered</span>
            </div>
            <h1 className={theme.page.title}>Domain Gazer</h1>
            <p className={theme.page.subtitle}>
              Describe your project, pick your TLDs, and get AI-generated domain names with live availability checks.
            </p>
          </div>

          <section className="mb-8 overflow-hidden rounded-3xl border border-gray-200/80 bg-white/95 shadow-sm dark:border-gray-700/70 dark:bg-gray-900/80">
            <div className="border-b border-gray-100/80 px-5 py-4 dark:border-gray-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">Billing</p>
                  <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {isBillingLoading && !billing ? 'Loading usage' : `${planLabel} plan`}
                  </h2>
                </div>
                {billing?.isSubscribed ? (
                  <button
                    type="button"
                    onClick={() => { void handleManageBilling() }}
                    disabled={billingAction !== null}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Manage Billing
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => { void handleCheckout('month') }}
                      disabled={billingAction !== null}
                      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Upgrade Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => { void handleCheckout('year') }}
                      disabled={billingAction !== null}
                      className="inline-flex items-center justify-center rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-500/40 dark:text-blue-200 dark:hover:bg-blue-900/20"
                    >
                      Upgrade Yearly
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 px-5 py-5">
              {billing?.isSubscribed ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    Unlimited AI usage is active.
                  </p>
                  <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-200/80">
                    {billing.cancelAtPeriodEnd && renewalDate
                      ? `Your subscription will end on ${renewalDate}.`
                      : renewalDate
                        ? `Your current billing period renews on ${renewalDate}.`
                        : 'You can update your plan, payment method, or cancellation settings in the billing portal.'}
                  </p>
                </div>
              ) : billing ? (
                <div className={`rounded-2xl border px-4 py-4 ${isCreditsExhausted
                  ? 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/70'}`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {billing.freeCreditsUsed} / {billing.freeCreditsTotal} free credits used
                      </p>
                      <p className={`mt-1 text-sm ${isCreditsExhausted ? 'text-red-700 dark:text-red-200' : 'text-gray-600 dark:text-gray-300'}`}>
                        {isCreditsExhausted
                          ? 'Your free credits are exhausted. Upgrade to continue using AI features.'
                          : `${billing.freeCreditsRemaining} free credits remaining before a subscription is required.`}
                      </p>
                    </div>
                    <p className={`text-2xl font-semibold ${isCreditsExhausted ? 'text-red-700 dark:text-red-200' : 'text-gray-900 dark:text-gray-100'}`}>
                      {billing.usagePercent}%
                    </p>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full rounded-full transition-all ${isCreditsExhausted ? 'bg-red-500' : 'bg-blue-600'}`}
                      style={{ width: `${billing.usagePercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Billing status will appear here once it loads.
                </p>
              )}

              {billingNotice && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                  {billingNotice}
                </p>
              )}
            </div>
          </section>

          <div className={theme.page.searchCard}>
            <SearchForm
              isSearching={status === 'searching'}
              onSearch={handleSearch}
              onCancel={cancel}
              hideTldSelector={isTldSelectionLocked}
              hasResults={results.length > 0}
              onClearResults={() => setIsClearConfirmOpen(true)}
              initialDescription={initialDescription}
              initialTlds={initialTlds}
              searchHistory={searchHistory}
              onDeleteHistory={handleDeleteHistory}
            />
          </div>

          <ResultsPanel
            results={results}
            nameBatches={nameBatches}
            status={status}
            errorMessage={errorMessage}
            tlds={selectedTlds}
            searchDescription={searchDescription}
            isCheckingCustom={isCheckingCustom}
            isWaitingForNewRows={isWaitingForNewRows}
            onGenerateMore={handleGenerateMore}
            onCheckCustom={checkCustom}
            onAddTldForBase={handleAddTldForBase}
            onBillableActionCompleted={() => {
              void refreshBilling()
            }}
          />

          <ClearResultsModal
            isOpen={isClearConfirmOpen}
            onCancel={() => setIsClearConfirmOpen(false)}
            onConfirm={() => {
              setIsClearConfirmOpen(false)
              handleClear()
            }}
          />

          <footer className={theme.footer.wrapper}>
            <p className={theme.footer.text}>© 2025 Domain Gazer · Find your perfect domain name with AI</p>
          </footer>
        </div>
      </main>
    </div>
  )
}
