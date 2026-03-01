export const PRIVACY_REGION_COOKIE = 'dg_region'
export const CONSENT_STORAGE_KEY = 'domaingazer_cookie_consent_v1'
export const CONSENT_STORAGE_VERSION = 1
export const CONSENT_CHANGED_EVENT = 'domaingazer:consent-changed'

export const OPTIONAL_STORAGE_KEYS = [
  'domaingazer_theme',
  'domaingazer_description',
  'domaingazer_tlds',
] as const

export const MODEL_USAGE_RETENTION_DAYS = 180

export type RegionKind = 'eu' | 'non-eu'
export type ConsentStatus = 'unknown' | 'accepted' | 'declined'
