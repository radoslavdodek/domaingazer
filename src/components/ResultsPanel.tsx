'use client'

import { useEffect, useRef, useState } from 'react'
import type { DomainResult, DomainStatus, TLD } from '@/lib/types'

interface ResultsPanelProps {
  results: DomainResult[]
  status: 'idle' | 'searching' | 'done' | 'cancelled' | 'error'
  errorMessage: string | null
  tlds: TLD[]
  isCheckingCustom?: boolean
  isWaitingForNewRows?: boolean
  onGenerateMore?: (hint: string) => void
  onCheckCustom?: (baseName: string) => void
  onClear?: () => void
}

const statusConfig: Record<DomainStatus, { label: string; badgeClass: string }> = {
  CHECKING: { label: 'Checking', badgeClass: 'border border-gray-200 bg-gray-100 text-gray-600 font-medium' },
  STOPPED: { label: 'Stopped', badgeClass: 'border border-gray-200 bg-gray-100 text-gray-600 font-medium' },
  AVAILABLE: { label: 'AVAILABLE', badgeClass: 'border border-green-200 bg-green-100 text-green-800 font-bold' },
  UNAVAILABLE: { label: 'TAKEN', badgeClass: 'border border-red-200 bg-red-50 text-red-700 font-semibold' },
  RESERVED: { label: 'Reserved', badgeClass: 'border border-yellow-200 bg-yellow-50 text-yellow-700 font-medium' },
  UNSUPPORTED: { label: 'N/A', badgeClass: 'border border-gray-200 bg-gray-100 text-gray-500 font-medium' },
  ERROR: { label: 'Error', badgeClass: 'border border-orange-200 bg-orange-50 text-orange-700 font-medium' },
}

const secondaryButtonClass = 'w-full rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white sm:w-auto'

