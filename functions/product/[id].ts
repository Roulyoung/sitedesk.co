export interface Env {
  PRODUCTS_API?: string;
  CHECKOUT_API?: string;
  PRODUCTS_CACHE?: KVNamespace;
  ENABLE_PRODUCT_PAGE?: string;
  ASSETS: Fetcher;
}

// Serve the SPA assets so the product page looks identical to the in-app view.
// Keep the feature flag: when explicitly set to false, return 404.
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (env.ENABLE_PRODUCT_PAGE && env.ENABLE_PRODUCT_PAGE.toLowerCase() !== "true") {
    return notFound();
  }

  // Try to serve the requested path from static assets.
  const assetResponse = await env.ASSETS.fetch(request);
  if (assetResponse && assetResponse.status !== 404) return assetResponse;

  // Fallback to root (SPA will handle the route client-side).
  return env.ASSETS.fetch(new Request(new URL("/", request.url), request));
};

function notFound(): Response {
  const body = `<!DOCTYPE html>
  <html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Product niet gevonden</title>
    <link rel="icon" type="image/png" href="/IconSitedesk-03.png" />
  </head>
  <body>
    <main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;">
      <div style="text-align:center;max-width:520px;">
        <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;">Product niet gevonden</h1>
        <p style="color:#475569;margin-bottom:1rem;">Controleer de link of ga terug naar de shop.</p>
        <a href="/shop" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.25rem;border-radius:9999px;background:#0f172a;color:white;text-decoration:none;">Terug naar shop</a>
      </div>
    </main>
  </body>
  </html>`;
  return new Response(body, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
