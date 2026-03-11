import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginPageClient } from '@/components/LoginPageClient'

interface LoginPageProps {
  searchParams?: {
    next?: string | string[]
    auth_error?: string | string[]
  }
}

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/app')
  }

  const nextPath = getSingleValue(searchParams?.next) ?? '/app'
  const authError = getSingleValue(searchParams?.auth_error) ?? null

  return <LoginPageClient nextPath={nextPath} initialAuthError={authError} />
}
