import type { RefObject } from 'react'
import type { TLD } from '@/lib/types'
import type { SearchStatus } from './types'

const secondaryButtonClass = 'w-full rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white sm:w-auto'

interface RefinementCardProps {
  status: SearchStatus
  tlds: TLD[]
  hint: string
  customInput: string
  isCheckingCustom?: boolean
  onHintChange: (value: string) => void
  onCustomInputChange: (value: string) => void
  onGenerateMore?: (hint: string) => void
  onCheckCustom?: (baseName: string) => void
  hintRef: RefObject<HTMLInputElement>
}

export function RefinementCard({
  status,
  tlds,
  hint,
  customInput,
  isCheckingCustom,
  onHintChange,
  onCustomInputChange,
  onGenerateMore,
  onCheckCustom,
  hintRef,
}: RefinementCardProps) {
  return (
    <div className="space-y-4 border-t border-gray-100 bg-gray-50/80 p-4 sm:p-5">
      {(status === 'done' || status === 'cancelled' || status === 'searching') && onGenerateMore && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Not quite right? Steer the AI:</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              ref={hintRef}
              type="text"
              value={hint}
              onChange={(event) => onHintChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && status !== 'searching') {
                  onGenerateMore(hint)
                }
              }}
              placeholder="e.g. shorter, more playful, finance-focused"
              disabled={status === 'searching'}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => {
                onGenerateMore(hint)
              }}
              disabled={status === 'searching'}
              className={secondaryButtonClass}
            >
              {status === 'searching' ? 'Generating and verifying names...' : 'Generate more names'}
            </button>
          </div>
        </div>
      )}

      {onCheckCustom && tlds.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Add your own idea:</label>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const name = customInput.trim().toLowerCase().replace(/\s+/g, '').replace(/\.$/, '')
              if (!name) return
              onCheckCustom(name)
              onCustomInputChange('')
            }}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              type="text"
              value={customInput}
              onChange={(event) => onCustomInputChange(event.target.value)}
              placeholder="e.g. myapp"
              disabled={isCheckingCustom}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!customInput.trim() || isCheckingCustom}
              className={secondaryButtonClass}
            >
              {isCheckingCustom ? 'Checking...' : 'Check availability'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
