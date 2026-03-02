export function getNamecheapBuyUrl(domain: string): string {
  const affiliateId = process.env.NEXT_PUBLIC_NAMECHEAP_AFFILIATE_ID
  const registrationUrl = `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`

  if (!affiliateId) {
    return registrationUrl
  }

  return `https://namecheap.pxf.io/c/${affiliateId}/386170/5618?u=${encodeURIComponent(registrationUrl)}`
}
