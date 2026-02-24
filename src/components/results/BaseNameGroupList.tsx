import { DomainRow } from '@/components/DomainRow'
import type { DomainResult, TLD } from '@/lib/types'
import type { SearchStatus } from './types'

interface BaseNameGroupListProps {
  status: SearchStatus
  totalCount: number
  tlds: TLD[]
  groupedVisibleBaseNames: string[][]
  visibleBaseNameCount: number
  showAvailableOnly: boolean
  showWorkingRow: boolean
  resultMap: Map<string, DomainResult>
  onTryVariation?: (baseName: string) => void
}

export function BaseNameGroupList({
  status,
  totalCount,
  tlds,
  groupedVisibleBaseNames,
  visibleBaseNameCount,
  showAvailableOnly,
  showWorkingRow,
  resultMap,
  onTryVariation,
}: BaseNameGroupListProps) {
  return (
    <div className="space-y-2 p-3 sm:p-4">
      {status === 'searching' && totalCount === 0 && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
          ))}
        </div>
      )}

      {tlds.length > 0 && visibleBaseNameCount > 0 && (
        <div className="space-y-3">
          {groupedVisibleBaseNames.map((batch, batchIndex) => (
            <div key={`batch-${batchIndex}`} className="space-y-1.5">
              {batchIndex > 0 && (
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Next batch</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
              )}
              {batch.map((baseName) => (
                <div
                  key={baseName}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 sm:px-3.5"
                >
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="break-all font-mono text-sm font-medium leading-tight text-gray-900">{baseName}</span>
                    {onTryVariation && (
                      <button
                        type="button"
                        onClick={() => onTryVariation(baseName)}
                        disabled={status === 'searching'}
                        className="rounded-md border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Try variations
                      </button>
                    )}
                  </div>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {tlds.map((tld) => {
                      const row = resultMap.get(`${baseName}${tld}`)
                      return (
                        <DomainRow
                          key={`${baseName}${tld}`}
                          domain={row?.fullDomain ?? `${baseName}${tld}`}
                          status={row?.status ?? 'PENDING'}
                          compact
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tlds.length > 0 && visibleBaseNameCount === 0 && status !== 'searching' && (
        <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
          {showAvailableOnly
            ? 'No names with availability yet. Try turning off the filter or generating more names.'
            : 'No results yet.'}
        </div>
      )}

      {tlds.length === 0 && (
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
    </div>
  )
}
