'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import {
  createGoogleSignInNonce,
  getGoogleClientId,
  normalizeNextPath,
  signInWithGoogleIdToken,
} from '@/lib/auth-client'

type GoogleCredentialResponse = {
  credential?: string
  state?: string
}

type GoogleIdentityWindow = Window & {
  google?: {
    accounts: {
      id: {
        initialize(config: {
          client_id: string
          callback: (response: GoogleCredentialResponse) => void | Promise<void>
          nonce?: string
          ux_mode?: 'popup' | 'redirect'
          use_fedcm_for_button?: boolean
        }): void
        renderButton(
          parent: HTMLElement,
          options: {
            theme?: 'outline' | 'filled_blue' | 'filled_black'
            size?: 'large' | 'medium' | 'small'
            type?: 'standard' | 'icon'
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
            shape?: 'rectangular' | 'pill' | 'circle' | 'square'
            width?: number
            logo_alignment?: 'left' | 'center'
            state?: string
            click_listener?: () => void
          }
        ): void
      }
    }
  }
}

type GoogleButtonRegistryEntry = {
  nextPath: string
  setError: (message: string | null) => void
}

type GoogleButtonTheme = 'outline' | 'filled_blue' | 'filled_black'
type GoogleButtonSize = 'large' | 'medium' | 'small'
type GoogleButtonText = 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
type GoogleButtonShape = 'rectangular' | 'pill' | 'circle' | 'square'
type GoogleButtonAlignment = 'left' | 'center'
type GoogleButtonVariant = 'default' | 'landing-nav' | 'landing-cta'

let googleButtonSequence = 0
let isGoogleScriptReady = false
let googleInitPromise: Promise<void> | null = null
let googleSignInNonce: string | null = null
let lastClickedGoogleButtonId: string | null = null

const googleButtonRegistry = new Map<string, GoogleButtonRegistryEntry>()
const googleScriptSubscribers = new Set<() => void>()

function createGoogleButtonId() {
  googleButtonSequence += 1
  return `google-signin-${googleButtonSequence}`
}

async function handleGoogleCredentialResponse(response: GoogleCredentialResponse) {
  const buttonId = typeof response.state === 'string' ? response.state : lastClickedGoogleButtonId
  const registryEntry = buttonId ? googleButtonRegistry.get(buttonId) : null
  const nextPath = normalizeNextPath(registryEntry?.nextPath ?? '/')

  try {
    if (!response.credential) {
      throw new Error('Google sign-in did not return a valid credential.')
    }

    if (!googleSignInNonce) {
      throw new Error('Google sign-in is not ready yet.')
    }

    registryEntry?.setError(null)
    await signInWithGoogleIdToken(response.credential, googleSignInNonce)
    window.location.assign(nextPath)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign in with Google.'
    registryEntry?.setError(message)
  } finally {
    lastClickedGoogleButtonId = null
  }
}

async function ensureGoogleInitialized() {
  const google = (window as GoogleIdentityWindow).google?.accounts.id

  if (!google) {
    throw new Error('Google sign-in is unavailable right now.')
  }

  if (!googleInitPromise) {
    googleInitPromise = (async () => {
      const { nonce, hashedNonce } = await createGoogleSignInNonce()
      googleSignInNonce = nonce

      google.initialize({
        client_id: getGoogleClientId(),
        nonce: hashedNonce,
        ux_mode: 'popup',
        use_fedcm_for_button: true,
        callback: (response) => {
          void handleGoogleCredentialResponse(response)
        },
      })
    })()
  }

  return googleInitPromise
}

function getGoogleButtonLabel(text: GoogleButtonText) {
  switch (text) {
    case 'signin_with':
      return 'Sign in with Google'
    case 'signup_with':
      return 'Sign up with Google'
    case 'signin':
      return 'Sign in'
    case 'continue_with':
    default:
      return 'Continue with Google'
  }
}

