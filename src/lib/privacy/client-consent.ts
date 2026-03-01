'use client'

import {
  CONSENT_CHANGED_EVENT,
  CONSENT_STORAGE_KEY,
  CONSENT_STORAGE_VERSION,
  OPTIONAL_STORAGE_KEYS,
  PRIVACY_REGION_COOKIE,
  type ConsentStatus,
  type RegionKind,
} from './constants'

type ConsentRecord = {
  status: Exclude<ConsentStatus, 'unknown'>
  version: number
  updatedAt: string
  region: RegionKind
}

function isBrowser() {
  return typeof window !== 'undefined'
}

function readRegionCookieValue(): string | null {
  if (!isBrowser()) return null

  const escapedKey = PRIVACY_REGION_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedKey}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function readConsentRecord(): ConsentRecord | null {
  if (!isBrowser()) return null

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<ConsentRecord>
    if (
      (parsed.status !== 'accepted' && parsed.status !== 'declined')
      || parsed.version !== CONSENT_STORAGE_VERSION
      || (parsed.region !== 'eu' && parsed.region !== 'non-eu')
    ) {
      return null
    }

    return {
      status: parsed.status,
      version: parsed.version,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
      region: parsed.region,
    }
  } catch {
    return null
  }
}

function emitConsentChanged(status: Exclude<ConsentStatus, 'unknown'>) {
  if (!isBrowser()) return
  window.dispatchEvent(
    new CustomEvent(CONSENT_CHANGED_EVENT, {
      detail: {
        status,
        region: getRegionKind(),
      },
    })
  )
}

export function getRegionKind(): RegionKind {
  const value = readRegionCookieValue()
  return value === 'eu' ? 'eu' : 'non-eu'
}

export function getConsentStatus(): ConsentStatus {
  return readConsentRecord()?.status ?? 'unknown'
}

export function getConsentSnapshot() {
  const region = getRegionKind()
  const status = getConsentStatus()

  return {
    region,
    status,
    canUseOptionalStorage: status === 'accepted' || (status === 'unknown' && region !== 'eu'),
  }
}

export function canUseOptionalStorage() {
  return getConsentSnapshot().canUseOptionalStorage
}

export function clearOptionalStorage() {
  if (!isBrowser()) return

  for (const key of OPTIONAL_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      continue
    }
  }
}

export function setConsentStatus(status: Exclude<ConsentStatus, 'unknown'>) {
  if (!isBrowser()) return

  const record: ConsentRecord = {
    status,
    version: CONSENT_STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    region: getRegionKind(),
  }

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record))
  } catch {
    return
  }

  if (status === 'declined') {
    clearOptionalStorage()
  }

  emitConsentChanged(status)
}
