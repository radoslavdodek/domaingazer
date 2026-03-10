import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : new URL(request.url).origin
  const code = searchParams.get('code')
  const requestedNext = searchParams.get('next') ?? '/'
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/'

  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  if (error) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('auth_error', errorDescription ?? error)
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    )
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('auth_error', exchangeError.message)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.redirect(new URL(next, origin))
}
