'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { openBillingPortal } from '@/lib/billing-client'
import { getOptionalItem, removeOptionalItem, setOptionalItem } from '@/lib/privacy/optional-storage'
import { SearchForm } from '@/components/SearchForm'
import { ResultsPanel } from '@/components/ResultsPanel'
import { ClearResultsModal } from '@/components/results/ClearResultsModal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserMenu } from '@/components/UserMenu'
import { ImpersonationBanner } from '@/components/ImpersonationBanner'
import { FeedbackDialog } from '@/components/FeedbackDialog'
import type { SearchContext } from '@/components/FeedbackDialog'
import { useBillingStatus } from '@/hooks/useBillingStatus'
import { useDomainSearch } from '@/hooks/useDomainSearch'
import { useSupportedTlds } from '@/hooks/useSupportedTlds'
import { useTheme } from '@/contexts/ThemeContext'
import { FEATURED_TLDS, type TLD } from '@/lib/types'
import { normalizeTldList } from '@/lib/tlds'

interface SearchHistoryEntry {
  id: string
  description: string
  selected_tlds: TLD[]
}

const FEATURED_TLD_LIST: TLD[] = [...FEATURED_TLDS]
const LS_CUSTOM_TLD_PILLS = 'domaingazer_custom_tld_pills'

interface AppPageProps {
  impersonationLabel: string | null
}

