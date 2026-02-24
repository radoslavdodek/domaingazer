'use client'

import type { TLD } from '@/lib/types'

const ALL_TLDS: TLD[] = ['.com', '.io', '.ai', '.app', '.dev', '.co', '.net', '.shop', '.store']

interface TldSelectorProps {
  selected: TLD[]
  onChange: (tlds: TLD[]) => void
}

export function TldSelector({ selected, onChange }: TldSelectorProps) {
  const toggle = (tld: TLD) => {
    if (selected.includes(tld)) {
      if (selected.length > 1) {
        onChange(selected.filter((t) => t !== tld))
      }
    } else {
      onChange([...selected, tld])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_TLDS.map((tld) => {
        const isSelected = selected.includes(tld)
        return (
          <button
            key={tld}
            type="button"
            onClick={() => toggle(tld)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              isSelected
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {tld}
          </button>
        )
      })}
    </div>
  )
}
