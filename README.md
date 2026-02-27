# domainerio

An AI-powered domain name finder. Describe your project, select your preferred TLDs, and get brandable domain name candidates with real-time availability checking.

## How it works

1. Enter a description of your project and select TLDs
2. The configured AI provider/model generates 10 base name candidates per round (up to 6 rounds)
3. Each `(baseName, tld)` pair is checked against AWS Route 53 Domains in real time
4. Results stream back via SSE, updating live from `CHECKING` to a final availability status
5. Generation stops early once an available domain is found

## Getting started

### Prerequisites

- Node.js 18+
- OpenAI API key or Groq API key (based on your provider config)
- AWS credentials with Route 53 Domains access (must use `us-east-1`)

### Setup

```bash
cp .env.example .env.local
# Fill in your credentials (see Environment variables below)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

```
OPENAI_API_KEY=
GROQ_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
```

## AI provider config

Provider/model selection lives in [`src/config/ai-providers.json`](src/config/ai-providers.json):

```json
{
  "providers": [
    {
      "name": "OpenAI",
      "api-key": "OPENAI_API_KEY",
      "base-url": "https://api.openai.com/v1",
      "model": "gpt-4.1"
    },
    {
      "name": "Groq",
      "api-key": "GROQ_API_KEY",
      "base-url": "https://api.groq.com/openai/v1",
      "model": "llama-3.3-70b-versatile"
    }
  ],
  "defaultProvider": "OpenAI"
}
```

Set `defaultProvider` to `OpenAI` or `Groq`, and set the `model` per provider as needed.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint via next lint
```

## Tech stack

- **Next.js 14** (App Router, Node.js runtime)
- **OpenAI-compatible AI clients** — OpenAI or Groq via config
- **AWS Route 53 Domains** — availability checking with exponential backoff
- **SSE** — real-time result streaming
