interface ClearResultsModalProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ClearResultsModal({ isOpen, onCancel, onConfirm }: ClearResultsModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/45 p-4 backdrop-blur-[1px]"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-results-title"
        aria-describedby="clear-results-description"
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="clear-results-title" className="text-base font-semibold text-gray-900">
          Clear all results?
        </h3>
        <p id="clear-results-description" className="mt-2 text-sm leading-relaxed text-gray-600">
          This will remove all generated and checked domains from the current session.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg border border-red-300 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Clear results
          </button>
        </div>
      </div>
    </div>
  )
}
