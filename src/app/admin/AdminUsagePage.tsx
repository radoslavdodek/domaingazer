'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type UsageRecord = {
  id: string
  created_at: string
  user_email: string
  provider: string
  model: string
  feature: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

type AggregatedByUser = {
  user_email: string
  model: string
  provider: string
  total_tokens: number
  request_count: number
}

type AggregatedByModel = {
  model: string
  provider: string
  total_tokens: number
  request_count: number
}

type Tab = 'recent' | 'by-user' | 'by-model'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function fmtNum(n: number) {
  return n.toLocaleString()
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

export function AdminUsagePage() {
  const [tab, setTab] = useState<Tab>('recent')
  const [records, setRecords] = useState<UsageRecord[]>([])
  const [byUser, setByUser] = useState<AggregatedByUser[]>([])
  const [byModel, setByModel] = useState<AggregatedByModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [recent, user, model] = await Promise.all([
          fetch('/api/admin/usage').then(r => r.json()),
          fetch('/api/admin/usage?groupBy=user').then(r => r.json()),
          fetch('/api/admin/usage?groupBy=model').then(r => r.json()),
        ])
        if (recent.error) throw new Error(recent.error)
        setRecords(recent as UsageRecord[])
        setByUser(user as AggregatedByUser[])
        setByModel(model as AggregatedByModel[])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const tokensToday = records
    .filter(r => new Date(r.created_at) >= todayStart)
    .reduce((s, r) => s + r.total_tokens, 0)
  const tokensMonth = records
    .filter(r => new Date(r.created_at) >= monthStart)
    .reduce((s, r) => s + r.total_tokens, 0)
  const tokensTotal = records.reduce((s, r) => s + r.total_tokens, 0)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'recent', label: 'Recent Records' },
    { key: 'by-user', label: 'By User' },
    { key: 'by-model', label: 'By Model' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            Domain Gazer
          </Link>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Admin — Usage</span>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Model Usage</h1>

        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
        )}

        {!loading && !error && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard label="Tokens today" value={fmtNum(tokensToday)} />
              <SummaryCard label="Tokens this month" value={fmtNum(tokensMonth)} />
              <SummaryCard label="Tokens all time" value={fmtNum(tokensTotal)} />
            </div>

            <div className="mb-6 flex gap-1 border-b border-gray-200 dark:border-gray-700">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    tab === t.key
                      ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'recent' && (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {['Time', 'User', 'Provider', 'Model', 'Feature', 'Prompt', 'Completion', 'Total'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    {records.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-gray-400">{fmtDate(r.created_at)}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.user_email}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.provider}</td>
                        <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{r.model}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            r.feature === 'explain'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>{r.feature}</span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{fmtNum(r.prompt_tokens)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{fmtNum(r.completion_tokens)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900 dark:text-white">{fmtNum(r.total_tokens)}</td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No records yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'by-user' && (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {['User', 'Provider', 'Model', 'Requests', 'Total Tokens'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    {byUser.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.user_email}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.provider}</td>
                        <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{r.model}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{fmtNum(r.request_count)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900 dark:text-white">{fmtNum(r.total_tokens)}</td>
                      </tr>
                    ))}
                    {byUser.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'by-model' && (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {['Provider', 'Model', 'Requests', 'Total Tokens'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    {byModel.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.provider}</td>
                        <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{r.model}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{fmtNum(r.request_count)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900 dark:text-white">{fmtNum(r.total_tokens)}</td>
                      </tr>
                    ))}
                    {byModel.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
