'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { TldSearchInput } from '@/components/TldSearchInput'
import type { TLD } from '@/lib/types'

interface TldLookupDialogProps {
  isOpen: boolean
  supportedTlds: TLD[]
  excludedTlds?: TLD[]
  isLoading?: boolean
  error?: string | null
  resetKey?: number
  title?: string
  description?: string
  placeholder?: string
  onSelect: (tld: TLD) => void
  onClose: () => void
}

export function TldLookupDialog({
  isOpen,
  supportedTlds,
  excludedTlds = [],
  isLoading = false,
  error = null,
  resetKey = 0,
  title = 'Find Another Extension',
  placeholder = 'Find TLD, e.g. .academy or .training',
  onSelect,
  onClose,
}: TldLookupDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { themeName } = useTheme()
  const isMidnightTheme = themeName === 'midnight'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
      requestAnimationFrame(() => {
        searchInputRef.current?.focus()
      })
    }

    if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) onClose()
  }

  const panelClass = isMidnightTheme
    ? 'flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900'
    : 'flex flex-col rounded-xl border border-gray-200 bg-white'
  const headerClass = isMidnightTheme
    ? 'flex items-center justify-between border-b border-zinc-800 px-5 py-4'
    : 'flex items-center justify-between border-b border-gray-200 px-5 py-4'
  const titleClass = isMidnightTheme
    ? 'text-sm font-semibold text-zinc-100'
    : 'text-sm font-semibold text-gray-800'
  const bodyTextClass = isMidnightTheme
    ? 'mt-1 text-xs text-zinc-400'
    : 'mt-1 text-xs text-gray-500'
  const closeButtonClass = isMidnightTheme
    ? 'rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300'
    : 'rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="m-auto w-full max-w-xl rounded-xl px-3 py-0 shadow-2xl backdrop:bg-black/50 sm:px-0 open:flex open:flex-col"
      style={{ border: 'none', background: 'transparent' }}
    >
      <div className={panelClass}>
        <div className={headerClass}>
          <div>
            <h2 className={titleClass}>{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={closeButtonClass}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <TldSearchInput
            supportedTlds={supportedTlds}
            excludedTlds={excludedTlds}
            onSelect={(tld) => {
              onSelect(tld)
              onClose()
            }}
            placeholder={placeholder}
            inputRef={searchInputRef}
            isLoading={isLoading}
            error={error}
            resetKey={resetKey}
          />
        </div>
      </div>
    </dialog>
  )
}
