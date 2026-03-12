import { DomainRow } from '@/components/DomainRow'
import { TldSearchInput } from '@/components/TldSearchInput'
import { useTheme } from '@/contexts/ThemeContext'
import { createTldComparator } from '@/lib/tlds'
import { FEATURED_TLDS, type DomainResult, type TLD } from '@/lib/types'
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
  activeTlds: TLD[]
  supportedTlds: TLD[]
  supportedTldsError?: string | null
  isLoadingSupportedTlds?: boolean
  onAddTldForBase?: (baseName: string, tld: TLD) => void
  onTryVariation?: (baseName: string) => void
  onExplain?: (baseName: string) => void
  explanationByBaseName?: Record<string, BaseNameExplanation>
  canExplain?: boolean
  userAddedBaseNames?: Set<string>
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
  activeTlds,
  supportedTlds,
  supportedTldsError,
  isLoadingSupportedTlds,
  onAddTldForBase,
  onTryVariation,
  onExplain,
  explanationByBaseName = {},
  canExplain = false,
  userAddedBaseNames,
  onBatchStartRef,
  onBaseNameRowRef,
}: BaseNameGroupListProps) {
  const { theme } = useTheme()
  const compareTlds = createTldComparator(activeTlds)

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
                  const rowsForBase = Array.from(resultMap.values())
                    .filter((row) => row.baseName === baseName)
                    .sort((a, b) => compareTlds(a.tld, b.tld))
                  const presentTlds = new Set(rowsForBase.map((row) => row.tld))
                  const remainingFeaturedTlds = FEATURED_TLDS.filter((tld) => !presentTlds.has(tld))
                  const searchableTldExclusions = [...Array.from(presentTlds), ...FEATURED_TLDS]

                  return (
                    <div
                      key={baseName}
                      ref={(element) => onBaseNameRowRef?.(baseName, element)}
                      className={theme.baseNameGroupList.card}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span className={`break-all font-mono text-sm font-medium leading-tight ${theme.domainRow.textDefault}`}>
                          {baseName}
                          {userAddedBaseNames?.has(baseName) && (
                            <span className="ml-2 inline-flex items-center gap-1 align-middle font-sans text-xs font-normal text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                                <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                              </svg>
                              your idea
                            </span>
                          )}
                        </span>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                          {onTryVariation && (
                            <button
                              type="button"
                              onClick={() => onTryVariation(baseName)}
                              disabled={status === 'searching'}
                              title="Generate spelling variations of this name"
                              className={`${theme.baseNameGroupList.variationButton} w-full text-center sm:w-28`}
                            >
                              Try variations
                            </button>
                          )}
                          {onExplain && (
                            <button
                              type="button"
                              onClick={() => onExplain(baseName)}
                              disabled={!canExplain || explanation?.isLoading || Boolean(explanation?.text && !explanation?.error)}
                              title="Explain why this name might work for your project"
                              className={`${theme.baseNameGroupList.variationButton} w-full text-center sm:w-28`}
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
                      {onAddTldForBase && (
                        <div className="mt-3 space-y-2">
                          {remainingFeaturedTlds.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs text-gray-500">Add featured TLD:</span>
                              {remainingFeaturedTlds.map((tld) => (
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
                          <TldSearchInput
                            supportedTlds={supportedTlds}
                            excludedTlds={searchableTldExclusions}
                            onSelect={(tld) => onAddTldForBase(baseName, tld)}
                            placeholder="Find another Route 53 TLD"
                            label="Search other TLDs"
                            isLoading={isLoadingSupportedTlds}
                            error={supportedTldsError}
                            size="sm"
                          />
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
            <span className="relative inline-flex h-2 w-2">
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
