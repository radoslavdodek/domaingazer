import type { TLD } from '@/lib/types'
import type { SearchStatus } from './types'

interface ResultsHeaderProps {
  status: SearchStatus
  errorMessage: string | null
  totalCount: number
  checkedCount: number
  availableCount: number
  resultsCount: number
  tlds: TLD[]
  tldCounts: Record<TLD, number>
  showAvailableOnly: boolean
  onShowAvailableOnlyChange: (checked: boolean) => void
  onClear?: () => void
  onExport?: () => void
  canExport: boolean
}

export function ResultsHeader({
  status,
  errorMessage,
  totalCount,
  checkedCount,
  availableCount,
  resultsCount,
  tlds,
  tldCounts,
  showAvailableOnly,
  onShowAvailableOnlyChange,
  onClear,
  onExport,
  canExport,
}: ResultsHeaderProps) {
  return (
    <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 p-4 text-sm text-gray-600 backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        {status === 'searching' && (
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        )}
        {(status === 'searching' || status === 'done') && (
          <span>
            {totalCount > 0 ? `${checkedCount} / ${totalCount} domains checked` : 'Generating and checking domains...'}
            {availableCount > 0 && (
              <span className="font-semibold text-green-700"> {' '}· {availableCount} available</span>
            )}
          </span>
        )}
        {status === 'cancelled' && (
          <span className="text-gray-500">
            Search cancelled. {availableCount} available out of {resultsCount} checked.
          </span>
        )}
        {status === 'error' && (
          <span className="text-red-600">Error: {errorMessage}</span>
        )}
      </div>

      {tlds.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {tlds.map((tld) => (
            <span
              key={tld}
              className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700"
            >
              {tld} ({tldCounts[tld] ?? 0})
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-4">
        {resultsCount > 0 && (
          <label className="flex cursor-pointer select-none items-center gap-2">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(event) => onShowAvailableOnlyChange(event.target.checked)}
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
              onClick={onExport}
              disabled={!canExport}
              className="text-sm text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              Export
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
