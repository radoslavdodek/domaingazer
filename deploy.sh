#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — edit these before first use
# ---------------------------------------------------------------------------
SSH_USER="deploy"
SSH_HOST="your-vps-ip-or-hostname"
SSH_PORT="22"
SSH_KEY=""                          # e.g. ~/.ssh/id_ed25519 (leave empty to use default)
APP_DIR="/var/www/domaingazer"      # absolute path on the server
PM2_APP_NAME="domaingazer"          # name used in: pm2 start ... --name <this>
BRANCH="main"
# ---------------------------------------------------------------------------

print_step() { echo -e "\n\033[1;34m==> $1\033[0m"; }
print_ok()   { echo -e "\033[1;32m    OK\033[0m"; }
print_err()  { echo -e "\033[1;31m    ERROR: $1\033[0m" >&2; exit 1; }

SSH_OPTS="-p ${SSH_PORT} -o StrictHostKeyChecking=accept-new"
[[ -n "$SSH_KEY" ]] && SSH_OPTS="$SSH_OPTS -o IdentitiesOnly=yes -i $SSH_KEY"

NVM_INIT='export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"'

ssh_run() {
  # Run a command on the remote server (sources nvm so node/npm are available)
  ssh $SSH_OPTS "${SSH_USER}@${SSH_HOST}" "${NVM_INIT}; $@"
}

# ---------------------------------------------------------------------------
print_step "Connecting to ${SSH_USER}@${SSH_HOST}…"
ssh_run "echo 'Connection OK'" || print_err "Cannot reach server"
print_ok

# ---------------------------------------------------------------------------
print_step "Pulling latest code (branch: ${BRANCH})"
ssh_run "
  set -e
  cd ${APP_DIR}
  git fetch --quiet origin
  git checkout --quiet ${BRANCH}
  git reset --hard origin/${BRANCH}
"
print_ok

# ---------------------------------------------------------------------------
print_step "Installing dependencies"
ssh_run "
  set -e
  cd ${APP_DIR}
  npm ci --silent
"
print_ok

# ---------------------------------------------------------------------------
print_step "Building application"
ssh_run "
  set -e
  cd ${APP_DIR}
  rm -rf .next
  npm run build
"
print_ok

# ---------------------------------------------------------------------------
print_step "Restarting PM2 process (${PM2_APP_NAME})"
ssh_run "
  set -e
  cd ${APP_DIR}
  if pm2 list | grep -q '${PM2_APP_NAME}'; then
    pm2 reload ${PM2_APP_NAME} --update-env
  else
    # First-time start — adjust port as needed
    pm2 start npm --name '${PM2_APP_NAME}' -- start
    pm2 save
  fi
"
print_ok

# ---------------------------------------------------------------------------
print_step "Verifying nginx config and reloading if changed"
ssh_run "
  set -e
  sudo nginx -t 2>&1 && sudo systemctl reload nginx
"
print_ok

# ---------------------------------------------------------------------------
echo -e "\n\033[1;32mDeployment complete.\033[0m"
