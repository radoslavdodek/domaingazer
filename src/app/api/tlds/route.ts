export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getSupportedTldCatalog } from '@/lib/tldCatalog'

export async function GET() {
  const catalog = await getSupportedTldCatalog()

  return NextResponse.json(catalog, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=43200',
    },
  })
}
