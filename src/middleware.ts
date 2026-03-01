import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { PRIVACY_REGION_COOKIE } from '@/lib/privacy/constants'
import { getCountryHeaderName, getDefaultRegion, getRegionFromCountryCode } from '@/lib/privacy/region'

export async function middleware(request: NextRequest) {
  const countryCode = request.geo?.country
    ?? request.headers.get('x-vercel-ip-country')
    ?? request.headers.get(getCountryHeaderName())

  const region = countryCode
    ? getRegionFromCountryCode(countryCode)
    : getDefaultRegion()

  const applyRegionCookie = (response: NextResponse) => {
    response.cookies.set(PRIVACY_REGION_COOKIE, region, {
      httpOnly: false,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
      path: '/',
      maxAge: 60 * 60 * 24,
    })
    return response
  }

  let supabaseResponse = applyRegionCookie(NextResponse.next({ request }))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = applyRegionCookie(NextResponse.next({ request }))
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not call getSession() — use getUser() for security (validates JWT server-side)
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Allow auth-related paths and public redirects through
  if (
    pathname === '/'
    || pathname.startsWith('/landing')
    || pathname.startsWith('/login')
    || pathname.startsWith('/privacy')
    || pathname.startsWith('/cookies')
    || pathname.startsWith('/terms')
    || pathname.startsWith('/auth')
    || pathname.startsWith('/billing/success')
    || pathname.startsWith('/billing/cancel')
    || pathname.startsWith('/api/stripe/webhook')
  ) {
    return supabaseResponse
  }

  if (!user) {
    // API routes: return 401
    if (pathname.startsWith('/api/')) {
      return applyRegionCookie(new NextResponse('Unauthorized', { status: 401 }))
    }
    // Page routes: redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return applyRegionCookie(NextResponse.redirect(url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
