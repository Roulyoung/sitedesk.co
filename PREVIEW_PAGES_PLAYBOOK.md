# Preview Pages Playbook

This project supports client-specific preview pages at:

- `/preview/:clientSlug`
- `/preview/:clientSlug/shop`
- `/preview/:clientSlug/product/:id`

Example:

- `/preview/bestfit-3d`

## Purpose

Preview pages run the real `Shop` and `Product` templates, but only with rows for one `client_slug`.

## Non-Negotiable Rules

1. Data filter rule:
- Always filter fetched rows by exact normalized `client_slug` match (`trim().toLowerCase()`).
- Never show cross-client rows.

2. Performance rule:
- Preview routes must stay on the same lazy-loaded page chunks as `Shop`/`Product`.
- Product/preview prerender can use `window.__PRERENDER_PRODUCTS__` bootstrap.

3. Styling rule:
- Preview styling must be scoped under `.preview-scope` only.
- Put preview overrides in `src/previews/previewTheme.css`.
- Never change global styling for preview-only design tweaks.

4. SEO/privacy rule:
- Every preview page must output:
  - `<meta name="robots" content="noindex, nofollow">`
  - canonical URL pointing to itself.
- `robots.txt` disallows `/preview/`.
- Sitemap generation excludes preview routes.

## Current Implementation

- Preview-aware templates:
  - `src/pages/Shop.tsx`
  - `src/pages/Product.tsx`
- Preview scoped styles:
  - `src/previews/previewTheme.css`
- Route registration:
  - `src/routes/AppRoutes.client.tsx`
  - `src/routes/AppRoutes.ssr.tsx`
- Prerender + sitemap:
  - `scripts/prerender.mjs`

## How To Add Preview-Only Styling

1. Add CSS under `.preview-scope` in:
- `src/previews/previewTheme.css`

2. If client-specific, scope deeper:
- `.preview-scope[data-client="bestfit3d"] { ... }`
- or conditionally render client class in `Shop`/`Product`.

3. Build and verify:
- `npm run build`
- Confirm:
  - route renders only that client data
  - noindex/canonical present
  - no global style bleed

## Prerender Behavior

`scripts/prerender.mjs` now:

- Reads all products.
- Creates preview shop pages:
  - `/preview/<client_slug>/index.html`
  - `/preview/<client_slug>/shop/index.html`
- Creates preview product pages:
  - `/preview/<client_slug>/product/<slug>/index.html`
- Boots preview and product pages with `window.__PRERENDER_PRODUCTS__` for fast first render.
- Writes `dist/sitemap.xml` without preview URLs.

## QA Checklist (Required)

1. Open `/preview/<slug>` and confirm only matching `client_slug` rows are shown.
2. Inspect page head for:
- `noindex, nofollow`
- canonical to same URL
3. Confirm preview URL is absent in generated sitemap.
4. Confirm Lighthouse on non-preview pages does not include preview chunks in network path.
