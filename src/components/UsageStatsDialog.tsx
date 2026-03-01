'use client'

import { useEffect, useRef, useState } from 'react'

interface DailyStat {
  date: string
  count: number
}

interface UsageStatsDialogProps {
  isOpen: boolean
  onClose: () => void
}

const PERIODS = [
  { label: 'Today', days: 1 },
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
]

export function UsageStatsDialog({ isOpen, onClose }: UsageStatsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [days, setDays] = useState(7)
  const [stats, setStats] = useState<DailyStat[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen) dialog.showModal()
    else dialog.close()
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleCancel = (e: Event) => { e.preventDefault(); onClose() }
    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    fetch(`/api/usage-stats?days=${days}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return
        setStats(data.stats)
        setTotal(data.total)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isOpen, days])

  const maxCount = Math.max(...stats.map((s) => s.count), 1)

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose()
  }

  const formatDate = (date: string) => {
    if (days === 1) return 'Today'
    const d = new Date(date + 'T12:00:00Z')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="m-auto w-full max-w-lg rounded-xl p-0 shadow-2xl backdrop:bg-black/50 open:flex open:flex-col"
      style={{ border: 'none', background: 'transparent' }}
    >
      <div className="flex flex-col rounded-xl bg-white dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-zinc-700">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-zinc-100">Search usage</h2>
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

        <div className="p-5">
          <div className="mb-5 flex items-center gap-1.5">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => setDays(p.days)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  days === p.days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                }`}
              >
                {p.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400 dark:text-zinc-500">
              {total} search{total !== 1 ? 'es' : ''} total
            </span>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-zinc-500">
              Loading…
            </div>
          ) : total === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-zinc-500">
              No searches in this period
            </div>
          ) : (
            <div className="space-y-2">
              {stats.map((s) => (
                <div key={s.date} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-right text-xs text-gray-400 dark:text-zinc-500">
                    {formatDate(s.date)}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                    <div
                      className="h-5 rounded-full bg-blue-500 transition-all duration-300 dark:bg-blue-600"
                      style={{ width: s.count === 0 ? '0%' : `${(s.count / maxCount) * 100}%`, minWidth: s.count > 0 ? '6px' : '0' }}
                    />
                  </div>
                  <span className="w-5 shrink-0 text-right text-xs font-medium text-gray-600 dark:text-zinc-300">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
