# Sitedesk Admin Handover

This file captures critical operational knowledge from the optimization and reliability rollout.

## 1) Current Production Baseline

- Lighthouse targets are achieved across key pages (home/shop/blog/product) after:
  - hydration mismatch fixes
  - route-level code splitting and preload control
  - product image variant optimization
  - cart and checkout live data validation
- Worker now uses order buffering + retry sync logic for Google Sheets.

## 2) Critical Reliability Rules

- Stripe webhook endpoint must be:
  - `https://stripe-webhook.rdo90.workers.dev/webhook`
- Worker must verify signatures with:
  - `stripe.webhooks.constructEventAsync(...)`
  - Never switch back to sync `constructEvent(...)` on Workers runtime.
- Orders are first written to KV (`ORDERS_BUFFER`) with status:
  - `pending_sync`, `failed_sync`, `synced`
- Cron retry is required:
  - `*/1 * * * *`
- `ORDERS_BUFFER` KV binding must exist in deployed worker.

## 3) Verification Endpoints (Admin Token Required)

- `GET /admin/stripe-health`
  - confirms Stripe account and `livemode`
- `GET /admin/order-sync/status`
  - shows KV order buffer status summary
- `POST /admin/order-sync/run`
  - forces an immediate retry pass

## 4) Stripe Mode Discipline

- Always validate test/live mode before payment testing.
- If webhook deliveries fail, first inspect Stripe delivery log:
  - event id
  - response code
  - response body
- Failed events can be retried in Stripe after a fix.

## 5) Multi-Tenant Isolation (Must-Have)

Each client must have isolated resources:
- separate GitHub repo
- separate Cloudflare Pages project
- separate Cloudflare zone/domain
- separate Google Sheet
- separate Stripe account (preferred) or at minimum strict mode-separated credentials
- separate worker secrets and webhook secret

## 6) Common Failure Patterns

- `React #418/#423` in Lighthouse:
  - hydration parity issue (often route preload mismatch, including trailing slash path variants)
- webhook `400` with `SubtleCryptoProvider cannot be used in a synchronous context`:
  - sync Stripe signature verification used by mistake
- Google Sheets stale data in frontend:
  - solved by revalidation on mount/pageshow + checkout-time live validation

## 7) Deployment Safety

- `worker/wrangler.toml` remains local only (gitignored).
- Use `worker/wrangler.example.toml` as template.
- Use `worker/SAFE_WRANGLER_DEPLOY.md` and `worker/TEST_AND_MODE_PROCEDURE.md` for deploy/mode switches.

## 8) Minimum Go-Live Checklist

1. Worker deploy successful with KV + cron visible in deploy output.
2. Stripe webhook test event returns 2xx.
3. `order:*` key appears in KV and transitions to `synced`.
4. Order row appears in Google Sheet.
5. `admin/stripe-health` confirms expected mode/account.
