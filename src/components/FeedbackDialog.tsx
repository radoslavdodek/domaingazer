'use client'

import { useEffect, useRef, useState } from 'react'
import type { DomainResult } from '@/lib/types'

export interface SearchContext {
  query: string
  results: Pick<DomainResult, 'fullDomain' | 'status'>[]
}

interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
  searchContext?: SearchContext | null
}

type FeedbackType = 'general' | 'bug_report' | 'feature_request'

const FEEDBACK_TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
]

const CATEGORIES = [
  { value: '', label: 'Select category (optional)' },
  { value: 'usability', label: 'UI / UX' },
  { value: 'performance', label: 'Performance' },
  { value: 'billing', label: 'Billing' },
  { value: 'content', label: 'Content' },
  { value: 'bug', label: 'Search' },
  { value: 'other', label: 'Other' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const MAX_ATTACHMENTS = 3

export function FeedbackDialog({ isOpen, onClose, searchContext }: FeedbackDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('medium')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  // Auto-close on success
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => {
      resetForm()
      onClose()
    }, 10000)
    return () => clearTimeout(timer)
  }, [success, onClose])

  const resetForm = () => {
    setMessage('')
    setTitle('')
    setFeedbackType('general')
    setCategory('')
    setPriority('medium')
    setFiles([])
    setPreviews((prev) => { prev.forEach((url) => URL.revokeObjectURL(url)); return [] })
    setError(null)
    setSuccess(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) handleClose()
  }

  const addFiles = (newFiles: FileList | File[]) => {
    const toAdd = Array.from(newFiles).filter((f) => f.type.startsWith('image/'))
    const total = [...files, ...toAdd].slice(0, MAX_ATTACHMENTS)
    setFiles(total)
    setPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url))
      return total.map((f) => URL.createObjectURL(f))
    })
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      setError('Please enter a message.')
      return
    }

    setSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append('message', message.trim())
    if (title.trim()) formData.append('title', title.trim())
    if (category) formData.append('category', category)
    formData.append('priority', priority)
    formData.append('feedback_type', feedbackType)
    formData.append('page_url', window.location.href)
    formData.append('user_agent', navigator.userAgent)
    formData.append('screen_info', `${window.screen.width}x${window.screen.height} / ${window.innerWidth < 768 ? 'mobile' : 'desktop'}`)

    if (searchContext) {
      formData.append('search_context', JSON.stringify(searchContext))
    }

    const commitId = process.env.NEXT_PUBLIC_APP_COMMIT_ID
    const commitDate = process.env.NEXT_PUBLIC_APP_COMMIT_DATE
    if (commitId && commitId !== 'unknown') {
      formData.append('app_version', `${commitId} (${commitDate})`)
    }

    for (const file of files) {
      formData.append('attachments', file)
    }

    try {
      const res = await fetch('/api/feedback', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit feedback')
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="m-auto w-full max-w-lg rounded-xl px-3 py-0 shadow-2xl backdrop:bg-black/50 sm:px-0 open:flex open:flex-col"
      style={{ border: 'none', background: 'transparent' }}
    >
      <div className="flex flex-col rounded-xl bg-white dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-zinc-700">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-zinc-100">Share your feedback</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              Help us improve Domain Gazer
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 text-green-600 dark:text-green-400">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-800 dark:text-zinc-100">Thank you!</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Your feedback has been received.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
              {/* Feedback type */}
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
                {FEEDBACK_TYPES.map((ft) => (
                  <button
                    key={ft.value}
                    type="button"
                    onClick={() => setFeedbackType(ft.value)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      feedbackType === ft.value
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                        : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    {ft.label}
                  </button>
                ))}
              </div>

              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary (optional)"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-500"
              />

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                required
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-500"
              />

              {/* Category + Priority row */}
              <div className="flex gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-28 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Attachments */}
              <div>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2.5 dark:border-zinc-600"
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={files.length >= MAX_ATTACHMENTS}
                    className="shrink-0 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Attach images
                  </button>
                  <span className="text-xs text-gray-400 dark:text-zinc-500">
                    {files.length >= MAX_ATTACHMENTS
                      ? `${MAX_ATTACHMENTS} files maximum`
                      : 'or drag and drop (max 5MB each)'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                    className="hidden"
                  />
                </div>

                {previews.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {previews.map((url, i) => (
                      <div key={i} className="group relative">
                        <img
                          src={url}
                          alt={`Attachment ${i + 1}`}
                          className="h-16 w-16 rounded-md border border-gray-200 object-cover dark:border-zinc-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-zinc-600"
                          aria-label={`Remove attachment ${i + 1}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                            <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-zinc-700">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Share your feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  )
}
