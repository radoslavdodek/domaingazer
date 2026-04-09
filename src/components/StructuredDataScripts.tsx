import { JsonLdScripts } from '@/components/JsonLdScripts'
import {
  getFaqPageJsonLd,
  getHowToJsonLd,
  getSoftwareApplicationJsonLd,
} from '@/lib/structuredData'

export function StructuredDataScripts({
  includeHowItWorks = false,
}: {
  includeHowItWorks?: boolean
}) {
  const schemas: Array<Record<string, unknown>> = [getSoftwareApplicationJsonLd()]

  if (includeHowItWorks) {
    schemas.push(getFaqPageJsonLd(), getHowToJsonLd())
  }

  return <JsonLdScripts schemas={schemas} idPrefix="structured-data" />
}
