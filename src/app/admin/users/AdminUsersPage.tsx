'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type UserEntry = {
  id: string
  email: string
  name: string | null
  is_admin: boolean
  created_at: string
  last_sign_in_at: string | null
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserEntry[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [impersonating, setImpersonating] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const q = search ? `?search=${encodeURIComponent(search)}` : ''
        const res = await fetch(`/api/admin/users${q}`)
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setUsers(data.users)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [search])

  const handleImpersonate = async (userId: string) => {
    setImpersonating(userId)
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to impersonate')
        setImpersonating(null)
        return
      }
      window.location.assign('/app')
    } catch {
      alert('Failed to impersonate')
      setImpersonating(null)
    }
  }

  const fmtDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/app" className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            Domain Gazer
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              Usage
            </Link>
            <Link href="/admin/feedback" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              Feedback
            </Link>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Admin — Users</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
        )}

        {!loading && !error && (
          <>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {users.length} user{users.length !== 1 ? 's' : ''}
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {['Email', 'Name', 'Role', 'Created', 'Last Sign In', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{u.email}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.name || '—'}</td>
                      <td className="px-4 py-3">
                        {u.is_admin ? (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Admin</span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">User</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">{fmtDate(u.created_at)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">{fmtDate(u.last_sign_in_at)}</td>
                      <td className="px-4 py-3 text-right">
                        {!u.is_admin && (
                          <button
                            type="button"
                            onClick={() => { void handleImpersonate(u.id) }}
                            disabled={impersonating !== null}
                            className="rounded-md bg-amber-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
                          >
                            {impersonating === u.id ? 'Redirecting...' : 'Impersonate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                        {search ? 'No users match your search' : 'No users found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
