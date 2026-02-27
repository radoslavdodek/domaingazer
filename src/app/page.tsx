'use client'

import { useState } from 'react'
import { SearchForm } from '@/components/SearchForm'
import { ResultsPanel } from '@/components/ResultsPanel'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useDomainSearch } from '@/hooks/useDomainSearch'
import { useTheme } from '@/contexts/ThemeContext'
import type { TLD } from '@/lib/types'

export default function Home() {
  const { theme } = useTheme()
  const { results, nameBatches, status, errorMessage, isCheckingCustom, isWaitingForNewRows, search, generateMore, cancel, clearResults, checkCustom, checkNewTld } = useDomainSearch()
  const [selectedTlds, setSelectedTlds] = useState<TLD[]>([])
  const [searchDescription, setSearchDescription] = useState('')
  const [isTldSelectionLocked, setIsTldSelectionLocked] = useState(false)

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
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-10 text-center sm:mb-12">
          <div className="mb-4 flex justify-center">
            <ThemeToggle />
          </div>
          <h1 className={theme.page.title}>Domain Gazer</h1>
          <p className={theme.page.subtitle}>
            Describe your project, pick TLDs, and get AI-generated domain names checked for availability.
          </p>
        </div>

        <div className={theme.page.searchCard}>
          <SearchForm
            isSearching={status === 'searching'}
            onSearch={handleSearch}
            onCancel={cancel}
            hideTldSelector={isTldSelectionLocked}
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
          onClear={handleClear}
        />
      </main>
    </div>
  )
}
