const DEFAULT_PRODUCTION_ORIGIN = 'https://example.com'
const DEFAULT_DEVELOPMENT_ORIGIN = 'http://localhost:3000'

function normalizeOrigin(value: string, envName: string) {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error(`Invalid ${envName}: expected an absolute URL`)
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Invalid ${envName}: expected an http or https URL`)
  }

  return url.origin
}

export function getAppOrigin() {
  const appUrl = process.env.APP_URL?.trim()
  if (appUrl) {
    return normalizeOrigin(appUrl, 'APP_URL')
  }

  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (publicSiteUrl) {
    return normalizeOrigin(publicSiteUrl, 'NEXT_PUBLIC_SITE_URL')
  }

  return process.env.NODE_ENV === 'development'
    ? DEFAULT_DEVELOPMENT_ORIGIN
    : DEFAULT_PRODUCTION_ORIGIN
}
