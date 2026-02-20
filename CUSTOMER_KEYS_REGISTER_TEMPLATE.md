# Customer Keys Register Template

Purpose: track setup status and secret locations per client without storing raw secret values.

## Rules

- Do not paste full token/key values in this file.
- Only store metadata: where secret is stored, token id/name, last 4 chars, creation/rotation dates.

## Client Record Template

Client Name:
Domain:
GitHub Repo:
Cloudflare Account ID:
Cloudflare Zone ID:
Cloudflare Pages Project:
Google Sheet URL:
Google Script Project URL:
Stripe Account ID:

### Cloudflare
- Purge Token Name/ID:
- Purge Token Last4:
- Scope Check (single zone): yes/no
- Stored In (vault path):
- Created On:
- Last Rotated On:

### GitHub
- GH_TOKEN Type (classic/fine-grained):
- GH_TOKEN Last4:
- Stored In (vault path):
- Repo Secrets Set: yes/no
- Last Verified Workflow Run:

### Google Apps Script Properties
- `GH_OWNER` set: yes/no
- `GH_REPO` set: yes/no
- `GH_TOKEN` set: yes/no
- `CF_ZONE_ID` set: yes/no
- `CF_API_TOKEN` set: yes/no
- Last Trigger Test:

### Worker/Stripe
- Test mode configured: yes/no
- Live mode configured: yes/no
- Webhook endpoint verified: yes/no
- Last successful `checkout.session.completed` handling:

### Ops Checks
- Deploy automation test: pass/fail
- Cache purge test: pass/fail
- Canonical/hreflang check (`/` + `/en/`): pass/fail
- Lighthouse baseline saved: yes/no

---

## Optional Table View

| Client | Domain | Repo | Zone | Pages Project | Token Last4 | Rotated | Purge Test | Deploy Test |
|---|---|---|---|---|---|---|---|---|
| Example BV | example.com | org/example | <zone_id> | example-pages | abcd | 2026-02-20 | pass | pass |
