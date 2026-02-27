import type { TLD } from '@/lib/types'
import { useTheme } from '@/contexts/ThemeContext'
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
  const { theme } = useTheme()

  return (
    <div className={theme.resultsHeader.wrapper}>
      <div className="flex min-w-0 items-center gap-3">
        {status === 'searching' && (
          <span className="relative inline-block h-2.5 w-2.5">
            <span className={theme.resultsHeader.searchingPing} />
            <span className={theme.resultsHeader.searchingDot} />
          </span>
        )}
        {(status === 'searching' || status === 'done') && (
          <span>
            {totalCount > 0 ? `${checkedCount} / ${totalCount} domains checked` : 'Generating and checking domains...'}
            {availableCount > 0 && (
              <span className={theme.resultsHeader.availableText}> {' '}· {availableCount} available</span>
            )}
          </span>
        )}
        {status === 'cancelled' && (
          <span className={theme.resultsHeader.cancelledText}>
            Search cancelled. {availableCount} available out of {resultsCount} checked.
          </span>
        )}
        {status === 'error' && (
          <span className={theme.resultsHeader.errorText}>Error: {errorMessage}</span>
        )}
      </div>

      {tlds.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {tlds.map((tld) => (
            <span
              key={tld}
              className={theme.resultsHeader.tldPill}
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
              className={theme.resultsHeader.checkboxAccent}
            />
            Show available only
          </label>
        )}
        {onClear && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClear}
              className={theme.resultsHeader.actionLink}
            >
              Clear results
            </button>
            <button
              type="button"
              onClick={onExport}
              disabled={!canExport}
              className={theme.resultsHeader.actionLinkDisabled}
            >
              Export
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
