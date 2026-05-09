'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { clearOptionalStorage } from '@/lib/privacy/client-consent'
import { createClient } from '@/lib/supabase/client'
import { PrivacyStorageControls } from '@/components/PrivacyStorageControls'

type ErrorPayload = {
  error?: string
}

export default function PrivacySettingsPage() {
  const router = useRouter()
  const { theme, themeName } = useTheme()
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const isMidnight = themeName === 'midnight'
  const mutedLabelClassName = isMidnight ? 'text-zinc-400' : 'text-gray-500'
  const breadcrumbCurrentClassName = isMidnight ? 'text-zinc-300' : 'text-gray-600'
  const primaryButtonClassName = isMidnight
    ? 'inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60'
    : 'inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60'
  const dangerLabelClassName = isMidnight ? 'text-red-300' : 'text-red-500'
  const errorTextClassName = isMidnight ? 'text-red-300' : 'text-red-600'
  const deletePromptClassName = isMidnight ? 'text-zinc-200' : 'text-gray-700'
  const deleteInputClassName = isMidnight
    ? 'mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition-colors focus:border-sky-500'
    : 'mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-zinc-500'
  const legalLinkClassName = isMidnight ? 'text-zinc-200 underline underline-offset-2' : 'underline underline-offset-2'

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)

    try {
      const response = await fetch('/api/privacy/export', {
        method: 'GET',
        cache: 'no-store',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as ErrorPayload | null
        throw new Error(payload?.error ?? 'Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'domain-gazer-export.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch('/api/privacy/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: deleteConfirm }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as ErrorPayload | null
        throw new Error(payload?.error ?? 'Failed to delete account')
      }

      clearOptionalStorage()
      const supabase = createClient()
      await supabase.auth.signOut().catch(() => {})
      router.replace('/')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  const canDelete = deleteConfirm === 'DELETE' && !isDeleting

  return (
    <div className={theme.layout.body}>
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-8 flex flex-wrap items-center gap-3 text-sm">
          <Link href="/app" className={theme.navbar.brand}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={theme.navbar.icon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <span>Dashboard</span>
          </Link>
          <span className={mutedLabelClassName}>/</span>
          <span className={`font-medium ${breadcrumbCurrentClassName}`}>Privacy &amp; Data</span>
        </nav>

        <div className="space-y-6">
          <section className={theme.page.searchCard}>
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${mutedLabelClassName}`}>Privacy</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Privacy &amp; Data</h1>
            <p className={`mt-3 text-sm leading-6 ${theme.page.subtitle}`}>
              Manage optional browser storage and analytics services, download the app data stored for your account,
              and request permanent account deletion. AI usage records are retained for up to 180 days. A minimal hashed
              anti-abuse marker may be retained after deletion to enforce one-time free-credit limits.
            </p>
          </section>

          <PrivacyStorageControls />

          <section className={theme.page.searchCard}>
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${mutedLabelClassName}`}>Export</p>
            <h2 className="mt-2 text-xl font-semibold">Download my data</h2>
            <p className={`mt-3 text-sm leading-6 ${theme.page.subtitle}`}>
              Export includes your search history stored by Domain Gazer.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => { void handleExport() }}
                disabled={isExporting}
                className={primaryButtonClassName}
              >
                {isExporting ? 'Preparing export...' : 'Download my data'}
              </button>
              {exportError && (
                <p className={`text-sm ${errorTextClassName}`}>{exportError}</p>
              )}
            </div>
          </section>

          <section className={theme.page.searchCard}>
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${dangerLabelClassName}`}>Danger zone</p>
            <h2 className="mt-2 text-xl font-semibold">Delete account</h2>
            <p className={`mt-3 text-sm leading-6 ${theme.page.subtitle}`}>
              This permanently removes your Domain Gazer account and app data. If you have an active paid subscription,
              cancel it first from the billing portal before continuing. To prevent free-credit abuse, a minimal hashed
              anti-abuse record may be retained after deletion.
            </p>
            <label className={`mt-5 block text-sm font-medium ${deletePromptClassName}`}>
              Type <span className="font-semibold">DELETE</span> to confirm
            </label>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className={deleteInputClassName}
              placeholder="DELETE"
            />
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => { void handleDeleteAccount() }}
                disabled={!canDelete}
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting account...' : 'Delete account'}
              </button>
              {deleteError && (
                <p className={`text-sm ${errorTextClassName}`}>{deleteError}</p>
              )}
            </div>
          </section>

          <section className={theme.page.searchCard}>
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${mutedLabelClassName}`}>Legal</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <Link href="/privacy" className={legalLinkClassName}>
                Privacy Policy
              </Link>
              <Link href="/cookies" className={legalLinkClassName}>
                Cookie Policy
              </Link>
              <Link href="/terms" className={legalLinkClassName}>
                Terms of Service
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
