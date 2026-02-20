# Sitedesk Page Optimization Playbook

Use this playbook whenever you optimize an existing page (`/shop`, `/blog`, `/product/:id`) or a new page.

## Reusable Prompt (Copy/Paste)

```text
Role: Senior Frontend Performance + Accessibility Engineer.
Task: Optimize <PAGE_ROUTE> to Lighthouse 100/100/100/100 (Performance, Accessibility, Best Practices, SEO) on desktop and mobile, without changing visual layout or business logic.

Hard constraints:
- Keep design and layout intent intact.
- Do not break data/API flows.
- Keep SSR/hydration stable (no React hydration errors).
- Keep analytics behavior as configured (interaction-delayed analytics allowed).

Apply this checklist:
1) Critical render path
- Remove render-blocking requests where possible.
- Keep critical CSS lean; defer non-critical CSS.
- Avoid adding new font/network chains.
- Prefer system fonts unless self-hosted fonts are required.
- Add `preconnect`/`dns-prefetch` for required API/image origins used in first render.
- Keep origin preconnect links centralized (global template) to avoid duplicate per-route injections.

2) JS payload and execution
- Eliminate unused runtime providers/libraries on critical path.
- Lazy-load non-critical UI (toasts, overlays, etc).
- Keep route hydration stable (SSR and client route trees must match).
- Avoid long main-thread tasks.
- Avoid loading non-critical media on first paint (e.g. gallery thumbnails below the fold).

3) Third-party scripts
- Defer GTM/analytics until first user interaction.
- Do not load heavy third-party scripts during initial paint.

4) Accessibility semantics
- Enforce heading order with no skipped levels.
- Ensure keyboard navigation and ARIA states for interactive controls.
- Ensure color contrast meets WCAG AA for all text.
- Ensure every form control has an explicit accessible name:
  - use `<label htmlFor>` + matching control `id` for `input`, `select`, `textarea`
  - if a visible label is not possible, add `aria-label` or `aria-labelledby`
- Ensure mobile tap targets are >= 48x48 CSS px and not overlapping fixed controls.

5) Visual token safety
- Prefer token-level changes (`--muted-foreground`, `--accent`, etc) over one-off overrides.
- If specific components still fail contrast, patch classes locally.

6) Cloudflare-aware checks
- Avoid dependencies on Cloudflare-injected scripts where possible.
- Confirm no robots/content-signal injection issues.

7) Canonical hygiene (critical for SEO >= 100)
- Never keep a route-specific canonical in static `index.html` for prerendered SPA routes.
- Set exactly one canonical per route with `Helmet` (`https://<domain>/<route>/` preferred for consistency).
- Ensure there are no conflicting canonicals between static head tags and route-level tags.

8) Dynamic route SEO (product/blog detail templates)
- Add route-level `Helmet` metadata on dynamic templates (`/product/:id`, `/blog/:slug`) for:
  - `title`, `meta description`, `canonical`, OG/Twitter basics.
- Provide safe fallback metadata during loading state (before API data resolves).
- On "not found" states, set `meta robots="noindex,follow"` to avoid indexing invalid detail URLs.

9) Image + CLS hardening (critical on product detail pages)
- Set explicit `width` and `height` on content images.
- Reserve image area using fixed ratio containers (e.g. `aspect-square`) to prevent layout jumps.
- LCP image: `loading="eager"`, `fetchpriority="high"`, avoid lazy loading.
- Non-critical gallery images: `loading="lazy"`, `fetchpriority="low"`, `decoding="async"`.
- Replace spinner-only loading screens with layout-matched skeletons to reduce CLS.
- Use Cloudflare Images variants for product media (`product-main`, `product-thumb`) and keep runtime fallback to original URLs when variant is unavailable.

Validation required:
- `npm run build` passes.
- Lighthouse desktop + mobile runs attached.
- No console errors in Lighthouse.
- `color-contrast` audit passes (0 failures).

Output:
- Files changed with reasons.
- Before/after Lighthouse deltas.
- Any remaining blockers outside code (Cloudflare toggles, third-party cookies, etc).
```

## Repo-Specific Rules (Learned)

1. Never introduce SSR/client route mismatch
- If server uses `AppRoutesSSR`, hydration must render same route tree first.
- React errors `#418/#423` indicate hydration mismatch.

2. Keep analytics off critical path
- GTM should initialize on real interaction (`pointerdown`, `keydown`, `touchstart`).
- Do not auto-fire via load-time fallback if Lighthouse score is priority.

