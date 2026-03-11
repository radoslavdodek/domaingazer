import type { ReactNode } from 'react'
import Link from 'next/link'

interface LegalPageLayoutProps {
  title: string
  description: string
  children: ReactNode
}

export function LegalPageLayout({ title, description, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <nav className="mb-8 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
          <Link href="/landing" className="font-semibold text-zinc-900">
            Domain Gazer
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/privacy" className="hover:text-zinc-900">
            Privacy
          </Link>
          <Link href="/cookies" className="hover:text-zinc-900">
            Cookies
          </Link>
          <Link href="/terms" className="hover:text-zinc-900">
            Terms
          </Link>
        </nav>

        <section className="rounded-3xl border border-zinc-200 bg-white px-6 py-8 shadow-sm sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Legal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-6 text-zinc-600">{description}</p>
          <div className="mt-8 space-y-8 text-sm leading-7 text-zinc-700">
            {children}
          </div>
        </section>
      </main>
    </div>
  )
}
