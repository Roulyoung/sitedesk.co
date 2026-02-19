# Cloudflare Image Variants Setup (Product Performance)

Use this to reduce product-page image transfer size and improve mobile Lighthouse.

## 1) Create variants in Cloudflare Images

Cloudflare Dashboard -> `Images` -> `Variants` -> create:

1. `product-main`
- Width: `768`
- Height: `768`
- Fit: `cover`

2. `product-thumb`
- Width: `160`
- Height: `160`
- Fit: `cover`

If your Cloudflare UI does not allow `-` in names, use:
- `productmain`
- `productthumb`

If Quality/Format fields are not visible in your plan/UI, skip them.

## 2) Configure app env vars

In your deploy environment (and local `.env` if needed):

```bash
VITE_CF_IMAGE_MAIN_VARIANT=product-main
VITE_CF_IMAGE_THUMB_VARIANT=product-thumb
```

If you used names without hyphens:

```bash
VITE_CF_IMAGE_MAIN_VARIANT=productmain
VITE_CF_IMAGE_THUMB_VARIANT=productthumb
```

Current code fallback behavior:
- If variant URL fails (403/404), it automatically falls back to original `public` URL.
- So rollout is safe even if some images are not ready.

## 3) Deploy + purge cache

1. Deploy latest build.
2. Purge Cloudflare cache (or purge specific product URLs).
3. Re-test on a product URL:
- `https://sitedesk.co/product/<slug>/`

## 4) If score is still limited

- Lower `product-thumb` quality to `50`.
- Keep `product-main` quality between `70` and `78`.
- Ensure no fallback to original `public` URLs in network panel for thumbs.
