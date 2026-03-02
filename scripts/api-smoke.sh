#!/usr/bin/env bash

set -u

BASE_URL="${BASE_URL:-http://localhost:3001}"
AUTH_COOKIE="${AUTH_COOKIE:-}"
ADMIN_COOKIE="${ADMIN_COOKIE:-}"
OTHER_USER_SEARCH_HISTORY_ID="${OTHER_USER_SEARCH_HISTORY_ID:-}"
RUN_MUTATING_TESTS="${RUN_MUTATING_TESTS:-0}"
RUN_EXPENSIVE_TESTS="${RUN_EXPENSIVE_TESTS:-0}"

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

usage() {
  cat <<EOF
Usage: $(basename "$0") [--base-url URL] [--auth-cookie COOKIE] [--admin-cookie COOKIE]

Environment variables:
  BASE_URL                     Base app URL (default: http://localhost:3001)
  AUTH_COOKIE                  Cookie header for a signed-in normal user
  ADMIN_COOKIE                 Cookie header for a signed-in admin user
  OTHER_USER_SEARCH_HISTORY_ID Search-history row id owned by another user
  RUN_MUTATING_TESTS           Set to 1 to run safe local mutations (default: 0)
  RUN_EXPENSIVE_TESTS          Set to 1 to hit OpenAI/Route53/Stripe-backed routes (default: 0)

Examples:
  npm run api:smoke
  AUTH_COOKIE='sb-foo=...; sb-bar=...' npm run api:smoke
  AUTH_COOKIE='...' ADMIN_COOKIE='...' RUN_MUTATING_TESTS=1 npm run api:smoke
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    --auth-cookie)
      AUTH_COOKIE="$2"
      shift 2
      ;;
    --admin-cookie)
      ADMIN_COOKIE="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required" >&2
  exit 2
fi

record_pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf 'PASS %s\n' "$1"
}

record_fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf 'FAIL %s (%s)\n' "$1" "$2"
}

record_skip() {
  SKIP_COUNT=$((SKIP_COUNT + 1))
  printf 'SKIP %s (%s)\n' "$1" "$2"
}

