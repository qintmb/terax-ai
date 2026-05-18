#!/usr/bin/env bash
set -euo pipefail

KEY_PATH="${TAURI_SIGNING_KEY_PATH:-$HOME/.tauri/qintmb-terax-ai.key}"
PUBKEY_PATH="${KEY_PATH}.pub"
CONFIG_PATH="${TAURI_CONFIG_PATH:-src-tauri/tauri.conf.json}"

if [[ ! -f "$PUBKEY_PATH" ]]; then
  echo "Missing Tauri public key: $PUBKEY_PATH" >&2
  exit 1
fi

node - "$CONFIG_PATH" "$PUBKEY_PATH" <<'NODE'
const fs = require("node:fs");
const [configPath, pubkeyPath] = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const pubkey = fs.readFileSync(pubkeyPath, "utf8").trim();

config.plugins ??= {};
config.plugins.updater ??= {};
config.plugins.updater.pubkey = pubkey;

fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Synced updater pubkey into ${configPath}`);
NODE
