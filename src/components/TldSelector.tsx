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
  selectionMode?: 'single' | 'multiple'
  size?: 'default' | 'compact'
  showSelected?: boolean
  supportedTlds: TLD[]
  isLoadingSupportedTlds?: boolean
  supportedTldsError?: string | null
}

export function TldSelector({
  selected,
  onChange,
  extraTldPills = [],
  onRemoveExtraTld,
  selectionMode = 'single',
  size = 'default',
  showSelected = true,
  supportedTlds,
  isLoadingSupportedTlds = false,
  supportedTldsError = null,
}: TldSelectorProps) {
  const { theme } = useTheme()
  const featuredTlds: TLD[] = [...FEATURED_TLDS]
  const selectedTlds = normalizeTldList(selected)
  const selectedTld = selectedTlds[0] ?? null
  const selectedTldSet = new Set(selectedTlds)
  const allPills = normalizeTldList([...featuredTlds, ...extraTldPills, ...selectedTlds])
  const visiblePills = showSelected
    ? allPills
    : allPills.filter((tld) => !selectedTldSet.has(tld))
  const [isLookupOpen, setIsLookupOpen] = useState(false)
  const [lookupResetKey, setLookupResetKey] = useState(0)
  const isCompact = size === 'compact'
  const customPillButtonClass = isCompact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
  const customPillRemoveClass = isCompact ? 'px-2 py-1.5' : 'px-2.5 py-2.5'
  const pillButtonClass = isCompact ? 'rounded-full px-3 py-1.5 text-xs' : 'rounded-full px-4 py-2.5 text-sm'
  const moreButtonClass = isCompact ? 'rounded-full px-2.5 py-1.5 text-[11px]' : 'rounded-full px-3 py-2 text-xs'

  const toggle = (tld: TLD) => {
    if (selectionMode === 'multiple') {
      if (selectedTldSet.has(tld)) return
      onChange(normalizeTldList([...selectedTlds, tld]))
      return
    }

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
          const isSelected = selectionMode === 'multiple'
            ? selectedTldSet.has(tld)
            : selectedTld === tld
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
                  className={`${customPillButtonClass} focus-visible:outline-none`}
                >
                  {tld}
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveExtraTld?.(tld)}
                  className={`border-l border-black/10 text-xs focus-visible:outline-none dark:border-white/10 ${customPillRemoveClass}`}
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
              className={`${pillButtonClass} font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
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
          className={`${moreButtonClass} font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.tldSelector.unselected}`}
        >
          + More
        </button>
      </div>
    </div>
      <TldLookupDialog
        isOpen={isLookupOpen}
        supportedTlds={supportedTlds}
        excludedTlds={normalizeTldList([...visiblePills, ...selectedTlds])}
        isLoading={isLoadingSupportedTlds}
        error={supportedTldsError}
        resetKey={lookupResetKey}
        onSelect={(tld) => onChange(
          selectionMode === 'multiple'
            ? normalizeTldList([...selectedTlds, tld])
            : [tld]
        )}
        onClose={() => setIsLookupOpen(false)}
      />
    </>
  )
}
