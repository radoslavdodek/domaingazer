# Contributing

Thanks for helping improve DomainGazer.

## Development Setup

1. Install Node.js 20.9.0 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment template and fill in local values:

   ```bash
   cp .env.example .env.local
   ```

4. Apply the Supabase migrations in `supabase/migrations/`.
5. Start the development server:

   ```bash
   npm run dev
   ```

## Before Opening a Pull Request

Run the same checks used by CI:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If you update generated industry SEO data, run:

```bash
npm run generate:industry-pages
```

and commit the updated `src/generated/industry-pages.ts` file.

## Coding Guidelines

- Use TypeScript and React patterns already present in the codebase.
- Keep components in `src/components`, routes in `src/app`, and shared logic in
  `src/lib`.
- Prefer small, focused changes over broad refactors.
- Keep secrets out of commits. Use `.env.local` for real local values.
- Add or update documentation when behavior, setup, or required configuration
  changes.

## Pull Requests

Pull requests should include:

- a short description of the change and why it is needed
- any relevant setup or environment changes
- screenshots or recordings for visible UI changes
- notes about testing performed

Use concise commit messages in the form `TYPE: summary`, for example:

```text
CHORE: add public repository docs
```
