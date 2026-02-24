'use client'

import { useEffect, useRef, useState } from 'react'
import { DOMAIN_STATUS_LABELS } from '@/lib/domainStatus'
import type { DomainResult, TLD } from '@/lib/types'
import { BaseNameGroupList } from './results/BaseNameGroupList'
import { ClearResultsModal } from './results/ClearResultsModal'
import { RefinementCard } from './results/RefinementCard'
import { ResultsHeader } from './results/ResultsHeader'
import type { SearchStatus } from './results/types'

interface ResultsPanelProps {
  results: DomainResult[]
  nameBatches?: string[][]
  status: SearchStatus
  errorMessage: string | null
  tlds: TLD[]
  isCheckingCustom?: boolean
  isWaitingForNewRows?: boolean
  onGenerateMore?: (hint: string) => void
  onCheckCustom?: (baseName: string) => void
  onClear?: () => void
}

function escapeCsvValue(value: string): string {
  if (/["\n,]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function ResultsPanel({
  results,
  nameBatches = [],
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
  const [hint, setHint] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
  const hintRef = useRef<HTMLInputElement>(null)
  const newRowsAnchorRef = useRef<HTMLDivElement>(null)
  const prevStatusRef = useRef(status)
  const prevBaseNameCountRef = useRef(0)
  const autoScrollNewRowsRef = useRef(false)

  const allBaseNames = Array.from(new Set(results.map((result) => result.baseName)))
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
        const hintInput = hintRef.current
        if (!hintInput) return
        try {
          hintInput.focus({ preventScroll: true })
        } catch {
          hintInput.focus()
        }
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
    if (!isClearConfirmOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsClearConfirmOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isClearConfirmOpen])

  if (status === 'idle' && results.length === 0) return null

  const resultMap = new Map(results.map((result) => [`${result.baseName}${result.tld}`, result]))
  const availableCount = results.filter((result) => result.status === 'AVAILABLE').length
  const checkedCount = results.filter((result) => result.status !== 'CHECKING').length
  const totalCount = results.length

  const exportBaseNames = showAvailableOnly
    ? allBaseNames.filter((name) =>
        tlds.some((tld) => {
          const rowStatus = resultMap.get(`${name}${tld}`)?.status
          return rowStatus === 'AVAILABLE' || rowStatus === 'CHECKING'
        })
      )
    : allBaseNames

  const visibleBaseNames = exportBaseNames
  const visibleBaseNameSet = new Set(visibleBaseNames)
  const groupedVisibleBaseNames = nameBatches
    .map((batch) => batch.filter((name) => visibleBaseNameSet.has(name)))
    .filter((batch) => batch.length > 0)
  const groupedVisibleSet = new Set(groupedVisibleBaseNames.flat())
  const ungroupedVisibleBaseNames = visibleBaseNames.filter((name) => !groupedVisibleSet.has(name))
  if (ungroupedVisibleBaseNames.length > 0) groupedVisibleBaseNames.push(ungroupedVisibleBaseNames)

  const tldCounts = tlds.reduce<Record<TLD, number>>((acc, tld) => {
    acc[tld] = visibleBaseNames.reduce((count, baseName) => {
      const row = resultMap.get(`${baseName}${tld}`)
      if (!row) return count
      return count + 1
    }, 0)
    return acc
  }, {} as Record<TLD, number>)

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
        const label = DOMAIN_STATUS_LABELS[result.status]
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
      <ResultsHeader
        status={status}
        errorMessage={errorMessage}
        totalCount={totalCount}
        checkedCount={checkedCount}
        availableCount={availableCount}
        resultsCount={results.length}
        tlds={tlds}
        tldCounts={tldCounts}
        showAvailableOnly={showAvailableOnly}
        onShowAvailableOnlyChange={setShowAvailableOnly}
        onClear={onClear ? () => setIsClearConfirmOpen(true) : undefined}
        onExport={handleExportCsv}
        canExport={canExport}
      />

      <BaseNameGroupList
        status={status}
        totalCount={totalCount}
        tlds={tlds}
        groupedVisibleBaseNames={groupedVisibleBaseNames}
        visibleBaseNameCount={visibleBaseNames.length}
        showAvailableOnly={showAvailableOnly}
        showWorkingRow={showWorkingRow}
        resultMap={resultMap}
        onTryVariation={onGenerateMore ? runVariationSearch : undefined}
      />

      <div ref={newRowsAnchorRef} />

      {showRefinementCard && (
        <RefinementCard
          status={status}
          tlds={tlds}
          hint={hint}
          customInput={customInput}
          isCheckingCustom={isCheckingCustom}
          onHintChange={setHint}
          onCustomInputChange={setCustomInput}
          onGenerateMore={onGenerateMore}
          onCheckCustom={onCheckCustom}
          hintRef={hintRef}
        />
      )}

      <ClearResultsModal
        isOpen={isClearConfirmOpen}
        onCancel={() => setIsClearConfirmOpen(false)}
        onConfirm={() => {
          if (!onClear) return
          setIsClearConfirmOpen(false)
          onClear()
        }}
      />
    </div>
  )
}
