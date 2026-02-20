# Sitedesk Clone + Update Factory

Related:
- `ADMIN_HANDOVER.md`
- `worker/TEST_AND_MODE_PROCEDURE.md`
- `worker/SAFE_WRANGLER_DEPLOY.md`
- `SECURITY_SECRETS_SETUP.md`
- `CUSTOMER_KEYS_REGISTER_TEMPLATE.md`

## 1) One-time template setup

1. Mark this repo as `Template repository` in GitHub.
2. Keep workflow file: `.github/workflows/deploy.yml`.
3. Keep config template: `sitedesk.config.example.json`.

## 2) New client bootstrap (fast path)

Use:

```powershell
.\scripts\bootstrap-customer.ps1 `
  -NewRepoName "client-webshop" `
  -GithubOwner "YOUR_GITHUB_USERNAME" `
  -TemplateRepo "YOUR_GITHUB_USERNAME/sitedesk.co" `
  -CloudflareAccountId "CF_ACCOUNT_ID" `
  -CloudflarePagesProjectName "client-webshop" `
  -CloudflareApiToken "CF_API_TOKEN"
```

This creates the repo from template and sets required GitHub Action secrets.

Security note:
- Keep raw secrets in vault/secret stores only.
- Use `CUSTOMER_KEYS_REGISTER_TEMPLATE.md` to track metadata (never plaintext secrets).

## 3) Required GitHub secrets per client repo

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT_NAME`
- `STRIPE_SECRET_KEY` (set in Worker secret, mode-specific)
- `STRIPE_WEBHOOK_SECRET` (set in Worker secret, mode-specific)
- `GOOGLE_SERVICE_ACCOUNT_KEY` (set in Worker secret, mode-specific)
- `ADMIN_PASSWORD` (set in Worker secret, mode-specific)

## 4) Google Sheets Script Properties per client

- `GH_TOKEN` (classic PAT with `repo` + `workflow`, or fine-grained token with repository Actions write + Contents read/write)
- `GH_OWNER`
- `GH_REPO`
- `CF_ZONE_ID`
- `CF_API_TOKEN`

## 4.1) Tenant Isolation Rules (Mandatory)

For each new webshop client, isolate all tenant resources:

- Separate GitHub repo.
- Separate Cloudflare Pages project.
- Separate Cloudflare zone/domain.
- Separate Google Sheet.
- Separate Google service account (or at minimum separate sheet access + dedicated credentials).
- Separate Stripe account (recommended) or at least separate Stripe mode credentials + webhook endpoint secret.

Do not reuse live secrets between clients.

## 5) Why update button may fail

Common causes:
- `GH_TOKEN` missing `workflow` permission.
- Wrong `GH_OWNER` or `GH_REPO`.
- Missing Cloudflare secrets in the repo.
- Cloudflare Pages project name mismatch.

## 6) Debug checklist

1. In GitHub repo -> `Actions`, check workflow `Sitedesk Build and Deploy`.
2. If no run appears, the dispatch call from Apps Script failed (token/owner/repo).
3. If run appears but fails, read failing step:
- `Validate Cloudflare secrets` means missing GitHub secrets.
- `Deploy to Cloudflare Pages` means token/project/account mismatch.

## 7) Test vs Live Mode (Worker)

Use mode-specific Worker deploy + secrets:

- Test: `wrangler deploy --env test`
- Live: `wrangler deploy --env live`

Always verify mode via:
- `GET /admin/stripe-health` (with admin bearer token)
- Check `livemode` flag and account id before running real payments.

## 8) Multilanguage Defaults for New Clones

- Route strategy:
  - default: `nl` (no prefix)
  - extra locales: `/en/*`, `/de/*`
- Prerender locales env:
  - `PRERENDER_LOCALES=nl,en,de` (build-time)
- Product sheet translation columns per locale:
  - `slug_<lang>`, `name_<lang>`, `description_<lang>`
  - example: `slug_en`, `name_en`, `description_en`
- Keep default columns (`slug`, `name`, `description`) as fallback for missing translations.
