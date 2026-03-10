'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { GitHubSignInButton } from '@/components/GitHubSignInButton'
import { MagicLinkForm } from '@/components/MagicLinkForm'
import { AppIcon } from '@/components/AppIcon'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') ?? '/'
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    // Check query param (set by /auth/callback on failure)
    const queryError = searchParams.get('auth_error')
    if (queryError) {
      setAuthError(queryError)
      // Clean the error param from the URL
      const url = new URL(window.location.href)
      url.searchParams.delete('auth_error')
      window.history.replaceState(null, '', url.pathname + (url.search || ''))
      return
    }

    // Check hash fragment (Supabase may redirect errors as hash params)
    const hash = window.location.hash.slice(1)
    if (!hash) return
    const hashParams = new URLSearchParams(hash)
    const errorDescription = hashParams.get('error_description')
    if (errorDescription) {
      setAuthError(decodeURIComponent(errorDescription).replace(/\+/g, ' '))
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [searchParams])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 text-white antialiased">
      {/* Ambient background glows — matching landing page */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute top-1/2 -right-64 h-[500px] w-[500px] rounded-full bg-cyan-600/8 blur-[120px]" />
        <div className="absolute bottom-0 -left-32 h-[400px] w-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      {/* Logo */}
      <Link
        href="/landing"
        className="relative mb-10 flex items-center gap-2.5 text-zinc-200 transition-colors hover:text-blue-400"
      >
        <AppIcon className="h-7 w-7 text-blue-400" />
        <span className="text-lg font-bold tracking-tight">Domain Gazer</span>
      </Link>

      {/* Card */}
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        {/* Inner glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 left-1/2 h-[250px] w-[250px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[80px]" />
        </div>

        <div className="relative px-8 pb-8 pt-10">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
              <span className="text-blue-400">✦</span>
              AI-powered
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Welcome back</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Sign in to find your perfect domain name
            </p>
          </div>

          {authError && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <p className="font-medium">Sign-in failed</p>
              <p className="mt-1 text-red-400/80">{authError}</p>
            </div>
          )}

          <div className="space-y-3">
            <GoogleSignInButton
              nextPath={nextPath}
              showLoadingMessage
              theme="filled_black"
              variant="landing-nav"
              buttonClassName="min-h-[44px] w-full"
            />
            <GitHubSignInButton nextPath={nextPath} />
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs font-medium text-zinc-500">or</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <MagicLinkForm nextPath={nextPath} />

          <p className="mt-8 text-center text-[11px] leading-4 text-zinc-500">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:text-zinc-300">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-300">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Footer links */}
      <div className="relative mt-8 flex items-center gap-4 text-xs text-zinc-500">
        <Link href="/privacy" className="transition-colors hover:text-zinc-300">
          Privacy
        </Link>
        <span className="text-zinc-700">&middot;</span>
        <Link href="/cookies" className="transition-colors hover:text-zinc-300">
          Cookies
        </Link>
        <span className="text-zinc-700">&middot;</span>
        <Link href="/terms" className="transition-colors hover:text-zinc-300">
          Terms
        </Link>
      </div>
    </div>
  )
}
