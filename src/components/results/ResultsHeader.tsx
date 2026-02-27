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
  onExport,
  canExport,
}: ResultsHeaderProps) {
  const { theme } = useTheme()

  return (
    <div className={theme.resultsHeader.wrapper}>
      <div className="flex min-w-0 items-center gap-3" aria-live="polite">
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

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        {resultsCount > 0 ? (
          <label className="flex cursor-pointer select-none items-center gap-2">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(event) => onShowAvailableOnlyChange(event.target.checked)}
              className={theme.resultsHeader.checkboxAccent}
            />
            Show available only
          </label>
        ) : <span />}
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            disabled={!canExport}
            title={!canExport ? 'Export available after all checks complete' : undefined}
            className={`flex items-center gap-1.5 ${theme.resultsHeader.actionLinkDisabled}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
            Export
          </button>
        )}
      </div>
    </div>
  )
}
