'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { openBillingPortal } from '@/lib/billing-client'
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
  const { theme, themeName } = useTheme()
  const { results, nameBatches, status, errorMessage, isCheckingCustom, isWaitingForNewRows, search, generateMore, cancel, clearResults, checkCustom, checkNewTld } = useDomainSearch()
  const { billing, isLoading: isBillingLoading, error: billingError, refresh: refreshBilling } = useBillingStatus()
  const [selectedTlds, setSelectedTlds] = useState<TLD[]>([])
  const [searchDescription, setSearchDescription] = useState('')
  const [isTldSelectionLocked, setIsTldSelectionLocked] = useState(false)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([])
  const [initialDescription, setInitialDescription] = useState<string | undefined>(undefined)
  const [initialTlds, setInitialTlds] = useState<TLD[] | undefined>(undefined)
  const [billingAction, setBillingAction] = useState<'portal' | null>(null)
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

  const handleClearAllHistory = () => {
    setSearchHistory([])
    fetch('/api/search-history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {/* ignore */})
  }

  const handleClear = () => {
    clearResults()
    setSearchDescription('')
    setSelectedTlds([])
    setIsTldSelectionLocked(false)
  }

  const handleUpgrade = () => {
    window.location.assign('/billing')
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
  const showBillingSection = Boolean(billingError) || Boolean(billing && !billing.isSubscribed)
  const isMidnightTheme = themeName === 'midnight'

  return (
    <div className={theme.layout.body}>
      <main className="mx-auto w-full max-w-4xl">
        <nav className={`${theme.navbar.wrapper} gap-3`}>
          <Link href="/landing" className={`${theme.navbar.brand} min-w-0`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className={theme.navbar.icon}>
              <defs><linearGradient id="nav-g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
              <circle cx="16" cy="16" r="15" fill="url(#nav-g)"/>
              <path d="M6 16 C6 16, 11 9, 16 9 C21 9, 26 16, 26 16 C26 16, 21 23, 16 23 C11 23, 6 16, 6 16Z" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
              <circle cx="16" cy="16" r="1.8" fill="#6366f1"/>
            </svg>
            <span className="truncate">Domain Gazer</span>
          </Link>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            {billing?.isSubscribed && (
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                isMidnightTheme
                  ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}>
                {planLabel}
              </span>
            )}
            <ThemeToggle />
            <UserMenu
              planLabel={billing ? planLabel : undefined}
              isSubscribed={billing?.isSubscribed}
              billingDisabled={billingAction !== null}
              onUpgrade={billing && !billing.isSubscribed
                ? handleUpgrade
                : undefined}
              onManageBilling={billing?.isSubscribed
                ? () => { void handleManageBilling() }
                : undefined}
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

          {showBillingSection && (
            <section className={`mb-8 overflow-hidden rounded-3xl border ${
              isMidnightTheme
                ? 'border-zinc-800 bg-zinc-900 shadow-lg shadow-black/20'
                : 'border-gray-200/80 bg-white/95 shadow-sm'
            }`}>
              <div className={`border-b px-5 py-4 ${
                isMidnightTheme ? 'border-zinc-800' : 'border-gray-100/80'
              }`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                      isMidnightTheme ? 'text-sky-400' : 'text-blue-600'
                    }`}>Billing</p>
                    <h2 className={`mt-1 text-lg font-semibold ${
                      isMidnightTheme ? 'text-zinc-100' : 'text-gray-900'
                    }`}>
                      {isBillingLoading && !billing ? 'Loading usage' : `${planLabel} plan`}
                    </h2>
                  </div>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={handleUpgrade}
                      disabled={billingAction !== null}
                      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        isMidnightTheme ? 'bg-sky-600 hover:bg-sky-500' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mr-2 h-4 w-4">
                        <path d="M3 5.75a.75.75 0 0 1 1.18-.615l3.07 2.193 2.316-4.054a.75.75 0 0 1 1.304 0l2.316 4.054 3.07-2.193A.75.75 0 0 1 17 5.75V8a.75.75 0 0 1-.03.212l-1.5 5.25A.75.75 0 0 1 14.75 14h-9.5a.75.75 0 0 1-.72-.538l-1.5-5.25A.75.75 0 0 1 3 8V5.75Z" />
                        <path d="M6.25 15.5a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1-.75-.75Z" />
                      </svg>
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-5 py-5">
                {billing ? (
                  <div className={`rounded-2xl border px-4 py-4 ${isCreditsExhausted
                    ? isMidnightTheme
                      ? 'border-red-900/60 bg-red-950/30'
                      : 'border-red-200 bg-red-50'
                    : isMidnightTheme
                      ? 'border-zinc-800 bg-zinc-950/70'
                      : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isMidnightTheme ? 'text-zinc-100' : 'text-gray-900'}`}>
                          {billing.freeCreditsUsed} / {billing.freeCreditsTotal} free credits used
                        </p>
                        <p className={`mt-1 text-sm ${isCreditsExhausted
                          ? isMidnightTheme ? 'text-red-200' : 'text-red-700'
                          : isMidnightTheme ? 'text-zinc-400' : 'text-gray-600'}`}>
                          {isCreditsExhausted
                            ? 'Your free credits are exhausted. Upgrade to continue using AI features.'
                            : `${billing.freeCreditsRemaining} free credits remaining before a subscription is required.`}
                        </p>
                      </div>
                      <p className={`text-2xl font-semibold ${isCreditsExhausted
                        ? isMidnightTheme ? 'text-red-200' : 'text-red-700'
                        : isMidnightTheme ? 'text-zinc-100' : 'text-gray-900'}`}>
                        {billing.usagePercent}%
                      </p>
                    </div>
                    <div className={`mt-4 h-2.5 overflow-hidden rounded-full ${
                      isMidnightTheme ? 'bg-zinc-800' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-full rounded-full transition-all ${isCreditsExhausted ? 'bg-red-500' : 'bg-blue-600'}`}
                        style={{ width: `${billing.usagePercent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm ${isMidnightTheme ? 'text-zinc-500' : 'text-gray-500'}`}>
                    Billing status will appear here once it loads.
                  </p>
                )}

                {billingNotice && (
                  <p className={`rounded-2xl border px-4 py-3 text-sm ${
                    isMidnightTheme
                      ? 'border-red-900/60 bg-red-950/30 text-red-200'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}>
                    {billingNotice}
                  </p>
                )}
              </div>
            </section>
          )}

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
              onClearAllHistory={handleClearAllHistory}
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
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className={theme.footer.text}>© 2026 Domain Gazer · Find your perfect domain name with AI</p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
                <Link href="/settings/privacy" className="underline underline-offset-2">
                  Privacy &amp; Data
                </Link>
                <Link href="/privacy" className="underline underline-offset-2">
                  Privacy Policy
                </Link>
                <Link href="/cookies" className="underline underline-offset-2">
                  Cookie Policy
                </Link>
                <Link href="/terms" className="underline underline-offset-2">
                  Terms
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
