'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

const STEPS = [
  {
    number: '01',
    title: 'Describe Your Project',
    description: 'Tell us about your business or startup in plain English. No keywords, no brainstorming — just describe what you\'re building.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'AI Generates Names',
    description: 'GPT-4.1 creates dozens of creative, brandable domain candidates tailored to your description — names that actually sound like real companies.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Check Availability Live',
    description: 'Every candidate is checked against real DNS records in real time via AWS Route 53 — across all your chosen TLDs simultaneously.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const FEATURES = [
  {
    title: 'GPT-4.1 Powered',
    description: 'State-of-the-art language model generates creative, brandable names — not generic keyword combinations.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    accent: 'purple',
  },
  {
    title: 'Real-Time Availability',
    description: 'Live checks via AWS Route 53, not a cached database. You always get fresh, accurate results.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    accent: 'yellow',
  },
  {
    title: '8 TLDs Supported',
    description: 'Search across .com, .io, .ai, .co, .net, .shop, .store, and .de simultaneously — mix and match freely.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    accent: 'blue',
  },
  {
    title: 'Smart Multi-Round Search',
    description: 'If round 1 finds nothing available, the AI automatically generates new variations and tries again — up to 5 rounds.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    accent: 'cyan',
  },
  {
    title: 'Search History',
    description: 'Every search is saved to your account automatically. Resume any past search and pick up where you left off.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: 'emerald',
  },
  {
    title: 'CSV Export',
    description: 'Download all results as a CSV file to share with your team or do further analysis in a spreadsheet.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    accent: 'orange',
  },
]

const ACCENT_CLASSES: Record<string, { icon: string; bg: string; border: string }> = {
  purple: { icon: 'text-purple-400', bg: 'bg-purple-950/50', border: 'border-purple-900/50' },
  yellow: { icon: 'text-yellow-400', bg: 'bg-yellow-950/50', border: 'border-yellow-900/50' },
  blue: { icon: 'text-blue-400', bg: 'bg-blue-950/50', border: 'border-blue-900/50' },
  cyan: { icon: 'text-cyan-400', bg: 'bg-cyan-950/50', border: 'border-cyan-900/50' },
  emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-900/50' },
  orange: { icon: 'text-orange-400', bg: 'bg-orange-950/50', border: 'border-orange-900/50' },
}

export function LandingPage() {
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setIsSignedIn(!!user))
  }, [])

  const handleSignIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    })
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsSignedIn(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white antialiased">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute top-1/2 -right-64 h-[500px] w-[500px] rounded-full bg-cyan-600/8 blur-[120px]" />
        <div className="absolute bottom-0 -left-32 h-[400px] w-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <GlobeIcon className="h-7 w-7 text-blue-400" />
            <span className="text-lg font-bold tracking-tight">Domain Gazer</span>
          </div>
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
              >
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-red-400"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              <GoogleIcon />
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:pt-36">
        <div className="mx-auto max-w-6xl">
          {/* Heading block */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300">
              <span className="text-blue-400">✦</span>
              Powered by GPT-4.1 &amp; AWS Route 53
            </div>

            <h1 className="mb-6 text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Find your perfect{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                domain name
              </span>
              {' '}— instantly
            </h1>

            <p className="mx-auto mb-4 max-w-xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
              Describe your project in plain English. Our AI generates brandable domain candidates
              and checks real-time availability across multiple TLDs — all in one shot.
            </p>

            {/* TLD pills */}
            <div className="mb-10 flex flex-wrap justify-center gap-2">
              {['.com', '.io', '.ai', '.co', '.net', '.shop', '.store', '.de'].map((tld) => (
                <span key={tld} className="rounded-md border border-zinc-700/60 bg-zinc-800/60 px-2.5 py-1 text-xs font-mono font-medium text-zinc-400">
                  {tld}
                </span>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {isSignedIn ? (
                <Link
                  href="/"
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-blue-600/50 hover:opacity-90 sm:w-auto"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-blue-600/50 hover:opacity-90 sm:w-auto"
                >
                  <GoogleIcon />
                  Get started free
                </button>
              )}
              <p className="text-sm text-zinc-500">No credit card required</p>
            </div>
          </div>

          {/* App preview mockup */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            {/* Glow behind the card */}
            <div className="absolute inset-x-0 -bottom-6 h-1/2 bg-gradient-to-r from-blue-600/20 via-cyan-600/15 to-blue-600/20 blur-2xl" aria-hidden="true" />

            <div className="relative overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900 shadow-2xl shadow-black/60">
              {/* Browser chrome bar */}
              <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/70 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                </div>
                <div className="flex flex-1 items-center justify-center rounded-md bg-zinc-800/80 px-3 py-1 text-xs text-zinc-500">
                  domaingazer.app
                </div>
              </div>

              {/* Simulated app content */}
              <div className="p-5 sm:p-7">
                {/* Search query display */}
                <div className="mb-5 rounded-xl border border-zinc-700/60 bg-zinc-800/50 p-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">Searching for</p>
                  <p className="text-sm text-zinc-200 sm:text-base">
                    &ldquo;A SaaS tool to help remote startup teams manage projects and stay in sync&rdquo;
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {['.io', '.ai', '.com'].map((tld) => (
                      <span key={tld} className="rounded-md bg-sky-600/20 px-2.5 py-0.5 text-xs font-semibold text-sky-300">
                        {tld}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Results header */}
                <div className="mb-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-zinc-300">
                      <span className="font-semibold text-emerald-400">3 available</span>
                      <span className="text-zinc-500"> · 9 checked · 12 total</span>
                    </span>
                  </div>
                  <span className="text-xs text-zinc-600">Round 1 of 5</span>
                </div>

                <div className="space-y-3">
                  {/* Group: sparkflow */}
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-zinc-100">sparkflow</span>
                      <button className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Try variations →</button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="flex items-center justify-between rounded-lg border border-emerald-800/50 bg-emerald-950/50 px-3 py-2">
                        <span className="text-sm text-zinc-200">sparkflow.io</span>
                        <span className="text-xs font-bold text-emerald-400">AVAILABLE</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-emerald-800/50 bg-emerald-950/50 px-3 py-2">
                        <span className="text-sm text-zinc-200">sparkflow.ai</span>
                        <span className="text-xs font-bold text-emerald-400">AVAILABLE</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-zinc-700/40 bg-zinc-800/40 px-3 py-2">
                        <span className="text-sm text-zinc-500">sparkflow.com</span>
                        <span className="text-xs font-medium text-zinc-600">TAKEN</span>
                      </div>
                    </div>
                  </div>

                  {/* Group: teamcraft */}
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-zinc-100">teamcraft</span>
                      <button className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Try variations →</button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="flex items-center justify-between rounded-lg border border-emerald-800/50 bg-emerald-950/50 px-3 py-2">
                        <span className="text-sm text-zinc-200">teamcraft.io</span>
                        <span className="text-xs font-bold text-emerald-400">AVAILABLE</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-zinc-700/40 bg-zinc-800/40 px-3 py-2">
                        <span className="text-sm text-zinc-500">teamcraft.ai</span>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                          <span className="text-xs text-zinc-600">Checking</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-zinc-700/40 bg-zinc-800/40 px-3 py-2">
                        <span className="text-sm text-zinc-500">teamcraft.com</span>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                          <span className="text-xs text-zinc-600">Checking</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative z-10 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="text-zinc-400">From idea to domain in three steps</p>
          </div>

          <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-8">
            {/* Connector line — desktop only */}
            <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent sm:block" aria-hidden="true" />

            {STEPS.map((step) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400 ring-4 ring-zinc-950">
                  {step.icon}
                </div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-blue-500/50">{step.number}</p>
                <h3 className="mb-2.5 text-lg font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Everything you need</h2>
            <p className="text-zinc-400">Powerful features built for founders and makers</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const a = ACCENT_CLASSES[feature.accent]
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${a.bg} ${a.border} ${a.icon}`}>
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 font-semibold text-zinc-100">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative z-10 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-700/60 bg-zinc-900 px-8 py-16 text-center sm:px-16">
            {/* Inner glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute -top-24 left-1/2 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[90px]" />
            </div>

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                ✦ Free to get started
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to find your domain?
              </h2>
              <p className="mb-8 text-zinc-400">
                Join founders who&apos;ve found their perfect domain with Domain Gazer.
                Sign in with Google and start searching in seconds.
              </p>
              {isSignedIn ? (
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:opacity-90 hover:shadow-blue-600/50"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:opacity-90 hover:shadow-blue-600/50"
                >
                  <GoogleIcon />
                  Get started free
                </button>
              )}
              <p className="mt-4 text-sm text-zinc-500">No credit card required · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-zinc-800/60 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5 text-zinc-500">
            <GlobeIcon className="h-5 w-5" />
            <span className="text-sm font-semibold text-zinc-400">Domain Gazer</span>
          </div>
          <p className="text-sm text-zinc-600">© 2025 Domain Gazer · Find your perfect domain name with AI</p>
        </div>
      </footer>
    </div>
  )
}
