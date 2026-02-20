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

## 2) Activate locale in frontend

- Update `VITE_ACTIVE_LOCALES` (comma-separated), for example:
  - `nl,en,de`

This controls which locales are visible in the switcher and active routes.

## 3) Product columns in Google Sheets

Add these columns:
- `slug_<lang>`
- `name_<lang>`
- `description_<lang>`

Example for German:
- `slug_de`, `name_de`, `description_de`

## 4) Scaffold blog rewrite drafts

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

## 5) Rewrite with prompt pack (Codex workflow)

- Use `i18n/BLOG_REWRITE_PROMPTS.md`
- Rewrite each draft (not literal translate).
- Validate JSON contract per post.

## 6) Apply rewritten posts

- Insert finalized localized post objects into your target locale content source.
- Keep fallback behavior to base locale when localized post is missing.

## 7) SEO checks

- Ensure localized pages exist with canonical + hreflang.
- Rebuild and verify:
  - `/lang/shop`
  - `/lang/blog`
  - `/lang/product/<localized-slug>`

## 8) Performance Guardrails (Keep Product Pages at 100)

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

## 9) Canonical Guardrails for Localized Home

- In this repo, localized home (`/en/`) is served by `Webshop` route.
- Do not assume `Index.tsx` controls homepage SEO tags.
- Keep `src/pages/Webshop.tsx` canonical locale-aware:
  - canonical should use `location.pathname` (`https://<domain>/en/` for EN home).
- Add hreflang alternates from `getAlternateHrefLangs(...)` on the same page.
- After deploy, validate live HTML for `/en/` before Lighthouse:
  - canonical must not point to root `/` when testing `/en/`.

## 10) Localized Hash Anchors (Important)

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
