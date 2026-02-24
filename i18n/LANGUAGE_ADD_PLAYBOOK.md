# Language Add Playbook

Use this when adding a new language for the website.

Related:
- `i18n/BLOG_REWRITE_PROMPTS.md`
- `i18n/CODEX_TASK_PROMPTS.md`
- `.private/I18N_OPERATOR_PRIVATE.md`
- `.private/I18N_CODEX_RUNBOOK_PRIVATE.md`
- `GOOGLE_SHEETS_I18N_SETUP.md`

## 1) Decide language code

- Use ISO code (example: `de`, `fr`, `es`).

## 2) Update Google Sheets product schema

Preferred product i18n columns (paired per locale):
- `title_nl`, `title_en`, `title_de`, ...
- `description_nl`, `description_en`, `description_de`, ...
- `slug_nl`, `slug_en`, `slug_de`, ...

Minimal-cell rollout for existing sheets is allowed:
- keep base NL columns (`name`, `description_nl`, `slug`)
- only add new locale columns (`title_<lang>`, `description_<lang>`, `slug_<lang>`)

Legacy compatibility:
- frontend still supports `name_<lang>` as fallback
- new standard is `title_<lang>`

## 3) Fill translation values in Sheets

If using formulas (fast bootstrap), start at row 2:

- `title_<lang>` from NL title
- `description_<lang>` from NL description
- `slug_<lang>` from NL slug (then manual SEO cleanup)

Example for EN with EU separators:

```gs
=IF($C2="";"";GOOGLETRANSLATE($C2;"nl";"en"))
```

For large catalogs:
- after review, copy translated columns and paste values-only
- this reduces recalc overhead and keeps Sheets responsive.

## 4) Activate locale in frontend + prerender

Set both:
- `VITE_ACTIVE_LOCALES=nl,en,<lang>`
- `PRERENDER_LOCALES=nl,en,<lang>`

This controls:
- active locale routes in frontend
- which localized static/product routes are emitted during prerender.

## 5) Worker/storage compatibility checks

- Worker already reads product rows dynamically by header names; no locale-specific code change required.
- Keep append range wide enough for added columns:
  - `worker/worker.js` uses `A:AZ` for admin append path.

## 6) Scaffold blog rewrite drafts (if blog also needs new locale)

Run:

```bash
npm run i18n:blog:scaffold -- --lang=<lang> --source=nl
```

This creates:
- `.private/blog-locales/<lang>/README.md` (default, commit-safe)
- one draft file per blog post

Optional public mode:

```bash
npm run i18n:blog:scaffold -- --lang=<lang> --source=nl --out=public
```

This writes to `i18n/blog-locales/<lang>/`.

Cleanup command:

```bash
# default: private drafts
npm run i18n:blog:clean -- --lang=<lang>

# cleanup public drafts
npm run i18n:blog:clean -- --lang=<lang> --scope=public

# cleanup both
npm run i18n:blog:clean -- --lang=<lang> --scope=all
```

## 7) Rewrite with prompt pack (Codex workflow)

- Use `i18n/BLOG_REWRITE_PROMPTS.md`
- Rewrite each draft (not literal translate).
- Validate JSON contract per post.

## 8) Apply rewritten posts

- Insert finalized localized post objects into your target locale content source.
- Keep fallback behavior to base locale when localized post is missing.

## 9) SEO checks

- Ensure localized pages exist with canonical + hreflang.
- Rebuild and verify:
  - `/lang/shop`
  - `/lang/blog`
  - `/lang/product/<localized-slug>`

## 10) Deploy + cache purge procedure (required)

1. Push to `main` (or trigger deployment workflow).
2. Wait for Cloudflare Pages deploy success.
3. Purge Cloudflare cache:
   - either via dashboard `Purge Everything`
   - or via the Google Sheets purge button.
4. Re-open localized URLs in an incognito session and verify live HTML source.

## 11) Performance Guardrails (Keep Product Pages at 100)

- Do not introduce blocking product API fetches in first render for localized product pages.
- Product detail route must render from prerender seed first (`window.__PRERENDER_PRODUCTS__`), for all locales.
- Runtime product refresh is allowed only as:
  - fallback when prerender seed is missing, or
  - background refresh (`requestIdleCallback` / delayed timeout), never in LCP critical path.
- Keep LCP image discoverable in HTML with:
  - `loading="eager"`
  - `fetchpriority="high"`
  - fixed `width`/`height`.
- If translation changes touch product templates, rerun mobile Lighthouse on:
  - `/product/<slug>/`
  - `/en/product/<slug>/`
  and confirm no `/products` request appears in the critical network chain before LCP.

## 12) Canonical Guardrails for Localized Home

- In this repo, localized home (`/en/`) is served by `Webshop` route.
- Do not assume `Index.tsx` controls homepage SEO tags.
- Keep `src/pages/Webshop.tsx` canonical locale-aware:
  - canonical should use `location.pathname` (`https://<domain>/en/` for EN home).
- Add hreflang alternates from `getAlternateHrefLangs(...)` on the same page.
- After deploy, validate live HTML for `/en/` before Lighthouse:
  - canonical must not point to root `/` when testing `/en/`.

## 13) Localized Hash Anchors (Important)

- Never hardcode Dutch section hashes in shared navigation.
- Use centralized helpers from `src/lib/i18n.ts`:
  - `getLandingSectionId(locale, key)`
  - `getLandingSectionHash(locale, key)`
- Current landing section keys:
  - `tech`
  - `calculator`
  - `comparison`
  - `offer`
  - `sheets`
  - `contact`
- Header/nav/footer/CTA links must use locale-aware hashes:
  - Example EN: `/en#comparison`
  - Example NL: `/#concurrentievergelijking`
- Section IDs on the landing page (`src/pages/Webshop.tsx`) must also be locale-aware and match these hashes.
- When adding a new language, update `LANDING_SECTION_IDS` in `src/lib/i18n.ts` before enabling the locale.
- Regression check after deploy:
  - Open `/en#comparison` and confirm it scrolls to the comparison section.
  - Open `/#concurrentievergelijking` and confirm NL still works.

## 14) Final go-live verification checklist (new language)

1. `/<lang>/` returns 200 and canonical points to `/<lang>/`.
2. `/<lang>/shop` shows translated product titles/descriptions.
3. `/<lang>/product/<slug_lang>` opens the correct product.
4. Product page head contains `hreflang` alternates including `x-default`.
5. No React hydration errors (`#418/#423`) in console.
6. Cloudflare cache purge completed after deploy.
