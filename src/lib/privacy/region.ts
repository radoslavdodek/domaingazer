import type { RegionKind } from './constants'

const EEA_COUNTRY_CODES = new Set([
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IS',
  'IE',
  'IT',
  'LV',
  'LI',
  'LT',
  'LU',
  'MT',
  'NL',
  'NO',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
])

export function isEuCountryCode(countryCode?: string | null) {
  if (!countryCode) return false
  return EEA_COUNTRY_CODES.has(countryCode.trim().toUpperCase())
}

export function getRegionFromCountryCode(countryCode?: string | null): RegionKind {
  return isEuCountryCode(countryCode) ? 'eu' : 'non-eu'
}

export function getDefaultRegion(): RegionKind {
  return process.env.GDPR_DEFAULT_REGION === 'non-eu' ? 'non-eu' : 'eu'
}

export function getCountryHeaderName() {
  const headerName = process.env.GDPR_COUNTRY_HEADER_NAME?.trim().toLowerCase()
  return headerName || 'x-country-code'
}
