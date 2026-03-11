import { createClient } from '@/lib/supabase/client'

export function normalizeNextPath(nextPath: string) {
  return nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/app'
}

function getRequiredGoogleClientId() {
  const value = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!value) {
    throw new Error('Missing required environment variable: NEXT_PUBLIC_GOOGLE_CLIENT_ID')
  }

  return value
}

function encodeBytesAsBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...Array.from(bytes)))
}

async function sha256Hex(value: string) {
  const encodedValue = new TextEncoder().encode(value)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedValue)

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function getGoogleClientId() {
  return getRequiredGoogleClientId()
}

export async function signInWithGoogle(nextPath = '/app') {
  const loginUrl = new URL('/login', window.location.origin)
  loginUrl.searchParams.set('next', normalizeNextPath(nextPath))
  window.location.assign(loginUrl.toString())
}

export async function createGoogleSignInNonce() {
  const nonce = encodeBytesAsBase64(crypto.getRandomValues(new Uint8Array(32)))
  const hashedNonce = await sha256Hex(nonce)

  return { nonce, hashedNonce }
}

export async function signInWithGoogleIdToken(idToken: string, nonce?: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
    nonce,
  })

  if (error) {
    throw error
  }
}
