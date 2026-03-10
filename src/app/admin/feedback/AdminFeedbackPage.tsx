'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type FeedbackEntry = {
  id: string
  created_at: string
  user_email: string
  user_id: string | null
  title: string | null
  message: string
  category: string | null
  priority: string | null
  feedback_type: string | null
  page_url: string | null
  user_agent: string | null
  screen_info: string | null
  attachments: string[] | null
  attachment_urls?: string[]
  app_version: string | null
  search_context: { query: string; results: { fullDomain: string; status: string }[] } | null
}

const TYPE_COLORS: Record<string, string> = {
  bug_report: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  feature_request: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  general: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function fmtType(type: string | null) {
  if (!type) return 'General'
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/feedback')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load feedback')
        return r.json()
      })
      .then((data) => setFeedback(data.feedback ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100">User Feedback</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              {feedback.length} submission{feedback.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading && (
          <p className="py-12 text-center text-sm text-gray-500 dark:text-zinc-400">Loading feedback...</p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>
        )}

        {!loading && !error && feedback.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500 dark:text-zinc-400">No feedback submitted yet.</p>
        )}

        {!loading && feedback.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">User</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Priority</th>
                  <th className="px-4 py-3 font-medium text-gray-500 dark:text-zinc-400">Title / Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {feedback.map((entry) => {
                  const isExpanded = expandedId === entry.id
                  return (
                    <tr
                      key={entry.id}
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 align-top text-gray-600 dark:text-zinc-400">
                        {fmtDate(entry.created_at)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="text-gray-900 dark:text-zinc-100">{entry.user_email}</span>
                        {!entry.user_id && (
                          <span className="ml-1.5 text-xs text-gray-400 dark:text-zinc-500">(deleted)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[entry.feedback_type ?? 'general'] ?? TYPE_COLORS.general}`}>
                          {fmtType(entry.feedback_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {entry.priority && (
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[entry.priority] ?? PRIORITY_COLORS.medium}`}>
                            {entry.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {entry.title && (
                          <p className="font-medium text-gray-900 dark:text-zinc-100">{entry.title}</p>
                        )}
                        <p className={`text-gray-600 dark:text-zinc-400 ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
                          {entry.message}
                        </p>
                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            {entry.app_version && (
                              <p className="text-xs text-gray-400 dark:text-zinc-500">Version: {entry.app_version}</p>
                            )}
                            {entry.category && (
                              <p className="text-xs text-gray-400 dark:text-zinc-500">Category: {entry.category}</p>
                            )}
                            {entry.page_url && (
                              <p className="text-xs text-gray-400 dark:text-zinc-500">Page: {entry.page_url}</p>
                            )}
                            {entry.screen_info && (
                              <p className="text-xs text-gray-400 dark:text-zinc-500">Screen: {entry.screen_info}</p>
                            )}
                            {entry.user_agent && (
                              <p className="break-all text-xs text-gray-400 dark:text-zinc-500">UA: {entry.user_agent}</p>
                            )}
                            {entry.search_context && (
                              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-900/50 dark:bg-blue-950/20">
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                  Search: &ldquo;{entry.search_context.query}&rdquo;
                                </p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {entry.search_context.results.map((r, i) => (
                                    <span
                                      key={i}
                                      className={`inline-block rounded px-1.5 py-0.5 text-xs ${
                                        r.status === 'AVAILABLE'
                                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                          : r.status === 'UNAVAILABLE'
                                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
                                      }`}
                                    >
                                      {r.fullDomain}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {entry.attachment_urls && entry.attachment_urls.length > 0 && (
                              <div className="flex gap-2 pt-1">
                                {entry.attachment_urls.map((url, i) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={url}
                                      alt={`Attachment ${i + 1}`}
                                      className="h-24 w-24 rounded-md border border-gray-200 object-cover transition-opacity hover:opacity-80 dark:border-zinc-700"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
