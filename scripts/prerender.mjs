import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist");
const ssrEntry = path.resolve(__dirname, "..", "dist-ssr", "entry-ssr.js");

const template = await fs.readFile(path.join(distDir, "index.html"), "utf-8");

const { render, posts } = await import(pathToFileURL(ssrEntry).href);

const staticRoutes = ["/", "/zakelijke-websites", "/shop", "/webshop", "/blog", "/over-ons"];
const blogRoutes = posts.map((post) => `/blog/${post.id}`);

const PRODUCTS_ENDPOINT =
  process.env.PRERENDER_PRODUCTS_ENDPOINT || "https://stripe-webhook.rdo90.workers.dev/products";
const PRODUCT_ROUTE_LIMIT = Number(process.env.PRERENDER_PRODUCT_LIMIT || "120");
const ENABLE_PRODUCT_PRERENDER = process.env.PRERENDER_PRODUCTS !== "false";

const normalizeSegment = (value) => encodeURIComponent(String(value).trim());

const getProductRoutes = async () => {
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
    const rows = Array.isArray(payload?.products) ? payload.products : [];
    const routes = rows
      .map((row) => row?.slug || row?.id || "")
      .filter(Boolean)
      .map((segment) => `/product/${normalizeSegment(segment)}`);

    const unique = [...new Set(routes)];
    return unique.slice(0, Math.max(0, PRODUCT_ROUTE_LIMIT));
  } catch (error) {
    console.warn(`[prerender] product fetch error from ${PRODUCTS_ENDPOINT}: ${error?.message || error}`);
    return [];
  }
};

const productRoutes = await getProductRoutes();
const productRowsForPrerender = ENABLE_PRODUCT_PRERENDER
  ? await (async () => {
      try {
        const res = await fetch(PRODUCTS_ENDPOINT, { headers: { Accept: "application/json" } });
        if (!res.ok) return [];
        const payload = await res.json();
        return Array.isArray(payload?.products) ? payload.products : [];
      } catch {
        return [];
      }
    })()
  : [];
const routes = [...new Set([...staticRoutes, ...blogRoutes, ...productRoutes])];
console.log(`[prerender] static=${staticRoutes.length}, blog=${blogRoutes.length}, product=${productRoutes.length}`);

const ensureDir = async (filePath) => {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
};

for (const route of routes) {
  const url = route;
  if (route.startsWith("/product/") && productRowsForPrerender.length > 0) {
    globalThis.__PRERENDER_PRODUCTS__ = productRowsForPrerender;
  } else {
    delete globalThis.__PRERENDER_PRODUCTS__;
  }
  const { html, head } = await render(url);
  const productBootstrap =
    route.startsWith("/product/") && productRowsForPrerender.length > 0
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
