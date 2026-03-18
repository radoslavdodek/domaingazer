'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { getConsentSnapshot } from '@/lib/privacy/client-consent'
import { CONSENT_CHANGED_EVENT } from '@/lib/privacy/constants'

interface AnalyticsScriptsProps {
  gaMeasurementId?: string
  clarityProjectId?: string
}

export function AnalyticsScripts({
  gaMeasurementId,
  clarityProjectId,
}: AnalyticsScriptsProps) {
  const isProduction = process.env.NODE_ENV === 'production'
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const updateConsent = () => {
      setShouldLoad(getConsentSnapshot().canUseOptionalStorage)
    }

    updateConsent()
    window.addEventListener(CONSENT_CHANGED_EVENT, updateConsent)

    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, updateConsent)
    }
  }, [])

  if (!isProduction || !shouldLoad) {
    return null
  }

  return (
    <>
      {gaMeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="lazyOnload"
          />
          <Script id="gtag-init" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}');
            `}
          </Script>
        </>
      )}
      {clarityProjectId && (
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","${clarityProjectId}");
          `}
        </Script>
      )}
    </>
  )
}
