'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { TldLookupDialog } from '@/components/TldLookupDialog'
import { normalizeTldList } from '@/lib/tlds'
import { FEATURED_TLDS, type TLD } from '@/lib/types'

interface TldSelectorProps {
  selected: TLD[]
  onChange: (tlds: TLD[]) => void
  extraTldPills?: TLD[]
  onRemoveExtraTld?: (tld: TLD) => void
  supportedTlds: TLD[]
  isLoadingSupportedTlds?: boolean
  supportedTldsError?: string | null
}

export function TldSelector({
  selected,
  onChange,
  extraTldPills = [],
  onRemoveExtraTld,
  supportedTlds,
  isLoadingSupportedTlds = false,
  supportedTldsError = null,
}: TldSelectorProps) {
  const { theme } = useTheme()
  const featuredTlds: TLD[] = [...FEATURED_TLDS]
  const selectedTld = selected[0] ?? null
  const visiblePills = normalizeTldList([...featuredTlds, ...extraTldPills, ...(selectedTld ? [selectedTld] : [])])
  const [isLookupOpen, setIsLookupOpen] = useState(false)
  const [lookupResetKey, setLookupResetKey] = useState(0)

  const toggle = (tld: TLD) => {
    if (selectedTld === tld) {
      onChange([])
      return
    }
    onChange([tld])
  }

  return (
    <>
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {visiblePills.map((tld) => {
          const isSelected = selectedTld === tld
          const isCustomPill = extraTldPills.includes(tld)
          if (isCustomPill) {
            return (
              <div
                key={tld}
                className={`inline-flex items-center overflow-hidden rounded-full text-sm font-medium transition-all ${
                  isSelected ? theme.tldSelector.selected : theme.tldSelector.unselected
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(tld)}
                  className="px-4 py-2.5 focus-visible:outline-none"
                >
                  {tld}
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveExtraTld?.(tld)}
                  className="border-l border-black/10 px-2.5 py-2.5 text-xs focus-visible:outline-none dark:border-white/10"
                  aria-label={`Remove ${tld} from TLD pills`}
                  title={`Remove ${tld}`}
                >
                  ×
                </button>
              </div>
            )
          }

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
        <button
          type="button"
          onClick={() => {
            setLookupResetKey((prev) => prev + 1)
            setIsLookupOpen(true)
          }}
          className={`rounded-full px-3 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.tldSelector.unselected}`}
        >
          + More
        </button>
      </div>
    </div>
      <TldLookupDialog
        isOpen={isLookupOpen}
        supportedTlds={supportedTlds}
        excludedTlds={visiblePills}
        isLoading={isLoadingSupportedTlds}
        error={supportedTldsError}
        resetKey={lookupResetKey}
        onSelect={(tld) => onChange([tld])}
        onClose={() => setIsLookupOpen(false)}
      />
    </>
  )
}