request_status() {
  local method="$1"
  local path="$2"
  local cookie="${3:-}"
  local data="${4:-}"
  local content_type="${5:-application/json}"
  local extra_headers=()

  if [[ $# -gt 5 ]]; then
    shift 5
    extra_headers=("$@")
  fi

  local args=(
    -sS
    -o /tmp/domainerio-api-smoke-body.$$
    -w '%{http_code}'
    -X "$method"
    "$BASE_URL$path"
  )

  if [[ -n "$cookie" ]]; then
    args+=(-H "Cookie: $cookie")
  fi

  if [[ -n "$content_type" ]]; then
    args+=(-H "Content-Type: $content_type")
  fi

  if [[ -n "$data" ]]; then
    args+=(--data "$data")
  fi

  local header
  for header in "${extra_headers[@]}"; do
    args+=(-H "$header")
  done

  curl "${args[@]}"
}

assert_status() {
  local name="$1"
  local expected="$2"
  local method="$3"
  local path="$4"
  local cookie="${5:-}"
  local data="${6:-}"
  local content_type="${7:-application/json}"
  local extra_headers=()

  if [[ $# -gt 7 ]]; then
    shift 7
    extra_headers=("$@")
  fi

  local status
  if ! status="$(request_status "$method" "$path" "$cookie" "$data" "$content_type" "${extra_headers[@]}")"; then
    record_fail "$name" "request error"
    return
  fi

  if [[ "$status" == "$expected" ]]; then
    record_pass "$name"
  else
    local body
    body="$(cat /tmp/domainerio-api-smoke-body.$$ 2>/dev/null || true)"
    record_fail "$name" "expected $expected got $status body=${body:0:180}"
  fi
}

assert_status_in() {
  local name="$1"
  local expected_csv="$2"
  local method="$3"
  local path="$4"
  local cookie="${5:-}"
  local data="${6:-}"
  local content_type="${7:-application/json}"
  local extra_headers=()

  if [[ $# -gt 7 ]]; then
    shift 7
    extra_headers=("$@")
  fi

  local status
  if ! status="$(request_status "$method" "$path" "$cookie" "$data" "$content_type" "${extra_headers[@]}")"; then
    record_fail "$name" "request error"
    return
  fi

  local item
  IFS=',' read -r -a expected_items <<< "$expected_csv"
  for item in "${expected_items[@]}"; do
    if [[ "$status" == "$item" ]]; then
      record_pass "$name"
      return
    fi
  done

  local body
  body="$(cat /tmp/domainerio-api-smoke-body.$$ 2>/dev/null || true)"
  record_fail "$name" "expected one of [$expected_csv] got $status body=${body:0:180}"
}

cleanup() {
  rm -f /tmp/domainerio-api-smoke-body.$$ >/dev/null 2>&1 || true
}

trap cleanup EXIT

echo "Base URL: $BASE_URL"
echo "Safe mode: mutating=$RUN_MUTATING_TESTS expensive=$RUN_EXPENSIVE_TESTS"

assert_status "unauth usage-stats" "401" "GET" "/api/usage-stats" "" "" ""
assert_status "unauth search" "401" "POST" "/api/search" "" '{"description":"test brand","tlds":[".com"]}'
assert_status "unauth check" "401" "POST" "/api/check" "" '{"baseName":"test","tlds":[".com"]}'
assert_status "unauth explain" "401" "POST" "/api/explain" "" '{"description":"test brand","baseName":"test"}'
assert_status "unauth search-history get" "401" "GET" "/api/search-history" "" "" ""
assert_status "unauth billing status" "401" "GET" "/api/billing/status" "" "" ""
assert_status "unauth billing checkout" "401" "POST" "/api/billing/checkout" "" '{"interval":"month"}'
assert_status "unauth billing portal" "401" "POST" "/api/billing/portal" "" '{}'
assert_status "unauth privacy export" "401" "GET" "/api/privacy/export" "" "" ""
assert_status "unauth delete account" "401" "POST" "/api/privacy/delete-account" "" '{"confirm":"DELETE"}'
assert_status "unauth admin usage" "401" "GET" "/api/admin/usage" "" "" ""

assert_status "webhook missing signature" "400" "POST" "/api/stripe/webhook" "" '{"type":"checkout.session.completed","data":{"object":{}}}'
assert_status "webhook fake signature" "400" "POST" "/api/stripe/webhook" "" '{"type":"checkout.session.completed","data":{"object":{}}}' "application/json" "Stripe-Signature: t=1234567890,v1=deadbeef"

if [[ -z "$AUTH_COOKIE" ]]; then
  record_skip "authenticated checks" "AUTH_COOKIE not set"
else
  assert_status "auth usage-stats" "200" "GET" "/api/usage-stats" "$AUTH_COOKIE" "" ""
  assert_status "auth search-history get" "200" "GET" "/api/search-history" "$AUTH_COOKIE" "" ""
  assert_status "auth billing status" "200" "GET" "/api/billing/status" "$AUTH_COOKIE" "" ""
  assert_status "auth privacy export" "200" "GET" "/api/privacy/export" "$AUTH_COOKIE" "" ""

  assert_status "auth malformed check json" "400" "POST" "/api/check" "$AUTH_COOKIE" '{"baseName":'
  assert_status "auth malformed search json" "400" "POST" "/api/search" "$AUTH_COOKIE" '{"description":'
  assert_status "auth malformed explain json" "400" "POST" "/api/explain" "$AUTH_COOKIE" '{"description":'
  assert_status "auth invalid check payload" "400" "POST" "/api/check" "$AUTH_COOKIE" '{}'
  assert_status "auth invalid explain payload" "400" "POST" "/api/explain" "$AUTH_COOKIE" '{"description":"abc","baseName":""}'
  assert_status "auth invalid search payload" "400" "POST" "/api/search" "$AUTH_COOKIE" '{"description":"abc"}'
  assert_status "auth invalid billing interval" "400" "POST" "/api/billing/checkout" "$AUTH_COOKIE" '{"interval":"weekly"}'
  assert_status "auth delete-account wrong confirm" "400" "POST" "/api/privacy/delete-account" "$AUTH_COOKIE" '{"confirm":"NOPE"}'

  if [[ "$RUN_MUTATING_TESTS" == "1" ]]; then
    assert_status "auth search-history post" "200" "POST" "/api/search-history" "$AUTH_COOKIE" '{"description":"api-smoke-test","selected_tlds":[".com"]}'

    if [[ -n "$OTHER_USER_SEARCH_HISTORY_ID" ]]; then
      assert_status "auth cross-user delete attempt" "200" "DELETE" "/api/search-history" "$AUTH_COOKIE" "{\"id\":\"$OTHER_USER_SEARCH_HISTORY_ID\"}"
    else
      record_skip "auth cross-user delete attempt" "OTHER_USER_SEARCH_HISTORY_ID not set"
    fi
  else
    record_skip "auth search-history post" "RUN_MUTATING_TESTS != 1"
    record_skip "auth cross-user delete attempt" "RUN_MUTATING_TESTS != 1"
  fi

  if [[ "$RUN_EXPENSIVE_TESTS" == "1" ]]; then
    assert_status "auth valid check" "200" "POST" "/api/check" "$AUTH_COOKIE" '{"baseName":"smoketest","tlds":[".com"]}'
    assert_status_in "auth valid explain" "200,402" "POST" "/api/explain" "$AUTH_COOKIE" '{"description":"brand for developers","baseName":"smoketest"}'
    assert_status_in "auth valid search" "200,402" "POST" "/api/search" "$AUTH_COOKIE" '{"description":"brand for developers","tlds":[".com"]}'
    assert_status_in "auth valid billing checkout" "200,409" "POST" "/api/billing/checkout" "$AUTH_COOKIE" '{"interval":"month"}'
  else
    record_skip "auth provider-backed route checks" "RUN_EXPENSIVE_TESTS != 1"
  fi
fi

if [[ -z "$AUTH_COOKIE" ]]; then
  record_skip "non-admin authorization check" "AUTH_COOKIE not set"
else
  assert_status "non-admin admin usage" "403" "GET" "/api/admin/usage?groupBy=user" "$AUTH_COOKIE" "" ""
fi

if [[ -z "$ADMIN_COOKIE" ]]; then
  record_skip "admin authorization check" "ADMIN_COOKIE not set"
else
  assert_status "admin usage access" "200" "GET" "/api/admin/usage?groupBy=user" "$ADMIN_COOKIE" "" ""
fi

echo
echo "Summary: pass=$PASS_COUNT fail=$FAIL_COUNT skip=$SKIP_COUNT"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  exit 1
fi
