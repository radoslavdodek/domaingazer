'use client'

import { ALL_TLDS, type TLD } from '@/lib/types'
import { useTheme } from '@/contexts/ThemeContext'

interface TldSelectorProps {
  selected: TLD[]
  onChange: (tlds: TLD[]) => void
}

export function TldSelector({ selected, onChange }: TldSelectorProps) {
  const { theme } = useTheme()

  const toggle = (tld: TLD) => {
    if (selected.includes(tld)) {
      onChange([])
    } else {
      onChange([tld])
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {ALL_TLDS.map((tld) => {
          const isSelected = selected.includes(tld)
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
    </div>
  )
}
