'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface MarketingAuthLinkProps {
  className: string
  signedInHref?: string
  signedOutHref?: string
  signedInLabel?: string
  signedOutLabel?: string
}

export function MarketingAuthLink({
  className,
  signedInHref = '/app',
  signedOutHref = '/login',
  signedInLabel = 'Open app',
  signedOutLabel = 'Sign in',
}: MarketingAuthLinkProps) {
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    let isMounted = true

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (isMounted) {
        setIsSignedIn(Boolean(user))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session?.user))
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <Link href={isSignedIn ? signedInHref : signedOutHref} className={className}>
      {isSignedIn ? signedInLabel : signedOutLabel}
    </Link>
  )
}
