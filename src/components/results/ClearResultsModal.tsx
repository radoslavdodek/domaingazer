'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface ClearResultsModalProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ClearResultsModal({ isOpen, onCancel, onConfirm }: ClearResultsModalProps) {
  const { theme } = useTheme()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel()
      return
    }

    if (event.key === 'Tab') {
      const focusable = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[]
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
  }, [onCancel])

  useEffect(() => {
    if (!isOpen) return

    triggerRef.current = document.activeElement as HTMLElement

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    // Auto-focus cancel button
    requestAnimationFrame(() => {
      cancelRef.current?.focus()
    })

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      triggerRef.current?.focus()
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className={theme.clearResultsModal.overlay}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-results-title"
        aria-describedby="clear-results-description"
        className={theme.clearResultsModal.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="clear-results-title" className={theme.clearResultsModal.title}>
          Clear all results?
        </h3>
        <p id="clear-results-description" className={theme.clearResultsModal.body}>
          This will remove all generated and checked domains from the current session.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className={theme.clearResultsModal.cancelButton}
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={theme.clearResultsModal.confirmButton}
          >
            Clear results
          </button>
        </div>
      </div>
    </div>
  )
}
