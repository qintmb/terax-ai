#!/usr/bin/env bash
set -euo pipefail

if [[ -f .env.tauri-signing ]]; then
  # shellcheck disable=SC1091
  source .env.tauri-signing
fi

KEY_PATH="${TAURI_SIGNING_KEY_PATH:-$HOME/.tauri/qintmb-terax-ai.key}"

if [[ ! -f "$KEY_PATH" ]]; then
  echo "Missing Tauri signing key: $KEY_PATH" >&2
  echo "Generate it with:" >&2
  echo "  pnpm tauri signer generate --ci -w \"$KEY_PATH\" -p 'YOUR_PASSWORD'" >&2
  exit 1
fi

if [[ -z "${TAURI_SIGNING_PRIVATE_KEY_PASSWORD:-}" ]]; then
  read -r -s -p "Tauri signing key password: " TAURI_SIGNING_PRIVATE_KEY_PASSWORD
  echo
fi

export TAURI_SIGNING_PRIVATE_KEY_PATH="$KEY_PATH"
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD

pnpm tauri build "$@"
