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
  const { results, nameBatches, status, errorMessage, isCheckingCustom, isWaitingForNewRows, search, generateMore, cancel, clearResults, checkCustom, checkNewTld, setActiveTlds } = useDomainSearch()
  const [selectedTlds, setSelectedTlds] = useState<TLD[]>([])

  const handleSearch = (description: string, tlds: TLD[]) => {
    setSelectedTlds(tlds)
    search(description, tlds)
  }

  const handleTldsChange = (newTlds: TLD[]) => {
    const addedTlds = newTlds.filter((t) => !selectedTlds.includes(t))
    setActiveTlds(newTlds)
    setSelectedTlds(newTlds)
    if (addedTlds.length > 0 && results.length > 0) {
      const baseNames = Array.from(new Set(results.map((r) => r.baseName)))
      for (const tld of addedTlds) {
        checkNewTld(tld, baseNames)
      }
    }
  }

  const handleGenerateMore = (hint: string) => {
    const baseNames = Array.from(new Set(results.map((r) => r.baseName)))
    generateMore(baseNames, hint || undefined)
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
            onTldsChange={handleTldsChange}
          />
        </div>

        <ResultsPanel
          results={results}
          nameBatches={nameBatches}
          status={status}
          errorMessage={errorMessage}
          tlds={selectedTlds}
          isCheckingCustom={isCheckingCustom}
          isWaitingForNewRows={isWaitingForNewRows}
          onGenerateMore={handleGenerateMore}
          onCheckCustom={checkCustom}
          onClear={clearResults}
        />
      </main>
    </div>
  )
}
