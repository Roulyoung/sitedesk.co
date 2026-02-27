import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist");
const ssrEntry = path.resolve(__dirname, "..", "dist-ssr", "entry-ssr.js");

const DEFAULT_LOCALE = "nl";
const PRERENDER_LOCALES = (process.env.PRERENDER_LOCALES || "nl,en")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);
const locales = PRERENDER_LOCALES.length > 0 ? [...new Set(PRERENDER_LOCALES)] : [DEFAULT_LOCALE];

const template = await fs.readFile(path.join(distDir, "index.html"), "utf-8");

const { render, posts } = await import(pathToFileURL(ssrEntry).href);

const staticBaseRoutes = ["/", "/zakelijke-websites", "/shop", "/demo", "/webshop", "/migratie", "/blog", "/over-ons"];
const blogBaseRoutes = posts.map((post) => `/blog/${post.id}`);

const PRODUCTS_ENDPOINT =
  process.env.PRERENDER_PRODUCTS_ENDPOINT || "https://stripe-webhook.rdo90.workers.dev/products";
const PRODUCT_ROUTE_LIMIT = Number(process.env.PRERENDER_PRODUCT_LIMIT || "120");
const PREVIEW_ROUTE_LIMIT = Number(process.env.PRERENDER_PREVIEW_LIMIT || "200");
const ENABLE_PRODUCT_PRERENDER = process.env.PRERENDER_PRODUCTS !== "false";

const withLocalePath = (route, locale) => {
  const normalized = route.startsWith("/") ? route : `/${route}`;
  if (locale === DEFAULT_LOCALE) return normalized;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
};

const normalizeSegment = (value) => encodeURIComponent(String(value).trim());

const getLocalizedSlug = (row, locale) => {
  const candidates = [`slug_${locale}`, `${locale}_slug`, "slug", "id", "name"];
  for (const key of candidates) {
    const value = row?.[key];
    if (value != null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
};

const getClientSlug = (row) => {
  const value = row?.client_slug;
  if (value == null) return "";
  return String(value).trim().toLowerCase();
};

const getProductRows = async () => {
  if (!ENABLE_PRODUCT_PRERENDER) return [];
  try {
    const res = await fetch(PRODUCTS_ENDPOINT, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn(`[prerender] product fetch failed (${res.status}) from ${PRODUCTS_ENDPOINT}`);
      return [];
    }

    const payload = await res.json();
    return Array.isArray(payload?.products) ? payload.products : [];
  } catch (error) {
    console.warn(`[prerender] product fetch error from ${PRODUCTS_ENDPOINT}: ${error?.message || error}`);
    return [];
  }
};

const productRowsForPrerender = await getProductRows();

const productRoutes = productRowsForPrerender
  .flatMap((row) =>
    locales.map((locale) => {
      const localizedSlug = getLocalizedSlug(row, locale);
      if (!localizedSlug) return "";
      return withLocalePath(`/product/${normalizeSegment(localizedSlug)}`, locale);
    }),
  )
  .filter(Boolean);

const previewClientSlugs = [...new Set(productRowsForPrerender.map(getClientSlug).filter(Boolean))]
  .filter((slug) => slug !== "default")
  .slice(0, Math.max(0, PREVIEW_ROUTE_LIMIT));

const previewShopRoutes = previewClientSlugs.flatMap((slug) => [
  `/preview/${normalizeSegment(slug)}`,
  `/preview/${normalizeSegment(slug)}/shop`,
]);

const previewProductRoutes = productRowsForPrerender
  .flatMap((row) => {
    const clientSlug = getClientSlug(row);
    if (!clientSlug || clientSlug === "default") return [];
    const productSlug = getLocalizedSlug(row, DEFAULT_LOCALE);
    if (!productSlug) return [];
    return `/preview/${normalizeSegment(clientSlug)}/product/${normalizeSegment(productSlug)}`;
  })
  .filter(Boolean);

const baseRoutes = [...new Set([...staticBaseRoutes, ...blogBaseRoutes])];
const localizedStaticRoutes = baseRoutes.flatMap((route) => locales.map((locale) => withLocalePath(route, locale)));

const routes = [...new Set([...localizedStaticRoutes, ...productRoutes, ...previewShopRoutes, ...previewProductRoutes])].slice(
  0,
  Math.max(0, localizedStaticRoutes.length + PRODUCT_ROUTE_LIMIT * locales.length + PREVIEW_ROUTE_LIMIT * 3),
);

console.log(
  `[prerender] locales=${locales.join(",")}, static=${localizedStaticRoutes.length}, blog=${blogBaseRoutes.length * locales.length}, product=${productRoutes.length}, previewShop=${previewShopRoutes.length}, previewProduct=${previewProductRoutes.length}`,
);

const ensureDir = async (filePath) => {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
};

for (const route of routes) {
  const url = route;
  const needsProductsBootstrap =
    (route.includes("/product/") || route.includes("/preview/")) && productRowsForPrerender.length > 0;
  if (needsProductsBootstrap) {
    globalThis.__PRERENDER_PRODUCTS__ = productRowsForPrerender;
  } else {
    delete globalThis.__PRERENDER_PRODUCTS__;
  }

  const { html, head } = await render(url);
  const productBootstrap =
    needsProductsBootstrap
      ? `<script>window.__PRERENDER_PRODUCTS__=${JSON.stringify(productRowsForPrerender).replace(/</g, "\\u003c")};</script>`
      : "";

  let page = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  page = page.replace("</head>", `${head}${productBootstrap}</head>`);

  const outPath =
    route === "/"
      ? path.join(distDir, "index.html")
      : path.join(distDir, route.replace(/^\//, ""), "index.html");

  await ensureDir(outPath);
  await fs.writeFile(outPath, page, "utf-8");
  console.log(`prerendered: ${route}`);
}

const sitemapRoutes = [...new Set([...localizedStaticRoutes, ...productRoutes])];
const sitemapXml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sitemapRoutes
    .map((route) => `  <url><loc>https://sitedesk.co${route}</loc></url>`)
    .join("\n") +
  `\n</urlset>\n`;

await fs.writeFile(path.join(distDir, "sitemap.xml"), sitemapXml, "utf-8");
console.log(`[prerender] wrote sitemap.xml with ${sitemapRoutes.length} urls (preview excluded)`);
