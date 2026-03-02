'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import { useTheme } from '@/contexts/ThemeContext'

export default function LoginPage() {
  const { theme } = useTheme()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') ?? '/'

  return (
    <div className={theme.layout.body}>
      <main className="mx-auto w-full max-w-4xl">
        <nav className={theme.navbar.wrapper}>
          <Link href="/landing" className={theme.navbar.brand}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={theme.navbar.icon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            <span>Domain Gazer</span>
          </Link>
        </nav>

        <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
          <div className={`w-full max-w-sm ${theme.page.searchCard}`}>
            <div className="mb-6 text-center">
              <span className={theme.page.heroBadge}>✦ AI-Powered</span>
              <h1 className="text-xl font-bold">Sign in to Domain Gazer</h1>
              <p className={`mt-2 text-sm ${theme.page.subtitle}`}>
                Find your perfect domain name with AI-powered suggestions.
              </p>
            </div>

            <GoogleSignInButton nextPath={nextPath} showLoadingMessage />

            <p className={`mt-4 text-xs leading-5 ${theme.page.subtitle}`}>
              Continuing uses essential authentication cookies. Optional browser storage for theme and draft searches is
              controlled separately, with opt-in required for EU users.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
              <Link href="/privacy" className="underline underline-offset-2">
                Privacy
              </Link>
              <Link href="/cookies" className="underline underline-offset-2">
                Cookies
              </Link>
              <Link href="/terms" className="underline underline-offset-2">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
