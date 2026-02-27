import { DomainRow } from '@/components/DomainRow'
import { ALL_TLDS, type DomainResult, type TLD } from '@/lib/types'
import { useTheme } from '@/contexts/ThemeContext'
import type { SearchStatus } from './types'

interface BaseNameExplanation {
  text: string
  isLoading: boolean
  error: string | null
}

interface BaseNameGroupListProps {
  status: SearchStatus
  totalCount: number
  groupedVisibleBaseNames: string[][]
  visibleBaseNameCount: number
  showAvailableOnly: boolean
  showWorkingRow: boolean
  resultMap: Map<string, DomainResult>
  onAddTldForBase?: (baseName: string, tld: TLD) => void
  onTryVariation?: (baseName: string) => void
  onExplain?: (baseName: string) => void
  explanationByBaseName?: Record<string, BaseNameExplanation>
  canExplain?: boolean
  onBatchStartRef?: (batchStartBaseName: string, element: HTMLDivElement | null) => void
  onBaseNameRowRef?: (baseName: string, element: HTMLDivElement | null) => void
}

export function BaseNameGroupList({
  status,
  totalCount,
  groupedVisibleBaseNames,
  visibleBaseNameCount,
  showAvailableOnly,
  showWorkingRow,
  resultMap,
  onAddTldForBase,
  onTryVariation,
  onExplain,
  explanationByBaseName = {},
  canExplain = false,
  onBatchStartRef,
  onBaseNameRowRef,
}: BaseNameGroupListProps) {
  const { theme } = useTheme()

  return (
    <div className="space-y-2 p-3 sm:p-4">
      {status === 'searching' && totalCount === 0 && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={theme.baseNameGroupList.skeleton} />
          ))}
        </div>
      )}

      {visibleBaseNameCount > 0 && (
        <div className="space-y-3">
          {groupedVisibleBaseNames.map((batch, batchIndex) => {
            const batchStartBaseName = batch[0]

            return (
              <div
                key={`batch-${batchIndex}`}
                ref={(element) => onBatchStartRef?.(batchStartBaseName, element)}
                className="scroll-mt-24 space-y-1.5"
              >
                {batchIndex > 0 && (
                  <div className="flex items-center gap-3 py-1">
                    <div className={theme.baseNameGroupList.batchDividerLine} />
                    <span className={theme.baseNameGroupList.batchDividerText}>Round {batchIndex + 1}</span>
                    <div className={theme.baseNameGroupList.batchDividerLine} />
                  </div>
                )}

                {batch.map((baseName) => {
                  const explanation = explanationByBaseName[baseName]
                  const hasExplanationState =
                    explanation && (explanation.isLoading || Boolean(explanation.error) || Boolean(explanation.text))
                  const rowsForBase = ALL_TLDS
                    .map((tld) => resultMap.get(`${baseName}${tld}`))
                    .filter((row): row is DomainResult => Boolean(row))
                  const presentTlds = new Set(rowsForBase.map((row) => row.tld))
                  const remainingTlds = ALL_TLDS.filter((tld) => !presentTlds.has(tld))

                  return (
                    <div
                      key={baseName}
                      ref={(element) => onBaseNameRowRef?.(baseName, element)}
                      className={theme.baseNameGroupList.card}
                    >
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="break-all font-mono text-sm font-medium leading-tight text-gray-900">{baseName}</span>
                        <div className="flex items-center gap-1">
                          {onTryVariation && (
                            <button
                              type="button"
                              onClick={() => onTryVariation(baseName)}
                              disabled={status === 'searching'}
                              className={`${theme.baseNameGroupList.variationButton} w-28 text-center`}
                            >
                              Try variations
                            </button>
                          )}
                          {onExplain && (
                            <button
                              type="button"
                              onClick={() => onExplain(baseName)}
                              disabled={!canExplain || explanation?.isLoading || Boolean(explanation?.text && !explanation?.error)}
                              className={`${theme.baseNameGroupList.variationButton} w-28 text-center`}
                            >
                              {explanation?.isLoading ? 'Explaining...' : 'Explain'}
                            </button>
                          )}
                        </div>
                      </div>
                      {hasExplanationState && (
                        <div className={theme.baseNameGroupList.explanationBox}>
                          {explanation?.isLoading && (
                            <p className={theme.baseNameGroupList.explanationLoadingText}>Thinking through this name...</p>
                          )}
                          {!explanation?.isLoading && explanation?.error && (
                            <p className={theme.baseNameGroupList.explanationErrorText}>{explanation.error}</p>
                          )}
                          {!explanation?.isLoading && explanation?.text && (
                            <p className={theme.baseNameGroupList.explanationText}>{explanation.text}</p>
                          )}
                        </div>
                      )}
                      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {rowsForBase.map((row) => (
                          <DomainRow
                            key={row.fullDomain}
                            domain={row.fullDomain}
                            status={row.status}
                            compact
                          />
                        ))}
                      </div>
                      {onAddTldForBase && remainingTlds.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-xs text-gray-500">Add TLD:</span>
                          {remainingTlds.map((tld) => (
                            <button
                              key={`${baseName}-${tld}`}
                              type="button"
                              onClick={() => onAddTldForBase(baseName, tld)}
                              className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all ${
                                theme.tldSelector.unselected
                              }`}
                            >
                              {tld}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {visibleBaseNameCount === 0 && status !== 'searching' && (
        <div className={theme.baseNameGroupList.emptyState}>
          {showAvailableOnly
            ? 'No names with availability yet. Try turning off the filter or generating more names.'
            : 'No results yet.'}
        </div>
      )}

      {showWorkingRow && (
        <div className={theme.baseNameGroupList.workingRow}>
          <div className="flex items-center gap-2">
            <span className="relative inline-block h-2 w-2">
              <span className={theme.baseNameGroupList.workingPing} />
              <span className={theme.baseNameGroupList.workingDot} />
            </span>
            <span>Generating names… New rows should appear shortly.</span>
          </div>
        </div>
      )}
    </div>
  )
}
