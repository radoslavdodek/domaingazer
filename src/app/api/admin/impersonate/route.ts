export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { IMPERSONATE_UID_COOKIE, IMPERSONATE_INFO_COOKIE } from '@/lib/impersonation'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.is_admin !== true) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as { userId?: string } | null
  const targetUserId = body?.userId?.trim()

  if (!targetUserId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  if (targetUserId === user.id) {
    return NextResponse.json({ error: 'Cannot impersonate yourself' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: { user: targetUser }, error } = await admin.auth.admin.getUserById(targetUserId)

  if (error || !targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (targetUser.app_metadata?.is_admin === true) {
    return NextResponse.json({ error: 'Cannot impersonate another admin' }, { status: 400 })
  }

  const cookieStore = cookies()
  const cookieOptions = {
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }

  cookieStore.set(IMPERSONATE_UID_COOKIE, targetUser.id, {
    ...cookieOptions,
    httpOnly: true,
  })

  cookieStore.set(IMPERSONATE_INFO_COOKIE, JSON.stringify({
    email: targetUser.email,
    name: targetUser.user_metadata?.full_name || targetUser.user_metadata?.name || null,
  }), {
    ...cookieOptions,
    httpOnly: false,
  })

  console.info('[impersonation.start]', {
    adminId: user.id,
    adminEmail: user.email,
    targetId: targetUser.id,
    targetEmail: targetUser.email,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.is_admin !== true) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const cookieStore = cookies()

  console.info('[impersonation.stop]', {
    adminId: user.id,
    adminEmail: user.email,
    targetId: cookieStore.get(IMPERSONATE_UID_COOKIE)?.value,
  })

  cookieStore.delete(IMPERSONATE_UID_COOKIE)
  cookieStore.delete(IMPERSONATE_INFO_COOKIE)

  return NextResponse.json({ ok: true })
}
