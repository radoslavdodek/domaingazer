'use client'

import { useEffect, useMemo, useState, type Ref } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { searchTlds } from '@/lib/tlds'
import type { TLD } from '@/lib/types'

interface TldSearchInputProps {
  supportedTlds: TLD[]
  excludedTlds?: TLD[]
  onSelect: (tld: TLD) => void
  placeholder: string
  inputRef?: Ref<HTMLInputElement>
  label?: string
  helperText?: string
  disabled?: boolean
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
  size?: 'md' | 'sm'
  resetKey?: number
}

export function TldSearchInput({
  supportedTlds,
  excludedTlds = [],
  onSelect,
  placeholder,
  inputRef,
  label,
  helperText,
  disabled = false,
  isLoading = false,
  error = null,
  emptyMessage = 'No matching Route 53 TLDs found.',
  size = 'md',
  resetKey = 0,
}: TldSearchInputProps) {
  const { theme, themeName } = useTheme()
  const [query, setQuery] = useState('')
  const hasQuery = query.trim().length > 0
  const matches = useMemo(
    () => searchTlds(supportedTlds, query, excludedTlds),
    [excludedTlds, query, supportedTlds],
  )
  const excludedMatches = useMemo(
    () => searchTlds(excludedTlds, query),
    [excludedTlds, query],
  )

  const inputClassName = size === 'sm'
    ? themeName === 'midnight'
      ? 'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:opacity-50'
      : 'w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50'
    : themeName === 'midnight'
      ? 'w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:bg-zinc-800/50 disabled:text-zinc-600'
      : 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500'

  const suggestionButtonClass = size === 'sm'
    ? `rounded-full px-2 py-1 text-xs font-medium transition-all ${theme.tldSelector.unselected}`
    : `rounded-full px-3 py-1.5 text-sm font-medium transition-all ${theme.tldSelector.unselected}`
  const excludedButtonClass = size === 'sm'
    ? 'rounded-full border border-dashed px-2 py-1 text-xs font-medium opacity-70'
    : 'rounded-full border border-dashed px-3 py-1.5 text-sm font-medium opacity-70'

  const infoTextClass = themeName === 'midnight' ? 'text-xs text-zinc-500' : 'text-xs text-gray-500'
  const errorTextClass = themeName === 'midnight' ? 'text-xs text-amber-300' : 'text-xs text-amber-700'

  const handleSelect = (tld: TLD) => {
    onSelect(tld)
    setQuery('')
  }

  useEffect(() => {
    setQuery('')
  }, [resetKey])

  return (
    <div className="space-y-2">
      {label && <label className={theme.searchForm.label}>{label}</label>}
      {helperText && <p className={infoTextClass}>{helperText}</p>}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && matches[0]) {
            event.preventDefault()
            handleSelect(matches[0])
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClassName}
      />
      {hasQuery && (
        <div className="space-y-2">
          {isLoading ? (
            <p className={infoTextClass}>Loading Route 53 TLDs…</p>
          ) : (
            <>
              {matches.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {matches.map((tld) => (
                    <button
                      key={tld}
                      type="button"
                      onClick={() => handleSelect(tld)}
                      disabled={disabled}
                      className={suggestionButtonClass}
                    >
                      {tld}
                    </button>
                  ))}
                </div>
              )}
              {excludedMatches.length > 0 && (
                <div className="space-y-2">
                  <p className={infoTextClass}>Already shown above:</p>
                  <div className="flex flex-wrap gap-2">
                    {excludedMatches.map((tld) => (
                      <span
                        key={`excluded-${tld}`}
                        className={`${excludedButtonClass} ${theme.tldSelector.unselected}`}
                      >
                        {tld}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {matches.length === 0 && excludedMatches.length === 0 && (
                <p className={error ? errorTextClass : infoTextClass}>{error ?? emptyMessage}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
