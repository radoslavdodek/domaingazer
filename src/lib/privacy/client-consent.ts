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
  const canUseOptionalServices = status === 'accepted' || (status === 'unknown' && region !== 'eu')

  return {
    region,
    status,
    canUseOptionalServices,
    canUseOptionalStorage: canUseOptionalServices,
  }
}

export function canUseOptionalServices() {
  return getConsentSnapshot().canUseOptionalServices
}

export function canUseOptionalStorage() {
  return getConsentSnapshot().canUseOptionalStorage
}

function getCookieDomains() {
  const hostname = window.location.hostname
  const parts = hostname.split('.').filter(Boolean)
  const domains = new Set([''])

  if (hostname && hostname !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    domains.add(hostname)
    domains.add(`.${hostname}`)
    for (let index = 1; index < parts.length - 1; index += 1) {
      domains.add(`.${parts.slice(index).join('.')}`)
    }
  }

  return [...domains]
}

function clearCookie(name: string) {
  const expires = 'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  const paths = ['/', window.location.pathname || '/']

  for (const domain of getCookieDomains()) {
    for (const path of paths) {
      document.cookie = [
        `${encodeURIComponent(name)}=`,
        expires,
        'Max-Age=0',
        `Path=${path}`,
        domain ? `Domain=${domain}` : '',
        window.location.protocol === 'https:' ? 'Secure' : '',
        'SameSite=Lax',
      ].filter(Boolean).join('; ')
    }
  }
}

function clearAnalyticsCookies() {
  if (!isBrowser()) return

  const cookieNames = document.cookie
    .split(';')
    .map((cookie) => decodeURIComponent(cookie.split('=')[0]?.trim() ?? ''))
    .filter((name) => (
      name === '_ga'
      || name.startsWith('_ga_')
      || name === '_gid'
      || name.startsWith('_gat')
      || name === '_clck'
      || name === '_clsk'
    ))

  for (const name of cookieNames) {
    clearCookie(name)
  }
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

  clearAnalyticsCookies()
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
