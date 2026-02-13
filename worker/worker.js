import Stripe from "stripe";

// Leave undefined to use Stripe default and avoid version mismatch errors
const STRIPE_API_VERSION = undefined;
const SHEET_RANGE = "Orders!A:G";
const PRODUCTS_RANGE_DEFAULT = "Products!A:Z"; // default range for products tab
const ADMIN_SESSION_SALT = "sheet-admin-session";
const PRODUCTS_CACHE_TTL = 900; // seconds

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // Preflight for CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Products endpoint (GET) to read from Google Sheets
    if (url.pathname === "/products" && req.method === "GET") {
      return handleGetProducts(env, req);
    }

    // Admin endpoints
    if (url.pathname.startsWith("/admin")) {
      return handleAdminRequest(req, env, url);
    }

    // Cart-based checkout endpoint
    if (url.pathname === "/create-checkout-session" && req.method === "POST") {
      return handleCreateCheckoutSession(req, env);
    }

    // Only allow POST /webhook
    if (url.pathname !== "/webhook" || req.method !== "POST") {
      return new Response("Not Found", { status: 404 });
    }

    // Read raw body for Stripe signature verification
    const rawBody = await req.arrayBuffer();
    const stripeSig = req.headers.get("stripe-signature");
    if (!stripeSig) return new Response("Missing signature", { status: 400 });

    const stripe = new Stripe(
      env.STRIPE_SECRET_KEY,
      STRIPE_API_VERSION ? { apiVersion: STRIPE_API_VERSION } : {},
    );

    let event;
    try {
      event = stripe.webhooks.constructEvent(Buffer.from(rawBody), stripeSig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return new Response(err instanceof Error ? err.message : "Signature verification failed", { status: 400 });
    }

    if (event.type !== "checkout.session.completed") {
      return new Response("OK", { status: 200 });
    }

    const session = event.data.object;
    const customer = session.customer_details;
    const addr = customer?.address;
  const address = addr
    ? `${addr.line1 ?? ""} ${addr.line2 ?? ""}, ${addr.postal_code ?? ""} ${addr.city ?? ""}, ${addr.country ?? ""}`.trim()
    : "";

  const orderDatetime = new Date().toLocaleString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const meta = session.metadata || {};
  const productId = meta.productId || meta.ProductID || "N/A";
  const amountTotal = (session.amount_total ?? 0) / 100;
  const transactionId = session.payment_intent?.toString() ?? session.id;

    try {
      const token = await getGoogleAccessToken(env);
      await appendOrderRow({
        token,
        sheetId: env.SHEET_ID,
        values: [
          orderDatetime,
          customer?.name || "Anoniem",
          customer?.email || "Geen e-mail",
          address,
          productId,
          amountTotal,
          transactionId,
        ],
      });
    } catch (err) {
      console.error("Sheet append failed:", err instanceof Error ? err.message : String(err));
      return new Response("Sheet append failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  },
};

async function getGoogleAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claimSet = base64url(
    JSON.stringify({
      iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  );
  const unsigned = `${header}.${claimSet}`;

  // Strip all whitespace/newlines; atob requires clean base64
  const cleanKey = (env.GOOGLE_SERVICE_ACCOUNT_KEY || "").replace(/\s/g, "");
  const binaryKey = atob(cleanKey);

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(binaryKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Token request failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function appendOrderRow({ token, sheetId, values }) {
  // Write header row if sheet is empty
  await ensureHeaderRow({ token, sheetId });

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(SHEET_RANGE)}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [values] }),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets append failed: ${text}`);
  }
}

// UTILS
function pemToArrayBuffer(binaryString) {
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64url(input) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function ensureHeaderRow({ token, sheetId }) {
  try {
    const range = SHEET_RANGE.split("!")[0] + "!A1:G1";
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    const hasHeader = Array.isArray(data?.values) && data.values.length > 0;
    if (hasHeader) return;
    const headerValues = [["Datum/Tijd", "Naam", "Email", "Adres", "ProductID", "Bedrag", "Transactie"]];
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: headerValues }),
      },
    );
  } catch {
    // ignore header errors
  }
}

async function handleGetProducts(env, req) {
  const cache = caches.default;
  const cacheKey = req ? new Request(req.url) : null;

  if (cacheKey) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  // KV cache first
  if (env.PRODUCTS_CACHE) {
    const kvCached = await env.PRODUCTS_CACHE.get("products:list", "json").catch(() => null);
    if (kvCached && cacheKey) {
      const res = jsonResponse({ products: kvCached }, 200, true);
      cache.put(cacheKey, res.clone()).catch(() => {});
      return res;
    }
    if (kvCached) return jsonResponse({ products: kvCached }, 200, true);
  }

  try {
    const { products } = await readProductsSheet(env, { includeInactive: false });
    const res = jsonResponse(
      { products },
      200,
      true,
      "public, max-age=180, s-maxage=900, stale-while-revalidate=900",
    );
    if (cacheKey) cache.put(cacheKey, res.clone());
    if (env.PRODUCTS_CACHE) {
      await env.PRODUCTS_CACHE.put("products:list", JSON.stringify(products), { expirationTtl: PRODUCTS_CACHE_TTL });
    }
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
}

async function handleCreateCheckoutSession(req, env) {
  try {
    const { cart } = await req.json();
    if (!Array.isArray(cart) || cart.length === 0) {
      return new Response("Cart is leeg", { status: 400 });
    }

    const totalCents = cart.reduce((sum, item) => {
      const amountCents = Math.round(item.price * 100) || item.amountCents || 0;
      return sum + (Number.isFinite(amountCents) ? amountCents * (item.quantity && item.quantity > 0 ? item.quantity : 1) : 0);
    }, 0);
    const productName = cart[0]?.name || "Product";

    const lineItems = cart.map((item) => {
      const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const amountCents = Math.round(item.price * 100) || item.amountCents || 0;
      if (!Number.isFinite(amountCents) || amountCents <= 0) {
        throw new Error("Ongeldige prijs in cart");
      }
      return {
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          product_data: {
            name: item.name || "Product",
            metadata: { productId: item.id || "" },
          },
        },
        quantity,
      };
    });

    const stripe = new Stripe(
      env.STRIPE_SECRET_KEY,
      STRIPE_API_VERSION ? { apiVersion: STRIPE_API_VERSION } : {},
    );
    const successBase = env.CHECKOUT_SUCCESS_URL || "https://sitedesk.co/success";
    const cancelUrl = env.CHECKOUT_CANCEL_URL || "https://sitedesk.co/cancel";
    const successUrl = (() => {
      try {
        const url = new URL(successBase);
        url.searchParams.set("product", productName);
        url.searchParams.set("amount", (totalCents / 100).toFixed(2));
        return url.toString();
      } catch {
        return successBase;
      }
    })();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "ideal"],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(message, {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}

async function handleAdminRequest(req, env, url) {
  if (url.pathname === "/admin/login" && req.method === "POST") {
    return handleAdminLogin(req, env);
  }

  const adminCheck = await verifyAdmin(req, env);
  if (adminCheck instanceof Response) return adminCheck;

  if (url.pathname === "/admin/products" && req.method === "GET") {
    return handleAdminListProducts(env);
  }

  if (url.pathname === "/admin/products" && req.method === "POST") {
    return handleAdminCreateProduct(req, env);
  }

  // /admin/products/{rowNumber}
  const productMatch = url.pathname.match(/^\/admin\/products\/(\d+)$/);
  if (productMatch && req.method === "PUT") {
    const rowNumber = parseInt(productMatch[1], 10);
    const res = await handleAdminUpdateProduct(req, env, rowNumber);
    await prefillProductsCache(env, url);
    return res;
  }

  const archiveMatch = url.pathname.match(/^\/admin\/products\/(\d+)\/archive$/);
  if (archiveMatch && req.method === "POST") {
    const rowNumber = parseInt(archiveMatch[1], 10);
    const res = await handleAdminArchiveProduct(env, rowNumber);
    await prefillProductsCache(env, url);
    return res;
  }

  if (url.pathname === "/admin/images/upload" && req.method === "POST") {
    const res = await handleAdminImageUpload(req, env);
    await prefillProductsCache(env, url);
    return res;
  }

  return jsonResponse({ error: "Not Found" }, 404);
}

async function handleAdminLogin(req, env) {
  try {
    const body = await safeJson(req);
    const password = (body?.password || "").toString();
    if (!env.ADMIN_PASSWORD) return jsonResponse({ error: "ADMIN_PASSWORD not set" }, 500);
    if (!password || password !== env.ADMIN_PASSWORD) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const token = await deriveAdminToken(env.ADMIN_PASSWORD, env.ADMIN_SESSION_SECRET);
    return jsonResponse({ token });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
}

async function handleAdminListProducts(env) {
  const data = await readProductsSheet(env, { includeInactive: true, includeRowNumber: true });
  return jsonResponse({ products: data.products, headers: data.headersRaw, sheetName: data.sheetName });
}

async function handleAdminCreateProduct(req, env) {
  const { products, headersRaw, sheetName } = await readProductsSheet(env, {
    includeInactive: true,
    includeRowNumber: true,
  });
  const normalizedHeaders = headersRaw.map((h) => h.toLowerCase());
  const body = await safeJson(req);
  const payload = normalizeKeys(body?.values || {});
  const row = normalizedHeaders.map((key) => payload[key] ?? "");

  await appendProductRow({
    env,
    sheetName,
    values: row,
  });

  await clearProductsCache(env);
  await prefillProductsCache(env);

  return jsonResponse({
    message: "Product toegevoegd",
    headers: headersRaw,
    inserted: payload,
    rowNumber: products.length + 2, // + header + new row
  });
}

async function handleAdminUpdateProduct(req, env, rowNumber) {
  const { products, headersRaw, sheetName } = await readProductsSheet(env, {
    includeInactive: true,
    includeRowNumber: true,
  });
  const existing = products.find((p) => p._rowNumber === rowNumber);
  if (!existing) return jsonResponse({ error: "Row not found" }, 404);

  const payload = normalizeKeys(await safeJson(req));
  const merged = { ...existing, ...payload, _rowNumber: rowNumber };
  await replaceRow({
    env,
    sheetName,
    headers: headersRaw,
    rowNumber,
    values: merged,
  });
  await clearProductsCache(env);
  await prefillProductsCache(env);
  return jsonResponse({ message: "Product bijgewerkt", product: merged });
}

async function handleAdminArchiveProduct(env, rowNumber) {
  const { products, headersRaw, sheetName } = await readProductsSheet(env, {
    includeInactive: true,
    includeRowNumber: true,
  });
  const existing = products.find((p) => p._rowNumber === rowNumber);
  if (!existing) return jsonResponse({ error: "Row not found" }, 404);

  const statusKey = headersRaw.find((h) => h.toLowerCase() === "status") ? "status" : null;
  if (!statusKey) return jsonResponse({ error: "Geen status kolom gevonden" }, 400);

  const merged = { ...existing, [statusKey]: "Archived", _rowNumber: rowNumber };
  await replaceRow({
    env,
    sheetName,
    headers: headersRaw,
    rowNumber,
    values: merged,
  });
  await clearProductsCache(env);
  await prefillProductsCache(env);
  return jsonResponse({ message: "Product gearchiveerd", product: merged });
}

async function handleAdminImageUpload(req, env) {
  if (!env.CF_IMAGES_ACCOUNT_ID || !env.CF_IMAGES_TOKEN) {
    return jsonResponse({ error: "Cloudflare Images niet geconfigureerd" }, 500);
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonResponse({ error: "Bestand ontbreekt" }, 400);
  }

  const uploadForm = new FormData();
  uploadForm.append("file", file, file.name || "upload.jpg");

  const cfRes = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CF_IMAGES_ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CF_IMAGES_TOKEN}`,
      },
      body: uploadForm,
    },
  );

  const text = await cfRes.text();
  let parsed = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    // ignore
  }
  if (!cfRes.ok) {
    return jsonResponse({ error: `Upload mislukt: ${text}` }, 500);
  }

  const imageId = parsed?.result?.id || parsed?.result?.uid || parsed?.result?.image?.id || null;
  const imageUrl = parsed?.result?.variants?.[0] || null;

  const rowNumber = parseInt((form.get("rowNumber") || form.get("row") || "").toString(), 10);
  const columnRaw = (form.get("column") || "image").toString();
  let updatedRow = null;
  if (Number.isFinite(rowNumber) && rowNumber > 1 && imageId) {
    const { products, headersRaw, sheetName } = await readProductsSheet(env, {
      includeInactive: true,
      includeRowNumber: true,
    });
    const existing = products.find((p) => p._rowNumber === rowNumber);
    if (existing) {
      const columnKey = resolveColumn(columnRaw, headersRaw);
      if (columnKey) {
        const merged = { ...existing, [columnKey]: imageId, _rowNumber: rowNumber };
        await replaceRow({
          env,
          sheetName,
          headers: headersRaw,
          rowNumber,
          values: merged,
        });
        updatedRow = merged;
      }
    }
  }

  await clearProductsCache(env);
  await prefillProductsCache(env);

  return jsonResponse({ imageId, imageUrl, updatedRow });
}

