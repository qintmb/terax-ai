#!/usr/bin/env bash
set -euo pipefail

REPO="${GITHUB_REPOSITORY:-qintmb/terax-ai}"
KEY_PATH="${TAURI_SIGNING_KEY_PATH:-$HOME/.tauri/qintmb-terax-ai.key}"
PUBKEY_PATH="${KEY_PATH}.pub"

if ! command -v gh >/dev/null 2>&1; then
  echo "Missing GitHub CLI: gh" >&2
  echo "Install/login first, then rerun:" >&2
  echo "  gh auth login" >&2
  exit 1
fi

if [[ ! -f "$KEY_PATH" ]]; then
  echo "Missing Tauri signing key: $KEY_PATH" >&2
  exit 1
fi

if [[ -z "${TAURI_SIGNING_PRIVATE_KEY_PASSWORD:-}" ]]; then
  read -r -s -p "Tauri signing key password: " TAURI_SIGNING_PRIVATE_KEY_PASSWORD
  echo
fi

gh secret set TAURI_SIGNING_PRIVATE_KEY \
  --repo "$REPO" \
  --body "$(cat "$KEY_PATH")"

gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD \
  --repo "$REPO" \
  --body "$TAURI_SIGNING_PRIVATE_KEY_PASSWORD"

echo "GitHub secrets updated for $REPO"
if [[ -f "$PUBKEY_PATH" ]]; then
  echo "Public key:"
  cat "$PUBKEY_PATH"
fi
