'use client'

import { canUseOptionalStorage } from './client-consent'

export function getOptionalItem(key: string): string | null {
  if (typeof window === 'undefined' || !canUseOptionalStorage()) return null

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function setOptionalItem(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !canUseOptionalStorage()) return false

  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function removeOptionalItem(key: string) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(key)
  } catch {
    return
  }
}
