'use client'

import { useState, useEffect } from 'react'
import type { TLD } from '@/lib/types'
import { TldSelector } from './TldSelector'

const LS_DESCRIPTION = 'domainerio_description'
const LS_TLDS = 'domainerio_tlds'
const DEFAULT_TLDS: TLD[] = ['.com']

interface SearchFormProps {
  isSearching: boolean
  onSearch: (description: string, tlds: TLD[]) => void
  onCancel: () => void
  onTldsChange?: (tlds: TLD[]) => void
}

export function SearchForm({ isSearching, onSearch, onCancel, onTldsChange }: SearchFormProps) {
  const [description, setDescription] = useState('')
  const [tlds, setTlds] = useState<TLD[]>(DEFAULT_TLDS)

  useEffect(() => {
    try {
      const savedDesc = localStorage.getItem(LS_DESCRIPTION)
      if (savedDesc) setDescription(savedDesc)
      const savedTlds = localStorage.getItem(LS_TLDS)
      if (savedTlds) setTlds(JSON.parse(savedTlds) as TLD[])
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
    // Prevent any form-submit default action if this click causes immediate re-render.
    e.preventDefault()
    e.stopPropagation()
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Describe your project
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Web and mobile app for helping early-stage teams generate, evaluate, and buy brandable startup domains"
          rows={4}
          disabled={isSearching}
          className="w-full min-h-[120px] resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
        {description.length > 0 && description.trim().length < 5 && (
          <p className="text-xs text-red-500 mt-1">Please enter at least 5 characters</p>
        )}
        {tlds.length === 0 && (
          <p className="mt-1 text-xs text-red-500">Select at least one TLD</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select top level domains to check:
        </label>
        <TldSelector
          selected={tlds}
          onChange={(newTlds) => {
            setTlds(newTlds)
            onTldsChange?.(newTlds)
          }}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {isSearching ? (
          <button
            type="button"
            onClick={handleCancel}
            className="w-full rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 sm:w-auto"
          >
            Cancel
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Find Domains
          </button>
        )}
      </div>
    </form>
  )
}
