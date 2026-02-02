import Stripe from "stripe";

const STRIPE_API_VERSION = "2024-08-16";
const SHEET_RANGE = "Orders!A:G";
const PRODUCTS_RANGE_DEFAULT = "Products!A:Z"; // default range for products tab

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // Preflight for CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Products endpoint (GET) to read from Google Sheets
    if (url.pathname === "/products" && req.method === "GET") {
      return handleGetProducts(env);
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

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION });

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
          new Date().toISOString(),
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

async function handleGetProducts(env) {
  try {
    const token = await getGoogleAccessToken(env);
    const rangesToTry = [
      env.PRODUCTS_RANGE,
      PRODUCTS_RANGE_DEFAULT,
      "Sheet1!A:Z",
      "Blad1!A:Z",
      "Products!A:Z",
    ].filter(Boolean);

    let data;
    let lastError = null;
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
      data = await res.json();
      if (Array.isArray(data?.values) && data.values.length > 0) {
        break;
      }
    }
    if (!data || !Array.isArray(data?.values) || data.values.length === 0) {
      throw new Error(`Sheets read failed: ${lastError || "no data"}`);
    }

    const values = data?.values;
    if (!Array.isArray(values) || values.length === 0) {
      return new Response(JSON.stringify({ products: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const headers = values[0].map((h) => (h || "").toString().trim().toLowerCase());
    const rows = values.slice(1);

    const products = rows
      .map((row) => {
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx] ?? "";
        });
        return obj;
      })
      .filter((p) => {
        // Only include active rows if 'active' column exists
        if ("active" in p) {
          const val = (p.active || "").toString().toLowerCase().trim();
          return ["true", "1", "yes", "y", "ja"].includes(val) || val === "";
        }
        return true;
      });

    return new Response(JSON.stringify({ products }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}

async function handleCreateCheckoutSession(req, env) {
  try {
    const { cart } = await req.json();
    if (!Array.isArray(cart) || cart.length === 0) {
      return new Response("Cart is leeg", { status: 400 });
    }

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

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION });
    const successUrl = env.CHECKOUT_SUCCESS_URL || "https://sitedesk.co/success";
    const cancelUrl = env.CHECKOUT_CANCEL_URL || "https://sitedesk.co/cancel";

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
