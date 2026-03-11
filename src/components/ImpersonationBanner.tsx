'use client'

import { useEffect, useState } from 'react'
import { IMPERSONATE_INFO_COOKIE } from '@/lib/impersonation-constants'

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function ImpersonationBanner() {
  const [info, setInfo] = useState<{ email?: string; name?: string | null } | null>(null)
  const [stopping, setStopping] = useState(false)

  useEffect(() => {
    const raw = getCookie(IMPERSONATE_INFO_COOKIE)
    if (!raw) return
    try {
      setInfo(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  if (!info) return null

  const label = info.name ? `${info.name} (${info.email})` : info.email

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
