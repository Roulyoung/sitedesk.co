# Security Secrets Setup (Multi-Client)

Use this for every new client clone. Goal: fast setup, no secret leakage.

## Core Rule

Never store raw tokens/keys in repo files, copied project folders, or shared docs.

Allowed:
- local secret manager (1Password/Bitwarden)
- OS-level secure env vars
- GitHub/Cloudflare/Worker secret stores

Not allowed:
- plaintext tokens in `.md`, `.json`, `.env` committed or shared
- one global full-access token for all clients

## Per-Client Isolation (Mandatory)

Each client gets:
- separate GitHub repo
- separate Cloudflare zone + Pages project
- separate Cloudflare API token
- separate Stripe account (recommended)
- separate Google Sheet + script properties

## Cloudflare Token Policy

Create per-client token with minimum permissions:
- `Zone.Cache Purge:Edit`
- `Zone:Read` (optional but useful)

Scope:
- include only that client zone

Optional extra token (separate): deploy automation token with only required Pages permissions.
Do not reuse purge token for broad account admin actions.

## Where to Store What

1. GitHub Actions secrets (per client repo)
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT_NAME`

2. Google Apps Script properties (per client sheet script)
- `GH_TOKEN`
- `GH_OWNER`
- `GH_REPO`
- `CF_ZONE_ID`
- `CF_API_TOKEN`

3. Worker secrets (per env)
- Stripe keys/webhook secret
- Google service account key
- admin token/password

## Fast Onboarding Procedure (2-5 min)

1. Clone from template.
2. Create client-scoped Cloudflare token(s).
3. Set GitHub repo secrets.
4. Set Apps Script properties.
5. Run one deploy.
6. Purge cache once.
7. Validate:
- homepage loads
- product page checkout path works
- canonical/hreflang are correct on localized pages

## Rotation Procedure

When rotating a client token:
1. Create new token with same scope.
2. Update target secret store(s).
3. Verify one action (deploy or purge).
4. Revoke old token.
5. Update key register metadata (not secret value).

## Incident Procedure

If a token may be leaked:
1. Revoke token immediately.
2. Create replacement token.
3. Update secret stores.
4. Purge cache and verify site.
5. Log incident in client ops notes.
