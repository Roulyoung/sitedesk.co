# Preview Pages Playbook

This project supports client-specific preview pages at:

- `/preview/:clientSlug`

Example:

- `/preview/bestfit-3d`

## Purpose

Preview pages are customer demo shells that read from the main `Products` Google Sheets feed and show only rows for a single client via the `client_slug` column.

## Non-Negotiable Rules

1. Data filter rule:
- Always filter fetched rows by exact normalized `client_slug` match (`trim().toLowerCase()`).
- Never show cross-client rows.

2. Performance rule:
- Preview route must remain lazy-loaded from app routes.
- Any client-specific override must be lazy-loaded and only when its slug matches.
- Do not import preview override components from homepage or global layout.

3. Styling rule:
- Use scoped styles only for preview UIs (CSS Modules).
- Do not place preview styles in global CSS files.

4. SEO/privacy rule:
- Every preview page must output:
  - `<meta name="robots" content="noindex, nofollow">`
  - canonical URL pointing to itself.
- `robots.txt` disallows `/preview/`.
- Sitemap generation excludes preview routes.

## Current Implementation

- Route shell: `src/pages/PreviewShell.tsx`
- Shell styles: `src/pages/PreviewShell.module.css`
- Hardcoded override example:
  - `src/previews/overrides/Bestfit3DPreview.tsx`
  - `src/previews/overrides/Bestfit3DPreview.module.css`
- Route registration:
  - `src/routes/AppRoutes.client.tsx`
  - `src/routes/AppRoutes.ssr.tsx`
- Prerender + sitemap:
  - `scripts/prerender.mjs`

## How To Add A New Hardcoded Preview Override

1. Create a new component under:
- `src/previews/overrides/<ClientName>Preview.tsx`
- `src/previews/overrides/<ClientName>Preview.module.css`

2. Register slug loader in `overrideLoaders` in:
- `src/pages/PreviewShell.tsx`

3. Ensure the slug value matches the `client_slug` in Google Sheets.

4. Build and verify:
- `npm run build`
- Confirm:
  - route renders only that client data
  - noindex/noindex canonical present
  - no global style bleed

## Prerender Behavior

`scripts/prerender.mjs` now:

- Reads all products.
- Creates `/preview/<client_slug>/index.html` for unique slugs except `default`.
- Boots preview and product pages with `window.__PRERENDER_PRODUCTS__` for fast first render.
- Writes `dist/sitemap.xml` without preview URLs.

## QA Checklist (Required)

1. Open `/preview/<slug>` and confirm only matching `client_slug` rows are shown.
2. Inspect page head for:
- `noindex, nofollow`
- canonical to same URL
3. Confirm preview URL is absent in generated sitemap.
4. Confirm Lighthouse on non-preview pages does not include preview chunks in network path.
