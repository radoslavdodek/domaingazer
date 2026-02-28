'use client'

import { useState } from 'react'
import { SearchForm } from '@/components/SearchForm'
import { ResultsPanel } from '@/components/ResultsPanel'
import { ClearResultsModal } from '@/components/results/ClearResultsModal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserMenu } from '@/components/UserMenu'
import { useDomainSearch } from '@/hooks/useDomainSearch'
import { useTheme } from '@/contexts/ThemeContext'
import type { TLD } from '@/lib/types'

export default function Home() {
  const { theme } = useTheme()
  const { results, nameBatches, status, errorMessage, isCheckingCustom, isWaitingForNewRows, search, generateMore, cancel, clearResults, checkCustom, checkNewTld } = useDomainSearch()
  const [selectedTlds, setSelectedTlds] = useState<TLD[]>([])
  const [searchDescription, setSearchDescription] = useState('')
  const [isTldSelectionLocked, setIsTldSelectionLocked] = useState(false)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)

  const handleSearch = (description: string, tlds: TLD[]) => {
    setSelectedTlds(tlds)
    setSearchDescription(description)
    setIsTldSelectionLocked(true)
    search(description, tlds)
  }

  const handleAddTldForBase = (baseName: string, tld: TLD) => {
    checkNewTld(tld, [baseName])
  }

  const handleGenerateMore = (hint: string) => {
    const baseNames = Array.from(new Set(results.map((r) => r.baseName)))
    generateMore(baseNames, hint || undefined)
  }

  const handleClear = () => {
    clearResults()
    setSearchDescription('')
    setSelectedTlds([])
    setIsTldSelectionLocked(false)
  }

  return (
    <div className={theme.layout.body}>
      <main className="mx-auto w-full max-w-4xl">
        <nav className={theme.navbar.wrapper}>
          <div className={theme.navbar.brand}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={theme.navbar.icon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <span>Domain Gazer</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
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

          <div className={theme.page.searchCard}>
            <SearchForm
              isSearching={status === 'searching'}
              onSearch={handleSearch}
              onCancel={cancel}
              hideTldSelector={isTldSelectionLocked}
              hasResults={results.length > 0}
              onClearResults={() => setIsClearConfirmOpen(true)}
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
