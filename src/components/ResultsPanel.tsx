'use client'

import { useState } from 'react'
import type { DomainResult, DomainStatus, TLD } from '@/lib/types'

interface ResultsPanelProps {
  results: DomainResult[]
  status: 'idle' | 'searching' | 'done' | 'error'
  currentRound: number
  errorMessage: string | null
  tlds: TLD[]
  isCheckingCustom?: boolean
  onGenerateMore?: () => void
  onCheckCustom?: (baseName: string) => void
}

const statusConfig: Record<DomainStatus, { label: string; cellClass: string }> = {
  CHECKING: { label: 'Verifying availability...', cellClass: 'text-gray-400' },
  AVAILABLE: { label: 'Available', cellClass: 'bg-green-100 text-green-700 font-semibold' },
  UNAVAILABLE: { label: 'Taken', cellClass: 'text-red-400' },
  RESERVED: { label: 'Reserved', cellClass: 'text-yellow-600' },
  UNSUPPORTED: { label: 'N/A', cellClass: 'text-gray-300' },
  ERROR: { label: 'Error', cellClass: 'text-orange-400' },
}

export function ResultsPanel({ results, status, currentRound, errorMessage, tlds, isCheckingCustom, onGenerateMore, onCheckCustom }: ResultsPanelProps) {
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [customInput, setCustomInput] = useState('')

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = customInput.trim().toLowerCase().replace(/\s+/g, '').replace(/\.$/, '')
    if (!name || !onCheckCustom) return
    onCheckCustom(name)
    setCustomInput('')
  }

  if (status === 'idle' && results.length === 0) return null

  // Collect unique base names in order of first appearance
  const allBaseNames = Array.from(new Set(results.map((r) => r.baseName)))

  // Index results by baseName+tld
  const resultMap = new Map(results.map((r) => [`${r.baseName}${r.tld}`, r]))

  const availableCount = results.filter((r) => r.status === 'AVAILABLE').length

  const baseNames = showAvailableOnly
    ? allBaseNames.filter((name) =>
        tlds.some((tld) => resultMap.get(`${name}${tld}`)?.status === 'AVAILABLE')
      )
    : allBaseNames

  return (
    <div className="space-y-4">
      {/* Status bar + Filter */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-3">
          {status === 'searching' && (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>
                Searching{currentRound > 1 ? ` (round ${currentRound})` : ''}…
              </span>
            </>
          )}
          {status === 'done' && (
            <span className="text-gray-500">
              Done — {availableCount} available out of {results.length} checked
            </span>
          )}
          {status === 'error' && (
            <span className="text-red-600">Error: {errorMessage}</span>
          )}
        </div>
        {results.length > 0 && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
            />
            Show available only
          </label>
        )}
      </div>

      {/* Table */}
      {baseNames.length > 0 && tlds.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-gray-100">
                {tlds.map((tld) => (
                  <th key={tld} className="text-left px-4 py-3 font-medium text-gray-500">
                    {tld}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {baseNames.map((baseName, i) => (
                <tr
                  key={baseName}
                  className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}
                >
                  {tlds.map((tld) => {
                    const result = resultMap.get(`${baseName}${tld}`)
                    if (!result) {
                      return (
                        <td key={tld} className="px-4 py-2.5 text-gray-200 text-xs">—</td>
                      )
                    }
                    const { label, cellClass } = statusConfig[result.status]
                    return (
                      <td key={tld} className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-gray-800 font-medium">{result.fullDomain}</span>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${cellClass}`}>
                            {label}
                          </span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add your own idea */}
      {onCheckCustom && tlds.length > 0 && (
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Add your own idea (e.g. myapp)"
            disabled={isCheckingCustom}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!customInput.trim() || isCheckingCustom}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            {isCheckingCustom ? 'Checking…' : 'Check availability'}
          </button>
        </form>
      )}

      {/* Generate more */}
      {(status === 'done' || (status === 'searching')) && onGenerateMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onGenerateMore}
            disabled={status === 'searching'}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            {status === 'searching' ? 'Generating and verifying names…' : 'Generate more names'}
          </button>
        </div>
      )}
    </div>
  )
}
