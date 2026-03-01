'use client'

import { useEffect, useRef } from 'react'
import type { TLD } from '@/lib/types'

interface SearchHistoryEntry {
  id: string
  description: string
  selected_tlds: TLD[]
}

interface HistoryDialogProps {
  isOpen: boolean
  history: SearchHistoryEntry[]
  onSelect: (entry: SearchHistoryEntry) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function HistoryDialog({ isOpen, history, onSelect, onDelete, onClose }: HistoryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="m-auto w-full max-w-lg rounded-xl px-3 py-0 shadow-2xl backdrop:bg-black/50 sm:px-0 open:flex open:flex-col"
      style={{ border: 'none', background: 'transparent' }}
    >
      <div className="flex flex-col rounded-xl bg-white dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-zinc-100">Recent searches</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <ul className="max-h-80 overflow-y-auto py-2">
          {history.map((entry) => (
            <li key={entry.id} className="group flex items-start gap-1 px-3 hover:bg-gray-50 dark:hover:bg-zinc-800">
              <button
                type="button"
                onClick={() => onSelect(entry)}
                className="min-w-0 flex-1 py-3 pl-2 text-left"
              >
                <p className="mb-1 text-sm text-gray-800 dark:text-zinc-100 line-clamp-2">
                  {entry.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {entry.selected_tlds.map((tld) => (
                    <span
                      key={tld}
                      className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-zinc-700 dark:text-zinc-400"
                    >
                      {tld}
                    </span>
                  ))}
                </div>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
                className="mt-3 shrink-0 rounded p-1 text-gray-300 opacity-100 transition-opacity hover:bg-gray-100 hover:text-gray-500 dark:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
                  <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5A.75.75 0 0 1 9.95 6Z" clipRule="evenodd" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  )
}
