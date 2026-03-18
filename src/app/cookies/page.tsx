import type { Metadata } from 'next'
import { LegalPageLayout } from '@/components/LegalPageLayout'
import { getSiteName } from '@/lib/site-config'

export const metadata: Metadata = {
  alternates: {
    canonical: '/cookies',
  },
}

export default function CookiesPage() {
  const siteName = getSiteName()

  return (
    <LegalPageLayout
      title="Cookie Policy"
      description={`${siteName} currently uses essential authentication cookies and a small amount of first-party browser storage. This page documents what is used and how to control it.`}
    >
      <section>
        <h2 className="text-base font-semibold text-zinc-900">Essential cookies</h2>
        <p className="mt-2">
          Supabase authentication cookies are required to sign in, keep your session active, and protect account access.
          These cookies remain enabled because the product cannot function securely without them.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Consent preference storage</h2>
        <p className="mt-2">
          We store a first-party consent preference on your device so we can remember whether optional browser storage is
          enabled or disabled for that browser.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Optional browser storage</h2>
        <p className="mt-2">
          When enabled, {siteName} stores your selected theme, your current draft search description, and your most
          recent TLD selection in first-party browser storage. For EU users, this storage is disabled until you opt in.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">What we do not use</h2>
        <p className="mt-2">
          The current product does not use advertising cookies, third-party analytics trackers, or retargeting pixels.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Managing your preferences</h2>
        <p className="mt-2">
          You can enable or disable optional browser storage from the consent banner or from the signed-in Privacy &amp;
          Data page. Clearing your browser storage will also remove locally stored preferences.
        </p>
      </section>
    </LegalPageLayout>
  )
}
