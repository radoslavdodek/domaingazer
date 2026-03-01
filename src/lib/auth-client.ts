import { createClient } from '@/lib/supabase/client'

function normalizeNextPath(nextPath: string) {
  return nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/'
}

export async function signInWithGoogle(nextPath = '/') {
  const supabase = createClient()
  const callbackUrl = new URL('/auth/callback', window.location.origin)

  callbackUrl.searchParams.set('next', normalizeNextPath(nextPath))

  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        prompt: 'select_account',
      },
    },
  })
}
