'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function GitHubMark({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  )
}

interface GitHubSignInButtonProps {
  nextPath?: string
}

export function GitHubSignInButton({ nextPath = '/app' }: GitHubSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleClick() {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to sign in with GitHub.')
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-100 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-sm transition-all hover:bg-white/[0.08] disabled:opacity-60"
      >
        <GitHubMark />
        <span>{isLoading ? 'Redirecting...' : 'Continue with GitHub'}</span>
      </button>
      {errorMessage ? <p className="mt-3 text-center text-xs text-red-600">{errorMessage}</p> : null}
    </div>
  )
}
