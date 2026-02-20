# Safe Wrangler Deploy (No Secret Leakage)

1. Copy template:
```bash
cp worker/wrangler.example.toml worker/wrangler.toml
```

2. Fill real IDs/URLs in local `worker/wrangler.toml`.

3. Set secrets (local/Cloudflare, never commit):
```bash
cd worker
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put GOOGLE_SERVICE_ACCOUNT_KEY
wrangler secret put ADMIN_PASSWORD
```

4. Deploy:
```bash
wrangler deploy
```

5. Verify config:
```bash
wrangler deployments list
```

Notes:
- `worker/wrangler.toml` is gitignored.
- Rotate Cloudflare/Stripe secrets immediately if you accidentally expose them.
