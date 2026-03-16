'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type FormState = 'idle' | 'loading' | 'success' | 'error'

interface MagicLinkFormProps {
  nextPath?: string
}

export function MagicLinkForm({ nextPath = '/app' }: MagicLinkFormProps) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmed = email.trim()
    if (!trimmed) return

    setState('loading')
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo },
      })

      if (error) {
        throw error
      }

      setState('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send magic link.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/50 px-4 py-3 text-center text-sm text-emerald-300">
        Check your email for a sign-in link.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="min-h-[44px] w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[linear-gradient(90deg,#6d28ff_0%,#4f46e5_28%,#2563eb_62%,#06b6d4_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(37,99,235,0.2)] transition-all hover:opacity-90 disabled:opacity-60"
        >
          {state === 'loading' ? 'Sending...' : 'Send magic link'}
        </button>
      </div>
      {errorMessage ? <p className="mt-3 text-center text-xs text-red-600">{errorMessage}</p> : null}
    </form>
  )
}