async function verifyAdmin(req, env) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return jsonResponse({ error: "Unauthorized" }, 401);

  if (!env.ADMIN_PASSWORD) return jsonResponse({ error: "ADMIN_PASSWORD not set" }, 500);
  const expected = await deriveAdminToken(env.ADMIN_PASSWORD, env.ADMIN_SESSION_SECRET);
  if (token !== expected) return jsonResponse({ error: "Unauthorized" }, 401);
  return true;
}

async function deriveAdminToken(password, secret) {
  const data = `${password}:${secret || ADMIN_SESSION_SALT}`;
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return base64url(hashBuffer);
}

async function readProductsSheet(env, { includeInactive = true } = {}) {
  const token = await getGoogleAccessToken(env);
  const rangesToTry = getRangeCandidates(env);

  let data;
  let lastError = null;
  let rangeUsed = rangesToTry[0];
  for (const range of rangesToTry) {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID}/values/${encodeURIComponent(range)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) {
      lastError = await res.text();
      continue;
    }
    const parsed = await res.json();
    if (Array.isArray(parsed?.values) && parsed.values.length > 0) {
      data = parsed;
      rangeUsed = range;
      break;
    }
  }
  if (!data || !Array.isArray(data?.values) || data.values.length === 0) {
    throw new Error(`Sheets read failed: ${lastError || "no data"}`);
  }

  const values = data.values;
  const headersRaw = values[0].map((h) => (h || "").toString().trim());
  const headers = headersRaw.map((h) => h.toLowerCase());
  const rows = values.slice(1);

  const products = rows
    .map((row, idx) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] ?? "";
      });
      obj._rowNumber = idx + 2; // header is row 1
      return obj;
    })
    .filter((p) => {
      if (includeInactive) return true;
      if ("active" in p) {
        const val = (p.active || "").toString().toLowerCase().trim();
        return ["true", "1", "yes", "y", "ja"].includes(val) || val === "";
      }
      if ("status" in p) {
        const val = (p.status || "").toString().toLowerCase().trim();
        return val !== "archived";
      }
      return true;
    });

  const sheetName = rangeUsed.split("!")[0] || "Products";

  return { headers, headersRaw, products, sheetName, rangeUsed, token };
}

