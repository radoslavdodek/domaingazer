'use client'

import { ALL_TLDS, type TLD } from '@/lib/types'

interface TldSelectorProps {
  selected: TLD[]
  onChange: (tlds: TLD[]) => void
}

export function TldSelector({ selected, onChange }: TldSelectorProps) {
  const toggle = (tld: TLD) => {
    if (selected.includes(tld)) {
      onChange(selected.filter((t) => t !== tld))
    } else {
      onChange([...selected, tld])
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
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-100'
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
