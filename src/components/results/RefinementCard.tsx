import type { RefObject } from 'react'
import type { TLD } from '@/lib/types'
import { useTheme } from '@/contexts/ThemeContext'
import type { SearchStatus } from './types'

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
  const { theme } = useTheme()

  return (
    <div className={theme.refinementCard.wrapper}>
      {(status === 'done' || status === 'cancelled' || status === 'searching') && onGenerateMore && (
        <div className="space-y-2">
          <label className={theme.refinementCard.label}>Not quite right? Steer the AI:</label>
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
              className={theme.refinementCard.input}
            />
            <button
              type="button"
              onClick={() => {
                onGenerateMore(hint)
              }}
              disabled={status === 'searching'}
              className={theme.refinementCard.button}
            >
              {status === 'searching' ? 'Generating and verifying names...' : 'Generate more names'}
            </button>
          </div>
        </div>
      )}

      {onCheckCustom && tlds.length > 0 && (
        <div className="space-y-2">
          <label className={theme.refinementCard.label}>Add your own idea:</label>
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
              className={theme.refinementCard.input}
            />
            <button
              type="submit"
              disabled={!customInput.trim() || isCheckingCustom}
              className={theme.refinementCard.button}
            >
              {isCheckingCustom ? 'Checking...' : 'Check availability'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
