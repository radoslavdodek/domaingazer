'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
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
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved === 'classic' || saved === 'vibrant' || saved === 'midnight') {
        setThemeNameState(saved)
      }
    } catch { /* ignore */ }
  }, [])

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name)
    try { localStorage.setItem(LS_KEY, name) } catch { /* ignore */ }
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
