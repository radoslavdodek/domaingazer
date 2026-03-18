import { getSiteName } from '@/lib/site-config'

const siteName = getSiteName()
const lowerCaseSiteName = siteName.toLowerCase()

export function replaceBrandReferences(value: string): string {
  return value
    .replaceAll('Domain Gazer’s', `${siteName}'s`)
    .replaceAll('Domain Gazer', siteName)
    .replaceAll('domaingazer', lowerCaseSiteName)
}

export function normalizeBrandReferences<T>(value: T): T {
  if (typeof value === 'string') {
    return replaceBrandReferences(value) as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeBrandReferences(item)) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        normalizeBrandReferences(entry),
      ])
    ) as T
  }

  return value
}
