'use client'

import { useState } from 'react'
import { SearchForm } from '@/components/SearchForm'
import { ResultsPanel } from '@/components/ResultsPanel'
import { useDomainSearch } from '@/hooks/useDomainSearch'
import type { TLD } from '@/lib/types'

export default function Home() {
  const { results, status, currentRound, errorMessage, isCheckingCustom, search, generateMore, cancel, checkCustom, checkNewTld, setActiveTlds } = useDomainSearch()
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

  const handleGenerateMore = () => {
    const baseNames = Array.from(new Set(results.map((r) => r.baseName)))
    generateMore(baseNames)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Domain Finder</h1>
        <p className="text-gray-500 text-sm">
          Describe your project, pick TLDs, and get AI-generated domain names checked for availability.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <SearchForm
          isSearching={status === 'searching'}
          onSearch={handleSearch}
          onCancel={cancel}
          onTldsChange={handleTldsChange}
        />
      </div>

      <ResultsPanel
        results={results}
        status={status}
        currentRound={currentRound}
        errorMessage={errorMessage}
        tlds={selectedTlds}
        isCheckingCustom={isCheckingCustom}
        onGenerateMore={handleGenerateMore}
        onCheckCustom={checkCustom}
      />
    </main>
  )
}
