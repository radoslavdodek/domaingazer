'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { DOMAIN_STATUS_LABELS } from '@/lib/domainStatus'
import { ALL_TLDS, type DomainResult, type TLD } from '@/lib/types'
import { useTheme } from '@/contexts/ThemeContext'
import { BaseNameGroupList } from './results/BaseNameGroupList'
import { RefinementCard } from './results/RefinementCard'
import { ResultsHeader } from './results/ResultsHeader'
import type { SearchStatus } from './results/types'

interface ResultsPanelProps {
  results: DomainResult[]
  nameBatches?: string[][]
  status: SearchStatus
  errorMessage: string | null
  tlds: TLD[]
  searchDescription?: string
  isCheckingCustom?: boolean
  isWaitingForNewRows?: boolean
  onGenerateMore?: (hint: string) => void
  onCheckCustom?: (baseName: string) => void
  onAddTldForBase?: (baseName: string, tld: TLD) => void
}

interface BaseNameExplanation {
  text: string
  isLoading: boolean
  error: string | null
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
  searchDescription,
  isCheckingCustom,
  isWaitingForNewRows,
  onGenerateMore,
  onCheckCustom,
  onAddTldForBase,
}: ResultsPanelProps) {
  const { theme } = useTheme()
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [hint, setHint] = useState('')
  const [customInput, setCustomInput] = useState('')
  const [explanationsByBaseName, setExplanationsByBaseName] = useState<Record<string, BaseNameExplanation>>({})
  const hintRef = useRef<HTMLInputElement>(null)
  const newRowsAnchorRef = useRef<HTMLDivElement>(null)
  const batchElementsRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const baseNameRowElementsRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const prevStatusRef = useRef(status)
  const prevBaseNameCountRef = useRef(0)
  const autoScrollNewRowsRef = useRef(false)
  const lastAutoScrolledBatchStartRef = useRef<string | null>(null)

  const allBaseNames = Array.from(new Set(results.map((result) => result.baseName)))
  const baseNameCount = allBaseNames.length
  const latestBatchStartBaseName = [...nameBatches]
    .reverse()
    .find((batch) => batch.length > 0)?.[0]

  const setBaseNameRowElement = useCallback((baseName: string, element: HTMLDivElement | null) => {
    if (element) {
      baseNameRowElementsRef.current.set(baseName, element)
      return
    }
    baseNameRowElementsRef.current.delete(baseName)
  }, [])

  const setBatchElement = useCallback((batchStartBaseName: string, element: HTMLDivElement | null) => {
    if (element) {
      batchElementsRef.current.set(batchStartBaseName, element)
      return
    }
    batchElementsRef.current.delete(batchStartBaseName)
  }, [])

  useEffect(() => {
    const prevStatus = prevStatusRef.current
    const prevBaseNameCount = prevBaseNameCountRef.current

    if (status === 'searching' && prevStatus !== 'searching') {
      autoScrollNewRowsRef.current = results.length > 0
      lastAutoScrolledBatchStartRef.current = null
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

    if (
      autoScrollNewRowsRef.current
      && status === 'searching'
      && baseNameCount > prevBaseNameCount
      && latestBatchStartBaseName
      && latestBatchStartBaseName !== lastAutoScrolledBatchStartRef.current
    ) {
      lastAutoScrolledBatchStartRef.current = latestBatchStartBaseName
      requestAnimationFrame(() => {
        const batchElement = batchElementsRef.current.get(latestBatchStartBaseName)
        if (batchElement) {
          batchElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
        const rowElement = baseNameRowElementsRef.current.get(latestBatchStartBaseName)
        if (rowElement) {
          rowElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
        newRowsAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      })
    }

    prevStatusRef.current = status
    prevBaseNameCountRef.current = baseNameCount
  }, [status, results.length, baseNameCount, latestBatchStartBaseName])

  useEffect(() => {
    setExplanationsByBaseName({})
  }, [searchDescription])

  useEffect(() => {
    const allowedBaseNames = new Set(results.map((result) => result.baseName))
    setExplanationsByBaseName((prev) => {
      let hasRemovedEntries = false
      const next: Record<string, BaseNameExplanation> = {}
      for (const [baseName, value] of Object.entries(prev)) {
        if (!allowedBaseNames.has(baseName)) {
          hasRemovedEntries = true
          continue
        }
        next[baseName] = value
      }
      return hasRemovedEntries ? next : prev
    })
  }, [results])

  if (status === 'idle' && results.length === 0) return null

  const resultMap = new Map(results.map((result) => [`${result.baseName}${result.tld}`, result]))
  const resultsByBaseName = new Map<string, DomainResult[]>()
  for (const result of results) {
    const existing = resultsByBaseName.get(result.baseName)
    if (existing) {
      existing.push(result)
      continue
    }
    resultsByBaseName.set(result.baseName, [result])
  }
  const availableCount = results.filter((result) => result.status === 'AVAILABLE').length
  const checkedCount = results.filter((result) => result.status !== 'CHECKING').length
  const totalCount = results.length

  const exportBaseNames = showAvailableOnly
    ? allBaseNames.filter((name) => (resultsByBaseName.get(name) ?? []).some(
      (row) => row.status === 'AVAILABLE' || row.status === 'CHECKING'
    ))
    : allBaseNames

  const visibleBaseNames = exportBaseNames
  const visibleBaseNameSet = new Set(visibleBaseNames)
  const groupedVisibleBaseNames = nameBatches
    .map((batch) => batch.filter((name) => visibleBaseNameSet.has(name)))
    .filter((batch) => batch.length > 0)
  const groupedVisibleSet = new Set(groupedVisibleBaseNames.flat())
  const ungroupedVisibleBaseNames = visibleBaseNames.filter((name) => !groupedVisibleSet.has(name))
  if (ungroupedVisibleBaseNames.length > 0) groupedVisibleBaseNames.push(ungroupedVisibleBaseNames)

  const visibleRows = results.filter((result) => visibleBaseNameSet.has(result.baseName))

  const showWorkingRow = status === 'searching' && Boolean(isWaitingForNewRows)
  const canExport =
    visibleRows.length > 0 &&
    visibleRows.every((row) => row.status !== 'CHECKING' && row.status !== 'STOPPED')

  const handleExportCsv = () => {
    if (!canExport) return

    const baseNameOrder = new Map(visibleBaseNames.map((baseName, index) => [baseName, index]))
    const tldOrder = new Map(ALL_TLDS.map((tld, index) => [tld, index]))
    const exportRows = [...visibleRows].sort((a, b) => {
      const baseDiff = (baseNameOrder.get(a.baseName) ?? 0) - (baseNameOrder.get(b.baseName) ?? 0)
      if (baseDiff !== 0) return baseDiff
      return (tldOrder.get(a.tld) ?? 0) - (tldOrder.get(b.tld) ?? 0)
    })

    const rows = exportRows.map((row) => (
      [row.baseName, row.fullDomain, DOMAIN_STATUS_LABELS[row.status]]
    ))

    const csvLines = [['Base name', 'Domain', 'Status'], ...rows]
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

  const runExplain = async (baseName: string) => {
    const description = searchDescription?.trim()
    if (!description) return

    setExplanationsByBaseName((prev) => ({
      ...prev,
      [baseName]: { text: '', isLoading: true, error: null },
    }))

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, baseName }),
      })

      const payload = await response.json().catch(() => null) as { explanation?: unknown; error?: unknown } | null

      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to generate explanation'
        throw new Error(message)
      }

      const explanation = typeof payload?.explanation === 'string' ? payload.explanation.trim() : ''
      if (!explanation) {
        throw new Error('AI returned an empty explanation')
      }

      setExplanationsByBaseName((prev) => ({
        ...prev,
        [baseName]: { text: explanation, isLoading: false, error: null },
      }))
    } catch (err) {
      setExplanationsByBaseName((prev) => ({
        ...prev,
        [baseName]: {
          text: '',
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to generate explanation',
        },
      }))
    }
  }

  const showRefinementCard = Boolean(onGenerateMore || onCheckCustom)

  return (
    <div className={theme.resultsPanel.container}>
      <ResultsHeader
        status={status}
        errorMessage={errorMessage}
        totalCount={totalCount}
        checkedCount={checkedCount}
        availableCount={availableCount}
        resultsCount={results.length}
        showAvailableOnly={showAvailableOnly}
        onShowAvailableOnlyChange={setShowAvailableOnly}
        onExport={handleExportCsv}
        canExport={canExport}
      />

      <BaseNameGroupList
        status={status}
        totalCount={totalCount}
        groupedVisibleBaseNames={groupedVisibleBaseNames}
        visibleBaseNameCount={visibleBaseNames.length}
        showAvailableOnly={showAvailableOnly}
        showWorkingRow={showWorkingRow}
        resultMap={resultMap}
        onAddTldForBase={onAddTldForBase}
        onTryVariation={onGenerateMore ? runVariationSearch : undefined}
        onExplain={runExplain}
        explanationByBaseName={explanationsByBaseName}
        canExplain={Boolean(searchDescription?.trim())}
        onBatchStartRef={setBatchElement}
        onBaseNameRowRef={setBaseNameRowElement}
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

    </div>
  )
}
