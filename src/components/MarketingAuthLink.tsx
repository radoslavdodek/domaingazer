'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface MarketingAuthLinkProps {
  className: string
}

export function MarketingAuthLink({ className }: MarketingAuthLinkProps) {
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsSignedIn(Boolean(user))
    })
  }, [])

  return (
    <Link href={isSignedIn ? '/app' : '/login'} className={className}>
      {isSignedIn ? 'Open app' : 'Sign in'}
    </Link>
  )
}
