# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages, layouts, and API routes.
- `src/components`: Reusable UI components.
- `src/hooks`: Custom React hooks.
- `src/lib`: Shared utilities and service clients (e.g., OpenAI/AWS helpers).
- Root config: `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `eslint.config.mjs`.
- Environment: `.env.example` is the template; `.env.local` holds local secrets.

## Build, Test, and Development Commands
- `npm run dev`: Start the local dev server at `http://localhost:3000`.
- `npm run build`: Create a production build.
- `npm run start`: Run the production server from the build output.
- `npm run lint`: Run ESLint via the ESLint CLI.

## Coding Style & Naming Conventions
- Language: TypeScript + React (Next.js 16 App Router).
- Indentation: 2 spaces (match existing project defaults).
- Linting: `next/core-web-vitals` via `eslint.config.mjs`; run `npm run lint` before PRs.
- Naming: Prefer `PascalCase` for components and `camelCase` for variables/functions.

## Testing Guidelines
- No automated test framework is configured yet.
- If you add tests, document the framework and provide a runnable command (e.g., `npm test`).
- Use clear, descriptive test names that reflect behavior.

## Commit & Pull Request Guidelines
- Commit messages follow a concise, prefixed style. Recent history shows `CHORE: <summary>`.
- Preferred format: `TYPE: summary` (e.g., `FEAT: add availability caching`).
- PRs should include:
  - A short description of the change and rationale.
  - Any relevant setup or environment changes.
  - Screenshots or screen recordings for UI updates.

## Configuration & Secrets
- Required env vars: `OPENAI_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=us-east-1`.
- Never commit real credentials; keep them in `.env.local`.
