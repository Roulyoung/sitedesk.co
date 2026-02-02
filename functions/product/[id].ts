export interface Env {
  PRODUCTS_API?: string;
  CHECKOUT_API?: string;
  PRODUCTS_CACHE?: KVNamespace;
  ENABLE_PRODUCT_PAGE?: string;
}

const FALLBACK_PRODUCTS_API = "https://stripe-webhook.rdo90.workers.dev/products";
const FALLBACK_CHECKOUT_API = "https://stripe-webhook.rdo90.workers.dev/create-checkout-session";
const CACHE_TTL = 60 * 10; // 10 minutes

export const onRequest: PagesFunction<Env> = async ({ params, env }) => {
  // Feature flag: require ENABLE_PRODUCT_PAGE=true to serve
  if (!env.ENABLE_PRODUCT_PAGE || env.ENABLE_PRODUCT_PAGE.toLowerCase() !== "true") {
    return notFound();
  }
  const id = params.id?.toString();
  if (!id) return notFound();

  const apiUrl = env.PRODUCTS_API || FALLBACK_PRODUCTS_API;

  // Try KV cache first
  let product: Product | null = null;
  if (env.PRODUCTS_CACHE) {
    const cached = await env.PRODUCTS_CACHE.get(`product:${id}`, "json").catch(() => null);
    if (cached) product = cached as Product;
  }

  if (!product) {
    const products = await fetchProducts(apiUrl);
    product = products.find((p) => (p.id || "").toString() === id) || null;
    if (product && env.PRODUCTS_CACHE) {
      await env.PRODUCTS_CACHE.put(`product:${id}`, JSON.stringify(product), {
        expirationTtl: CACHE_TTL,
      });
    }
  }

  if (!product) return notFound();

  const title = product.name || "Product";
  const description = product.description || "Bekijk dit product.";
  const priceText = product.priceDisplay || formatPrice(product.priceCents || 0);
  const image = product.image || "https://dummyimage.com/800x600/edf2f7/1a202c&text=Product";
  const checkoutApi = env.CHECKOUT_API || FALLBACK_CHECKOUT_API;

  const html = renderHtml({ product, title, description, priceText, image, checkoutApi });
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

type Product = {
  id?: string;
  name?: string;
  description?: string;
  priceCents?: number;
  price?: string;
  image?: string;
  priceDisplay?: string;
};

async function fetchProducts(apiUrl: string): Promise<Product[]> {
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error("Failed to load products");
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON from products API");
  }
  const list: any[] = data?.products || [];
  return list.map((row) => {
    const priceRaw = row.price || row.sale_price || "0";
    const priceCents = toCents(priceRaw);
    return {
      id: row.id?.toString() || row.slug?.toString() || "",
      name: row.name || row.description || row.slug || "",
      description: row.description || "",
      priceCents,
      price: priceRaw,
      priceDisplay: formatPrice(priceCents),
      image: row.image || "",
    };
  });
}

function toCents(val: string): number {
  const n = parseFloat(val.replace(/[^\d.,-]/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

function formatPrice(cents: number): string {
  const f = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
  return f.format(cents / 100);
}

function notFound(): Response {
  const body = `<!DOCTYPE html>
  <html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Product niet gevonden</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.4/dist/tailwind.min.css">
  </head>
  <body class="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-semibold">Product niet gevonden</h1>
      <p class="text-gray-600">Controleer de link of ga terug naar de shop.</p>
      <a href="/shop" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition">Terug naar shop</a>
    </div>
  </body>
  </html>`;
  return new Response(body, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function renderHtml({
  product,
  title,
  description,
  priceText,
  image,
  checkoutApi,
}: {
  product: Product;
  title: string;
  description: string;
  priceText: string;
  image: string;
  checkoutApi: string;
}): string {
  const safeId = product.id || "product";
  const script = `
    async function bestel() {
      try {
        const res = await fetch("${checkoutApi}", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart: [{ id: "${safeId}", name: ${JSON.stringify(
            title,
          )}, price: ${(product.priceCents || 0) / 100}, quantity: 1 }] })
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (data.url) window.location.href = data.url;
        else alert("Geen checkout URL ontvangen.");
      } catch (err) {
        alert("Afrekenen mislukt: " + err);
      }
    }
  `;

  return `<!DOCTYPE html>
  <html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:type" content="product" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.4/dist/tailwind.min.css">
  </head>
  <body class="bg-gray-50 text-gray-900">
    <main class="min-h-screen flex items-center justify-center px-4 py-12">
      <div class="max-w-4xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="grid md:grid-cols-2 gap-0">
          <div class="bg-gray-100 flex items-center justify-center">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="object-cover w-full h-full max-h-[520px]" />
          </div>
          <div class="p-8 space-y-4">
            <p class="text-sm uppercase tracking-wide text-gray-500">Product</p>
            <h1 class="text-3xl font-bold">${escapeHtml(title)}</h1>
            <div class="text-2xl font-semibold text-emerald-600">${escapeHtml(priceText)}</div>
            <p class="text-gray-700 leading-relaxed">${escapeHtml(description)}</p>
            <button onclick="bestel()" class="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition">
              Bestel nu
              <span aria-hidden="true">→</span>
            </button>
            <a href="/shop" class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition">
              ← Terug naar de shop
            </a>
          </div>
        </div>
      </div>
    </main>
    <script>${script}</script>
  </body>
  </html>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
