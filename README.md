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
      "base-url": "https://api.openai.com/v1"
    },
    {
      "name": "Groq",
      "api-key": "GROQ_API_KEY",
      "base-url": "https://api.groq.com/openai/v1"
    }
  ],
  "generateDomains": {
    "provider": "Groq",
    "model": "moonshotai/kimi-k2-instruct-0905"
  },
  "explain": {
    "provider": "Groq",
    "model": "moonshotai/kimi-k2-instruct-0905"
  }
}
```

Set `generateDomains.provider` and `generateDomains.model` for search generation.
Set `explain.provider` and `explain.model` for the Explain button.

If you want both flows to use the same setup, keep both sections identical:

```json
{
  "generateDomains": {
    "provider": "Groq",
    "model": "moonshotai/kimi-k2-instruct-0905"
  },
  "explain": {
    "provider": "Groq",
    "model": "moonshotai/kimi-k2-instruct-0905"
  }
}
```

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

## Deployment

The app runs on a Ubuntu VPS behind nginx. `deploy.sh` handles the full deploy over SSH.

### One-time server setup

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone the repo
git clone <repo-url> /var/www/domainerio
cd /var/www/domainerio
cp .env.example .env.local
# edit .env.local and fill in real values

# Allow the deploy user to reload nginx without a password prompt
echo "deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx, /usr/sbin/nginx" \
  | sudo tee /etc/sudoers.d/deploy
```

### Configure deploy.sh

Edit the variables at the top of `deploy.sh`:

| Variable | Default | Description |
|---|---|---|
| `SSH_USER` | `deploy` | SSH user on the server |
| `SSH_HOST` | _(required)_ | VPS IP or hostname |
| `SSH_PORT` | `22` | SSH port |
| `SSH_KEY` | _(empty)_ | Path to private key, e.g. `~/.ssh/id_ed25519` |
| `APP_DIR` | `/var/www/domainerio` | App directory on the server |
| `PM2_APP_NAME` | `domainerio` | PM2 process name |
| `BRANCH` | `main` | Git branch to deploy |

### Deploy

```bash
./deploy.sh
```

The script:
1. Verifies SSH connectivity
2. `git pull` the configured branch on the server
3. Runs `npm ci` to install dependencies
4. Runs `npm run build`
5. Reloads the PM2 process (starts it on first deploy)
6. Validates nginx config and runs `systemctl reload nginx`

### nginx config

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;

        # Required for SSE streaming to work correctly
        proxy_buffering off;
        proxy_read_timeout 120s;
    }
}
```
