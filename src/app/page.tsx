'use client'

import { useState } from 'react'
import { SearchForm } from '@/components/SearchForm'
import { ResultsPanel } from '@/components/ResultsPanel'
import { useDomainSearch } from '@/hooks/useDomainSearch'
import type { TLD } from '@/lib/types'

export default function Home() {
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
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 text-center sm:mb-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Domain Finder</h1>
        <p className="mx-auto max-w-2xl text-sm text-gray-500">
          Describe your project, pick TLDs, and get AI-generated domain names checked for availability.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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
  )
}