export function AppPage({ impersonationLabel }: AppPageProps) {
  const { theme, themeName } = useTheme()
  const { results, nameBatches, status, errorMessage, isCheckingCustom, isWaitingForNewRows, hasReachedMaxRounds, search, generateMore, cancel, clearResults, checkCustom, checkNewTld, setActiveTlds } = useDomainSearch()
  const { billing, isLoading: isBillingLoading, error: billingError, refresh: refreshBilling } = useBillingStatus()
  const { supportedTlds, isLoading: isLoadingSupportedTlds, error: supportedTldsError } = useSupportedTlds()
  const [selectedTlds, setSelectedTlds] = useState<TLD[]>([])
  const [customTldPills, setCustomTldPills] = useState<TLD[]>([])
  const [searchDescription, setSearchDescription] = useState('')
  const [isTldSelectionLocked, setIsTldSelectionLocked] = useState(false)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([])
  const [initialDescription, setInitialDescription] = useState<string | undefined>(undefined)
  const [initialTlds, setInitialTlds] = useState<TLD[] | undefined>(undefined)
  const resultsPanelRef = useRef<HTMLDivElement>(null)
  const [billingAction, setBillingAction] = useState<'portal' | null>(null)
  const [billingActionError, setBillingActionError] = useState<string | null>(null)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  useEffect(() => {
    const savedCustomTldPills = getOptionalItem(LS_CUSTOM_TLD_PILLS)
    if (!savedCustomTldPills) return

    try {
      const parsed = normalizeTldList(JSON.parse(savedCustomTldPills) as TLD[])
      setCustomTldPills(parsed.filter((tld) => !FEATURED_TLD_LIST.includes(tld)))
    } catch {
      removeOptionalItem(LS_CUSTOM_TLD_PILLS)
    }
  }, [])

  useEffect(() => {
    if (customTldPills.length === 0) {
      removeOptionalItem(LS_CUSTOM_TLD_PILLS)
      return
    }

    setOptionalItem(LS_CUSTOM_TLD_PILLS, JSON.stringify(customTldPills))
  }, [customTldPills])

  useEffect(() => {
    setActiveTlds(selectedTlds)
  }, [selectedTlds, setActiveTlds])

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

  const rememberCustomTld = useCallback((nextTld: TLD | undefined) => {
    if (!nextTld || FEATURED_TLD_LIST.includes(nextTld)) return
    setCustomTldPills((prev) => normalizeTldList([...prev, nextTld]))
  }, [])

  const forgetCustomTld = useCallback((tldToRemove: TLD) => {
    setCustomTldPills((prev) => prev.filter((tld) => tld !== tldToRemove))
    setSelectedTlds((prev) => prev.filter((tld) => tld !== tldToRemove))
  }, [])

  const handleSearch = (description: string, tlds: TLD[]) => {
    rememberCustomTld(tlds[0])
    setSelectedTlds(tlds)
    setSearchDescription(description)
    setIsTldSelectionLocked(true)
    setTimeout(() => {
      resultsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
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
    rememberCustomTld(tld)
    setSelectedTlds((prev) => normalizeTldList([...prev, tld]))
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
      <ImpersonationBanner label={impersonationLabel} />
      <main className="mx-auto w-full max-w-4xl">
        <nav className={`${theme.navbar.wrapper} gap-3`}>
          <Link href="/" className={`${theme.navbar.brand} min-w-0`}>
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
              impersonationLabel={impersonationLabel}
              planLabel={billing ? planLabel : undefined}
              isSubscribed={billing?.isSubscribed}
              billingDisabled={billingAction !== null}
              onUpgrade={billing && !billing.isSubscribed
                ? handleUpgrade
                : undefined}
              onManageBilling={billing?.isSubscribed
                ? () => { void handleManageBilling() }
                : undefined}
              onFeedbackClick={() => setIsFeedbackOpen(true)}
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
              extraTldPills={customTldPills}
              onPinTld={rememberCustomTld}
              onRemovePinnedTld={forgetCustomTld}
              supportedTlds={supportedTlds}
              isLoadingSupportedTlds={isLoadingSupportedTlds}
              supportedTldsError={supportedTldsError}
              searchHistory={searchHistory}
              onDeleteHistory={handleDeleteHistory}
              onClearAllHistory={handleClearAllHistory}
            />
          </div>

          <div ref={resultsPanelRef}>
          <ResultsPanel
            results={results}
            nameBatches={nameBatches}
            status={status}
            errorMessage={errorMessage}
            tlds={selectedTlds}
            customTldPills={customTldPills}
            onRemovePinnedTld={forgetCustomTld}
            searchDescription={searchDescription}
            isCheckingCustom={isCheckingCustom}
            isWaitingForNewRows={isWaitingForNewRows}
            supportedTlds={supportedTlds}
            supportedTldsError={supportedTldsError}
            isLoadingSupportedTlds={isLoadingSupportedTlds}
            onGenerateMore={hasReachedMaxRounds ? undefined : handleGenerateMore}
            onCheckCustom={checkCustom}
            onAddTldForBase={handleAddTldForBase}
            onBillableActionCompleted={() => {
              void refreshBilling()
            }}
          />
          </div>

          <ClearResultsModal
            isOpen={isClearConfirmOpen}
            onCancel={() => setIsClearConfirmOpen(false)}
            onConfirm={() => {
              setIsClearConfirmOpen(false)
              handleClear()
            }}
          />

          <FeedbackDialog
            isOpen={isFeedbackOpen}
            onClose={() => setIsFeedbackOpen(false)}
            searchContext={searchDescription && results.length > 0 ? {
              query: searchDescription,
              results: results.map((r) => ({ fullDomain: r.fullDomain, status: r.status })),
            } satisfies SearchContext : null}
          />

          {billing && (
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className={`fixed bottom-5 right-5 z-40 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-colors ${
                isMidnightTheme
                  ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              aria-label="Share your feedback"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 0 0 1.33 0l1.713-3.293a.783.783 0 0 1 .642-.413 41.102 41.102 0 0 0 3.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2ZM6.75 6a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 2.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
              </svg>
              Share your feedback
            </button>
          )}

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
                <span className="mx-1 hidden sm:inline text-gray-300 dark:text-zinc-600">|</span>
                <div className="flex items-center gap-2">
                  <a href="https://github.com/radoslavdodek/domaingazer" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors" aria-label="View on GitHub" title="View on GitHub">
                    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" /></svg>
                  </a>
                  <a href="https://x.com/intent/tweet?url=https%3A%2F%2Fdomaingazer.com&text=Find%20your%20perfect%20domain%20name%20with%20AI" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors" aria-label="Share on X" title="Share on X">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fdomaingazer.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors" aria-label="Share on LinkedIn" title="Share on LinkedIn">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdomaingazer.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors" aria-label="Share on Facebook" title="Share on Facebook">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
