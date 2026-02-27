import { useTheme } from '@/contexts/ThemeContext'

interface ClearResultsModalProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ClearResultsModal({ isOpen, onCancel, onConfirm }: ClearResultsModalProps) {
  const { theme } = useTheme()

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
            type="button"
            onClick={onCancel}
            className={theme.clearResultsModal.cancelButton}
          >
            Cancel
          </button>
          <button
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
