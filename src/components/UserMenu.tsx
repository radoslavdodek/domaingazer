'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserMenuProps {
  planLabel?: string
  isSubscribed?: boolean
  billingDisabled?: boolean
  onUpgrade?: () => void
  onManageBilling?: () => void
}

export function UserMenu({
  planLabel,
  isSubscribed = false,
  billingDisabled = false,
  onUpgrade,
  onManageBilling,
}: UserMenuProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return null

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const name = (user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? '') as string
  const email = user.email ?? ''
  const initial = name.charAt(0).toUpperCase() || email.charAt(0).toUpperCase() || '?'
  const isAdmin = user.app_metadata?.is_admin === true

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        className={`${theme.navbar.toggleButton} gap-2`}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={20}
            height={20}
            className="rounded-full"
          />
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            {initial}
          </span>
        )}
        <span className="hidden max-w-[120px] truncate sm:inline">{name.split(' ')[0]}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 opacity-60">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-gray-900">{name}</p>
            <p className="truncate text-xs text-gray-500">{email}</p>
            {planLabel && (
              <p className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
                {planLabel}
              </p>
            )}
          </div>
          {isSubscribed && onManageBilling && (
            <button
              type="button"
              onClick={() => { setOpen(false); onManageBilling() }}
              disabled={billingDisabled}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10 2a2.5 2.5 0 0 0-2.2 1.316l-.18.34-.38.06a2.5 2.5 0 0 0-2.038 1.7l-.12.37-.36.15a2.5 2.5 0 0 0-1.422 3.25l.14.36-.24.31a2.5 2.5 0 0 0 0 3.087l.24.31-.14.36a2.5 2.5 0 0 0 1.422 3.25l.36.15.12.37a2.5 2.5 0 0 0 2.038 1.7l.38.06.18.34a2.5 2.5 0 0 0 4.4 0l.18-.34.38-.06a2.5 2.5 0 0 0 2.038-1.7l.12-.37.36-.15a2.5 2.5 0 0 0 1.422-3.25l-.14-.36.24-.31a2.5 2.5 0 0 0 0-3.087l-.24-.31.14-.36a2.5 2.5 0 0 0-1.422-3.25l-.36-.15-.12-.37a2.5 2.5 0 0 0-2.038-1.7l-.38-.06-.18-.34A2.5 2.5 0 0 0 10 2Zm2.03 7.03a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-1.25-1.25a.75.75 0 1 1 1.06-1.06L9 10.94l1.97-1.97a.75.75 0 0 1 1.06 0Z" />
              </svg>
              Manage Billing
            </button>
          )}
          {!isSubscribed && onUpgrade && (
            <button
              type="button"
              onClick={() => { setOpen(false); onUpgrade() }}
              disabled={billingDisabled}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M3 5.75a.75.75 0 0 1 1.18-.615l3.07 2.193 2.316-4.054a.75.75 0 0 1 1.304 0l2.316 4.054 3.07-2.193A.75.75 0 0 1 17 5.75V8a.75.75 0 0 1-.03.212l-1.5 5.25A.75.75 0 0 1 14.75 14h-9.5a.75.75 0 0 1-.72-.538l-1.5-5.25A.75.75 0 0 1 3 8V5.75Z" />
                <path d="M6.25 15.5a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1-.75-.75Z" />
              </svg>
              Upgrade to Pro
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => { setOpen(false); router.push('/admin') }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M2.5 3A1.5 1.5 0 0 0 1 4.5v4A1.5 1.5 0 0 0 2.5 10h6A1.5 1.5 0 0 0 10 8.5v-4A1.5 1.5 0 0 0 8.5 3h-6Zm11 2A1.5 1.5 0 0 0 12 6.5v7a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 16.5 5h-3Zm-10 7A1.5 1.5 0 0 0 2 13.5v1A1.5 1.5 0 0 0 3.5 16h6a1.5 1.5 0 0 0 1.5-1.5v-1A1.5 1.5 0 0 0 9.5 12h-6Z" clipRule="evenodd" />
              </svg>
              Admin Dashboard
            </button>
          )}
          <button
            type="button"
            onClick={() => { setOpen(false); router.push('/settings/privacy') }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M10 2a1.75 1.75 0 0 0-1.75 1.75v.55a5.87 5.87 0 0 0-1.472.61l-.39-.39a1.75 1.75 0 1 0-2.475 2.475l.39.39a5.87 5.87 0 0 0-.61 1.472h-.55a1.75 1.75 0 1 0 0 3.5h.55c.133.514.338 1.008.61 1.472l-.39.39a1.75 1.75 0 1 0 2.475 2.475l.39-.39c.464.272.958.477 1.472.61v.55a1.75 1.75 0 1 0 3.5 0v-.55a5.87 5.87 0 0 0 1.472-.61l.39.39a1.75 1.75 0 1 0 2.475-2.475l-.39-.39c.272-.464.477-.958.61-1.472h.55a1.75 1.75 0 1 0 0-3.5h-.55a5.87 5.87 0 0 0-.61-1.472l.39-.39a1.75 1.75 0 1 0-2.475-2.475l-.39.39a5.87 5.87 0 0 0-1.472-.61v-.55A1.75 1.75 0 0 0 10 2Zm0 5.25A2.75 2.75 0 1 0 10 12.75 2.75 2.75 0 0 0 10 7.25Z" clipRule="evenodd" />
            </svg>
            Privacy &amp; Data
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-1.04a.75.75 0 1 0-1.056-1.062l-2.5 2.5a.75.75 0 0 0 0 1.062l2.5 2.5a.75.75 0 1 0 1.056-1.061l-1.048-1.04h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
