'use client'

import {useEffect, useRef, useState} from 'react'
import type {TLD} from '@/lib/types'
import {useTheme} from '@/contexts/ThemeContext'
import {getOptionalItem, setOptionalItem} from '@/lib/privacy/optional-storage'
import {TldSelector} from './TldSelector'
import {ExamplesDialog} from './ExamplesDialog'
import {HistoryDialog} from './HistoryDialog'

const LS_DESCRIPTION = 'domaingazer_description'
const LS_TLDS = 'domaingazer_tlds'
const DEFAULT_TLDS: TLD[] = ['.com']
const DESCRIPTION_EXAMPLES = [
    {
        title: 'Digital Wellness App',
        description: 'A digital wellness app that helps users drastically reduce their screen time by gamifying offline activities, reading, and outdoor hobbies. The brand should feel serene, grounded, and freeing—like taking a deep breath.\n' +
            'Metaphors to explore: Unplugging, nature, spaciousness, returning to roots, momentum, presence.\n' +
            'Naming Constraints: Use real English words, nature-inspired blends, or short poetic concepts. The name should sound like a modern lifestyle brand (e.g., Calm, Headspace, Oura).',
    },
    {
        title: 'AI Video Editing Tool',
        description: 'An AI video editing tool for podcasters and YouTubers that automatically finds the most engaging moments in long videos and turns them into viral, captioned TikToks and YouTube Shorts. The name should feel kinetic, magical, fast, and punchy.\n' +
            'Metaphors to explore: Slicing, sparks, highlights, magnifying, echoes, lightning, focus.\n' +
            'Naming Constraints: Focus on action verbs and snappy 1- or 2-syllable words. The name should look great as an app icon. Prefer real words.',
    },
    {
        title: 'Food Waste Prediction Software',
        description: 'Predictive software for bakeries, cafes, and local groceries. It analyzes local weather, foot traffic, and historical data to tell them exactly how much perishable food to prep each morning, completely eliminating food waste and lost profits.\n' +
            'Metaphors to explore: Seasons, rhythm, harvest, scales, prime, sunrise, balance, cycles, roots.\n' +
            'Naming Constraints: The name should bridge the gap between organic nature and high-tech algorithms. Prefer real words.',
    },
]

interface SearchHistoryEntry {
    id: string
    description: string
    selected_tlds: TLD[]
}

interface SearchFormProps {
    isSearching: boolean
    onSearch: (description: string, tlds: TLD[]) => void
    onCancel: () => void
    hideTldSelector?: boolean
    hasResults?: boolean
    onClearResults?: () => void
    initialDescription?: string
    initialTlds?: TLD[]
    searchHistory?: SearchHistoryEntry[]
    onDeleteHistory?: (id: string) => void
    onClearAllHistory?: () => void
}

