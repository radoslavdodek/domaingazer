'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { TldSearchInput } from '@/components/TldSearchInput'
import { FEATURED_TLDS, type TLD } from '@/lib/types'

interface TldSelectorProps {
  selected: TLD[]
  onChange: (tlds: TLD[]) => void
  supportedTlds: TLD[]
  isLoadingSupportedTlds?: boolean
  supportedTldsError?: string | null
}

export function TldSelector({
  selected,
  onChange,
  supportedTlds,
  isLoadingSupportedTlds = false,
  supportedTldsError = null,
}: TldSelectorProps) {
  const { theme, themeName } = useTheme()
  const featuredTlds: TLD[] = [...FEATURED_TLDS]
  const selectedTld = selected[0] ?? null
  const selectedIsFeatured = selectedTld ? featuredTlds.includes(selectedTld) : false
  const selectedChipClass = themeName === 'midnight'
    ? 'inline-flex items-center rounded-full border border-sky-800 bg-sky-950/60 px-3 py-1 text-xs font-medium text-sky-300'
    : 'inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700'

  const toggle = (tld: TLD) => {
    if (selectedTld === tld) {
      onChange([])
      return
    }
    onChange([tld])
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {FEATURED_TLDS.map((tld) => {
          const isSelected = selectedTld === tld
          return (
            <button
              key={tld}
              type="button"
              onClick={() => toggle(tld)}
              className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isSelected ? theme.tldSelector.selected : theme.tldSelector.unselected
              }`}
            >
              {tld}
            </button>
          )
        })}
      </div>

      {selectedTld && !selectedIsFeatured && (
        <div className="flex flex-wrap items-center gap-2">
          <span className={selectedChipClass}>Selected hidden TLD: {selectedTld}</span>
          <button
            type="button"
            onClick={() => onChange([])}
            className={theme.searchForm.clearButton}
          >
            Clear
          </button>
        </div>
      )}

      <TldSearchInput
        supportedTlds={supportedTlds}
        excludedTlds={featuredTlds}
        onSelect={(tld) => onChange([tld])}
        placeholder="Search other Route 53 TLDs, e.g. .app or .dev"
        label="Need another extension?"
        helperText="Search every other TLD Route 53 supports without crowding the featured pills."
        isLoading={isLoadingSupportedTlds}
        error={supportedTldsError}
      />
    </div>
  )
}
