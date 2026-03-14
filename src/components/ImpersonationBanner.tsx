'use client'

import { useState } from 'react'

interface ImpersonationBannerProps {
  label: string | null
}

export function ImpersonationBanner({ label }: ImpersonationBannerProps) {
  const [stopping, setStopping] = useState(false)

  if (!label) return null

  const handleStop = async () => {
    setStopping(true)
    try {
      await fetch('/api/admin/impersonate', { method: 'DELETE' })
    } finally {
      window.location.reload()
    }
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950 shadow-md">
        <span>
          Viewing as <strong>{label}</strong>
        </span>
        <button
          type="button"
          onClick={() => { void handleStop() }}
          disabled={stopping}
          className="rounded-md bg-amber-800 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-amber-900 disabled:opacity-60"
        >
          {stopping ? 'Stopping...' : 'Stop Impersonating'}
        </button>
      </div>
      {/* Spacer to push page content below the fixed banner */}
      <div className="h-10" />
    </>
  )
}
