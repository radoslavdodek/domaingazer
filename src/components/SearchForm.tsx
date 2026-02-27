'use client'

import { useState, useEffect } from 'react'
import type { TLD } from '@/lib/types'
import { useTheme } from '@/contexts/ThemeContext'
import { TldSelector } from './TldSelector'

const LS_DESCRIPTION = 'domainerio_description'
const LS_TLDS = 'domainerio_tlds'
const DEFAULT_TLDS: TLD[] = ['.com']

interface SearchFormProps {
  isSearching: boolean
  onSearch: (description: string, tlds: TLD[]) => void
  onCancel: () => void
  hideTldSelector?: boolean
  hasResults?: boolean
  onClearResults?: () => void
}

export function SearchForm({ isSearching, onSearch, onCancel, hideTldSelector = false, hasResults = false, onClearResults }: SearchFormProps) {
  const { theme } = useTheme()
  const [description, setDescription] = useState('')
  const [tlds, setTlds] = useState<TLD[]>(DEFAULT_TLDS)

  useEffect(() => {
    try {
      const savedDesc = localStorage.getItem(LS_DESCRIPTION)
      if (savedDesc) setDescription(savedDesc)
      const savedTlds = localStorage.getItem(LS_TLDS)
      if (savedTlds) {
        const parsed = JSON.parse(savedTlds) as TLD[]
        setTlds(parsed.length > 0 ? [parsed[0]] : DEFAULT_TLDS)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(LS_DESCRIPTION, description) } catch { /* ignore */ }
  }, [description])

  useEffect(() => {
    try { localStorage.setItem(LS_TLDS, JSON.stringify(tlds)) } catch { /* ignore */ }
  }, [tlds])

  const canSubmit = description.trim().length >= 5 && tlds.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canSubmit) {
      onSearch(description.trim(), tlds)
    }
  }

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={theme.searchForm.label}>
          Describe your project
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Web and mobile app for helping early-stage teams generate, evaluate, and buy brandable startup domains"
          rows={4}
          disabled={isSearching}
          className={theme.searchForm.textarea}
        />
        {description.length > 0 && description.trim().length < 5 && (
          <p className="mt-1 text-xs text-gray-400">{description.trim().length} characters (minimum 5)</p>
        )}
        {tlds.length === 0 && (
          <p className={theme.searchForm.validationText}>Select a TLD</p>
        )}
      </div>

      {!hideTldSelector && (
        <div>
          <label className={`mb-2 ${theme.searchForm.label}`}>
            Select the primary top level domain you are interested in:
          </label>
          <TldSelector
            selected={tlds}
            onChange={(newTlds) => {
              setTlds(newTlds)
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {isSearching ? (
          <button
            type="button"
            onClick={handleCancel}
            className={theme.searchForm.cancelButton}
          >
            Cancel
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSubmit}
            className={theme.searchForm.submitButton}
          >
            Find Domains
          </button>
        )}
        {hasResults && !isSearching && onClearResults && (
          <button
            type="button"
            onClick={onClearResults}
            className={theme.searchForm.clearButton}
          >
            Clear results
          </button>
        )}
      </div>
    </form>
  )
}
