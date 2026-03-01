'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getOptionalItem, setOptionalItem } from '@/lib/privacy/optional-storage'
import { themes, type Theme, type ThemeName } from '@/lib/themes'

const LS_KEY = 'domainerio_theme'
const DEFAULT_THEME: ThemeName = 'classic'

interface ThemeContextValue {
  theme: Theme
  themeName: ThemeName
  setThemeName: (name: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>(DEFAULT_THEME)

  useEffect(() => {
    const saved = getOptionalItem(LS_KEY)
    if (saved === 'classic' || saved === 'midnight') {
      setThemeNameState(saved)
    }
  }, [])

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name)
    setOptionalItem(LS_KEY, name)
  }

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], themeName, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
