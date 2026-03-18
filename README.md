# DomainGazer

AI-assisted domain discovery with live availability checks, auth, billing, privacy tooling, and self-hostable configuration.

## What It Does

- Accepts a plain-English product description and selected TLDs.
- Generates brandable base names with an OpenAI-compatible provider.
- Checks availability live through Namecheap bulk checks with Route 53 fallback.
- Streams results back over SSE.
- Tracks billing, usage, feedback, privacy export/delete, and admin impersonation through Supabase + Stripe.

## Requirements

- Node.js `>=20.9.0`
- npm `>=10`
- Supabase project with Auth enabled
- AWS Route 53 Domains credentials in `us-east-1`
- One OpenAI-compatible provider key configured in [`src/config/ai-providers.json`](src/config/ai-providers.json)
- Stripe only if you want paid subscriptions

## Quick Start

```bash
cp .env.example .env.local
npm ci
# Apply the SQL files in supabase/migrations/
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run check
npm run generate:industry-pages
npm run api:smoke
```

## Environment

`.env.example` is the source of truth. The main groups are:

- Core app: `OPENAI_API_KEY` and/or `GROQ_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Google sign-in: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Free-credit enforcement: `FREE_CREDIT_IDENTITY_SALT`, `FREE_CREDITS_TOTAL`, `FREE_CREDITS_COST_SEARCH`, `FREE_CREDITS_COST_EXPLAIN`
- Billing: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the four `STRIPE_PRICE_*` IDs
- Self-hosting / branding: `APP_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_SITE_TAGLINE`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_COMPANY_*`
- Optional integrations: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_CLARITY_PROJECT_ID`, `NEXT_PUBLIC_IMPACT_SITE_VERIFICATION`, `NEXT_PUBLIC_NAMECHEAP_AFFILIATE_ID`, `SLACK_FEEDBACK_WEBHOOK_URL`, `NAMECHEAP_*`, `DEBUG_LOGGING`

Notes:

- GitHub OAuth is configured in the Supabase dashboard, not through app env vars.
- If `NAMECHEAP_*` is unset, the app still works and uses Route 53 only.
- Leave `DEBUG_LOGGING=false` in normal environments; it enables verbose provider/domain logs.

## Supabase Setup

Apply every migration in [`supabase/migrations`](supabase/migrations). The current app expects:

- `search_history`
- `model_usage`
- `billing_customers`
- `subscriptions`
- `credit_usage`
- `free_credit_entitlements`
- `user_feedback`

Auth setup:

- Enable Google and GitHub providers in Supabase Auth if you want social login.
- Keep Email / OTP enabled if you want magic-link login.
- Add local callback URLs such as `http://localhost:3000/auth/callback`.

## Stripe Setup

Subscriptions are optional. If enabled:

1. Create one Stripe product for the paid plan.
2. Create four recurring prices: EUR monthly, EUR yearly, USD monthly, USD yearly.
3. Put those `price_...` ids into the matching `STRIPE_PRICE_*` vars.
4. Point Stripe webhooks at `/api/stripe/webhook`.
5. Enable:
   `checkout.session.completed`
   `customer.subscription.created`
   `customer.subscription.updated`
   `customer.subscription.deleted`

Local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## AI Provider Config

Provider/model selection lives in [`src/config/ai-providers.json`](src/config/ai-providers.json).

- `providers[*].api-key` names the env var to read.
- `generateDomains` controls search generation.
- `explain` controls the explanation endpoint.
- Optional `backup` entries provide a fallback provider/model.

## Self-Hosting Notes

- Core branding, legal identity, site URL, support email, analytics ids, and share links are now env-driven.
- Some long-form marketing content is still opinionated and DomainGazer-specific, especially in [`src/lib/seo-pages.ts`](src/lib/seo-pages.ts) and [`src/generated/industry-pages.ts`](src/generated/industry-pages.ts). If you are rebranding the app, update or regenerate those assets.
- The repo stays `"private": true` in `package.json` to prevent accidental npm publishing; that does not affect GitHub open-sourcing.

## Deployment

`deploy.sh` is a simple VPS/PM2/nginx deployment helper. Review it before using it in production.

High-level flow:

1. SSH into the target host
2. Reset the target checkout to the configured branch
3. Run `npm ci`
4. Run `npm run build`
5. Reload PM2
6. Validate and reload nginx

Adjust the top-level variables in [`deploy.sh`](deploy.sh) before first use.
