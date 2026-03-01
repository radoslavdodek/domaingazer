import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
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

  // Allow auth-related paths and root (landing page) through
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/auth')) {
    return supabaseResponse
  }

  if (!user) {
    // API routes: return 401
    if (pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    // Page routes: redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
