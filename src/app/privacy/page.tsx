import type { Metadata } from 'next'
import { LegalPageLayout } from '@/components/LegalPageLayout'

export const metadata: Metadata = {
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="This document explains what personal data Domain Gazer processes, why we process it, and how users can exercise their privacy rights."
    >
      <section>
        <h2 className="text-base font-semibold text-zinc-900">Controller and contact</h2>
        <p className="mt-2">
          Indek s.r.o. is the data controller for the product data described here.<br/>
          Address: Lichardova 26, 01001 Zilina, Slovakia, European Union.<br/>
          Company ID: 46942955.<br/>
          For privacy requests, use the in-app
          Privacy &amp; Data page when signed in or contact <span className="font-medium">support@domaingazer.com</span>.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Data we process</h2>
        <p className="mt-2">
          We process account identifiers from Supabase and Google sign-in, saved search descriptions and selected TLDs,
          AI usage records, subscription and billing linkage, and your optional storage preference. We do not use
          advertising trackers in the current product.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Why we process it</h2>
        <p className="mt-2">
          We use this data to provide the product, authenticate users, generate domain suggestions, check domain
          availability, enforce plan limits, process payments, support security, and let you control your privacy
          preferences. Optional browser storage for theme and draft searches is used only with consent for EU users.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Legal bases</h2>
        <p className="mt-2">
          We rely on contract necessity to operate your account and paid features, legitimate interests for product
          security and abuse prevention, and consent for optional browser storage where required.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Processors and transfers</h2>
        <p className="mt-2">
          Domain Gazer uses Supabase for authentication and database services, Google for OAuth login, OpenAI and/or
          Groq for AI generation depending on the configured provider, AWS Route 53 Domains for domain availability
          checks, and Stripe for subscription billing. These services may process data outside your country of residence.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Retention</h2>
        <p className="mt-2">
          Search history remains until you delete entries or delete your account. Billing linkage and per-account credit
          usage are retained while your account exists. After account deletion, Domain Gazer may retain a minimal hashed
          anti-abuse record to enforce one-time free-credit limits and protect against fraud. AI usage records are
          retained for up to 180 days. Optional browser storage remains on your device until you change your preference
          or clear browser storage.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Your rights</h2>
        <p className="mt-2">
          You can access and download your app data, delete saved search history, disable optional storage, and request
          account deletion from the signed-in Privacy &amp; Data page. Account deletion removes your app data and auth
          account, but may leave a minimal hashed anti-abuse record for security. EU users may also lodge a complaint
          with their local supervisory authority.
        </p>
      </section>
    </LegalPageLayout>
  )
}
