'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface Example {
  title: string
  description: string
}

interface ExamplesDialogProps {
  isOpen: boolean
  examples: Example[]
  onSelect: (description: string) => void
  onClose: () => void
}

export function ExamplesDialog({ isOpen, examples, onSelect, onClose }: ExamplesDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { themeName } = useTheme()
  const isMidnightTheme = themeName === 'midnight'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    }

    if (!isOpen && dialog.open) {
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
  const listClass = isMidnightTheme
    ? 'max-h-[26rem] space-y-2 overflow-y-auto p-3'
    : 'max-h-[26rem] space-y-2 overflow-y-auto p-3'
  const exampleButtonClass = isMidnightTheme
    ? 'w-full rounded-xl border border-zinc-800 bg-zinc-800/80 px-4 py-3 text-left text-sm leading-relaxed text-zinc-200 transition-colors hover:border-sky-700 hover:bg-zinc-800'
    : 'w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm leading-relaxed text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50'

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="m-auto w-full max-w-2xl rounded-xl px-3 py-0 shadow-2xl backdrop:bg-black/50 sm:px-0 open:flex open:flex-col"
      style={{ border: 'none', background: 'transparent' }}
    >
      <div className={panelClass}>
        <div className={headerClass}>
          <div>
            <h2 className={titleClass}>Project Description Examples</h2>
            <p className={bodyTextClass}>
              Here are some examples of how to write a project description.
            </p>
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

        <div className={listClass}>
          {examples.map((example) => (
            <button
              key={example.title}
              type="button"
              onClick={() => onSelect(example.description)}
              className={exampleButtonClass}
            >
              <span className={`block text-xs font-semibold mb-1.5 ${isMidnightTheme ? 'text-zinc-400' : 'text-gray-500'}`}>
                {example.title}
              </span>
              {example.description}
            </button>
          ))}
        </div>
      </div>
    </dialog>
  )
}
