'use client'

import { useTheme } from '@/contexts/ThemeContext'
import type { ThemeName } from '@/lib/themes'

const cycle: ThemeName[] = ['classic', 'midnight']

const labels: Record<ThemeName, string> = {
  classic: 'Classic',
  midnight: 'Midnight',
}

export function ThemeToggle() {
  const { themeName, setThemeName } = useTheme()

  const next = () => {
    const idx = cycle.indexOf(themeName)
    setThemeName(cycle[(idx + 1) % cycle.length])
  }

  return (
    <button
      type="button"
      onClick={next}
      aria-label="Switch theme"
      className="rounded-full border border-white/30 bg-white/50 px-3.5 py-2 text-xs font-medium text-gray-600 backdrop-blur-sm transition-all hover:bg-white/70 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      {labels[themeName]}
    </button>
  )
}
