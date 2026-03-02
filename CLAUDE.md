# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint via next lint
```

No test suite is configured.

## Architecture

**DomainGazer** is an AI-powered domain name finder. The user describes their project, selects TLDs, and the app generates brandable domain name candidates via OpenAI and streams their availability status in real time via AWS Route 53 Domains.

### Data flow

1. `page.tsx` (`'use client'`) owns top-level state via `useDomainSearch` hook.
2. User submits a description + selected TLDs through `SearchForm` / `TldSelector`.
3. The hook POSTs to `/api/search`, which:
   - Calls OpenAI (`gpt-4.1`) to generate 10 base names per round (up to 5 rounds, stopping early when any AVAILABLE domain is found).
   - Concurrently checks each `(baseName, tld)` pair via Route 53 `CheckDomainAvailabilityCommand` (concurrency=3, exponential backoff on throttling).
   - Streams results back as SSE (`text/event-stream`).
4. The hook reads the SSE stream, updating results in place (CHECKING → final status).
5. `ResultsPanel` / `DomainRow` render the live results.

### SSE event types (defined in `src/lib/types.ts`)

| Event | Payload |
|---|---|
| `round_start` | `{ round: number }` |
| `domain_result` | `{ baseName, tld, fullDomain, status }` |
| `done` | — |
| `error` | `{ message: string }` |

### Two API routes (both `runtime = 'nodejs'`)

- **`/api/search`** — full AI-generate-then-check flow with multi-round logic
- **`/api/check`** — availability-only check for a given `baseName` + `tlds[]`; used when the user adds a TLD after results are shown or checks a custom name

### Key implementation details

- **Concurrency limiter**: `p-limit` is not used (its ESM import maps break webpack). Both route handlers define an inline `createLimiter(concurrency)`.
- **Lazy client init**: `OpenAI` and `Route53DomainsClient` are module-level singletons initialized on first use, not at import time, to avoid build-time errors when env vars are absent.
- **`next.config.mjs`**: Uses `experimental.serverComponentsExternalPackages` (Next.js 14 key; `serverExternalPackages` is Next.js 15+).
- **AWS region**: Route 53 Domains API only works in `us-east-1` regardless of `AWS_REGION`.
- **README.md**: Always keep this file up-to-date.

## Environment variables

```
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
STRIPE_PRICE_MONTHLY_EUR_ID=
STRIPE_PRICE_YEARLY_EUR_ID=
STRIPE_PRICE_MONTHLY_USD_ID=
STRIPE_PRICE_YEARLY_USD_ID=
```
