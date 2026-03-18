const DEFAULT_SITE_NAME = 'Domain Search Starter'
const DEFAULT_SITE_TAGLINE = 'Find your perfect domain name with AI'
const DEFAULT_SITE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : 'https://example.com'
const DEFAULT_SUPPORT_EMAIL = 'support@example.com'
const DEFAULT_COMPANY_LEGAL_NAME = 'Your Company'
const DEFAULT_COMPANY_ADDRESS = 'Your business address'
const DEFAULT_COMPANY_REGISTRATION_ID = 'Not provided'

function getTrimmedEnv(name: keyof NodeJS.ProcessEnv) {
  const value = process.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getConfiguredSiteUrl() {
  return getTrimmedEnv('NEXT_PUBLIC_SITE_URL') ?? DEFAULT_SITE_URL
}

function getSiteUrlObject() {
  return new URL(getConfiguredSiteUrl())
}

export function getSiteName() {
  return getTrimmedEnv('NEXT_PUBLIC_SITE_NAME') ?? DEFAULT_SITE_NAME
}

export function getSiteTagline() {
  return getTrimmedEnv('NEXT_PUBLIC_SITE_TAGLINE') ?? DEFAULT_SITE_TAGLINE
}

export function getSiteUrl() {
  return getSiteUrlObject().toString().replace(/\/$/, '')
}

export function getSiteHost() {
  return getSiteUrlObject().host
}

export function getSupportEmail() {
  return getTrimmedEnv('NEXT_PUBLIC_SUPPORT_EMAIL') ?? DEFAULT_SUPPORT_EMAIL
}

export function getCompanyLegalName() {
  return getTrimmedEnv('NEXT_PUBLIC_COMPANY_LEGAL_NAME') ?? DEFAULT_COMPANY_LEGAL_NAME
}

export function getCompanyAddress() {
  return getTrimmedEnv('NEXT_PUBLIC_COMPANY_ADDRESS') ?? DEFAULT_COMPANY_ADDRESS
}

export function getCompanyRegistrationId() {
  return getTrimmedEnv('NEXT_PUBLIC_COMPANY_REGISTRATION_ID') ?? DEFAULT_COMPANY_REGISTRATION_ID
}

export function getGaMeasurementId(): string | undefined {
  return getTrimmedEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID') ?? undefined
}

export function getClarityProjectId(): string | undefined {
  return getTrimmedEnv('NEXT_PUBLIC_CLARITY_PROJECT_ID') ?? undefined
}

export function getImpactSiteVerification(): string | undefined {
  return getTrimmedEnv('NEXT_PUBLIC_IMPACT_SITE_VERIFICATION') ?? undefined
}

export function getSocialShareLinks() {
  const siteUrl = getSiteUrl()
  const encodedUrl = encodeURIComponent(siteUrl)
  const encodedText = encodeURIComponent(getSiteTagline())

  return {
    x: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  }
}
