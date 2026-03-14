import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginPageClient } from '@/components/LoginPageClient'

interface LoginPageProps {
  searchParams?: Promise<{
    next?: string | string[]
    auth_error?: string | string[]
  }>
}

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

function normalizeNextPath(value?: string | string[]) {
  const nextPath = getSingleValue(value)

  return nextPath?.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/app'
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  const nextPath = normalizeNextPath(resolvedSearchParams?.next)
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect(nextPath)
  }

  const authError = getSingleValue(resolvedSearchParams?.auth_error) ?? null

  return <LoginPageClient nextPath={nextPath} initialAuthError={authError} />
}