3. Keep fonts off critical chain
- Current best result uses system font stack.
- Avoid runtime Google Fonts requests on high-performance pages.

4. Keep non-critical CSS out critical dependency chain
- Do not import deferred CSS in a way that creates blocking chain for initial viewport.

5. Prefer token fixes for contrast
- Main tokens tuned for AA:
  - `--muted-foreground`
  - `--accent`
  - `--success`
  - `--destructive`
- Then patch specific low-contrast utility classes if needed.

6. Canonical tags must be route-owned
- Keep canonical out of global static head template.
- Define canonical in each page component that should index.
- If Lighthouse SEO reports `Document does not have a valid rel=canonical`, check for duplicate/conflicting canonical URLs first.
- Important route mapping note:
  - `/` and `/<locale>/` are rendered by `Webshop` in this repo, not by `Index`.
  - Therefore homepage canonical/hreflang must be fixed in `src/pages/Webshop.tsx`, not only in `src/pages/Index.tsx`.

7. Dynamic pages may not be prerendered by default
- If scores are low on `/product/:id`, ensure metadata is injected by the template itself and not dependent on static prerender only.
- If needed for top SKUs, extend prerender route generation to include a stable list of product slugs.

8. Product image CDN strategy
- Create dedicated Cloudflare variants for main image and thumbnails.
- Wire variant names through env vars (`VITE_CF_IMAGE_MAIN_VARIANT`, `VITE_CF_IMAGE_THUMB_VARIANT`).
- Verify Lighthouse “Image delivery” improvement by checking that thumbnail requests are served from the thumb variant, not `public`.

9. Product LCP strategy (critical for mobile score)
- Do not block product rendering on client-side product fetch.
- Seed product template with prerendered product payload (`window.__PRERENDER_PRODUCTS__`) so hero image and price render in initial HTML.
- Keep runtime fetch as fallback only when prerender seed is missing.
- SSR/client parity is mandatory: the same seed must be available during SSR render and before hydration, otherwise React hydration errors (#418/#423) will occur.

10. React 18 image priority attribute
- In JSX on React 18, prefer `fetchpriority` (lowercase attribute) on `<img>` instead of `fetchPriority` to avoid runtime warnings and console-noise audits.

11. Multilanguage parity checks (when i18n is enabled)
- Every primary route must exist in default and prefixed locales:
  - `/...`, `/en/...`, `/de/...`
- Locale-aware links must preserve current locale (avoid hardcoded root `/shop`, `/blog`, `/cart` links).
- Product routes must use locale slugs from sheet (`slug_<lang>`) with fallback to default `slug`.
- Add `hreflang` alternates and `x-default` to localized pages.
- Keep SSR and client route trees identical across locale-prefixed routes.

12. Cloudflare deploy + purge verification loop
- Even with auto-deploy, always verify the live HTML after deploy:
  - `https://<domain>/en/` must output canonical to `/en/` (or `/en`) and not root `/`.
- After SEO/head changes, run a full cache purge to remove stale HTML variants.
- Re-check live source before Lighthouse rerun to avoid false debugging on already-fixed code.

## Cloudflare Settings Checklist (Post-Deploy)

1. Disable Email Obfuscation
- Cloudflare -> Scrape Shield -> Email Address Obfuscation: OFF

2. Disable Browser Insights beacon (if chasing max Lighthouse)
- Cloudflare -> Analytics/Web Analytics or Browser Insights: OFF

3. Validate robots
- `https://<domain>/robots.txt` must not include Cloudflare `Content-Signal` directives.

4. Purge cache after performance changes
- Cloudflare -> Caching -> Purge Everything

## Fast QA Commands

```bash
npm run build

# mobile
npx lighthouse https://<domain-or-local> --output json --output html --quiet

# desktop
npx lighthouse https://<domain-or-local> --preset=desktop --output json --output html --quiet

# targeted contrast
npx lighthouse https://<domain-or-local> --only-categories=accessibility --only-audits=color-contrast --output json --quiet
```

## Definition of Done for Any Page

- Desktop: 100 / 100 / 100 / 100
- Mobile: as close as possible to 100/100/100/100 (target >= 95 Performance, 100 A11y/BP/SEO)
- No Lighthouse console errors
- No heading-order violations
- No color-contrast failures
- No regressions in SSR/hydration