function getRangeCandidates(env) {
  return [
    env.PRODUCTS_RANGE,
    PRODUCTS_RANGE_DEFAULT,
    "Sheet1!A:Z",
    "Blad1!A:Z",
    "Products!A:Z",
  ].filter(Boolean);
}

async function replaceRow({ env, sheetName, headers, rowNumber, values }) {
  const token = await getGoogleAccessToken(env);
  const normalizedHeaders = headers.map((h) => h.toLowerCase());
  const payload = normalizeKeys(values);
  const rowValues = normalizedHeaders.map((h) => payload[h] ?? "");
  const range = `${sheetName}!A${rowNumber}:${columnLetter(normalizedHeaders.length)}${rowNumber}`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [rowValues] }),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets update failed: ${text}`);
  }
}

async function appendProductRow({ env, sheetName, values }) {
  const token = await getGoogleAccessToken(env);
  const range = `${sheetName}!A:Z`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${env.SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [values] }),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets append failed: ${text}`);
  }
}

function resolveColumn(column, headers) {
  const normalized = column.toString().toLowerCase();
  const idx = headers.findIndex((h) => h.toLowerCase() === normalized);
  return idx >= 0 ? headers[idx] : null;
}

function columnLetter(index) {
  let n = index;
  let str = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    str = String.fromCharCode(65 + rem) + str;
    n = Math.floor((n - 1) / 26);
  }
  return str || "A";
}

