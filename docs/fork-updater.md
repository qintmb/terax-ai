# Fork Updater Setup

This fork ships updates from `https://github.com/qintmb/terax-ai`.

## Local signed build

```bash
pnpm run tauri:build:signed
```

The script reads the private updater key from:

```bash
~/.tauri/qintmb-terax-ai.key
```

## GitHub release signing secrets

```bash
pnpm run tauri:secrets:setup
```

This writes these GitHub Actions secrets to `qintmb/terax-ai`:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

## Updater public key

The matching public key is intentionally committed in:

```bash
src-tauri/tauri.conf.json
```

Tauri embeds this public key into the app binary so future downloads can be verified.

When rotating the key, sync the config from `~/.tauri/qintmb-terax-ai.key.pub`:

```bash
pnpm run tauri:pubkey:sync
```
