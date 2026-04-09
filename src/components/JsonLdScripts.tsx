type JsonLdSchema = Record<string, unknown>

function encodeJsonString(value: string) {
  let encoded = ''

  for (const char of value) {
    const codePoint = char.codePointAt(0)

    if (!codePoint) {
      continue
    }

    if (codePoint <= 0xffff) {
      encoded += `\\u${codePoint.toString(16).padStart(4, '0')}`
      continue
    }

    const surrogateOffset = codePoint - 0x10000
    const highSurrogate = 0xd800 + (surrogateOffset >> 10)
    const lowSurrogate = 0xdc00 + (surrogateOffset & 0x3ff)
    encoded += `\\u${highSurrogate.toString(16).padStart(4, '0')}\\u${lowSurrogate.toString(16).padStart(4, '0')}`
  }

  return `"${encoded}"`
}

function serializeJsonLdValue(value: unknown): string {
  if (typeof value === 'string') {
    return encodeJsonString(value)
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'null'
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (value === null || value === undefined) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => serializeJsonLdValue(item)).join(',')}]`
  }

  return `{${Object.entries(value)
    .filter(([, entryValue]) => entryValue !== undefined)
    .map(([key, entryValue]) => `${encodeJsonString(key)}:${serializeJsonLdValue(entryValue)}`)
    .join(',')}}`
}

function serializeJsonLd(schema: JsonLdSchema) {
  return serializeJsonLdValue(schema)
}

export function JsonLdScripts({
  schemas,
  idPrefix = 'json-ld',
}: {
  schemas: ReadonlyArray<JsonLdSchema>
  idPrefix?: string
}) {
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`${idPrefix}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      ))}
    </>
  )
}
