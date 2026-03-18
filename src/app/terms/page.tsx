import type { Metadata } from 'next'
import { LegalPageLayout } from '@/components/LegalPageLayout'
import {
  getCompanyAddress,
  getCompanyLegalName,
  getCompanyRegistrationId,
  getSiteName,
} from '@/lib/site-config'

export const metadata: Metadata = {
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsPage() {
  const siteName = getSiteName()
  const companyName = getCompanyLegalName()
  const companyAddress = getCompanyAddress()
  const companyRegistrationId = getCompanyRegistrationId()

  return (
    <LegalPageLayout
      title="Terms of Service"
      description={`These terms govern access to ${siteName}. This service is run by ${companyName}.
Address: ${companyAddress}.
Company ID: ${companyRegistrationId}.`}
    >
      <section>
        <h2 className="text-base font-semibold text-zinc-900">Service access</h2>
        <p className="mt-2">
          {siteName} provides AI-assisted domain discovery, availability checks, and subscription-managed access to paid
          features. You are responsible for maintaining the security of your account and for activity performed using it.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Acceptable use</h2>
        <p className="mt-2">
          You may not use the service to violate law, abuse third-party services, interfere with product availability, or
          attempt unauthorized access to accounts or infrastructure.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Billing</h2>
        <p className="mt-2">
          Paid plans are billed through Stripe. Subscription renewals, cancellations, and payment methods are managed
          through Stripe&apos;s checkout and billing portal flows. Fees are non-refundable except where required by law.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Availability and warranty</h2>
        <p className="mt-2">
          The service is provided on an as-available basis. We do not guarantee uninterrupted operation, perfect domain
          availability accuracy, or uninterrupted access to third-party processors.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-900">Termination</h2>
        <p className="mt-2">
          We may suspend or terminate access for abuse, legal risk, or violation of these terms. You may stop using the
          service at any time and may delete your account through the in-app Privacy &amp; Data page if you do not have an
          active subscription.
        </p>
      </section>
    </LegalPageLayout>
  )
}
