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

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
