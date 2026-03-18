'use client'

import { useEffect, useRef, useState } from 'react'
import { getSiteHost, getSiteName } from '@/lib/site-config'

const DEMO_EMBED_URL = 'https://demo.arcade.software/6Q7YAKbp8Fd7RkhTjcMZ?embed&embed_mobile=tab&embed_desktop=tab&show_copy_link=true'

export function LandingDemoPreview({ focusRingClassName }: { focusRingClassName: string }) {
  const siteHost = getSiteHost()
  const siteName = getSiteName()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const updateIsDesktop = () => setIsDesktop(mediaQuery.matches)

    updateIsDesktop()
    mediaQuery.addEventListener('change', updateIsDesktop)

    return () => mediaQuery.removeEventListener('change', updateIsDesktop)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
    }

    if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      setIsOpen(false)
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [])

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      setIsOpen(false)
    }
  }

  const handleOpen = () => {
    if (!isDesktop) return
    setIsOpen(true)
  }

  return (
    <>
      <div className="relative mx-auto mt-16 max-w-4xl">
        <div className="absolute inset-x-0 -bottom-6 h-1/2 bg-gradient-to-r from-blue-600/20 via-cyan-600/15 to-blue-600/20 blur-2xl" aria-hidden="true" />

        <button
          type="button"
          onClick={handleOpen}
          disabled={!isDesktop}
          aria-label={`Open the interactive ${siteName} product demo`}
          className={`group relative block w-full overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900 text-left shadow-2xl shadow-black/60 transition-all hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-cyan-950/20 disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:border-zinc-700/60 disabled:hover:shadow-black/60 ${focusRingClassName}`}
        >
          <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/70 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-zinc-700" />
              <div className="h-3 w-3 rounded-full bg-zinc-700" />
              <div className="h-3 w-3 rounded-full bg-zinc-700" />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center justify-center rounded-md bg-zinc-800/80 px-3 py-1 text-xs text-zinc-300">
                <span className="truncate">{siteHost}</span>
              </div>
              <span className="pointer-events-none hidden shrink-0 items-center gap-2 rounded-full border border-cyan-400/25 bg-zinc-950/85 px-3 py-1.5 text-xs font-semibold text-cyan-200 shadow-lg shadow-black/40 backdrop-blur transition-colors group-hover:border-cyan-300/45 group-hover:text-white md:inline-flex">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M6.5 5.5a1 1 0 0 1 1.53-.848l6 3.75a1 1 0 0 1 0 1.696l-6 3.75A1 1 0 0 1 6.5 13V5.5Z" />
                </svg>
                <span>Interactive demo</span>
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="mb-5 rounded-xl border border-zinc-700/60 bg-zinc-800/50 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-300">Searching for</p>
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

            <div className="mb-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
                <span className="text-zinc-300">
                  <span className="font-semibold text-emerald-400">3 available</span>
                  <span className="text-zinc-300"> · 9 checked · 12 total</span>
                </span>
              </div>
              <span className="text-xs text-zinc-300">Round 1 of 5</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-bold text-zinc-100">sparkflow</span>
                  <span className="text-xs font-medium text-zinc-300">Try variations →</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5 rounded-lg border border-emerald-800/50 bg-emerald-950/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-zinc-200">sparkflow.io</span>
                    <span className="text-xs font-bold text-emerald-400">AVAILABLE</span>
                  </div>
                  <div className="flex flex-col gap-1.5 rounded-lg border border-emerald-800/50 bg-emerald-950/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-zinc-200">sparkflow.ai</span>
                    <span className="text-xs font-bold text-emerald-400">AVAILABLE</span>
                  </div>
                  <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-700/40 bg-zinc-800/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-zinc-300">sparkflow.com</span>
                    <span className="text-xs font-medium text-zinc-300">TAKEN</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-4">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-bold text-zinc-100">teamcraft</span>
                  <span className="text-xs font-medium text-zinc-300">Try variations →</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5 rounded-lg border border-emerald-800/50 bg-emerald-950/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-zinc-200">teamcraft.io</span>
                    <span className="text-xs font-bold text-emerald-400">AVAILABLE</span>
                  </div>
                  <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-700/40 bg-zinc-800/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-zinc-300">teamcraft.ai</span>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" aria-hidden="true" />
                      <span className="text-xs text-zinc-300">Checking</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-700/40 bg-zinc-800/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-zinc-300">teamcraft.com</span>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" aria-hidden="true" />
                      <span className="text-xs text-zinc-300">Checking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        className="m-auto w-full max-w-6xl rounded-3xl p-3 shadow-2xl backdrop:bg-black/75 sm:p-4 open:flex open:flex-col"
        style={{ border: 'none', background: 'transparent' }}
      >
        <div className="flex max-h-[92vh] flex-col overflow-hidden rounded-3xl border border-zinc-700/70 bg-zinc-950 shadow-2xl shadow-black/70">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-4 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 sm:text-base">Interactive product tour</h2>
              <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                Explore {siteName} inside the embedded walkthrough.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-zinc-700 p-2 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-100"
              aria-label="Close demo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto p-3 sm:p-4">
            {isDesktop && isOpen ? (
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-white">
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 0,
                    paddingBottom: 'calc(75.7958% + 41px)',
                  }}
                >
                  <iframe
                    src={DEMO_EMBED_URL}
                    title={`${siteName} - Find the best brand and domain name for your product`}
                    frameBorder="0"
                    loading="lazy"
                    allowFullScreen
                    allow="clipboard-write"
                    className="absolute left-0 top-0 h-full w-full"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  )
}
