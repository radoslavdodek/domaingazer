import type { Metadata } from 'next'
import { LegalPageLayout } from '@/components/LegalPageLayout'

export const metadata: Metadata = {
  alternates: {
    canonical: '/cookies',
  },
}

export default function CookiesPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      description="Domain Gazer uses essential authentication cookies and optional browser storage or analytics services. This page documents what is used and how to control it."
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
          We store a first-party consent preference on your device so we can remember whether optional browser storage
          and analytics services are enabled or disabled for that browser.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Optional browser storage and analytics</h2>
        <p className="mt-2">
          When enabled, Domain Gazer stores your selected theme, your current draft search description, and your most
          recent TLD selection in first-party browser storage. Google Analytics may also be loaded to measure aggregate
          traffic and product usage, and Microsoft Clarity may be loaded for session recording and heatmaps when a
          Clarity project ID is configured. For EU users, these optional services are disabled until you opt in.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">What we do not use</h2>
        <p className="mt-2">
          The current product does not use advertising cookies or retargeting pixels.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Managing your preferences</h2>
        <p className="mt-2">
          You can enable or disable optional services from the consent banner or from the signed-in Privacy &amp; Data
          page. Disabling optional services removes known first-party analytics cookies from the current browser. Clearing
          your browser storage will also remove locally stored preferences.
        </p>
      </section>
    </LegalPageLayout>
  )
}
