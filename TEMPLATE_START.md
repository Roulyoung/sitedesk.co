# Template Start

Use this checklist immediately after cloning or starting a new client project.

## Required Project Docs

Create or update these files first:

1. `PROJECT_KEYS_REGISTER.md`
2. `PROJECT_SECRETS_PLAYBOOK.md`
3. `GOOGLE_SHEETS_ACCESS.md`

## Purpose Of Each File

- `PROJECT_KEYS_REGISTER.md`
  Track where project secrets, sheet ids, domains, repos, and deployment settings live.
  Do not store raw secrets in it.

- `PROJECT_SECRETS_PLAYBOOK.md`
  Keep the project-specific storage and rotation process clear.
  This is the operational reference for secrets and verification.

- `GOOGLE_SHEETS_ACCESS.md`
  Reuse the standard Google Sheets access model:
  shared service account, worker secret, local admin script, no JSON in git.

## First Setup Pass

1. Set project name, domain, repo, and sheet id
2. Confirm worker choice:
   - shared worker
   - dedicated worker
3. Put raw secrets in a local user env var or non-committed `.env`, not in chat or markdown
4. Confirm GitHub repo variables and secrets
5. Confirm Cloudflare Pages project
6. Confirm Google Sheet access
7. Add a local sheet admin script if the project uses Sheets operationally
8. Run one verification command for each critical integration

## Minimum Verification

- Site build works
- Worker endpoint responds
- Google Sheet read works
- Stripe config path is documented
- Domain/canonical is documented
- Live share URL is documented in full `https://` form

## Deploy Baseline

For Cloudflare Pages projects, prefer this default workflow shape unless there is a documented exception:

- build with Node 22
- use `actions/checkout@v5`
- use `actions/setup-node@v5`
- deploy through `npx wrangler@latest pages deploy ...`
- keep the workflow config in the repo so future projects inherit the same baseline

## Rule

If a new project starts without these docs, add them before the project grows.
That prevents missing secrets, unclear ownership, and repeated setup mistakes.
Always move secrets from local env vars into GitHub or Cloudflare by CLI instead of pasting raw values into chat.

## Share Rule

When sending the website to a client or lead for the first time:

- always send the full `https://` URL
- example: `https://clientdomain.com`

Do not assume `clientdomain.com` will be clickable everywhere.
## Admin Auth Rule

For shared-worker admin access:

- use a site-specific worker secret like ADMIN_PASSWORD_<SITEKEY>
- point the admin frontend to the worker API, not a relative site route
- include the project site key on admin requests


