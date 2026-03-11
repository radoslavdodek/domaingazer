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
  cost_usd: number | null
}

type AggregatedByUser = {
  user_email: string
  model: string
  provider: string
  total_tokens: number
  cost_usd: number
  request_count: number
}

type AggregatedByModel = {
  model: string
  provider: string
  total_tokens: number
  cost_usd: number
  request_count: number
}

type Tab = 'recent' | 'by-user' | 'by-model' | 'searches'
type TimePeriod = 'today' | 'yesterday' | '7d' | '30d' | '365d' | 'all'
type DailyStat = { date: string; count: number }
type CostBucket = { bucket: string; cost_usd: number }

const TIME_PERIODS: { key: TimePeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '365d', label: 'Last year' },
  { key: 'all', label: 'All time' },
]

function getPeriodRange(period: TimePeriod): { since?: string; until?: string } {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  switch (period) {
    case 'today':
      return { since: todayStart.toISOString() }
    case 'yesterday': {
      const d = new Date(todayStart)
      d.setDate(d.getDate() - 1)
      return { since: d.toISOString(), until: todayStart.toISOString() }
    }
    case '7d': {
      const d = new Date(todayStart)
      d.setDate(d.getDate() - 6)
      return { since: d.toISOString() }
    }
    case '30d': {
      const d = new Date(todayStart)
      d.setDate(d.getDate() - 29)
      return { since: d.toISOString() }
    }
    case '365d': {
      const d = new Date(todayStart)
      d.setFullYear(d.getFullYear() - 1)
      return { since: d.toISOString() }
    }
    case 'all':
      return {}
  }
}

function getGranularity(period: TimePeriod): 'hour' | 'day' {
  return period === 'today' || period === 'yesterday' ? 'hour' : 'day'
}

