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

const statusConfig: Record<DomainStatus, { label: string; cellClass: string }> = {
  CHECKING: { label: 'Verifying availability...', cellClass: 'text-gray-400' },
  STOPPED: { label: 'Stopped', cellClass: 'bg-gray-100 text-gray-600 font-medium' },
  AVAILABLE: { label: 'Available', cellClass: 'bg-green-100 text-green-700 font-semibold' },
  UNAVAILABLE: { label: 'Taken', cellClass: 'text-red-400' },
  RESERVED: { label: 'Reserved', cellClass: 'text-yellow-600' },
  UNSUPPORTED: { label: 'N/A', cellClass: 'text-gray-300' },
  ERROR: { label: 'Error', cellClass: 'text-orange-400' },
}

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
  const [statusRowHeight, setStatusRowHeight] = useState(0)
  const hintRef = useRef<HTMLInputElement>(null)
  const newRowsAnchorRef = useRef<HTMLDivElement>(null)
  const statusRowRef = useRef<HTMLDivElement>(null)
  const prevStatusRef = useRef(status)
  const prevBaseNameCountRef = useRef(0)
  const autoScrollNewRowsRef = useRef(false)

  // Collect unique base names in order of first appearance
  const allBaseNames = Array.from(new Set(results.map((r) => r.baseName)))
  const baseNameCount = allBaseNames.length

  useEffect(() => {
    const prevStatus = prevStatusRef.current
    const prevBaseNameCount = prevBaseNameCountRef.current

    if (status === 'searching' && prevStatus !== 'searching') {
      // Generate more keeps previous results while switching to searching.
      autoScrollNewRowsRef.current = results.length > 0
    } else if (status !== 'searching') {
      autoScrollNewRowsRef.current = false
    }

    // Once verification finishes, return focus to the steering input.
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

  useEffect(() => {
    const statusRow = statusRowRef.current
    if (!statusRow) return

    const updateHeight = () => {
      const nextHeight = Math.ceil(statusRow.getBoundingClientRect().height)
      setStatusRowHeight((prevHeight) => (prevHeight === nextHeight ? prevHeight : nextHeight))
    }

    updateHeight()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateHeight)
      return () => {
        window.removeEventListener('resize', updateHeight)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      updateHeight()
    })

    resizeObserver.observe(statusRow)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = customInput.trim().toLowerCase().replace(/\s+/g, '').replace(/\.$/, '')
    if (!name || !onCheckCustom) return
    onCheckCustom(name)
    setCustomInput('')
  }

  if (status === 'idle' && results.length === 0) return null

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
  const canExport =
    baseNames.length > 0 &&
    tlds.length > 0 &&
    baseNames.every((baseName) =>
      tlds.every((tld) => {
        const result = resultMap.get(`${baseName}${tld}`)
        return Boolean(result) && result.status !== 'CHECKING' && result.status !== 'STOPPED'
      })
    )

  const handleExportCsv = () => {
    if (!canExport) return

    const rows = baseNames.map((baseName) =>
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

  return (
    <div className="space-y-4">
      {/* Status bar + Filter */}
      <div
        ref={statusRowRef}
        className="sticky top-0 z-30 flex flex-col gap-3 bg-white/95 py-2 text-sm text-gray-600 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-center gap-3">
          {status === 'searching' && (
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
          {(status === 'searching' || status === 'done') && (
            <>
              <span>
                {totalCount > 0 ? `${checkedCount} / ${totalCount} checked` : 'Generating and checking names'}
                {availableCount > 0 && (
                  <span className="text-green-600 font-medium"> · {availableCount} available</span>
                )}
              </span>
            </>
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
        <div className="flex flex-wrap items-center gap-3">
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
            <div className="flex items-center gap-3">
              <button
                onClick={onClear}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear results
              </button>
              <button
                onClick={handleExportCsv}
                disabled={!canExport}
                className="text-sm text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:text-gray-300"
              >
                Export
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {(baseNames.length > 0 || showWorkingRow) && tlds.length > 0 && (
        <div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-white">
                <tr className="border-b border-gray-100">
                  {tlds.map((tld) => (
                    <th
                      key={tld}
                      className="sticky z-20 border-b border-gray-100 bg-white px-3 py-3 text-left font-medium text-gray-500 sm:px-4"
                      style={{ top: `${statusRowHeight}px` }}
                    >
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
                          <td key={tld} className="px-3 py-2.5 text-xs text-gray-200 sm:px-4">—</td>
                        )
                      }
                      const { label, cellClass } = statusConfig[result.status]
                      return (
                        <td key={tld} className="px-3 py-2.5 sm:px-4">
                          <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                            <span className="break-all font-mono font-medium text-gray-800">{result.fullDomain}</span>
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
                    <td colSpan={tlds.length} className="px-3 py-3 text-sm text-blue-700 sm:px-4">
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
          <div ref={newRowsAnchorRef} />
        </div>
      )}

      {/* Add your own idea */}
      {onCheckCustom && tlds.length > 0 && (
        <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 sm:w-auto"
          >
            {isCheckingCustom ? 'Checking…' : 'Check availability'}
          </button>
        </form>
      )}

      {/* Generate more */}
      {(status === 'done' || status === 'cancelled' || status === 'searching') && onGenerateMore && (
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
          <input
            ref={hintRef}
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && status !== 'searching') { onGenerateMore(hint) } }}
            placeholder="Steer AI: e.g. short, techy, playful…"
            disabled={status === 'searching'}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
          />
          <button
            onClick={() => { onGenerateMore(hint) }}
            disabled={status === 'searching'}
            className="w-full whitespace-normal rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent sm:w-auto sm:whitespace-nowrap"
          >
            {status === 'searching' ? 'Generating and verifying names…' : 'Generate more names'}
          </button>
        </div>
      )}
    </div>
  )
}
