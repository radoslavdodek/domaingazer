'use client'

import { useEffect, useRef, useState } from 'react'
import type { DomainResult, DomainStatus, TLD } from '@/lib/types'

interface ResultsPanelProps {
  results: DomainResult[]
  status: 'idle' | 'searching' | 'done' | 'cancelled' | 'error'
  currentRound: number
  errorMessage: string | null
  tlds: TLD[]
  isCheckingCustom?: boolean
  isWaitingForNewRows?: boolean
  onGenerateMore?: (hint: string) => void
  onCheckCustom?: (baseName: string) => void
  onClear?: () => void
}

const statusConfig: Record<DomainStatus, { label: string; cellClass: string }> = {
  CHECKING: { label: 'Verifying availability...', cellClass: 'text-gray-400' },
  STOPPED: { label: 'Stopped', cellClass: 'bg-gray-100 text-gray-600 font-medium' },
  AVAILABLE: { label: 'Available', cellClass: 'bg-green-100 text-green-700 font-semibold' },
  UNAVAILABLE: { label: 'Taken', cellClass: 'text-red-400' },
  RESERVED: { label: 'Reserved', cellClass: 'text-yellow-600' },
  UNSUPPORTED: { label: 'N/A', cellClass: 'text-gray-300' },
  ERROR: { label: 'Error', cellClass: 'text-orange-400' },
}

export function ResultsPanel({
  results,
  status,
  currentRound,
  errorMessage,
  tlds,
  isCheckingCustom,
  isWaitingForNewRows,
  onGenerateMore,
  onCheckCustom,
  onClear,
}: ResultsPanelProps) {
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [hint, setHint] = useState('')
  const hintRef = useRef<HTMLInputElement>(null)
  const refocusHint = useRef(false)

  useEffect(() => {
    if (refocusHint.current && status !== 'searching') {
      refocusHint.current = false
      hintRef.current?.focus()
    }
  }, [status])

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
  const checkedCount = results.filter((r) => r.status !== 'CHECKING').length
  const totalCount = results.length

  const baseNames = showAvailableOnly
    ? allBaseNames.filter((name) =>
        tlds.some((tld) => {
          const status = resultMap.get(`${name}${tld}`)?.status
          return status === 'AVAILABLE' || status === 'CHECKING'
        })
      )
    : allBaseNames
  const showWorkingRow = status === 'searching' && Boolean(isWaitingForNewRows)

  return (
    <div className="space-y-4">
      {/* Status bar + Filter */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-3">
          {status === 'searching' && (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>
                Round {currentRound}
                {totalCount > 0 && (
                  <> · {checkedCount} / {totalCount} checked</>
                )}
                {availableCount > 0 && (
                  <span className="text-green-600 font-medium"> · {availableCount} available</span>
                )}
              </span>
            </>
          )}
          {status === 'done' && (
            <span className="text-gray-500">
              Done — {availableCount} available out of {results.length} checked
            </span>
          )}
          {status === 'cancelled' && (
            <span className="text-gray-500">
              Cancelled — {availableCount} available out of {results.length} checked
            </span>
          )}
          {status === 'error' && (
            <span className="text-red-600">Error: {errorMessage}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
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
          {onClear && (
            <button
              onClick={onClear}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear results
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {(baseNames.length > 0 || showWorkingRow) && tlds.length > 0 && (
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
              {showWorkingRow && (
                <tr className="border-b border-gray-50 last:border-0 bg-blue-50/40">
                  <td colSpan={tlds.length} className="px-4 py-3 text-sm text-blue-700">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span>Working on more names. New rows should appear shortly.</span>
                    </div>
                  </td>
                </tr>
              )}
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
      {(status === 'done' || status === 'cancelled' || status === 'searching') && onGenerateMore && (
        <div className="flex items-center gap-2 pt-2">
          <input
            ref={hintRef}
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && status !== 'searching') { refocusHint.current = true; onGenerateMore(hint) } }}
            placeholder="Steer AI: e.g. short, techy, playful…"
            disabled={status === 'searching'}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          />
          <button
            onClick={() => { onGenerateMore(hint) }}
            disabled={status === 'searching'}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent whitespace-nowrap"
          >
            {status === 'searching' ? 'Generating and verifying names…' : 'Generate more names'}
          </button>
        </div>
      )}
    </div>
  )
}