function buildQuery(params: Record<string, string | undefined>): string {
  const parts = Object.entries(params)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
  return parts.length ? `?${parts.join('&')}` : ''
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function fmtNum(n: number) {
  return n.toLocaleString()
}

function fmtCost(usd: number) {
  if (usd < 0.01) return `$${usd.toFixed(5)}`
  return `$${usd.toFixed(4)}`
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
  const [period, setPeriod] = useState<TimePeriod>('all')
  const [records, setRecords] = useState<UsageRecord[]>([])
  const [byUser, setByUser] = useState<AggregatedByUser[]>([])
  const [byModel, setByModel] = useState<AggregatedByModel[]>([])
  const [searchStats, setSearchStats] = useState<DailyStat[]>([])
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchChartTruncated, setSearchChartTruncated] = useState(false)
  const [costBuckets, setCostBuckets] = useState<CostBucket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      const { since, until } = getPeriodRange(period)
      const base: Record<string, string | undefined> = { since, until }
      const makeUrl = (extra: Record<string, string | undefined>) =>
        `/api/admin/usage${buildQuery({ ...base, ...extra })}`

      try {
        const granularity = getGranularity(period)
        const [recent, user, model, searches, costs] = await Promise.all([
          fetch(makeUrl({})).then(r => r.json()),
          fetch(makeUrl({ groupBy: 'user' })).then(r => r.json()),
          fetch(makeUrl({ groupBy: 'model' })).then(r => r.json()),
          fetch(makeUrl({ groupBy: 'searches' })).then(r => r.json()),
          fetch(makeUrl({ groupBy: 'costs', granularity })).then(r => r.json()),
        ])
        if (recent.error) throw new Error(recent.error)
        setRecords(recent as UsageRecord[])
        setByUser(user as AggregatedByUser[])
        setByModel(model as AggregatedByModel[])
        setSearchStats(searches.stats ?? [])
        setSearchTotal(searches.total ?? 0)
        setSearchChartTruncated(searches.chartTruncated ?? false)
        setCostBuckets(Array.isArray(costs) ? costs as CostBucket[] : [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  const summaryRequests = byModel.reduce((s, r) => s + r.request_count, 0)
  const summaryTokens = byModel.reduce((s, r) => s + r.total_tokens, 0)
  const summaryCost = byModel.reduce((s, r) => s + r.cost_usd, 0)

  const byUserTotal = Array.from(
    byUser.reduce((map, r) => {
      const existing = map.get(r.user_email)
      if (existing) {
        existing.request_count += r.request_count
        existing.total_tokens += r.total_tokens
        existing.cost_usd += r.cost_usd
      } else {
        map.set(r.user_email, { user_email: r.user_email, request_count: r.request_count, total_tokens: r.total_tokens, cost_usd: r.cost_usd })
      }
      return map
    }, new Map<string, { user_email: string; request_count: number; total_tokens: number; cost_usd: number }>())
    .values()
  ).sort((a, b) => b.cost_usd - a.cost_usd)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'recent', label: 'Recent Records' },
    { key: 'by-user', label: 'By User' },
    { key: 'by-model', label: 'By Model' },
    { key: 'searches', label: 'Domain Searches' },
  ]

  const searchMaxCount = Math.max(...searchStats.map((s) => s.count), 1)

  const fmtDay = (date: string) => {
    const d = new Date(date + 'T12:00:00Z')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
            <Link href="/admin/users" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              Users
            </Link>
            <Link href="/admin/feedback" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              Feedback
            </Link>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Admin — Usage</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Model Usage</h1>
          <div className="flex flex-wrap gap-1">
            {TIME_PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === p.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
        )}

        {!loading && !error && (
          <>
            <div className="mb-8 grid grid-cols-3 gap-4">
              <SummaryCard label="Requests" value={fmtNum(summaryRequests)} />
              <SummaryCard label="Total tokens" value={fmtNum(summaryTokens)} />
              <SummaryCard label="Total cost" value={fmtCost(summaryCost)} />
            </div>

            {costBuckets.length > 0 && (() => {
              const granularity = getGranularity(period)
              const maxCost = Math.max(...costBuckets.map(b => b.cost_usd), 1e-9)
              const n = costBuckets.length
              const labelStep = n <= 7 ? 1 : n <= 24 ? 4 : n <= 31 ? 5 : Math.ceil(n / 12)
              const scrollable = n > 60
              const minBarPx = scrollable ? 6 : undefined

              function fmtBucket(bucket: string) {
                if (granularity === 'hour') {
                  return new Date(bucket + ':00:00Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
                return new Date(bucket + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }

              return (
                <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                    Cost over time
                  </p>
                  <div className="overflow-x-auto">
                    <div style={{ minWidth: scrollable ? `${n * 7}px` : '100%' }}>
                      <div className="flex items-end gap-px" style={{ height: '128px' }}>
                        {costBuckets.map((b) => (
                          <div
                            key={b.bucket}
                            className="flex-1 cursor-default rounded-t-sm bg-emerald-500 transition-colors hover:bg-emerald-400 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                            style={{
                              minWidth: minBarPx,
                              height: b.cost_usd === 0 ? '2px' : `${Math.max((b.cost_usd / maxCost) * 100, 1.5)}%`,
                            }}
                            title={`${fmtBucket(b.bucket)}: ${fmtCost(b.cost_usd)}`}
                          />
                        ))}
                      </div>
                      <div className="mt-1 flex gap-px">
                        {costBuckets.map((b, i) => (
                          <div key={b.bucket} className="flex-1 overflow-visible" style={{ minWidth: minBarPx }}>
                            {i % labelStep === 0 && (
                              <span className="whitespace-nowrap text-[10px] text-gray-400 dark:text-gray-500">
                                {fmtBucket(b.bucket)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

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
                      {['Time', 'User', 'Provider', 'Model', 'Feature', 'Prompt', 'Completion', 'Total', 'Cost'].map(h => (
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
                        <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                          {r.cost_usd != null ? fmtCost(r.cost_usd) : '—'}
                        </td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No records yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'by-user' && (
              <div className="space-y-6">
                {byUserTotal.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Cost by user</p>
                    <div className="space-y-3">
                      {byUserTotal.map((r) => (
                        <div key={r.user_email} className="flex items-center gap-3">
                          <span className="w-48 shrink-0 truncate text-right text-xs text-gray-500 dark:text-gray-400" title={r.user_email}>
                            {r.user_email}
                          </span>
                          <div className="flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                            <div
                              className="h-6 rounded-full bg-emerald-500 transition-all duration-300 dark:bg-emerald-600"
                              style={{
                                width: `${(r.cost_usd / byUserTotal[0].cost_usd) * 100}%`,
                                minWidth: r.cost_usd > 0 ? '8px' : '0',
                              }}
                            />
                          </div>
                          <span className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                            {fmtCost(r.cost_usd)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {['User', 'Requests', 'Total Tokens', 'Total Cost'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-900">
                      {byUserTotal.map((r) => (
                        <tr key={r.user_email} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{r.user_email}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-gray-600 dark:text-gray-300">{fmtNum(r.request_count)}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900 dark:text-white">{fmtNum(r.total_tokens)}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{fmtCost(r.cost_usd)}</td>
                        </tr>
                      ))}
                      {byUserTotal.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No data</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {byUser.length > 0 && (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Breakdown by model</p>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            {['User', 'Provider', 'Model', 'Requests', 'Total Tokens', 'Total Cost'].map(h => (
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
                              <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{fmtCost(r.cost_usd)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === 'by-model' && (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {['Provider', 'Model', 'Requests', 'Total Tokens', 'Total Cost'].map(h => (
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
                        <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{fmtCost(r.cost_usd)}</td>
                      </tr>
                    ))}
                    {byModel.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'searches' && (
              <div>
                <div className="mb-5 flex items-center">
                  <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                    {searchTotal} search{searchTotal !== 1 ? 'es' : ''} total
                    {searchChartTruncated && (
                      <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">(chart shows last 90 days)</span>
                    )}
                  </span>
                </div>

                {searchTotal === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">No searches in this period</p>
                ) : (
                  <div className="space-y-2">
                    {searchStats.map((s) => (
                      <div key={s.date} className="flex items-center gap-3">
                        <span className="w-16 shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
                          {fmtDay(s.date)}
                        </span>
                        <div className="flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                          <div
                            className="h-6 rounded-full bg-indigo-500 transition-all duration-300 dark:bg-indigo-600"
                            style={{ width: s.count === 0 ? '0%' : `${(s.count / searchMaxCount) * 100}%`, minWidth: s.count > 0 ? '8px' : '0' }}
                          />
                        </div>
                        <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                          {s.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          {process.env.NEXT_PUBLIC_APP_COMMIT_ID && process.env.NEXT_PUBLIC_APP_COMMIT_ID !== 'unknown'
            ? `Version: ${process.env.NEXT_PUBLIC_APP_COMMIT_ID} (${process.env.NEXT_PUBLIC_APP_COMMIT_DATE})`
            : 'Version: dev'}
        </p>
      </footer>
    </div>
  )
}