async function safeJson(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function normalizeKeys(obj) {
  if (!obj || typeof obj !== "object") return {};
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k.toLowerCase()] = v;
  }
  return result;
}

async function clearProductsCache(env) {
  if (env.PRODUCTS_CACHE) {
    try {
      await env.PRODUCTS_CACHE.delete("products:list");
    } catch {
      // ignore
    }
  }
  try {
    const cache = caches.default;
    await cache.delete("/products");
  } catch {
    // ignore
  }
}

async function prefillProductsCache(env, url) {
  try {
    const { products } = await readProductsSheet(env, { includeInactive: false });
    if (env.PRODUCTS_CACHE) {
      await env.PRODUCTS_CACHE.put("products:list", JSON.stringify(products), {
        expirationTtl: PRODUCTS_CACHE_TTL,
      });
    }
    if (url) {
      const cache = caches.default;
      const cacheKey = new Request(new URL("/products", url).toString());
      const res = jsonResponse(
        { products },
        200,
        true,
        "public, max-age=180, s-maxage=900, stale-while-revalidate=900",
      );
      cache.put(cacheKey, res.clone()).catch(() => {});
    }
  } catch {
    // ignore prefill errors
  }
}

function jsonResponse(data, status = 200, allowCache = false, cacheControl) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };
  if (allowCache && cacheControl) {
    headers["Cache-Control"] = cacheControl;
  }
  return new Response(JSON.stringify(data), { status, headers });
}