function escapeCsvValue(value: string): string {
  if (/["\n,]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function ResultsPanel({
  results,
  status,
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
  const [activeTld, setActiveTld] = useState<TLD | null>(null)
  const hintRef = useRef<HTMLInputElement>(null)
  const newRowsAnchorRef = useRef<HTMLDivElement>(null)
  const prevStatusRef = useRef(status)
  const prevBaseNameCountRef = useRef(0)
  const autoScrollNewRowsRef = useRef(false)

  useEffect(() => {
    if (!activeTld || !tlds.includes(activeTld)) {
      setActiveTld(tlds[0] ?? null)
    }
  }, [tlds, activeTld])

  const allBaseNames = Array.from(new Set(results.map((r) => r.baseName)))
  const baseNameCount = allBaseNames.length

  useEffect(() => {
    const prevStatus = prevStatusRef.current
    const prevBaseNameCount = prevBaseNameCountRef.current

    if (status === 'searching' && prevStatus !== 'searching') {
      autoScrollNewRowsRef.current = results.length > 0
    } else if (status !== 'searching') {
      autoScrollNewRowsRef.current = false
    }

    if (prevStatus === 'searching' && status !== 'searching') {
      requestAnimationFrame(() => {
        hintRef.current?.focus()
      })
    }

    if (autoScrollNewRowsRef.current && status === 'searching' && baseNameCount > prevBaseNameCount) {
      requestAnimationFrame(() => {
        newRowsAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      })
    }

    prevStatusRef.current = status
    prevBaseNameCountRef.current = baseNameCount
  }, [status, results.length, baseNameCount])

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = customInput.trim().toLowerCase().replace(/\s+/g, '').replace(/\.$/, '')
    if (!name || !onCheckCustom) return
    onCheckCustom(name)
    setCustomInput('')
  }

  if (status === 'idle' && results.length === 0) return null

  const resultMap = new Map(results.map((r) => [`${r.baseName}${r.tld}`, r]))
  const availableCount = results.filter((r) => r.status === 'AVAILABLE').length
  const checkedCount = results.filter((r) => r.status !== 'CHECKING').length
  const totalCount = results.length

  const exportBaseNames = showAvailableOnly
    ? allBaseNames.filter((name) =>
        tlds.some((tld) => {
          const rowStatus = resultMap.get(`${name}${tld}`)?.status
          return rowStatus === 'AVAILABLE' || rowStatus === 'CHECKING'
        })
      )
    : allBaseNames

  const tldCounts = tlds.reduce<Record<TLD, number>>((acc, tld) => {
    acc[tld] = allBaseNames.reduce((count, baseName) => {
      const row = resultMap.get(`${baseName}${tld}`)
      if (!row) return count
      if (showAvailableOnly && row.status !== 'AVAILABLE' && row.status !== 'CHECKING') return count
      return count + 1
    }, 0)
    return acc
  }, {} as Record<TLD, number>)

  const visibleRows = activeTld
    ? allBaseNames
        .map((baseName) => resultMap.get(`${baseName}${activeTld}`))
        .filter((row): row is DomainResult => Boolean(row))
        .filter((row) => !showAvailableOnly || row.status === 'AVAILABLE' || row.status === 'CHECKING')
    : []

  const showWorkingRow = status === 'searching' && Boolean(isWaitingForNewRows)
  const canExport =
    exportBaseNames.length > 0 &&
    tlds.length > 0 &&
    exportBaseNames.every((baseName) =>
      tlds.every((tld) => {
        const result = resultMap.get(`${baseName}${tld}`)
        if (!result) return false
        return result.status !== 'CHECKING' && result.status !== 'STOPPED'
      })
    )

  const handleExportCsv = () => {
    if (!canExport) return

    const rows = exportBaseNames.map((baseName) =>
      tlds.map((tld) => {
        const result = resultMap.get(`${baseName}${tld}`)
        if (!result) return '—'
        const { label } = statusConfig[result.status]
        return `${result.fullDomain} (${label})`
      })
    )

    const csvLines = [tlds, ...rows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
      .join('\n')

    const blob = new Blob([`\uFEFF${csvLines}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    link.href = url
    link.download = `domain-results-${timestamp}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const runVariationSearch = (baseName: string) => {
    if (!onGenerateMore || status === 'searching') return
    const variationPrompt = `Similar to "${baseName}"`
    setHint(variationPrompt)
    onGenerateMore(variationPrompt)
  }

  const showRefinementCard = Boolean(onGenerateMore || onCheckCustom)

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 p-4 text-sm text-gray-600 backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          {status === 'searching' && (
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
          )}
          {(status === 'searching' || status === 'done') && (
            <span>
              {totalCount > 0 ? `${checkedCount} domains checked` : 'Generating and checking domains...'}
              {availableCount > 0 && (
                <span className="font-semibold text-green-700"> {' '}· {availableCount} available</span>
              )}
            </span>
          )}
          {status === 'cancelled' && (
            <span className="text-gray-500">
              Search cancelled. {availableCount} available out of {results.length} checked.
            </span>
          )}
          {status === 'error' && (
            <span className="text-red-600">Error: {errorMessage}</span>
          )}
        </div>

        {tlds.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {tlds.map((tld) => (
              <button
                key={tld}
                type="button"
                onClick={() => setActiveTld(tld)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  activeTld === tld
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                }`}
              >
                {tld} ({tldCounts[tld] ?? 0})
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-4">
          {results.length > 0 && (
            <label className="flex cursor-pointer select-none items-center gap-2">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-blue-600"
              />
              Show available only
            </label>
          )}
          {onClear && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClear}
                className="text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                Clear results
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={!canExport}
                className="text-sm text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                Export
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        {status === 'searching' && totalCount === 0 && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
            ))}
          </div>
        )}

        {activeTld && visibleRows.length > 0 && (
          <div className="space-y-2">
            {visibleRows.map((row) => {
              const { label, badgeClass } = statusConfig[row.status]
              return (
                <div
                  key={row.fullDomain}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-3 sm:px-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <span className="break-all font-mono font-medium text-gray-900">{row.fullDomain}</span>
                      <span className={`inline-block w-fit rounded-full px-2 py-0.5 text-xs ${badgeClass}`}>
                        {label}
                      </span>
                    </div>
                    {onGenerateMore && (
                      <button
                        type="button"
                        onClick={() => runVariationSearch(row.baseName)}
                        disabled={status === 'searching'}
                        className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Try variations
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTld && visibleRows.length === 0 && status !== 'searching' && (
          <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
            {showAvailableOnly
              ? `No available names in ${activeTld} yet. Try turning off the filter or generating more names.`
              : `No results in ${activeTld} yet.`}
          </div>
        )}

        {!activeTld && (
          <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
            Select at least one TLD to view or check results.
          </div>
        )}

        {showWorkingRow && (
          <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              <span>Working on more names. New rows should appear shortly.</span>
            </div>
          </div>
        )}

        <div ref={newRowsAnchorRef} />
      </div>

      {showRefinementCard && (
        <div className="space-y-4 border-t border-gray-100 bg-gray-50/80 p-4 sm:p-5">
          {(status === 'done' || status === 'cancelled' || status === 'searching') && onGenerateMore && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Not quite right? Steer the AI:</label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  ref={hintRef}
                  type="text"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && status !== 'searching') {
                      onGenerateMore(hint)
                    }
                  }}
                  placeholder="e.g. shorter, more playful, finance-focused"
                  disabled={status === 'searching'}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => {
                    onGenerateMore(hint)
                  }}
                  disabled={status === 'searching'}
                  className={secondaryButtonClass}
                >
                  {status === 'searching' ? 'Generating and verifying names...' : 'Generate more names'}
                </button>
              </div>
            </div>
          )}

          {onCheckCustom && tlds.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Add your own idea:</label>
              <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. myapp"
                  disabled={isCheckingCustom}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!customInput.trim() || isCheckingCustom}
                  className={secondaryButtonClass}
                >
                  {isCheckingCustom ? 'Checking...' : 'Check availability'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
