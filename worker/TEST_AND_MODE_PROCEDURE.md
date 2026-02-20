# Worker Test + Live Mode Procedure

## 1) Deploy mode

Use local script:

```powershell
cd worker
.\switch-worker-mode.ps1 -Mode test
```

or

```powershell
cd worker
.\switch-worker-mode.ps1 -Mode live
```

## 2) Secrets per mode (required)

Set mode-specific secrets:

```bash
cd worker
wrangler secret put STRIPE_SECRET_KEY --env test
wrangler secret put STRIPE_WEBHOOK_SECRET --env test
wrangler secret put GOOGLE_SERVICE_ACCOUNT_KEY --env test
wrangler secret put ADMIN_PASSWORD --env test
```

```bash
cd worker
wrangler secret put STRIPE_SECRET_KEY --env live
wrangler secret put STRIPE_WEBHOOK_SECRET --env live
wrangler secret put GOOGLE_SERVICE_ACCOUNT_KEY --env live
wrangler secret put ADMIN_PASSWORD --env live
```

## 3) Quick health checks

1. Login to admin:
- `POST /admin/login` with `{ "password": "..." }`

2. Verify Stripe mode/account:
- `GET /admin/stripe-health` with `Authorization: Bearer <token>`

3. Check order buffer:
- `GET /admin/order-sync/status` with `Authorization: Bearer <token>`

4. Force retry run:
- `POST /admin/order-sync/run` with `Authorization: Bearer <token>`

## 4) Stripe webhook test

In Stripe dashboard:
1. Open Webhooks endpoint for the selected mode account.
2. Click **Send test webhook**.
3. Choose `checkout.session.completed`.
4. Confirm endpoint responds with 2xx.

Then verify:
1. `GET /admin/order-sync/status` shows new record and eventually `synced`.
2. Google Sheet has the order row.

## 5) Expected failsafe behavior

- If Sheets fails temporarily, order remains in KV with `failed_sync`.
- Cron retry (every minute) attempts sync again.
- No order loss as long as Stripe webhook reaches worker and KV write succeeds.

## 6) Known gotcha

- On Cloudflare Workers, Stripe webhook signature verification must use:
  - `await stripe.webhooks.constructEventAsync(...)`
- Using sync `constructEvent(...)` causes `400` webhook failures.