function GoogleMark({ className = 'h-4 w-4 shrink-0' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className={className}>
      <path
        fill="#EA4335"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.56 2.68-3.86 2.68-6.62Z"
      />
      <path
        fill="#4285F4"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A8.99 8.99 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.69 9c0-.6.1-1.18.28-1.72V4.95H.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33Z"
      />
      <path
        fill="#34A853"
        d="M9 3.58c1.32 0 2.5.45 3.43 1.33l2.57-2.57C13.46.9 11.42 0 9 0A8.99 8.99 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

interface GoogleSignInButtonProps {
  nextPath?: string
  className?: string
  buttonClassName?: string
  messageClassName?: string
  label?: string
  theme?: GoogleButtonTheme
  size?: GoogleButtonSize
  text?: GoogleButtonText
  shape?: GoogleButtonShape
  logoAlignment?: GoogleButtonAlignment
  width?: number
  showLoadingMessage?: boolean
  variant?: GoogleButtonVariant
}

export function GoogleSignInButton({
  nextPath = '/app',
  className,
  buttonClassName = 'min-h-[44px] w-full',
  messageClassName = 'mt-3 text-center text-xs text-red-600',
  label,
  theme = 'outline',
  size = 'large',
  text = 'continue_with',
  shape = 'rectangular',
  logoAlignment = 'left',
  width,
  showLoadingMessage = false,
  variant = 'default',
}: GoogleSignInButtonProps) {
  const buttonContainerRef = useRef<HTMLDivElement | null>(null)
  const buttonIdRef = useRef<string | null>(null)
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!buttonIdRef.current) {
    buttonIdRef.current = createGoogleButtonId()
  }

  const buttonId = buttonIdRef.current!
  const normalizedNextPath = normalizeNextPath(nextPath)
  const isLandingVariant = variant === 'landing-nav' || variant === 'landing-cta'
  const buttonLabel = label ?? getGoogleButtonLabel(text)
  const landingButtonClassName =
    variant === 'landing-cta'
      ? 'pointer-events-none flex min-h-[inherit] w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(90deg,#6d28ff_0%,#4f46e5_28%,#2563eb_62%,#06b6d4_100%)] px-6 py-3 text-base font-semibold text-white shadow-[0_18px_48px_rgba(37,99,235,0.28)]'
      : 'pointer-events-none flex min-h-[inherit] w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-100 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-sm'
  const landingErrorClassName =
    variant === 'landing-cta'
      ? 'border border-red-500/60 bg-red-500/10 shadow-red-950/30'
      : 'border-red-500/60 bg-red-500/10 shadow-red-950/30'
  const iconClassName = variant === 'landing-cta' ? 'h-5 w-5 shrink-0' : 'h-4 w-4 shrink-0'

  useEffect(() => {
    const handleGoogleReady = () => {
      setIsGoogleAvailable(true)
    }

    googleScriptSubscribers.add(handleGoogleReady)

    if (isGoogleScriptReady || (window as GoogleIdentityWindow).google?.accounts.id) {
      handleGoogleReady()
    }

    return () => {
      googleScriptSubscribers.delete(handleGoogleReady)
    }
  }, [])

  useEffect(() => {
    googleButtonRegistry.set(buttonId, {
      nextPath: normalizedNextPath,
      setError: setErrorMessage,
    })

    return () => {
      googleButtonRegistry.delete(buttonId)
    }
  }, [buttonId, normalizedNextPath])

  useEffect(() => {
    if (!isGoogleAvailable) {
      return
    }

    const renderGoogleButton = async () => {
      try {
        await ensureGoogleInitialized()

        const google = (window as GoogleIdentityWindow).google?.accounts.id
        const buttonContainer = buttonContainerRef.current

        if (!google || !buttonContainer) {
          throw new Error('Google sign-in is unavailable right now.')
        }

        buttonContainer.textContent = ''
        google.renderButton(buttonContainer, {
          theme,
          size,
          text,
          shape,
          width:
            (isLandingVariant ? undefined : width) ??
            Math.min(360, Math.max(240, Math.floor(buttonContainer.clientWidth || width || 320))),
          logo_alignment: logoAlignment,
          state: buttonId,
          click_listener: () => {
            lastClickedGoogleButtonId = buttonId
            setErrorMessage(null)
          },
        })

        setIsReady(true)
        setErrorMessage(null)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load Google sign-in.')
      }
    }

    setIsReady(false)
    void renderGoogleButton()
  }, [buttonId, isGoogleAvailable, isLandingVariant, logoAlignment, shape, size, text, theme, width])

  return (
    <div className={className}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          isGoogleScriptReady = true
          googleScriptSubscribers.forEach((notifyReady) => notifyReady())
          setErrorMessage(null)
        }}
        onError={() => {
          setErrorMessage('Failed to load Google sign-in.')
        }}
      />
      {isLandingVariant ? (
        <div className={`relative inline-flex flex-col ${buttonClassName}`}>
          <div
            aria-hidden="true"
            className={`${landingButtonClassName} ${
              errorMessage ? landingErrorClassName : ''
            } ${isReady ? '' : 'opacity-90'} `}
            style={width ? { minWidth: `${width}px` } : undefined}
          >
            <GoogleMark className={iconClassName} />
            <span>{buttonLabel}</span>
          </div>
          <div ref={buttonContainerRef} className={`absolute inset-0 z-10 ${isReady ? 'opacity-[0.01]' : 'pointer-events-none opacity-0'}`} />
        </div>
      ) : (
        <div ref={buttonContainerRef} className={buttonClassName} />
      )}
      {showLoadingMessage && !isReady && !errorMessage ? (
        <p className="mt-3 text-center text-xs text-gray-500">Loading Google sign-in...</p>
      ) : null}
      {errorMessage ? <p className={messageClassName}>{errorMessage}</p> : null}
    </div>
  )
}