export function SearchForm({
                               isSearching,
                               onSearch,
                               onCancel,
                               hideTldSelector = false,
                               hasResults = false,
                               onClearResults,
                               initialDescription,
                               initialTlds,
                               searchHistory,
                               onDeleteHistory,
                               onClearAllHistory,
                           }: SearchFormProps) {
    const {theme, themeName} = useTheme()
    const [description, setDescription] = useState('')
    const [tlds, setTlds] = useState<TLD[]>(DEFAULT_TLDS)
    const [isExamplesOpen, setIsExamplesOpen] = useState(false)
    const dbLoadApplied = useRef(false)

    // Fast initial load from localStorage
    useEffect(() => {
        const savedDesc = getOptionalItem(LS_DESCRIPTION)
        if (savedDesc) setDescription(savedDesc)

        const savedTlds = getOptionalItem(LS_TLDS)
        if (savedTlds) {
            try {
                const parsed = JSON.parse(savedTlds) as TLD[]
                setTlds(parsed.length > 0 ? [parsed[0]] : DEFAULT_TLDS)
            } catch { /* ignore */
            }
        }
    }, [])

    // Once DB response arrives, overwrite with most-recent entry (runs once)
    useEffect(() => {
        if (dbLoadApplied.current) return
        if (initialDescription === undefined || initialTlds === undefined) return
        dbLoadApplied.current = true
        setDescription(initialDescription)
        setTlds(initialTlds.length > 0 ? initialTlds : DEFAULT_TLDS)
    }, [initialDescription, initialTlds])

    useEffect(() => {
        setOptionalItem(LS_DESCRIPTION, description)
    }, [description])

    useEffect(() => {
        setOptionalItem(LS_TLDS, JSON.stringify(tlds))
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

    const handleHistoryClick = (entry: SearchHistoryEntry) => {
        setDescription(entry.description)
        setTlds(entry.selected_tlds.length > 0 ? entry.selected_tlds : DEFAULT_TLDS)
    }

    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const hasHistory = (searchHistory?.length ?? 0) > 0
    const isMidnightTheme = themeName === 'midnight'
    const utilityButtonClass = isMidnightTheme
        ? 'flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/70 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100'
        : 'flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800'

    const handleHistorySelect = (entry: SearchHistoryEntry) => {
        handleHistoryClick(entry)
        setIsHistoryOpen(false)
    }

    const handleExampleSelect = (description: string) => {
        setDescription(description)
        setIsExamplesOpen(false)
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <div className="mb-1.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <label className={theme.searchForm.label}>
                            Describe your project
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsExamplesOpen(true)}
                                className={
                                    description.trim().length === 0 && !isSearching
                                        ? isMidnightTheme
                                            ? 'flex items-center gap-1 rounded-lg border border-indigo-500/60 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-medium text-indigo-300 transition-colors hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-200 animate-pulse'
                                            : 'flex items-center gap-1 rounded-md border border-indigo-400 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:border-indigo-500 hover:bg-indigo-100 hover:text-indigo-700 animate-pulse'
                                        : utilityButtonClass
                                }
                                aria-expanded={isExamplesOpen}
                                aria-haspopup="dialog"
                                title="See example project descriptions"
                            >
                                Examples
                            </button>
                            {hasHistory && (
                                <button
                                    type="button"
                                    onClick={() => setIsHistoryOpen(true)}
                                    title="View your past searches"
                                    className={utilityButtonClass}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
                                         className="size-3.5">
                                        <path fillRule="evenodd"
                                              d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z"
                                              clipRule="evenodd"/>
                                    </svg>
                                    History
                                </button>
                            )}
                        </div>
                    </div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Web and mobile app for helping early-stage teams generate, evaluate, and buy brandable startup domains"
                        rows={4}
                        maxLength={1000}
                        disabled={isSearching}
                        className={theme.searchForm.textarea}
                    />
                    {description.length > 0 && description.trim().length < 5 && (
                        <p className="mt-1 text-xs text-gray-400">{description.trim().length} characters (minimum 5)</p>
                    )}
                    {description.length >= 950 && (
                        <p className="mt-1 text-xs text-gray-400">{description.length}/1000 characters</p>
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
                    ) : hasResults && onClearResults ? (
                        <button
                            type="button"
                            onClick={onClearResults}
                            className={theme.searchForm.submitButton}
                        >
                            New Search
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
                </div>
            </form>
            <HistoryDialog
                isOpen={isHistoryOpen}
                history={searchHistory ?? []}
                onSelect={handleHistorySelect}
                onDelete={(id) => onDeleteHistory?.(id)}
                onClearAll={() => {
                    onClearAllHistory?.()
                    setIsHistoryOpen(false)
                }}
                onClose={() => setIsHistoryOpen(false)}
            />
            <ExamplesDialog
                isOpen={isExamplesOpen}
                examples={DESCRIPTION_EXAMPLES}
                onSelect={handleExampleSelect}
                onClose={() => setIsExamplesOpen(false)}
            />
        </>
    )
}
