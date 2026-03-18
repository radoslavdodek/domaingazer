# Contributing

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the credentials you actually need for the part of the app you are touching.
3. Run `npm ci`.
4. Apply the SQL files in `supabase/migrations/` if your change depends on database state.

## Before Opening a PR

- Run `npm run lint`.
- Run `npm run build`.
- Update docs when you add, remove, or rename env vars, routes, or setup steps.
- Include screenshots or short recordings for visible UI changes.

## PR Expectations

- Keep changes scoped.
- Explain behavior changes, not just code movement.
- Call out any new env vars, migrations, or third-party setup.
- Avoid committing secrets, local `.env` files, or machine-specific config.

## Coding Notes

- TypeScript + Next.js App Router.
- Prefer `PascalCase` for components and `camelCase` for variables/functions.
- Match the existing 2-space indentation.
- Keep server logs low-noise by default; use `DEBUG_LOGGING=true` only for targeted debugging.
