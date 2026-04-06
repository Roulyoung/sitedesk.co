import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import Stripe from "stripe";

// Leave undefined to use Stripe default and avoid version mismatch errors
const STRIPE_API_VERSION = undefined;
const SHEET_RANGE = "Orders!A:H";
const LEADS_RANGE = "Leads!A:O";
const PRODUCTS_RANGE_DEFAULT = "Products!A:ZZ"; // wider default so appended columns (e.g. client_slug) are included
const MODELS_RANGE_DEFAULT = "3DModels!A:ZZ";
const ADMIN_SESSION_SALT = "sheet-admin-session";
const PRODUCTS_CACHE_TTL = 900; // seconds
const ORDER_KEY_PREFIX = "order:";
const TICKET_CHECKOUT_PREFIX = "ticket_checkout:";
const ORDER_STATUS_PENDING = "pending_sync";
const ORDER_STATUS_SYNCED = "synced";
const ORDER_STATUS_FAILED = "failed_sync";
const ORDER_SYNC_META_KEY = "order_sync:meta";
const DEFAULT_ORDER_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const DEFAULT_RETRY_BASE_MS = 60 * 1000; // 1 min
const MAX_RETRY_DELAY_MS = 60 * 60 * 1000; // 1 hour
const DEFAULT_SYNC_BATCH_LIMIT = 25;
const DEFAULT_ORDER_LIST_LIMIT = 25;
const DEFAULT_IDLE_SCAN_MS = 15 * 60 * 1000; // 15 min
const DEFAULT_CONTINUE_SCAN_MS = 15 * 1000; // 15 sec
const DEFAULT_SITE_KEY = "default";
const DEFAULT_SCHEMA_VERSION = 1;
const CONTACT_SECRET = "OHUASDFIHUO87AIHUASDF&^^^&%kuhA123";
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzSf27HMHx2kCZe80cpdtDMOWN_1NYtcdIAz4yVcJzZwOcCmMn88DFUwPOpd8OCV6tS3Q/exec";
const LEAD_FLOW_VERSION = "lead-flow-v2-pagespeed";
const LEAD_NOTIFY_EMAIL = "rdo90@live.nl";
const LEAD_FROM_EMAIL = "hello@sitedesk.co";
const LEAD_FROM_NAME = "Sitedesk Leads";
const DEFAULT_TICKET_EMAIL_LOCALE = "nl";
const DEFAULT_TICKET_LINK_POST_EVENT_HOURS = 24 * 7;
const DEFAULT_TICKET_LINK_FALLBACK_HOURS = 24 * 30;
const FALLBACK_WORKER_PUBLIC_BASE_URL = "https://stripe-webhook.rdo90.workers.dev";
const TICKET_SHARE_MAX_RECIPIENTS_PER_REQUEST = 5;
const TICKET_SHARE_MAX_RECIPIENTS_PER_24H = 20;
const TICKET_SHARE_RATE_TTL_SECONDS = 24 * 60 * 60;
const TICKET_ACCESS_URL_PLACEHOLDER = "__TICKET_ACCESS_URL__";
const ORDER_CODEWORD_ADJECTIVES = [
  "gouden",
  "vrolijke",
  "stoere",
  "snelle",
  "strakke",
  "warme",
  "frisse",
  "stille",
  "heldere",
  "vrije",
];
const ORDER_CODEWORD_NOUNS = [
  "lach",
  "podium",
  "spotlight",
  "microfoon",
  "grap",
  "show",
  "zaal",
  "avond",
  "ticket",
  "lineup",
];

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const site = resolveSiteContext(req, url, env);

    // Preflight for CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // Products endpoint (GET) to read from Google Sheets
    if (url.pathname === "/products" && req.method === "GET") {
      return handleGetProducts(env, req, site);
    }

    if (url.pathname === "/submit" && req.method === "POST") {
      return handleLeadSubmit(req, env, site, ctx);
    }

    if (/^\/t\/[^/]+\/share$/.test(url.pathname) && req.method === "POST") {
      return handlePublicTicketShare(req, url, env, ctx);
    }

    if (url.pathname.startsWith("/t/") && req.method === "GET") {
      return handlePublicTicketLink(url, env);
    }

    // Admin endpoints
    if (url.pathname.startsWith("/admin")) {
      return handleAdminRequest(req, env, url);
    }

    // Cart-based checkout endpoint
    if (url.pathname === "/create-checkout-session" && req.method === "POST") {
      return handleCreateCheckoutSession(req, env, site);
    }

    if (url.pathname === "/create-payment-intent" && req.method === "POST") {
      return handleCreatePaymentIntent(req, env, site);
    }

    if (url.pathname === "/confirm-payment" && req.method === "POST") {
      return handleConfirmPayment(req, env, site, ctx);
    }

    // Only allow POST /webhook
    if (url.pathname !== "/webhook" || req.method !== "POST") {
      return new Response("Not Found", { status: 404 });
    }

    // Read raw body for Stripe signature verification
    const rawBody = await req.arrayBuffer();
    const stripeSig = req.headers.get("stripe-signature");
    if (!stripeSig) return new Response("Missing signature", { status: 400 });

    let event;
    let matchedSite = site;
    const webhookCandidates = getAllWebhookSecretCandidates(env);
    if (webhookCandidates.length === 0) {
      return new Response("No webhook secret configured", { status: 500 });
    }

    let lastWebhookError = null;
    for (const candidate of webhookCandidates) {
      try {
        const stripe = getStripeClient(env, candidate.site);
        event = await stripe.webhooks.constructEventAsync(
          Buffer.from(rawBody),
          stripeSig,
          candidate.value,
        );
        matchedSite = candidate.site;
        break;
      } catch (err) {
        lastWebhookError = err;
      }
    }

    if (!event) {
      return new Response(
        lastWebhookError instanceof Error ? lastWebhookError.message : "Signature verification failed",
        { status: 400 },
      );
    }

    const eventSite = resolveSiteFromStripeObject(env, event.data?.object, matchedSite);

    if (event.type !== "checkout.session.completed" && event.type !== "payment_intent.succeeded") {
      return new Response("OK", { status: 200 });
    }

    try {
      const orderRecord =
        event.type === "checkout.session.completed"
          ? buildOrderRecordFromStripeEvent(
              event.id || `evt_${event.data.object?.id || Date.now()}`,
              event.data.object,
              eventSite,
            )
          : buildOrderRecordFromPaymentIntent(
              `payment_intent:${event.data.object?.id || Date.now()}`,
              event.data.object,
              eventSite,
            );
      await persistOrderRecord(env, orderRecord);
      ctx.waitUntil(triggerOrderSyncSafely(orderRecord.key, env));
      if (event.type === "payment_intent.succeeded") {
        await issueTicketsFromPaymentIntent(env, event.data.object, eventSite);
        ctx.waitUntil(processDueTicketEmailOutbox(env));
      }
    } catch (err) {
      console.error("Order buffering failed:", err instanceof Error ? err.message : String(err));
      // Returning 500 here makes Stripe retry webhook delivery later.
      return new Response("Order buffering failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  },

  async queue(batch, env, ctx) {
    for (const message of batch.messages) {
      const body = message.body || {};
      const orderKey = typeof body === "string" ? body : body.orderKey;
      if (!orderKey) {
        message.ack();
        continue;
      }
      try {
        await syncOrderByKey(orderKey, env);
        message.ack();
      } catch (err) {
        console.error("Queue sync failed:", err instanceof Error ? err.message : String(err));
        message.retry();
      }
    }
    ctx.waitUntil(Promise.resolve());
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil((async () => {
      await runScheduledOrderSync(env);
      await processDueTicketEmailOutbox(env).catch((err) => {
        console.error("Ticket email outbox processing failed:", err instanceof Error ? err.message : String(err));
      });
    })());
  },
};

function getStripeClient(env, site = resolveDefaultSiteContext(env)) {
  const stripeSecret = getStripeSecretConfig(env, site);
  return new Stripe(
    stripeSecret.value,
    STRIPE_API_VERSION ? { apiVersion: STRIPE_API_VERSION } : {},
  );
}

function getTicketsDb(env) {
  return env.TICKETS_DB || null;
}

function getQrSeedSecret(env) {
  return String(env.TICKET_QR_SECRET || env.ADMIN_SESSION_SECRET || "ticket-qr-seed").trim() || "ticket-qr-seed";
}

function getEmailProvider(env, site = resolveDefaultSiteContext(env)) {
  return String(site?.emailProvider || env.EMAIL_PROVIDER || "").trim().toLowerCase();
}

function getEmailFromAddress(env, site = resolveDefaultSiteContext(env)) {
  return String(site?.emailFromAddress || env.EMAIL_FROM_ADDRESS || "").trim();
}

function getEmailFromName(env, site = resolveDefaultSiteContext(env)) {
  return String(site?.emailFromName || env.EMAIL_FROM_NAME || site?.brandName || site?.key || "Tickets").trim();
}

function getEmailReplyTo(env, site = resolveDefaultSiteContext(env)) {
  return String(site?.emailReplyTo || env.EMAIL_REPLY_TO || "").trim();
}

function getTicketAttachmentMode(site) {
  const mode = String(site?.ticketAttachmentMode || "").trim().toLowerCase();
  if (mode === "none" || mode === "pdf" || mode === "png") return mode;
  return "pdf";
}

function getMailchannelsApiKey(env, site = resolveDefaultSiteContext(env)) {
  const config = getOptionalSiteSecretValue(env, site, site?.mailchannelsApiKeyName, "MAILCHANNELS_API_KEY");
  return String(config?.value || "").trim();
}

function getBrevoApiKey(env, site = resolveDefaultSiteContext(env)) {
  const config = getOptionalSiteSecretValue(env, site, site?.brevoApiKeyName, "BREVO_API_KEY");
  if (!config) {
    console.error("Brevo secret lookup failed", {
      siteKey: site?.key || null,
      preferredName: site?.brevoApiKeyName || null,
      normalizedSiteKey: normalizeSecretEnvName(site?.key),
      hasExactSiteSecret: Boolean(env.BREVO_API_KEY_ROLEXBUGATTI),
      hasLegacySecret: Boolean(env.BREVO_API_KEY),
    });
  }
  return String(config?.value || "").trim();
}

function getDefaultTicketEmailLocale(env) {
  return String(env.DEFAULT_EMAIL_LOCALE || DEFAULT_TICKET_EMAIL_LOCALE).trim().toLowerCase() || DEFAULT_TICKET_EMAIL_LOCALE;
}

function getTicketCheckoutKey(paymentIntentId) {
  return `${TICKET_CHECKOUT_PREFIX}${String(paymentIntentId || "").trim()}`;
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(String(input || ""));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function buildDeterministicQrToken(env, siteKey, paymentIntentId, lineIndex, ticketIndex) {
  const raw = `${siteKey}:${paymentIntentId}:${lineIndex}:${ticketIndex}:${getQrSeedSecret(env)}`;
  const hash = await sha256Hex(raw);
  return hash.slice(0, 32);
}

function normalizeTicketCart(cart) {
  if (!Array.isArray(cart)) return [];
  return cart
    .map((item, index) => {
      const quantity = Math.max(1, Number(item?.quantity || 1) || 1);
      const amountCents = Math.max(0, Number(item?.amountCents || Math.round((Number(item?.price) || 0) * 100) || 0));
      const id = String(item?.id || item?.slug || `ticket-${index + 1}`).trim();
      const name = String(item?.name || `Ticket ${index + 1}`).trim();
      const slug = String(item?.slug || id).trim();
      if (!id || !name || amountCents <= 0) return null;
      return {
        id,
        name,
        slug,
        quantity,
        amountCents,
      };
    })
    .filter(Boolean);
}

async function storeTicketCheckoutContext(env, paymentIntent, site, payload) {
  const kv = getOrdersKV(env);
  const key = getTicketCheckoutKey(paymentIntent.id);
  const record = {
    paymentIntentId: paymentIntent.id,
    siteKey: site.key,
    customerEmail: payload.customerEmail || "",
    cart: normalizeTicketCart(payload.cart),
    createdAt: new Date().toISOString(),
  };
  await kv.put(key, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 7 });
  return record;
}

async function getTicketCheckoutContext(env, paymentIntentId) {
  const kv = getOrdersKV(env);
  const raw = await kv.get(getTicketCheckoutKey(paymentIntentId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function calculateServiceFeeCents(cart) {
  const ticketCount = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + Math.max(0, Number(item?.quantity || 0) || 0), 0)
    : 0;
  if (ticketCount <= 0) return 0;
  return Math.ceil(ticketCount / 3) * 100;
}

function getConfiguredStripePaymentMethodTypes(site, fallback = []) {
  const configured = Array.isArray(site?.stripePaymentMethodTypes) ? site.stripePaymentMethodTypes : [];
  const normalized = configured
    .map((entry) => String(entry || "").trim().toLowerCase())
    .filter(Boolean);
  if (normalized.length > 0) return normalized;
  return Array.isArray(fallback)
    ? fallback
        .map((entry) => String(entry || "").trim().toLowerCase())
        .filter(Boolean)
    : [];
}

function getPaymentMethodTypesWithoutWero(paymentMethodTypes = []) {
  if (!Array.isArray(paymentMethodTypes)) return [];
  const seen = new Set();
  return paymentMethodTypes
    .map((entry) => String(entry || "").trim().toLowerCase())
    .filter((entry) => {
      if (!entry || entry === "wero") return false;
      if (seen.has(entry)) return false;
      seen.add(entry);
      return true;
    });
}

function shouldRetryWithoutWero(err, preferredMethodTypes = [], fallbackMethodTypes = []) {
  const preferred = Array.isArray(preferredMethodTypes)
    ? preferredMethodTypes.map((entry) => String(entry || "").trim().toLowerCase()).filter(Boolean)
    : [];
  const fallback = Array.isArray(fallbackMethodTypes)
    ? fallbackMethodTypes.map((entry) => String(entry || "").trim().toLowerCase()).filter(Boolean)
    : [];

  if (!preferred.includes("wero") || fallback.length === 0 || fallback.length === preferred.length) {
    return false;
  }

  const code = String(err?.code || err?.raw?.code || "").trim().toLowerCase();
  if (code === "parameter_invalid_enum" || code === "payment_method_unavailable") {
    return true;
  }

  const message = String(err?.message || "").trim().toLowerCase();
  if (!message || !message.includes("wero")) return false;
  return (
    message.includes("payment_method") ||
    message.includes("payment method") ||
    message.includes("invalid") ||
    message.includes("not available") ||
    message.includes("not supported")
  );
}

function formatEuroCents(value) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format((Number(value || 0) || 0) / 100);
}

function formatEventDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Amsterdam",
  }).format(parsed);
}

function formatEventDateOnly(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Amsterdam",
  }).format(parsed);
}

function formatEventTime(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Amsterdam",
  }).format(parsed);
}

function firstNonEmptyValue(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function parseClockToMinutes(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const match = raw.match(/^(\d{1,2})[:.](\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function formatClockFromMinutes(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return "";
  const total = ((Math.round(minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function buildTicketEmailEventDetails(eventName, product = null) {
  const source = product && typeof product === "object" ? product : {};
  const eventDateRaw = firstNonEmptyValue(
    source.date,
    source.datetime,
    source.show_date,
    source.event_date,
    source.start_at,
    source.start,
  );
  const eventPlace = firstNonEmptyValue(source.place, source.city, source.location, source.venue, source.province);

  const explicitStartTime = firstNonEmptyValue(source.show_time, source.start_time, source.starttime, source.time);
  const explicitStartMinutes = parseClockToMinutes(explicitStartTime);
  const startTimeFromDate = formatEventTime(eventDateRaw);
  const startTimeFromDateMinutes = parseClockToMinutes(startTimeFromDate);
  const showStartTime =
    explicitStartMinutes != null
      ? formatClockFromMinutes(explicitStartMinutes)
      : startTimeFromDateMinutes != null
        ? formatClockFromMinutes(startTimeFromDateMinutes)
        : "";

  const explicitDoors = firstNonEmptyValue(source.doors_time, source.doors, source.door_time, source.doorsTime);
  const explicitDoorsMinutes = parseClockToMinutes(explicitDoors);
  const showStartMinutes = parseClockToMinutes(showStartTime);
  const doorsOpenTime =
    explicitDoorsMinutes != null
      ? formatClockFromMinutes(explicitDoorsMinutes)
      : showStartMinutes != null
        ? formatClockFromMinutes(showStartMinutes - 30)
        : "";

  return {
    eventName: String(eventName || "").trim(),
    eventPlace,
    eventDate: formatEventDateOnly(eventDateRaw),
    showStartTime,
    doorsOpenTime,
  };
}

function formatTicketLinkExpiry(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value || "");
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Amsterdam",
  }).format(parsed);
}

function sanitizeFilenameSegment(value, fallback = "ticket") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

function toBase64UrlBytes(base64urlValue) {
  const normalized = String(base64urlValue || "")
    .trim()
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  if (!normalized) return new Uint8Array();
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function fromBase64Url(base64urlValue) {
  return new TextDecoder().decode(toBase64UrlBytes(base64urlValue));
}

function getTicketLinkSecret(env) {
  return String(env.TICKET_LINK_SECRET || env.ADMIN_SESSION_SECRET || getQrSeedSecret(env)).trim() || "ticket-link-secret";
}

function getPreferredSiteHostname(site) {
  if (!Array.isArray(site?.hostnames) || site.hostnames.length === 0) return "";
  const normalized = site.hostnames
    .map((value) => normalizeHostname(value))
    .filter((value) => value && !value.endsWith(".workers.dev"));
  if (normalized.length === 0) return "";
  const nonWww = normalized.find((value) => !value.startsWith("www."));
  return nonWww || normalized[0];
}

function tryGetOriginFromUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

function getSitePublicBaseOrigin(site) {
  const candidates = [
    site?.checkoutSuccessUrl,
    site?.checkoutCancelUrl,
    site?.publicBaseUrl,
    site?.siteUrl,
  ];
  for (const candidate of candidates) {
    const origin = tryGetOriginFromUrl(candidate);
    if (origin) return origin;
  }
  return "";
}

function getTicketLinkBaseUrl(env, site = null) {
  const siteOverride = String(site?.ticket_link_base_url || site?.ticketLinkBaseUrl || "").trim();
  if (siteOverride) {
    const parsedSiteOverride = tryGetOriginFromUrl(siteOverride);
    if (parsedSiteOverride) return parsedSiteOverride;
  }

  const sitePublicBaseOrigin = getSitePublicBaseOrigin(site);
  if (sitePublicBaseOrigin) {
    return sitePublicBaseOrigin;
  }

  const preferredHost = getPreferredSiteHostname(site);
  if (preferredHost) {
    return `https://${preferredHost}`;
  }

  const raw = String(env.TICKET_LINK_BASE_URL || env.PUBLIC_BASE_URL || "").trim();
  const parsedEnvBase = tryGetOriginFromUrl(raw);
  if (parsedEnvBase) return parsedEnvBase;

  return FALLBACK_WORKER_PUBLIC_BASE_URL;
}

function buildTicketAccessUrl(env, token, site = null) {
  return `${getTicketLinkBaseUrl(env, site)}/t/${encodeURIComponent(String(token || "").trim())}`;
}

function buildEventPageUrl(env, site = null, eventSlugOrId = "") {
  const raw = String(eventSlugOrId || "").trim();
  if (!raw) return "";
  const baseUrl = getTicketLinkBaseUrl(env, site);
  if (!baseUrl) return "";
  return `${baseUrl}/product/${encodeURIComponent(raw)}`;
}

async function signTicketAccessPayload(env, payloadEncoded) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getTicketLinkSecret(env)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(String(payloadEncoded || "")));
  return new Uint8Array(signature);
}

async function createTicketAccessToken(env, payload) {
  const compactPayload = [
    String(payload?.siteKey || "").trim(),
    String(payload?.orderId || "").trim(),
    String(Number(payload?.exp || 0)),
  ].join("|");
  const encodedPayload = base64url(compactPayload);
  const signatureBytes = await signTicketAccessPayload(env, encodedPayload);
  const truncatedSignature = signatureBytes.slice(0, 16);
  const encodedSignature = base64url(truncatedSignature);
  return `${encodedPayload}.${encodedSignature}`;
}

async function decodeTicketAccessToken(env, token) {
  const [encodedPayload, encodedSignature] = String(token || "").trim().split(".");
  if (!encodedPayload || !encodedSignature) return null;
  const signatureBytes = await signTicketAccessPayload(env, encodedPayload);
  const expectedFullSignature = base64url(signatureBytes);
  const expectedTruncatedSignature = base64url(signatureBytes.slice(0, 16));
  if (encodedSignature !== expectedFullSignature && encodedSignature !== expectedTruncatedSignature) return null;

  const decodedPayload = fromBase64Url(encodedPayload);
  let siteKey = "";
  let orderId = "";
  let exp = 0;

  // Legacy JSON payload support for previously sent links.
  if (decodedPayload.startsWith("{")) {
    let payload = null;
    try {
      payload = JSON.parse(decodedPayload);
    } catch {
      payload = null;
    }
    if (!payload || typeof payload !== "object") return null;
    siteKey = String(payload.siteKey || "").trim();
    orderId = String(payload.orderId || "").trim();
    exp = Number(payload.exp || 0);
  } else {
    const [rawSiteKey, rawOrderId, rawExp] = String(decodedPayload || "").split("|");
    siteKey = String(rawSiteKey || "").trim();
    orderId = String(rawOrderId || "").trim();
    exp = Number(rawExp || 0);
  }

  if (!siteKey || !orderId || !Number.isFinite(exp)) return null;
  return {
    siteKey,
    orderId,
    exp,
  };
}

function parseDateToTimestamp(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const candidates = [raw];
  if (raw.includes(" ") && !raw.includes("T")) {
    candidates.push(raw.replace(" ", "T"));
  }
  for (const candidate of candidates) {
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
  }
  return null;
}

function getLineEventTimestamp(line) {
  const product = line?.product || {};
  const candidates = [
    product.date,
    product.datetime,
    product.show_date,
    product.event_date,
    product.start_at,
    product.start,
  ];
  for (const value of candidates) {
    const timestamp = parseDateToTimestamp(value);
    if (timestamp) return timestamp;
  }
  return null;
}

function resolveTicketLinkExpiryMs(bundle) {
  const eventTimestamps = Array.isArray(bundle?.lines)
    ? bundle.lines
        .map((line) => getLineEventTimestamp(line))
        .filter((value) => Number.isFinite(value))
    : [];
  if (eventTimestamps.length > 0) {
    return Math.max(...eventTimestamps) + DEFAULT_TICKET_LINK_POST_EVENT_HOURS * 60 * 60 * 1000;
  }
  const orderCreatedAt = parseDateToTimestamp(bundle?.order?.created_at);
  if (orderCreatedAt) {
    return orderCreatedAt + DEFAULT_TICKET_LINK_FALLBACK_HOURS * 60 * 60 * 1000;
  }
  return Date.now() + DEFAULT_TICKET_LINK_FALLBACK_HOURS * 60 * 60 * 1000;
}

async function buildTicketPngAttachments(bundle, site) {
  const attachments = [];
  if (!Array.isArray(bundle?.lines)) return attachments;

  for (const line of bundle.lines) {
    const eventSlug = sanitizeFilenameSegment(line?.event_slug || line?.event_name || "event", "event");
    for (const item of line.items || []) {
      const qrToken = String(item?.qr_token || "").trim();
      if (!qrToken) continue;
      const qrBytes = await buildQrPngBytes(qrToken);
      if (!qrBytes) continue;

      attachments.push({
        name: `${sanitizeFilenameSegment(site?.brandName || "ticket", "ticket")}-${eventSlug}-ticket-${Number(item?.ticket_number || 0) || 1}-${sanitizeFilenameSegment(String(item?.id || "").slice(-8), "code")}.png`,
        content: bytesToBase64(qrBytes),
        contentType: "image/png",
      });
    }
  }

  return attachments;
}

function collectTicketCodesFromBundle(bundle, max = 24) {
  const codes = [];
  if (!Array.isArray(bundle?.lines)) return codes;

  for (const line of bundle.lines) {
    for (const item of line.items || []) {
      const qrToken = String(item?.qr_token || "").trim();
      if (!qrToken) continue;
      codes.push({
        ticketNumber: Number(item?.ticket_number || 0) || codes.length + 1,
        code: qrToken,
      });
      if (codes.length >= max) return codes;
    }
  }
  return codes;
}

function normalizeShareEmails(input) {
  const rawItems = Array.isArray(input) ? input : String(input || "").split(/[,;\n]+/);
  const seen = new Set();
  const emails = [];
  for (const raw of rawItems) {
    const email = String(raw || "").trim().toLowerCase();
    if (!email || !isValidEmail(email)) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }
  return emails;
}

function buildTicketShareRateKey(siteKey, orderId) {
  return `ticket_share_rate:${String(siteKey || "").trim()}:${String(orderId || "").trim()}`;
}

async function reserveTicketShareQuota(env, siteKey, orderId, amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: true, remaining: TICKET_SHARE_MAX_RECIPIENTS_PER_24H };
  }
  const kv = getOrdersKV(env);
  const key = buildTicketShareRateKey(siteKey, orderId);
  const currentRaw = await kv.get(key);
  const current = Math.max(0, Number(currentRaw || 0) || 0);
  if (current + amount > TICKET_SHARE_MAX_RECIPIENTS_PER_24H) {
    return { ok: false, remaining: Math.max(0, TICKET_SHARE_MAX_RECIPIENTS_PER_24H - current) };
  }
  await kv.put(key, String(current + amount), { expirationTtl: TICKET_SHARE_RATE_TTL_SECONDS });
  return { ok: true, remaining: Math.max(0, TICKET_SHARE_MAX_RECIPIENTS_PER_24H - current - amount) };
}

function normalizeOrderCodeword(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomInt(maxExclusive) {
  if (!Number.isFinite(maxExclusive) || maxExclusive <= 0) return 0;
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] % maxExclusive;
}

function generateOrderCodewordCandidate() {
  const adjective = ORDER_CODEWORD_ADJECTIVES[randomInt(ORDER_CODEWORD_ADJECTIVES.length)] || "gouden";
  const noun = ORDER_CODEWORD_NOUNS[randomInt(ORDER_CODEWORD_NOUNS.length)] || "lach";
  const number = String(randomInt(1000)).padStart(3, "0");
  return normalizeOrderCodeword(`${adjective}-${noun}-${number}`);
}

async function ensureTicketOrderCodeword(db, siteKey, orderId, existingCodeword = "") {
  const normalizedExisting = normalizeOrderCodeword(existingCodeword);
  if (normalizedExisting) return normalizedExisting;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = generateOrderCodewordCandidate();
    if (!candidate) continue;

    const taken = await db
      .prepare(
        `SELECT id
         FROM ticket_orders
         WHERE site_key = ?
           AND LOWER(COALESCE(order_codeword, '')) = ?
           AND id != ?
         LIMIT 1`,
      )
      .bind(siteKey, candidate, orderId)
      .first();
    if (taken?.id) continue;

    const now = new Date().toISOString();
    const updateResult = await db
      .prepare(
        `UPDATE ticket_orders
         SET order_codeword = ?, updated_at = ?
         WHERE site_key = ?
           AND id = ?
           AND (order_codeword IS NULL OR TRIM(order_codeword) = '')`,
      )
      .bind(candidate, now, siteKey, orderId)
      .run();
    const changed = Number(updateResult?.meta?.changes || updateResult?.changes || 0);
    if (changed > 0) return candidate;

    const current = await db
      .prepare(
        `SELECT order_codeword
         FROM ticket_orders
         WHERE site_key = ?
           AND id = ?
         LIMIT 1`,
      )
      .bind(siteKey, orderId)
      .first();
    const normalizedCurrent = normalizeOrderCodeword(current?.order_codeword || "");
    if (normalizedCurrent) return normalizedCurrent;
  }

  return "";
}

function renderTicketShareEmailTemplate({ site, bundle, ticketAccessUrl, expiresAtIso, recipientEmail, ticketLabel = "" }) {
  const safeRecipient = escapeHtml(recipientEmail || "daar");
  const eventNames = (bundle?.lines || [])
    .map((line) => String(line?.event_name || "").trim())
    .filter(Boolean)
    .slice(0, 4);
  const eventText = escapeHtml(eventNames.join(", ") || (site?.brandName || "de show"));
  const safeTicketLabel = escapeHtml(ticketLabel || "");
  const orderCodeword = normalizeOrderCodeword(bundle?.order?.order_codeword || "");
  const safeOrderCodeword = escapeHtml(orderCodeword || "");
  const expiryText = escapeHtml(formatTicketLinkExpiry(expiresAtIso || ""));
  const subject = site?.key === "rolexbugatti" ? "Je tickets voor Rolex Bugatti Live" : `Je tickets voor ${site?.brandName || "de show"}`;
  const ticketLine = safeTicketLabel ? `<p><strong>Ticket:</strong> ${safeTicketLabel}</p>` : "";
  const codewordLine = safeOrderCodeword
    ? `<p><strong>Codewoord (fallback check-in):</strong> <code style="padding:2px 6px;border-radius:6px;background:#111827;color:#fbbf24">${safeOrderCodeword}</code></p>`
    : "";

  const html =
    `<p>Hey ${safeRecipient},</p>` +
    `<p>Iemand heeft tickettoegang met je gedeeld.</p>` +
    `<p><strong>Show:</strong> ${eventText}</p>` +
    ticketLine +
    `<p><a href="${escapeHtml(ticketAccessUrl)}" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#fbbf24;color:#111827;text-decoration:none;font-weight:700">Open tickets</a></p>` +
    `<p>Kom je niet tegelijk aan? Deel de ticketlink of meld het codewoord bij de scanner.</p>` +
    codewordLine +
    `<p>Link geldig t/m ${expiryText}.</p>` +
    `<p>Fallback: <a href="${escapeHtml(ticketAccessUrl)}">Open ticketlink</a></p>` +
    `<p>Mvg,<br/>${escapeHtml(site?.brandName || "Tickets")}</p>`;

  const text =
    `Hey ${recipientEmail || "daar"}, iemand heeft tickettoegang met je gedeeld.\n` +
    `Show: ${eventNames.join(", ") || (site?.brandName || "de show")}\n` +
    (ticketLabel ? `Ticket: ${ticketLabel}\n` : "") +
    `Open tickets: ${ticketAccessUrl}\n` +
    (orderCodeword ? `Codewoord (fallback check-in): ${orderCodeword}\n` : "") +
    `Kom je niet tegelijk aan? Deel de ticketlink of meld het codewoord bij de scanner.\n` +
    `Link geldig t/m: ${formatTicketLinkExpiry(expiresAtIso || "")}\n` +
    `Mvg, ${site?.brandName || "Tickets"}`;

  return { subject, html, text };
}

async function buildTicketEmailDeliveryAssets(env, site, orderId, options = {}) {
  const bundle = await getTicketOrderBundle(env, orderId, site);
  const expiresAtMs = resolveTicketLinkExpiryMs(bundle);
  const ticketAccessToken = await createTicketAccessToken(env, {
    siteKey: site.key,
    orderId: String(orderId || "").trim(),
    exp: expiresAtMs,
  });
  const includePngAttachments = options?.includePngAttachments !== false;

  return {
    bundle,
    ticketAccessUrl: buildTicketAccessUrl(env, ticketAccessToken, site),
    expiresAtIso: new Date(expiresAtMs).toISOString(),
    ticketCodes: collectTicketCodesFromBundle(bundle, 24),
    attachments: includePngAttachments ? await buildTicketPngAttachments(bundle, site) : [],
  };
}

function addTicketLinkSectionToEmailHtml(html, options = {}) {
  const original = String(html || "").trim();
  const url = String(options.ticketAccessUrl || "").trim();
  if (!url) return original || "";
  if (original.includes("ticket-access-link")) return original;

  const expiryText = formatTicketLinkExpiry(options.expiresAtIso || "");
  const isEnglish = Boolean(options.isEnglish);
  const ticketAttachmentMode = String(options.ticketAttachmentMode || "pdf").trim().toLowerCase();
  const ticketCodes = Array.isArray(options.ticketCodes) ? options.ticketCodes : [];
  const title = isEnglish ? "Your ticket link" : "Je ticketlink";
  const ctaLabel = isEnglish ? "Open tickets" : "Open tickets";
  const fallbackLabel = isEnglish ? "Open ticket link" : "Open ticketlink";
  const fallbackPrefix = isEnglish ? "Fallback" : "Fallback";
  const backupLine =
    ticketAttachmentMode === "png"
      ? isEnglish
        ? `Backup: PNG ticket files are attached. Link valid until ${escapeHtml(expiryText)}.`
        : `Backup: per ticket is ook een PNG-bijlage toegevoegd. Link geldig t/m ${escapeHtml(expiryText)}.`
      : ticketAttachmentMode === "pdf"
        ? isEnglish
          ? `Backup: ticket PDF is attached. Link valid until ${escapeHtml(expiryText)}.`
          : `Backup: ticket-PDF is toegevoegd. Link geldig t/m ${escapeHtml(expiryText)}.`
        : isEnglish
          ? `Backup: use the ticket codes below for manual scanner entry. Link valid until ${escapeHtml(expiryText)}.`
          : `Backup: gebruik onderstaande ticketcodes voor handmatige scannerinvoer. Link geldig t/m ${escapeHtml(expiryText)}.`;

  const ticketCodesHeading = isEnglish
    ? "Ticket codes (manual fallback)"
    : "Ticketcodes (handmatige fallback)";
  const ticketCodesHtml =
    ticketAttachmentMode === "none" && ticketCodes.length > 0
      ? `<div style="margin-top:10px"><p style="margin:0 0 6px 0"><strong>${escapeHtml(ticketCodesHeading)}:</strong></p><ul style="margin:0;padding-left:18px">${ticketCodes
          .map((entry) => `<li style="margin:0 0 4px 0">Ticket #${escapeHtml(entry.ticketNumber)}: <code>${escapeHtml(entry.code)}</code></li>`)
          .join("")}</ul></div>`
      : "";
  const prefix = original || "<p>Je ticket is klaar.</p>";
  return `${prefix}<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" /><div data-block="ticket-access-link"><p><strong>${escapeHtml(title)}:</strong></p><p style="margin:8px 0 10px 0"><a href="${escapeHtml(url)}" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#fbbf24;color:#111827;text-decoration:none;font-weight:700">${escapeHtml(ctaLabel)}</a></p><p style="margin:0 0 6px 0">${backupLine}</p><p style="margin:0;font-size:12px;color:#64748b">${escapeHtml(fallbackPrefix)}: <a href="${escapeHtml(url)}">${escapeHtml(fallbackLabel)}</a></p>${ticketCodesHtml}</div>`;
}

function renderPublicTicketPage({ site, bundle, ticketDataUrls = [], expiresAtIso, shareEndpoint = "" }) {
  const brand = escapeHtml(site?.brandName || "Tickets");
  const orderId = escapeHtml(bundle?.order?.id || "-");
  const customerName = escapeHtml(bundle?.order?.customer_name || "Gast");
  const customerEmail = escapeHtml(bundle?.order?.customer_email || "-");
  const orderCodeword = escapeHtml(normalizeOrderCodeword(bundle?.order?.order_codeword || "") || "-");
  const expiresText = escapeHtml(formatTicketLinkExpiry(expiresAtIso || ""));
  const hasShareEndpoint = Boolean(String(shareEndpoint || "").trim());
  const safeShareEndpoint = escapeHtml(String(shareEndpoint || "").trim());

  const ticketSections = [];
  for (const line of bundle?.lines || []) {
    const eventName = escapeHtml(line?.event_name || "Show");
    const eventDateRaw =
      line?.product?.date ||
      line?.product?.datetime ||
      line?.product?.show_date ||
      line?.product?.event_date ||
      "";
    const eventDate = escapeHtml(eventDateRaw ? formatEventDate(eventDateRaw) : "-");

    const ticketsMarkup = (line.items || [])
      .map((item) => {
        const ticketNumberRaw = Number(item?.ticket_number || 0) || "-";
        const ticketNumber = escapeHtml(ticketNumberRaw);
        const status = escapeHtml(item?.status || "issued");
        const ticketId = escapeHtml(String(item?.id || "").trim());
        const qrToken = String(item?.qr_token || "").trim();
        const qrSrc = escapeHtml(ticketDataUrls.find((entry) => entry.qrToken === qrToken)?.dataUrl || "");
        const qrLabel = escapeHtml(String(qrToken || "").slice(0, 16).toUpperCase());
        const ticketShareMarkup = hasShareEndpoint
          ? `<form class="ticket-share-inline" data-ticket-share-form novalidate>
               <input type="hidden" name="ticketId" value="${ticketId}" />
               <input type="hidden" name="ticketNumber" value="${ticketNumber}" />
               <label class="sr-only" for="ticket-share-email-${ticketId}">Deel ticket #${ticketNumber} met e-mail</label>
               <div class="ticket-share-row">
                 <input id="ticket-share-email-${ticketId}" type="email" name="email" placeholder="doorsturen naar e-mailadres" required />
                 <button type="submit">Deel ticket</button>
               </div>
               <p class="ticket-share-status" data-ticket-share-status aria-live="polite"></p>
             </form>`
          : "";
        return `<article class="ticket-card"><div class="ticket-head"><strong>Ticket #${ticketNumber}</strong><span>${status}</span></div><div class="qr-wrap">${qrSrc ? `<img src="${qrSrc}" alt="QR ticket ${ticketNumber}" loading="lazy" />` : `<div class="qr-missing">QR niet beschikbaar</div>`}</div><div class="ticket-code">${qrLabel}</div>${ticketShareMarkup}</article>`;
      })
      .join("");

    ticketSections.push(`<section class="event-block"><h2>${eventName}</h2><p class="event-date">${eventDate}</p><div class="tickets-grid">${ticketsMarkup}</div></section>`);
  }

  const shareScript = hasShareEndpoint
    ? `<script>
        (() => {
          const forms = Array.from(document.querySelectorAll("[data-ticket-share-form]"));
          if (forms.length === 0) return;
          const endpoint = "${safeShareEndpoint}";

          const setStatus = (statusNode, message, type) => {
            if (!statusNode) return;
            statusNode.textContent = message || "";
            statusNode.dataset.type = type || "";
          };

          const onSubmit = async (form, event) => {
            event.preventDefault();
            const statusNode = form.querySelector("[data-ticket-share-status]");
            const input = form.querySelector("input[name='email']");
            const submitButton = form.querySelector("button[type='submit']");
            const ticketId = form.querySelector("input[name='ticketId']")?.value || "";
            const ticketNumber = form.querySelector("input[name='ticketNumber']")?.value || "";
            const rawEmail = input && "value" in input ? String(input.value || "").trim() : "";

            if (!rawEmail) {
              setStatus(statusNode, "Vul een e-mailadres in.", "error");
              return;
            }

            if (submitButton) submitButton.disabled = true;
            setStatus(statusNode, "Versturen...", "info");

            try {
              const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  emails: rawEmail,
                  ticketId,
                  ticketNumber,
                }),
              });

              let data = {};
              try {
                data = await response.json();
              } catch {
                data = {};
              }

              if (!response.ok || !data || data.ok !== true) {
                setStatus(statusNode, data?.error || "Versturen mislukt. Probeer opnieuw.", "error");
                return;
              }

              const remainingRaw = Number(data?.remaining);
              const remainingSuffix = Number.isFinite(remainingRaw) ? " Nog over vandaag: " + Math.max(0, remainingRaw) + "." : "";
              if (input && "value" in input) input.value = "";
              setStatus(statusNode, "Ticket gedeeld via e-mail." + remainingSuffix, "success");
            } catch {
              setStatus(statusNode, "Netwerkfout. Probeer opnieuw.", "error");
            } finally {
              if (submitButton) submitButton.disabled = false;
            }
          };

          forms.forEach((form) => {
            form.addEventListener("submit", (event) => {
              onSubmit(form, event);
            });
          });
        })();
      </script>`
    : "";

  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <title>${brand} ticket</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #0a0b10; color: #f8fafc; }
      main { max-width: 820px; margin: 0 auto; padding: 20px 14px 26px; }
      .hero { border: 1px solid rgba(255,255,255,.14); border-radius: 16px; padding: 14px; background: linear-gradient(135deg, rgba(255,197,61,.14), rgba(15,18,28,.8)); margin-bottom: 14px; }
      .hero h1 { margin: 0 0 4px; font-size: 1.25rem; }
      .meta { display: grid; gap: 2px; color: rgba(241,245,249,.9); font-size: .92rem; }
      .event-block { border: 1px solid rgba(255,255,255,.1); border-radius: 14px; padding: 12px; background: rgba(15,23,42,.6); margin-bottom: 12px; }
      .event-block h2 { margin: 0; font-size: 1.05rem; }
      .event-date { margin: 4px 0 10px; color: rgba(226,232,240,.85); font-size: .9rem; }
      .tickets-grid { display: grid; gap: 10px; }
      .ticket-card { border: 1px solid rgba(255,255,255,.14); border-radius: 12px; background: rgba(2,6,23,.7); padding: 10px; }
      .ticket-head { display: flex; justify-content: space-between; align-items: center; font-size: .92rem; margin-bottom: 8px; }
      .ticket-head span { color: #fcd34d; text-transform: uppercase; letter-spacing: .04em; font-size: .72rem; }
      .qr-wrap { width: 100%; display: flex; justify-content: center; }
      .qr-wrap img { width: min(84vw, 360px); aspect-ratio: 1 / 1; border-radius: 10px; background: #fff; padding: 8px; }
      .qr-missing { width: min(84vw, 360px); aspect-ratio: 1 / 1; border-radius: 10px; display: grid; place-items: center; border: 1px dashed rgba(255,255,255,.3); color: rgba(241,245,249,.7); }
      .ticket-code { margin-top: 8px; text-align: center; color: rgba(226,232,240,.75); font-size: .75rem; letter-spacing: .06em; }
      .ticket-share-inline { margin-top: 10px; border-top: 1px solid rgba(255,255,255,.08); padding-top: 10px; }
      .ticket-share-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: center; }
      .ticket-share-row input { width: 100%; border-radius: 9px; border: 1px solid rgba(255,255,255,.2); background: rgba(2,6,23,.9); color: #f8fafc; padding: 9px 10px; font-size: .86rem; }
      .ticket-share-row button { border: none; border-radius: 9px; background: #fbbf24; color: #111827; font-weight: 700; padding: 9px 12px; cursor: pointer; white-space: nowrap; }
      .ticket-share-row button[disabled] { opacity: .65; cursor: wait; }
      .ticket-share-status { min-height: 1.2em; margin: 7px 0 0; font-size: .78rem; color: rgba(226,232,240,.8); }
      .ticket-share-status[data-type="success"] { color: #86efac; }
      .ticket-share-status[data-type="error"] { color: #fda4af; }
      .ticket-share-status[data-type="info"] { color: #fcd34d; }
      @media (max-width: 640px) {
        .ticket-share-row { grid-template-columns: 1fr; }
        .ticket-share-row button { width: 100%; }
      }
      .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      .hint { margin-top: 10px; color: rgba(226,232,240,.8); font-size: .83rem; line-height: 1.4; }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>${brand} tickets</h1>
        <div class="meta">
          <div>Order: ${orderId}</div>
          <div>Naam: ${customerName}</div>
          <div>E-mail: ${customerEmail}</div>
          <div>Codewoord (fallback): ${orderCodeword}</div>
          <div>Link geldig t/m: ${expiresText}</div>
        </div>
      </section>
      ${ticketSections.join("")}
      <p class="hint">Laat bij entree de QR-code op volledige helderheid zien. Kom je niet tegelijk aan? Deel per ticket het e-mailadres of gebruik het codewoord voor handmatige check-in.</p>
    </main>
    ${shareScript}
  </body>
</html>`;
}

async function handlePublicTicketLink(url, env) {
  const tokenMatch = String(url.pathname || "").match(/^\/t\/([^/?#]+)$/);
  const token = String(tokenMatch?.[1] || "").trim();
  if (!token) {
    return new Response("Ticket link ongeldig", {
      status: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const payload = await decodeTicketAccessToken(env, token);
  if (!payload) {
    return new Response("Ticket link ongeldig", {
      status: 401,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const site = resolveSiteContextByKey(env, payload.siteKey);
  if (!site?.key || site.key !== payload.siteKey) {
    return new Response("Ticket site niet gevonden", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  let bundle = null;
  try {
    bundle = await getTicketOrderBundle(env, payload.orderId, site);
  } catch {
    bundle = null;
  }
  if (!bundle) {
    return new Response("Ticket order niet gevonden", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const dynamicExpiryMs = Math.max(Number(payload.exp || 0), resolveTicketLinkExpiryMs(bundle));
  if (Date.now() > dynamicExpiryMs) {
    return new Response(
      "<!doctype html><html><head><meta charset='utf-8' /><meta name='viewport' content='width=device-width, initial-scale=1' /></head><body style='font-family:system-ui;background:#0a0b10;color:#f8fafc;padding:24px'><h1 style='font-size:1.25rem'>Ticketlink verlopen</h1><p>Deze link is verlopen. Neem contact op met support als je hulp nodig hebt.</p></body></html>",
      {
        status: 410,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      },
    );
  }

  const qrEntries = [];
  for (const line of bundle.lines || []) {
    for (const item of line.items || []) {
      const qrToken = String(item?.qr_token || "").trim();
      if (!qrToken) continue;
      try {
        const bytes = await buildQrPngBytes(qrToken);
        if (!bytes) continue;
        qrEntries.push({
          qrToken,
          dataUrl: `data:image/png;base64,${bytesToBase64(bytes)}`,
        });
      } catch {
        // keep page available even if one QR render fails
      }
    }
  }

  const html = renderPublicTicketPage({
    site,
    bundle,
    ticketDataUrls: qrEntries,
    expiresAtIso: new Date(dynamicExpiryMs).toISOString(),
    shareEndpoint: `/t/${encodeURIComponent(token)}/share`,
  });

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

async function handlePublicTicketShare(req, url, env, ctx) {
  const tokenMatch = String(url.pathname || "").match(/^\/t\/([^/?#]+)\/share$/);
  const token = String(tokenMatch?.[1] || "").trim();
  if (!token) {
    return jsonResponse({ ok: false, error: "Ticket link ongeldig" }, 400);
  }

  const payload = await decodeTicketAccessToken(env, token);
  if (!payload) {
    return jsonResponse({ ok: false, error: "Ticket link ongeldig" }, 401);
  }

  const site = resolveSiteContextByKey(env, payload.siteKey);
  if (!site?.key || site.key !== payload.siteKey) {
    return jsonResponse({ ok: false, error: "Ticket site niet gevonden" }, 404);
  }

  const provider = getEmailProvider(env, site);
  const fromAddress = getEmailFromAddress(env, site);
  if (!provider || !fromAddress) {
    return jsonResponse({ ok: false, error: "Ticketmail is niet geconfigureerd voor deze site" }, 503);
  }

  let bundle = null;
  try {
    bundle = await getTicketOrderBundle(env, payload.orderId, site);
  } catch {
    bundle = null;
  }
  if (!bundle) {
    return jsonResponse({ ok: false, error: "Ticket order niet gevonden" }, 404);
  }

  const dynamicExpiryMs = Math.max(Number(payload.exp || 0), resolveTicketLinkExpiryMs(bundle));
  if (Date.now() > dynamicExpiryMs) {
    return jsonResponse({ ok: false, error: "Ticket link verlopen" }, 410);
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const requestedTicketId = String(body?.ticketId || "").trim();
  const requestedTicketNumber = String(body?.ticketNumber || "").trim();

  let matchedTicket = null;
  if (requestedTicketId) {
    for (const line of bundle.lines || []) {
      for (const item of line.items || []) {
        if (String(item?.id || "").trim() === requestedTicketId) {
          matchedTicket = item;
          break;
        }
      }
      if (matchedTicket) break;
    }
    if (!matchedTicket) {
      return jsonResponse({ ok: false, error: "Ticket niet gevonden voor deze order" }, 400);
    }
  }
  const matchedTicketNumber = Number(matchedTicket?.ticket_number || 0) || 0;
  const ticketLabel = matchedTicket
    ? `Ticket #${matchedTicketNumber || requestedTicketNumber || "?"}${matchedTicket?.event_name ? ` - ${String(matchedTicket.event_name).trim()}` : ""}`
    : requestedTicketNumber
      ? `Ticket #${requestedTicketNumber}`
      : "";

  const emails = normalizeShareEmails(body?.emails ?? body?.email ?? "");
  if (emails.length === 0) {
    return jsonResponse({ ok: false, error: "Geen geldige e-mailadressen gevonden" }, 400);
  }
  if (emails.length > TICKET_SHARE_MAX_RECIPIENTS_PER_REQUEST) {
    return jsonResponse(
      {
        ok: false,
        error: `Maximaal ${TICKET_SHARE_MAX_RECIPIENTS_PER_REQUEST} ontvangers per keer`,
      },
      400,
    );
  }

  const quota = await reserveTicketShareQuota(env, payload.siteKey, payload.orderId, emails.length);
  if (!quota.ok) {
    return jsonResponse(
      {
        ok: false,
        error: `Daglimiet bereikt. Je kunt nog ${quota.remaining} ontvanger(s) delen binnen 24 uur`,
        remaining: quota.remaining,
      },
      429,
    );
  }

  const now = new Date().toISOString();
  const ticketAccessUrl = buildTicketAccessUrl(env, token, site);
  const expiresAtIso = new Date(dynamicExpiryMs).toISOString();
  const eventProductId = String(matchedTicket?.event_product_id || bundle?.lines?.[0]?.event_product_id || "").trim();
  const sharedByEmail = String(bundle?.order?.customer_email || "").trim().toLowerCase();

  for (const recipientEmail of emails) {
    const rendered = renderTicketShareEmailTemplate({
      site,
      bundle,
      ticketAccessUrl,
      expiresAtIso,
      recipientEmail,
      ticketLabel,
    });
    const outboxId = `ticket_share_${site.key}_${payload.orderId}_${crypto.randomUUID()}`;
    await insertTicketEmailOutboxItem(env, {
      id: outboxId,
      siteKey: site.key,
      orderId: payload.orderId,
      eventProductId: eventProductId || null,
      recipientEmail,
      templateKey: "ticket_share",
      subjectResolved: rendered.subject,
      bodyHtmlResolved: rendered.html,
      attachmentsJson: JSON.stringify([]),
      status: "pending",
      provider: provider || null,
      providerMessageId: null,
      errorMessage: null,
      sendAfterAt: now,
      sentAt: null,
      failedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    await insertTicketEmailLog(env, {
      id: crypto.randomUUID(),
      siteKey: site.key,
      emailOutboxId: outboxId,
      action: "share_queued",
      payloadJson: JSON.stringify({
        templateKey: "ticket_share",
        recipientEmail,
        orderId: payload.orderId,
        sharedByEmail: sharedByEmail || null,
        ticketId: requestedTicketId || null,
        ticketNumber: matchedTicketNumber || requestedTicketNumber || null,
      }),
      createdAt: now,
    });
  }

  if (ctx?.waitUntil) {
    ctx.waitUntil(processDueTicketEmailOutbox(env));
  } else {
    await processDueTicketEmailOutbox(env).catch(() => {});
  }

  return jsonResponse({
    ok: true,
    queued: emails.length,
    remaining: quota.remaining,
  });
}

function bytesToBase64(bytes) {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < array.length; i += chunkSize) {
    binary += String.fromCharCode(...array.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function getEventCatalogByIds(env, site, productIds = []) {
  const wanted = new Set(productIds.map((value) => String(value || "").trim()).filter(Boolean));
  if (wanted.size === 0) return new Map();

  try {
    const { products } = await readProductsSheet(env, site, { includeInactive: true });
    const byId = new Map();
    for (const product of products) {
      const candidates = [
        product.id,
        product.slug,
        product.productid,
        product.product_id,
      ]
        .map((value) => String(value || "").trim())
        .filter(Boolean);
      for (const candidate of candidates) {
        if (wanted.has(candidate) && !byId.has(candidate)) {
          byId.set(candidate, product);
        }
      }
    }
    return byId;
  } catch {
    return new Map();
  }
}

async function getTicketOrderBundle(env, orderId, site) {
  const db = getTicketsDb(env);
  if (!db) throw new Error("TICKETS_DB binding ontbreekt");

  const order = await db
    .prepare(
      `SELECT id, site_key, stripe_payment_intent_id, customer_email, customer_name, order_codeword, currency, ticket_subtotal_cents, service_fee_cents, total_paid_cents, quantity_total, created_at
       FROM ticket_orders
       WHERE id = ? AND site_key = ?
       LIMIT 1`,
    )
    .bind(orderId, site.key)
    .first();
  if (!order) {
    throw new Error(`Ticket order niet gevonden: ${orderId}`);
  }

  const ensuredCodeword = await ensureTicketOrderCodeword(db, site.key, String(order.id || orderId), order.order_codeword);

  const linesResult = await db
    .prepare(
      `SELECT id, event_product_id, event_slug, event_name, unit_price_cents, quantity
       FROM ticket_order_lines
       WHERE order_id = ?
       ORDER BY created_at ASC, id ASC`,
    )
    .bind(orderId)
    .all();
  const lines = Array.isArray(linesResult?.results) ? linesResult.results : [];

  const itemsResult = await db
    .prepare(
      `SELECT id, order_line_id, event_product_id, event_name, ticket_number, holder_name, holder_email, qr_token, status, issued_at
       FROM ticket_items
       WHERE order_id = ?
       ORDER BY order_line_id ASC, ticket_number ASC, created_at ASC`,
    )
    .bind(orderId)
    .all();
  const items = Array.isArray(itemsResult?.results) ? itemsResult.results : [];

  const productIds = lines.map((line) => String(line.event_product_id || "").trim()).filter(Boolean);
  const eventCatalog = await getEventCatalogByIds(env, site, productIds);

  const enrichedLines = lines.map((line) => {
    const product = eventCatalog.get(String(line.event_product_id || "").trim()) || null;
    const lineItems = items.filter((item) => item.order_line_id === line.id);
    return {
      ...line,
      product,
      items: lineItems,
    };
  });

  return {
    order: {
      ...order,
      order_codeword: ensuredCodeword || normalizeOrderCodeword(order.order_codeword || ""),
    },
    lines: enrichedLines,
  };
}

async function generateTicketOrderPdfAttachment(env, site, orderId) {
  const bundle = await getTicketOrderBundle(env, orderId, site);
  const { order, lines } = bundle;

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const left = 46;
  const right = 545;
  const ticketCardHeight = 132;
  const ticketCardGap = 12;
  const ticketCardPadding = 12;
  const ticketQrSize = 104;
  let y = 796;

  const ensureSpace = (needed = 20) => {
    if (y >= 60 + needed) return;
    page = pdfDoc.addPage([595, 842]);
    y = 796;
  };

  const writeLine = (text, { size = 11, boldText = false, color = rgb(0.12, 0.13, 0.16) } = {}) => {
    ensureSpace(size + 8);
    page.drawText(String(text || ""), {
      x: left,
      y,
      size,
      font: boldText ? bold : font,
      color,
      maxWidth: right - left,
      lineHeight: size + 2,
    });
    y -= size + 8;
  };

  page.drawText(site?.brandName || "Tickets", {
    x: left,
    y,
    size: 22,
    font: bold,
    color: rgb(0.08, 0.07, 0.05),
  });
  y -= 30;
  writeLine("Officieel ticketoverzicht", { size: 14, boldText: true, color: rgb(0.45, 0.33, 0.07) });
  writeLine(`Orderreferentie: ${order.id}`);
  writeLine(`Betaling: ${order.stripe_payment_intent_id || "-"}`);
  writeLine(`Naam: ${order.customer_name || "Gast"}`);
  writeLine(`E-mail: ${order.customer_email || "-"}`);
  writeLine(`Totaal betaald: ${formatEuroCents(order.total_paid_cents)}`);
  writeLine(`Servicekosten: ${formatEuroCents(order.service_fee_cents)}`);
  writeLine(`Uitgegeven op: ${formatEventDate(order.created_at)}`);
  y -= 6;

  for (const line of lines) {
    const eventDate =
      line.product?.date || line.product?.datetime || line.product?.show_date || line.product?.event_date || "";
    const venue = String(line.product?.venue || line.product?.location || "").trim();
    const place = String(line.product?.place || line.product?.city || "").trim();
    const doors = String(line.product?.doors_time || line.product?.doors || "").trim();

    writeLine(line.event_name || "Show", { size: 16, boldText: true, color: rgb(0.08, 0.07, 0.05) });
    if (eventDate) writeLine(`Datum: ${formatEventDate(eventDate)}`);
    if (venue || place) writeLine(`Locatie: ${[venue, place].filter(Boolean).join(", ")}`);
    if (doors) writeLine(`Zaal open: ${doors}`);
    writeLine(`Aantal tickets: ${line.quantity}`);
    writeLine(`Prijs per ticket: ${formatEuroCents(line.unit_price_cents)}`);
    y -= 4;

    for (const item of line.items) {
      ensureSpace(ticketCardHeight + ticketCardGap + 6);
      const cardTop = y;
      const cardBottom = y - ticketCardHeight;
      const qrBoxX = right - ticketCardPadding - ticketQrSize;
      const qrBoxY = cardBottom + Math.round((ticketCardHeight - ticketQrSize) / 2);
      const textX = left + ticketCardPadding;
      const textMaxWidth = Math.max(180, qrBoxX - textX - 18);

      page.drawRectangle({
        x: left,
        y: cardBottom,
        width: right - left,
        height: ticketCardHeight,
        borderWidth: 1,
        borderColor: rgb(0.84, 0.77, 0.56),
      });

      page.drawRectangle({
        x: qrBoxX - 4,
        y: qrBoxY - 4,
        width: ticketQrSize + 8,
        height: ticketQrSize + 8,
        color: rgb(1, 1, 1),
        borderWidth: 1,
        borderColor: rgb(0.84, 0.77, 0.56),
      });

      const qrBytes = await buildQrPngBytes(String(item.qr_token || ""));
      if (qrBytes) {
        const qrImage = await pdfDoc.embedPng(qrBytes);
        page.drawImage(qrImage, {
          x: qrBoxX,
          y: qrBoxY,
          width: ticketQrSize,
          height: ticketQrSize,
        });
      }

      page.drawText(`Ticket ${item.ticket_number}`, {
        x: textX,
        y: cardTop - 20,
        size: 12,
        font: bold,
        color: rgb(0.08, 0.07, 0.05),
        maxWidth: textMaxWidth,
      });

      page.drawText(`Status: ${item.status || "issued"}`, {
        x: textX,
        y: cardTop - 38,
        size: 10,
        font,
        color: rgb(0.12, 0.13, 0.16),
        maxWidth: textMaxWidth,
      });

      page.drawText(`Code: ${String(item.qr_token || "").slice(0, 16).toUpperCase()}`, {
        x: textX,
        y: cardTop - 56,
        size: 10,
        font,
        color: rgb(0.12, 0.13, 0.16),
        maxWidth: textMaxWidth,
      });

      page.drawText("Scan de QR-code rechts bij entree.", {
        x: textX,
        y: cardTop - 74,
        size: 9,
        font,
        color: rgb(0.45, 0.33, 0.07),
        maxWidth: textMaxWidth,
      });

      page.drawText(`Volledige scan: ${String(item.qr_token || "")}`, {
        x: textX,
        y: cardTop - 92,
        size: 8,
        font,
        color: rgb(0.32, 0.33, 0.37),
        maxWidth: textMaxWidth,
      });

      y -= ticketCardHeight + ticketCardGap;
    }
    y -= 8;
  }

  writeLine("Neem dit ticket-PDF mee op je telefoon of geprint naar de show.", {
    size: 10,
    color: rgb(0.32, 0.33, 0.37),
  });

  const pdfBytes = await pdfDoc.save();
  const fileName = `${String(site?.brandName || "ticket")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}-${order.id}.pdf`;

  return {
    name: fileName,
    content: bytesToBase64(pdfBytes),
    contentType: "application/pdf",
  };
}

async function buildQrPngBytes(value) {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) return null;

  try {
    const qrDataUrl = await QRCode.toDataURL(normalizedValue, {
      margin: 0,
      width: 256,
      color: {
        dark: "#111111",
        light: "#FFFFFF",
      },
    });
    const qrBase64 = qrDataUrl.split(",")[1] || "";
    return qrBase64 ? Uint8Array.from(Buffer.from(qrBase64, "base64")) : null;
  } catch {
    const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(normalizedValue)}`;
    const response = await fetch(fallbackUrl);
    if (!response.ok) {
      throw new Error(`QR fallback mislukt (${response.status})`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }
}

function normalizeHostname(value) {
  return (value || "").toString().trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

function parseJsonObject(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function buildLegacySiteConfig(env) {
  return {
    key: env.SITE_KEY || DEFAULT_SITE_KEY,
    schemaVersion: Number(env.SCHEMA_VERSION || DEFAULT_SCHEMA_VERSION),
    brandName: env.SITE_NAME || env.BRAND_NAME || "Default Site",
    sheetId: env.SHEET_ID || "",
    ordersRange: env.ORDERS_RANGE || SHEET_RANGE,
    productsRange: env.PRODUCTS_RANGE || PRODUCTS_RANGE_DEFAULT,
    leadsRange: env.LEADS_RANGE || LEADS_RANGE,
    checkoutSuccessUrl: env.CHECKOUT_SUCCESS_URL || "https://example.com/success",
    checkoutCancelUrl: env.CHECKOUT_CANCEL_URL || "https://example.com/cancel",
    googleServiceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
    stripeSecretKeyName: "STRIPE_SECRET_KEY",
    stripeWebhookSecretName: "STRIPE_WEBHOOK_SECRET",
    stripePaymentMethodTypes: null,
    ticketAttachmentMode: "pdf",
    emailProvider: env.EMAIL_PROVIDER || "",
    emailFromAddress: env.EMAIL_FROM_ADDRESS || "",
    emailFromName: env.EMAIL_FROM_NAME || "",
    emailReplyTo: env.EMAIL_REPLY_TO || "",
    brevoApiKeyName: "BREVO_API_KEY",
    mailchannelsApiKeyName: "MAILCHANNELS_API_KEY",
    hostnames: [],
  };
}

function getConfiguredSites(env) {
  const raw = parseJsonObject(env.SITES_JSON);
  if (!raw) {
    const legacy = buildLegacySiteConfig(env);
    return { [legacy.key]: legacy };
  }

  const sites = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!value || typeof value !== "object") continue;
    const siteKey = value.site_key || value.key || key;
    sites[siteKey] = {
      ...buildLegacySiteConfig(env),
      ...value,
      key: siteKey,
      brandName: String(value.brand_name || value.brandName || env.SITE_NAME || env.BRAND_NAME || "Default Site").trim(),
      schemaVersion: Number(value.schema_version || value.schemaVersion || DEFAULT_SCHEMA_VERSION),
      sheetId: value.sheet_id || value.sheetId || env.SHEET_ID || "",
      ordersRange: value.orders_range || value.ordersRange || env.ORDERS_RANGE || SHEET_RANGE,
      productsRange: value.products_range || value.productsRange || env.PRODUCTS_RANGE || PRODUCTS_RANGE_DEFAULT,
      leadsRange: value.leads_range || value.leadsRange || env.LEADS_RANGE || LEADS_RANGE,
      checkoutSuccessUrl:
        value.checkout_success_url || value.checkoutSuccessUrl || env.CHECKOUT_SUCCESS_URL || "https://example.com/success",
      checkoutCancelUrl:
        value.checkout_cancel_url || value.checkoutCancelUrl || env.CHECKOUT_CANCEL_URL || "https://example.com/cancel",
      googleServiceAccountEmail:
        value.google_service_account_email || value.googleServiceAccountEmail || env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
      stripeSecretKeyName:
        value.stripe_secret_key_name || value.stripeSecretKeyName || buildLegacySiteConfig(env).stripeSecretKeyName,
      stripeWebhookSecretName:
        value.stripe_webhook_secret_name ||
        value.stripeWebhookSecretName ||
        buildLegacySiteConfig(env).stripeWebhookSecretName,
      stripePaymentMethodTypes: Array.isArray(value.stripe_payment_method_types || value.stripePaymentMethodTypes)
        ? (value.stripe_payment_method_types || value.stripePaymentMethodTypes)
            .map((entry) => String(entry || "").trim())
            .filter(Boolean)
        : buildLegacySiteConfig(env).stripePaymentMethodTypes,
      ticketAttachmentMode: String(
        value.ticket_attachment_mode ||
          value.ticketAttachmentMode ||
          buildLegacySiteConfig(env).ticketAttachmentMode ||
          "pdf",
      )
        .trim()
        .toLowerCase(),
      emailProvider: String(value.email_provider || value.emailProvider || env.EMAIL_PROVIDER || "").trim().toLowerCase(),
      emailFromAddress: String(value.email_from_address || value.emailFromAddress || env.EMAIL_FROM_ADDRESS || "").trim(),
      emailFromName: String(value.email_from_name || value.emailFromName || env.EMAIL_FROM_NAME || "").trim(),
      emailReplyTo: String(value.email_reply_to || value.emailReplyTo || env.EMAIL_REPLY_TO || "").trim(),
      brevoApiKeyName:
        value.brevo_api_key_name || value.brevoApiKeyName || buildLegacySiteConfig(env).brevoApiKeyName,
      mailchannelsApiKeyName:
        value.mailchannels_api_key_name ||
        value.mailchannelsApiKeyName ||
        buildLegacySiteConfig(env).mailchannelsApiKeyName,
      ticketLinkBaseUrl: String(value.ticket_link_base_url || value.ticketLinkBaseUrl || "").trim(),
      hostnames: Array.isArray(value.hostnames) ? value.hostnames.map(normalizeHostname).filter(Boolean) : [],
    };
  }

  if (Object.keys(sites).length === 0) {
    const legacy = buildLegacySiteConfig(env);
    return { [legacy.key]: legacy };
  }

  return sites;
}

function resolveRequestedSiteKey(req, url) {
  const headerSiteKey = req.headers.get("x-site-key");
  const querySiteKey = url.searchParams.get("site");
  return (querySiteKey || headerSiteKey || "").toString().trim();
}

function resolveRequestHostname(req, url) {
  return normalizeHostname(req.headers.get("x-forwarded-host") || req.headers.get("host") || url.hostname);
}

function resolveSiteContext(req, url, env) {
  const sites = getConfiguredSites(env);
  const requestedSiteKey = resolveRequestedSiteKey(req, url);
  if (requestedSiteKey && sites[requestedSiteKey]) {
    return sites[requestedSiteKey];
  }

  const hostname = resolveRequestHostname(req, url);
  const byHostname = Object.values(sites).find((configuredSite) => configuredSite.hostnames.includes(hostname));
  if (byHostname) return byHostname;

  const defaultSiteKey = env.DEFAULT_SITE_KEY && sites[env.DEFAULT_SITE_KEY] ? env.DEFAULT_SITE_KEY : Object.keys(sites)[0];
  return sites[defaultSiteKey];
}

function resolveSiteContextByKey(env, siteKey) {
  const sites = getConfiguredSites(env);
  return sites[siteKey] || sites[env.DEFAULT_SITE_KEY] || sites[Object.keys(sites)[0]];
}

function resolveDefaultSiteContext(env) {
  return resolveSiteContextByKey(env, env.DEFAULT_SITE_KEY || env.SITE_KEY || DEFAULT_SITE_KEY);
}

function normalizeSecretEnvName(value) {
  return String(value || "")
    .trim()
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function getSiteSecretValue(env, site, preferredName, legacyName) {
  const candidates = [];
  if (preferredName) candidates.push(preferredName);
  const normalizedSiteKey = normalizeSecretEnvName(site?.key);
  if (normalizedSiteKey) candidates.push(`${legacyName}_${normalizedSiteKey}`);
  candidates.push(legacyName);

  for (const key of candidates) {
    const value = env[key];
    if (value) {
      return { key, value };
    }
  }

  throw new Error(`Missing secret ${preferredName || legacyName} for site ${site?.key || DEFAULT_SITE_KEY}`);
}

function getOptionalSiteSecretValue(env, site, preferredName, legacyName) {
  const candidates = [];
  if (preferredName) candidates.push(preferredName);
  const normalizedSiteKey = normalizeSecretEnvName(site?.key);
  if (normalizedSiteKey && legacyName) candidates.push(`${legacyName}_${normalizedSiteKey}`);
  if (legacyName) candidates.push(legacyName);

  for (const key of candidates) {
    const value = env[key];
    if (value) {
      return { key, value };
    }
  }

  return null;
}

function getStripeSecretConfig(env, site = resolveDefaultSiteContext(env)) {
  return getSiteSecretValue(env, site, site?.stripeSecretKeyName, "STRIPE_SECRET_KEY");
}

function getStripeWebhookSecretConfig(env, site = resolveDefaultSiteContext(env)) {
  return getSiteSecretValue(env, site, site?.stripeWebhookSecretName, "STRIPE_WEBHOOK_SECRET");
}

function getAllWebhookSecretCandidates(env) {
  const seen = new Set();
  const candidates = [];

  for (const site of Object.values(getConfiguredSites(env))) {
    try {
      const config = getStripeWebhookSecretConfig(env, site);
      if (!seen.has(config.key)) {
        seen.add(config.key);
        candidates.push({ ...config, site });
      }
    } catch {
      // Skip sites that do not have Stripe configured yet.
    }
  }

  return candidates;
}

function resolveSiteFromStripeObject(env, stripeObject, fallbackSite) {
  const meta = stripeObject?.metadata || {};
  const siteKey = meta.siteKey || meta.site_key || "";
  return resolveSiteContextByKey(env, siteKey) || fallbackSite || resolveDefaultSiteContext(env);
}

function getProductsCacheKey(site) {
  return `products:list:${site.key}`;
}

function buildProductsCacheRequest(reqOrUrl, site) {
  const url = typeof reqOrUrl === "string" ? new URL(reqOrUrl) : new URL(reqOrUrl.url);
  url.searchParams.set("__site", site.key);
  return new Request(url.toString(), { method: "GET" });
}

async function getGoogleAccessToken(env, site = resolveDefaultSiteContext(env)) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claimSet = base64url(
    JSON.stringify({
      iss: site.googleServiceAccountEmail || env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
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

async function appendOrderRow({ token, sheetId, values, site = null }) {
  // Write header row if sheet is empty
  await ensureHeaderRow({ token, sheetId, site });
  const eventId = values?.[7];
  if (eventId) {
    const exists = await orderEventExistsInSheet({ token, sheetId, eventId: String(eventId), site });
    if (exists) return;
  }

  const range = getOrdersRange(site);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
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

function getOrdersRange(site = null) {
  return String(site?.ordersRange || SHEET_RANGE).trim() || SHEET_RANGE;
}

function getOrdersSheetName(site = null) {
  return getOrdersRange(site).split("!")[0] || SHEET_RANGE.split("!")[0];
}

async function appendLeadRow({ token, sheetId, values }) {
  await ensureLeadHeaderRow({ token, sheetId });

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(LEADS_RANGE)}:append?valueInputOption=RAW`,
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
    throw new Error(`Lead append failed (${res.status}): ${text.slice(0, 400)}`);
  }
}

function leadJsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...extraHeaders,
    },
  });
}

function normalizeAndValidateShopUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    const host = String(url.hostname || "").trim();
    if (!host || (!host.includes(".") && host !== "localhost")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function isValidEmail(input) {
  const email = String(input || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getLossPercentFromPerformanceScore(score) {
  if (score == null) return 0;
  if (score >= 90) return 0.03;
  if (score >= 80) return 0.05;
  if (score >= 70) return 0.08;
  if (score >= 60) return 0.12;
  if (score >= 50) return 0.18;
  return 0.25;
}

function formatLeadCurrency(value) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Number(value) || 0));
}

function formatLeadCurrencyFromString(value) {
  const parsed = extractFirstNumber(String(value || "").replace(/\./g, "").replace(/\s/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? formatLeadCurrency(parsed) : "";
}

function extractFirstNumber(value) {
  const match = String(value || "").replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

function normalizeIntegerString(value) {
  const parsed = extractFirstNumber(String(value || "").replace(/\./g, "").replace(/\s/g, ""));
  if (!Number.isFinite(parsed)) return "";
  return String(Math.round(parsed));
}

function normalizeDecimalString(value) {
  const parsed = extractFirstNumber(value);
  if (!Number.isFinite(parsed)) return "";
  return parsed.toFixed(1);
}

function estimatePerformanceScoreFromLoadTime(seconds, strategy) {
  const value = extractFirstNumber(seconds);
  if (!Number.isFinite(value) || value <= 0) return strategy === "desktop" ? 95 : 90;
  const penalty = strategy === "desktop" ? 6 : 9;
  return Math.max(25, Math.min(99, Math.round(100 - value * penalty)));
}

async function fetchPagespeedReport(url, strategy, env) {
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", strategy);
  endpoint.searchParams.set("category", "PERFORMANCE");
  if (env?.PAGESPEED_API_KEY) {
    endpoint.searchParams.set("key", env.PAGESPEED_API_KEY);
  }

  const response = await fetch(endpoint.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Pagespeed ${strategy} failed: ${response.status}`);
  }
  const data = await response.json();
  const lighthouse = data?.lighthouseResult;
  const score = lighthouse?.categories?.performance?.score;
  const audits = lighthouse?.audits || {};

  return {
    score: typeof score === "number" ? Math.round(score * 100) : null,
    lcp: audits["largest-contentful-paint"]?.displayValue || "",
    fcp: audits["first-contentful-paint"]?.displayValue || "",
    tbt: audits["total-blocking-time"]?.displayValue || "",
  };
}

async function buildPagespeedSummary(shopUrl, monthlyRevenueRaw, currentLoadTimeRaw, env) {
  const currentLoadTime = extractFirstNumber(currentLoadTimeRaw);
  try {
    const [mobile, desktop] = await Promise.all([
      fetchPagespeedReport(shopUrl, "mobile", env),
      fetchPagespeedReport(shopUrl, "desktop", env),
    ]);
    const monthlyRevenue = extractFirstNumber(String(monthlyRevenueRaw).replace(/\./g, "").replace(/\s/g, ""));
    const lossPercent = getLossPercentFromPerformanceScore(mobile.score);
    const scoreEstimatedLoss =
      Number.isFinite(monthlyRevenue) && monthlyRevenue > 0 ? String(Math.round(monthlyRevenue * lossPercent)) : "";
    const parts = [
      mobile.score != null ? `Mobiel: ${mobile.score}/100` : "",
      desktop.score != null ? `Desktop: ${desktop.score}/100` : "",
      mobile.lcp ? `LCP mobiel: ${mobile.lcp}` : "",
      mobile.fcp ? `FCP mobiel: ${mobile.fcp}` : "",
      mobile.tbt ? `TBT mobiel: ${mobile.tbt}` : "",
    ].filter(Boolean);
    return {
      mobilePerformanceScore: mobile.score != null ? String(mobile.score) : "",
      desktopPerformanceScore: desktop.score != null ? String(desktop.score) : "",
      scoreEstimatedLoss,
      pagespeedSummary: parts.join(" | "),
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("Pagespeed fetch failed:", reason);
    const mobileEstimated = estimatePerformanceScoreFromLoadTime(currentLoadTime, "mobile");
    const desktopEstimated = estimatePerformanceScoreFromLoadTime(currentLoadTime, "desktop");
    const monthlyRevenue = extractFirstNumber(String(monthlyRevenueRaw).replace(/\./g, "").replace(/\s/g, ""));
    const lossPercent = getLossPercentFromPerformanceScore(mobileEstimated);
    return {
      mobilePerformanceScore: String(mobileEstimated),
      desktopPerformanceScore: String(desktopEstimated),
      scoreEstimatedLoss:
        Number.isFinite(monthlyRevenue) && monthlyRevenue > 0 ? String(Math.round(monthlyRevenue * lossPercent)) : "",
      pagespeedSummary: reason ? `Pagespeed unavailable: ${reason}. Estimated from current load time.` : "Pagespeed unavailable. Estimated from current load time.",
    };
  }
}

function escapeLeadHtml(value) {
  return String(value || "").replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&#39;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });
}

async function sendLeadNotificationEmail({
  leadType,
  name,
  email,
  message,
  phone,
  shopUrl,
  monthlyRevenue,
  currentLoadTime,
  estimatedLoss,
  mobilePerformanceScore,
  desktopPerformanceScore,
  scoreEstimatedLoss,
  pagespeedSummary,
  flowVersion,
}) {
  const subject =
    leadType === "calculator"
      ? `Nieuwe calculator lead: ${shopUrl || name || "-"}`
      : leadType === "migration"
        ? `Nieuwe migratie-check: ${name || shopUrl || "-"}`
        : `Nieuw contactbericht van ${name || "-"}`;
  const textBody = [
    `Type: ${leadType || "-"}`,
    `Naam: ${name || "-"}`,
    `E-mail: ${email || "-"}`,
    `Telefoon: ${phone || "-"}`,
    `Shop URL: ${shopUrl || "-"}`,
    `Maandelijkse omzet: ${monthlyRevenue || "-"}`,
    `Huidige laadtijd: ${currentLoadTime || "-"}`,
    `Geschat verlies p/m: ${estimatedLoss || "-"}`,
    `Mobiele score: ${mobilePerformanceScore || "-"}`,
    `Desktop score: ${desktopPerformanceScore || "-"}`,
    `Geschat verlies op score: ${scoreEstimatedLoss || "-"}`,
    `Pagespeed samenvatting: ${pagespeedSummary || "-"}`,
    `Flow versie: ${flowVersion || "-"}`,
    "",
    message || "-",
  ].join("\n");
  const htmlBody = [
    `<p><strong>Type:</strong> ${escapeLeadHtml(leadType || "-")}</p>`,
    `<p><strong>Naam:</strong> ${escapeLeadHtml(name || "-")}</p>`,
    `<p><strong>E-mail:</strong> ${escapeLeadHtml(email || "-")}</p>`,
    `<p><strong>Telefoon:</strong> ${escapeLeadHtml(phone || "-")}</p>`,
    `<p><strong>Shop URL:</strong> ${escapeLeadHtml(shopUrl || "-")}</p>`,
    `<p><strong>Maandelijkse omzet:</strong> ${escapeLeadHtml(monthlyRevenue || "-")}</p>`,
    `<p><strong>Huidige laadtijd:</strong> ${escapeLeadHtml(currentLoadTime || "-")}</p>`,
    `<p><strong>Geschat verlies p/m:</strong> ${escapeLeadHtml(estimatedLoss || "-")}</p>`,
    `<p><strong>Mobiele score:</strong> ${escapeLeadHtml(mobilePerformanceScore || "-")}</p>`,
    `<p><strong>Desktop score:</strong> ${escapeLeadHtml(desktopPerformanceScore || "-")}</p>`,
    `<p><strong>Geschat verlies op score:</strong> ${escapeLeadHtml(scoreEstimatedLoss || "-")}</p>`,
    `<p><strong>Pagespeed samenvatting:</strong> ${escapeLeadHtml(pagespeedSummary || "-")}</p>`,
    `<p><strong>Flow versie:</strong> ${escapeLeadHtml(flowVersion || "-")}</p>`,
    `<p><strong>Bericht:</strong><br>${escapeLeadHtml(message || "-").replace(/\n/g, "<br>")}</p>`,
  ].join("");

  const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: LEAD_NOTIFY_EMAIL }] }],
      from: { email: LEAD_FROM_EMAIL, name: LEAD_FROM_NAME },
      reply_to: email ? { email, name: name || email } : undefined,
      subject,
      content: [
        { type: "text/plain", value: textBody },
        { type: "text/html", value: htmlBody },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mail send failed (${response.status}): ${text.slice(0, 400)}`);
  }
}

async function handleLeadSubmit(req, env, site = resolveDefaultSiteContext(env)) {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return leadJsonResponse({ message: "Invalid JSON", detail: String(error) }, 400);
  }

  const leadType = String(body?.leadType ?? "contact").trim().toLowerCase();
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? body?.["E-mail"] ?? "").trim();
  const message = String(body?.message ?? "").trim();
  const honeypot = String(body?.company ?? "").trim();
  const phone = String(body?.phone ?? body?.Telefoon ?? "").trim();
  const shopUrl = normalizeAndValidateShopUrl(String(body?.shopUrl ?? body?.URL ?? "").trim());
  const monthlyRevenue = String(body?.monthlyRevenue ?? body?.["Maandelijkse Omzet"] ?? "").trim();
  const currentLoadTime = String(body?.currentLoadTime ?? body?.["Huidige Laadtijd"] ?? "").trim();
  const estimatedLoss = String(body?.estimatedLoss ?? body?.["Geschat Verlies"] ?? "").trim();
  const normalizedMonthlyRevenue = normalizeIntegerString(monthlyRevenue);
  const normalizedCurrentLoadTime = normalizeDecimalString(currentLoadTime);
  const normalizedEstimatedLoss = normalizeIntegerString(estimatedLoss);
  const flowVersion = LEAD_FLOW_VERSION;

  let mobilePerformanceScore = "";
  let desktopPerformanceScore = "";
  let scoreEstimatedLoss = "";
  let pagespeedSummary = "";

  if (honeypot) {
    return leadJsonResponse({ message: "Received" });
  }

  const isCalculatorLead = leadType === "calculator";
  const isSoldOutInterestLead = leadType === "sold_out_interest";
  if (isCalculatorLead) {
    if (!shopUrl || !isValidEmail(email)) {
      return leadJsonResponse({ message: "Validation failed" }, 400);
    }

    const pagespeed = await buildPagespeedSummary(shopUrl, monthlyRevenue, currentLoadTime, env);
    mobilePerformanceScore = pagespeed.mobilePerformanceScore;
    desktopPerformanceScore = pagespeed.desktopPerformanceScore;
    scoreEstimatedLoss = pagespeed.scoreEstimatedLoss;
    pagespeedSummary = pagespeed.pagespeedSummary;
  } else if (isSoldOutInterestLead) {
    if (!message || (email && !isValidEmail(email))) {
      return leadJsonResponse({ message: "Validation failed" }, 400);
    }
  } else if (!name || !email || !message) {
    return leadJsonResponse({ message: "Validation failed" }, 400);
  }

  const resolvedName =
    isCalculatorLead ? name || "Calculator lead" : isSoldOutInterestLead ? name || "Sold-out interest" : name;
  const resolvedMessage =
    isCalculatorLead && !message
      ? [
          "Calculator lead aanvraag",
          `Shop URL: ${shopUrl || "-"}`,
          `Telefoon: ${phone || "-"}`,
          `E-mail: ${email || "-"}`,
          `Maandelijkse omzet: ${monthlyRevenue || "-"}`,
          `Huidige laadtijd: ${currentLoadTime || "-"}`,
          `Geschat omzetverlies p/m: ${estimatedLoss || "-"}`,
          `Mobiele Lighthouse score: ${mobilePerformanceScore ? `${mobilePerformanceScore}/100` : "-"}`,
          `Desktop Lighthouse score: ${desktopPerformanceScore ? `${desktopPerformanceScore}/100` : "-"}`,
          `Geschat omzetverlies p/m op basis van live score: ${scoreEstimatedLoss || "-"}`,
          `Pagespeed samenvatting: ${pagespeedSummary || "-"}`,
          `Flow versie: ${flowVersion}`,
        ].join("\n")
      : message;

  try {
    const token = await getGoogleAccessToken(env, site);
    await appendLeadRow({
      token,
      sheetId: site.sheetId,
      values: [
        new Date().toISOString(),
        resolvedName,
        email,
        resolvedMessage,
        leadType,
        phone,
        shopUrl,
        normalizedMonthlyRevenue,
        normalizedCurrentLoadTime,
        normalizedEstimatedLoss,
        mobilePerformanceScore,
        desktopPerformanceScore,
        scoreEstimatedLoss,
        pagespeedSummary,
        flowVersion,
      ],
    });
    try {
      await sendLeadNotificationEmail({
        leadType,
        name: resolvedName,
        email,
        message: resolvedMessage,
        phone,
        shopUrl,
        monthlyRevenue: normalizedMonthlyRevenue,
        currentLoadTime: normalizedCurrentLoadTime,
        estimatedLoss: normalizedEstimatedLoss,
        mobilePerformanceScore,
        desktopPerformanceScore,
        scoreEstimatedLoss,
        pagespeedSummary,
        flowVersion,
      });
    } catch (mailError) {
      console.error("Lead notify mail failed:", mailError instanceof Error ? mailError.message : String(mailError));
    }
  } catch (error) {
    return leadJsonResponse({ message: "Delivery failed", detail: String(error) }, 502);
  }

  return leadJsonResponse({
    message: "Received",
    analysis: isCalculatorLead
      ? {
          mobilePerformanceScore,
          desktopPerformanceScore,
          estimatedLoss,
          scoreEstimatedLoss,
          estimatedLossFormatted: formatLeadCurrencyFromString(normalizedEstimatedLoss),
          scoreEstimatedLossFormatted: formatLeadCurrencyFromString(scoreEstimatedLoss),
          pagespeedSummary,
          usedFallback: pagespeedSummary.toLowerCase().includes("pagespeed unavailable"),
        }
      : null,
  });
}

async function orderEventExistsInSheet({ token, sheetId, eventId, site = null }) {
  const columnRange = `${getOrdersSheetName(site)}!H:H`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(columnRange)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return false;
  const data = await res.json();
  const values = Array.isArray(data?.values) ? data.values.flat() : [];
  return values.includes(eventId);
}

async function ensureLeadHeaderRow({ token, sheetId }) {
  const range = `${LEADS_RANGE.split("!")[0]}!A1:O1`;
  const requiredHeaders = [[
    "timestamp",
    "Naam",
    "Email",
    "Bericht",
    "leadType",
    "phone",
    "shopUrl",
    "monthlyRevenue",
    "currentLoadTime",
    "estimatedLoss",
    "mobilePerformanceScore",
    "desktopPerformanceScore",
    "scoreEstimatedLoss",
    "pagespeedSummary",
    "flowVersion",
  ]];

  try {
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!readRes.ok) {
      const text = await readRes.text();
      throw new Error(`Lead header read failed (${readRes.status}): ${text.slice(0, 400)}`);
    }
    const readData = await readRes.json().catch(() => ({}));
    const existing = Array.isArray(readData?.values) && readData.values.length > 0 ? readData.values[0] : [];
    const needsWrite =
      existing.length < requiredHeaders[0].length ||
      requiredHeaders[0].some((header, index) => !String(existing[index] || "").trim());

    if (!needsWrite) return;

    const writeRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: requiredHeaders }),
      },
    );
    if (!writeRes.ok) {
      const text = await writeRes.text();
      throw new Error(`Lead header write failed (${writeRes.status}): ${text.slice(0, 400)}`);
    }
  } catch {
    // Allow append attempt even if header sync fails.
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

async function ensureHeaderRow({ token, sheetId, site = null }) {
  try {
    const sheetName = getOrdersSheetName(site);
    const range = `${sheetName}!A1:H1`;
    await ensureSheetExists({ token, sheetId, sheetName });
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    const hasHeader = Array.isArray(data?.values) && data.values.length > 0;
    if (hasHeader) return;
    const headerValues = [["Datum/Tijd", "Naam", "Email", "Adres", "ProductID", "Bedrag", "Transactie", "StripeEventId"]];
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

async function ensureSheetExists({ token, sheetId, sheetName }) {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties.title`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    const sheets = Array.isArray(data?.sheets) ? data.sheets : [];
    const exists = sheets.some((sheet) => String(sheet?.properties?.title || "").trim() === sheetName);
    if (exists) return;

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        }),
      },
    );
  } catch {
    // ignore; header write will fail later if sheet cannot be created
  }
}

function getOrdersKV(env) {
  const kv = env.ORDERS_BUFFER || env.PRODUCTS_CACHE;
  if (!kv) throw new Error("No KV binding found for order buffering (ORDERS_BUFFER or PRODUCTS_CACHE).");
  return kv;
}

function getRetryBaseMs(env) {
  const value = Number(env.ORDER_SYNC_RETRY_BASE_MS || DEFAULT_RETRY_BASE_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_RETRY_BASE_MS;
}

function getOrderTtlSeconds(env) {
  const value = Number(env.ORDER_TTL_SECONDS || DEFAULT_ORDER_TTL_SECONDS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_ORDER_TTL_SECONDS;
}

function getOrderSyncIdleScanMs(env) {
  const value = Number(env.ORDER_SYNC_IDLE_SCAN_MS || DEFAULT_IDLE_SCAN_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_IDLE_SCAN_MS;
}

function getOrderSyncContinueScanMs(env) {
  const value = Number(env.ORDER_SYNC_CONTINUE_SCAN_MS || DEFAULT_CONTINUE_SCAN_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_CONTINUE_SCAN_MS;
}

function computeNextAttemptAt(attempts, env) {
  const base = getRetryBaseMs(env);
  const delay = Math.min(base * Math.pow(2, Math.max(0, attempts - 1)), MAX_RETRY_DELAY_MS);
  return Date.now() + delay;
}

function buildOrderRecordFromStripeEvent(eventId, session, site = null) {
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
  const siteKey = meta.siteKey || meta.site_key || site?.key || DEFAULT_SITE_KEY;

  return {
    key: `${ORDER_KEY_PREFIX}${eventId}`,
    eventId,
    sessionId: session.id,
    siteKey,
    status: ORDER_STATUS_PENDING,
    attempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nextAttemptAt: Date.now(),
    order: {
      orderDatetime,
      customerName: customer?.name || "Anoniem",
      customerEmail: customer?.email || "Geen e-mail",
      address,
      productId,
      amountTotal,
      transactionId,
      eventId,
    },
  };
}

function buildOrderRecordFromPaymentIntent(eventId, paymentIntent, site = null) {
  const latestCharge = paymentIntent.latest_charge;
  const billing =
    latestCharge && typeof latestCharge === "object" && latestCharge.billing_details
      ? latestCharge.billing_details
      : null;
  const address = billing?.address
    ? `${billing.address.line1 ?? ""} ${billing.address.line2 ?? ""}, ${billing.address.postal_code ?? ""} ${billing.address.city ?? ""}, ${billing.address.country ?? ""}`.trim()
    : "";
  const orderDatetime = new Date().toLocaleString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const meta = paymentIntent.metadata || {};
  const productId = meta.productId || meta.ProductID || "N/A";
  const amountTotal = (paymentIntent.amount_received ?? paymentIntent.amount ?? 0) / 100;
  const transactionId = paymentIntent.id;
  const siteKey = meta.siteKey || meta.site_key || site?.key || DEFAULT_SITE_KEY;

  return {
    key: `${ORDER_KEY_PREFIX}${paymentIntent.id}`,
    eventId,
    sessionId: paymentIntent.id,
    siteKey,
    status: ORDER_STATUS_PENDING,
    attempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nextAttemptAt: Date.now(),
    order: {
      orderDatetime,
      customerName: billing?.name || "Anoniem",
      customerEmail: billing?.email || meta.customerEmail || "Geen e-mail",
      address,
      productId,
      amountTotal,
      transactionId,
      eventId,
    },
  };
}

async function issueTicketsFromPaymentIntent(env, paymentIntent, site = resolveDefaultSiteContext(env)) {
  const db = getTicketsDb(env);
  if (!db) return { ok: false, skipped: true, reason: "tickets_db_missing" };

  const siteKey = String(paymentIntent?.metadata?.siteKey || paymentIntent?.metadata?.site_key || site?.key || DEFAULT_SITE_KEY).trim();
  const paymentIntentId = String(paymentIntent?.id || "").trim();
  if (!paymentIntentId) throw new Error("payment_intent_id ontbreekt voor ticket issuance");

  const orderId = `ticket_order_${paymentIntentId}`;
  const existingOrder = await db
    .prepare(`SELECT id, fulfillment_status FROM ticket_orders WHERE site_key = ? AND stripe_payment_intent_id = ? LIMIT 1`)
    .bind(siteKey, paymentIntentId)
    .first();
  if (existingOrder?.id) {
    const existingTicketCountResult = await db
      .prepare(`SELECT COUNT(*) AS count FROM ticket_items WHERE order_id = ?`)
      .bind(existingOrder.id)
      .first();
    const existingTicketCount = Number(existingTicketCountResult?.count || 0) || 0;
    if (existingTicketCount > 0) {
      return { ok: true, skipped: true, orderId: existingOrder.id, reason: "already_issued" };
    }
  }

  const checkoutContext = await getTicketCheckoutContext(env, paymentIntentId);
  if (!checkoutContext || !Array.isArray(checkoutContext.cart) || checkoutContext.cart.length === 0) {
    throw new Error(`Geen checkoutcontext gevonden voor ${paymentIntentId}`);
  }

  const normalizedCart = normalizeTicketCart(checkoutContext.cart);
  if (normalizedCart.length === 0) {
    throw new Error(`Geen geldige ticketregels gevonden voor ${paymentIntentId}`);
  }

  const latestCharge = paymentIntent.latest_charge;
  const billing =
    latestCharge && typeof latestCharge === "object" && latestCharge.billing_details
      ? latestCharge.billing_details
      : null;
  const customerName = String(billing?.name || paymentIntent.metadata?.customerName || "Gast").trim() || "Gast";
  const customerEmail = String(billing?.email || checkoutContext.customerEmail || paymentIntent.metadata?.customerEmail || "").trim();
  const stripeChargeId =
    latestCharge && typeof latestCharge === "object" && latestCharge.id ? String(latestCharge.id).trim() : "";
  const ticketSubtotalCents = normalizedCart.reduce((sum, item) => sum + item.amountCents * item.quantity, 0);
  const serviceFeeCents = Math.max(0, Number(paymentIntent.metadata?.serviceFeeAmount || 0) * 100) || calculateServiceFeeCents(normalizedCart);
  const totalPaidCents = Math.max(
    0,
    Number(paymentIntent.amount_received || paymentIntent.amount || ticketSubtotalCents + serviceFeeCents) || 0,
  );
  const quantityTotal = normalizedCart.reduce((sum, item) => sum + item.quantity, 0);
  const now = new Date().toISOString();

  const initialOrderCodeword = generateOrderCodewordCandidate();

  await db
    .prepare(
      `INSERT OR IGNORE INTO ticket_orders
        (id, site_key, stripe_payment_intent_id, stripe_charge_id, customer_email, customer_name, order_codeword, currency, ticket_subtotal_cents, service_fee_cents, total_paid_cents, quantity_total, payment_status, fulfillment_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      orderId,
      siteKey,
      paymentIntentId,
      stripeChargeId || null,
      customerEmail || null,
      customerName || null,
      initialOrderCodeword || null,
      String(paymentIntent.currency || "eur").toLowerCase(),
      ticketSubtotalCents,
      serviceFeeCents,
      totalPaidCents,
      quantityTotal,
      String(paymentIntent.status || "succeeded").trim() || "succeeded",
      "issued",
      now,
      now,
    )
    .run();

  const orderCodeword = await ensureTicketOrderCodeword(db, siteKey, orderId, initialOrderCodeword);

  for (let lineIndex = 0; lineIndex < normalizedCart.length; lineIndex += 1) {
    const item = normalizedCart[lineIndex];
    const lineId = `${orderId}_line_${lineIndex + 1}`;
    await db
      .prepare(
        `INSERT OR IGNORE INTO ticket_order_lines
          (id, site_key, order_id, event_product_id, event_slug, event_name, unit_price_cents, quantity, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        lineId,
        siteKey,
        orderId,
        item.id,
        item.slug || item.id,
        item.name,
        item.amountCents,
        item.quantity,
        now,
        now,
      )
      .run();

    for (let ticketIndex = 0; ticketIndex < item.quantity; ticketIndex += 1) {
      const ticketId = `${lineId}_ticket_${ticketIndex + 1}`;
      const qrToken = await buildDeterministicQrToken(env, siteKey, paymentIntentId, lineIndex + 1, ticketIndex + 1);
      const qrHash = await sha256Hex(qrToken);
      await db
        .prepare(
          `INSERT OR IGNORE INTO ticket_items
            (id, site_key, order_id, order_line_id, event_product_id, event_slug, event_name, ticket_number, holder_name, holder_email, qr_token, qr_hash, status, issued_at, checked_in_at, checked_in_by, refunded_at, cancelled_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          ticketId,
          siteKey,
          orderId,
          lineId,
          item.id,
          item.slug || item.id,
          item.name,
          ticketIndex + 1,
          customerName || null,
          customerEmail || null,
          qrToken,
          qrHash,
          "issued",
          now,
          null,
          null,
          null,
          null,
          now,
          now,
        )
        .run();
    }
  }

  if (customerEmail) {
    const eventCatalog = await getEventCatalogByIds(
      env,
      site,
      normalizedCart.map((item) => item.id),
    );
    const firstCartLine = normalizedCart[0] || null;
    const firstEventDetails = buildTicketEmailEventDetails(
      firstCartLine?.name || "",
      firstCartLine ? eventCatalog.get(String(firstCartLine.id || "").trim()) || null : null,
    );
    const firstEventSlug = String(firstCartLine?.slug || firstCartLine?.id || "").trim();

    await queueTicketOrderEmail(env, {
      site,
      orderId,
      eventProductId: normalizedCart[0]?.id || "",
      recipientEmail: customerEmail,
      recipientName: customerName,
      locale: getDefaultTicketEmailLocale(env),
      context: {
        customerName,
        orderId,
        orderCodeword,
        quantityTotal,
        eventNames: normalizedCart.map((item) => item.name),
        totalPaidCents,
        eventCount: normalizedCart.length,
        eventSlug: firstEventSlug,
        eventPageUrl: firstEventSlug ? buildEventPageUrl(env, site, firstEventSlug) : "",
        eventPlace: firstEventDetails.eventPlace,
        eventDate: firstEventDetails.eventDate,
        showStartTime: firstEventDetails.showStartTime,
        doorsOpenTime: firstEventDetails.doorsOpenTime,
      },
    });
  }

  return { ok: true, orderId, quantityTotal };
}

async function insertTicketEmailOutboxItem(env, item) {
  const db = getTicketsDb(env);
  if (!db) throw new Error("TICKETS_DB binding ontbreekt");
  await db
    .prepare(
      `INSERT OR IGNORE INTO ticket_email_outbox
        (id, site_key, order_id, event_product_id, recipient_email, template_key, subject_resolved, body_html_resolved, attachments_json, status, provider, provider_message_id, error_message, send_after_at, sent_at, failed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      item.id,
      item.siteKey,
      item.orderId,
      item.eventProductId || null,
      item.recipientEmail,
      item.templateKey,
      item.subjectResolved,
      item.bodyHtmlResolved,
      item.attachmentsJson,
      item.status,
      item.provider || null,
      item.providerMessageId || null,
      item.errorMessage || null,
      item.sendAfterAt,
      item.sentAt || null,
      item.failedAt || null,
      item.createdAt,
      item.updatedAt,
    )
    .run();
}

async function insertTicketEmailLog(env, log) {
  const db = getTicketsDb(env);
  if (!db) throw new Error("TICKETS_DB binding ontbreekt");
  await db
    .prepare(
      `INSERT INTO ticket_email_log
        (id, site_key, email_outbox_id, action, payload_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(log.id, log.siteKey, log.emailOutboxId, log.action, log.payloadJson || null, log.createdAt)
    .run();
}

async function listPendingTicketEmailOutbox(env, limit = 20) {
  const db = getTicketsDb(env);
  if (!db) return [];
  const result = await db
    .prepare(
      `SELECT *
       FROM ticket_email_outbox
       WHERE status = 'pending' AND send_after_at <= ?
       ORDER BY send_after_at ASC
       LIMIT ?`,
    )
    .bind(new Date().toISOString(), limit)
    .all();
  return Array.isArray(result?.results) ? result.results : [];
}

async function updateTicketEmailOutboxItem(env, item) {
  const db = getTicketsDb(env);
  if (!db) throw new Error("TICKETS_DB binding ontbreekt");
  await db
    .prepare(
      `UPDATE ticket_email_outbox
       SET status = ?, provider = ?, provider_message_id = ?, error_message = ?, sent_at = ?, failed_at = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      item.status,
      item.provider || null,
      item.providerMessageId || null,
      item.errorMessage || null,
      item.sentAt || null,
      item.failedAt || null,
      item.updatedAt,
      item.id,
    )
    .run();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTicketEmailTemplate({ site, locale, context }) {
  const isEn = String(locale || "nl").toLowerCase() === "en";
  const siteKey = String(site?.key || "").trim().toLowerCase();
  const customerNameText = String(context.customerName || (isEn ? "there" : "daar")).trim() || (isEn ? "there" : "daar");
  const customerName = escapeHtml(customerNameText);
  const eventNamesRaw = Array.isArray(context.eventNames)
    ? context.eventNames.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
  const eventNames = eventNamesRaw.map((value) => escapeHtml(value)).join(", ");
  const totalFormatted = formatEuroCents(context.totalPaidCents);
  const eventPlaceText = String(context.eventPlace || "").trim();
  const eventDateText = String(context.eventDate || "").trim();
  const showStartTimeText = String(context.showStartTime || "").trim();
  const doorsOpenTimeText = String(context.doorsOpenTime || "").trim();
  const eventPlace = escapeHtml(eventPlaceText);
  const eventDate = escapeHtml(eventDateText);
  const showStartTime = escapeHtml(showStartTimeText);
  const doorsOpenTime = escapeHtml(doorsOpenTimeText);
  const eventPageUrlText = String(context.eventPageUrl || "").trim();
  const eventPageUrl = escapeHtml(eventPageUrlText);
  const orderCodeword = normalizeOrderCodeword(context.orderCodeword || "");
  const safeOrderCodeword = escapeHtml(orderCodeword || "");
  const fallbackCodewordHtml = orderCodeword
    ? `<p><strong>Codewoord (fallback check-in):</strong> <code style="padding:2px 6px;border-radius:6px;background:#111827;color:#fbbf24">${safeOrderCodeword}</code></p>`
    : "";
  const fallbackCodewordText = orderCodeword ? ` Codewoord (fallback check-in): ${orderCodeword}.` : "";
  const whereWhenHtmlParts = [];
  if (eventPlace) whereWhenHtmlParts.push(`in ${eventPlace}`);
  if (eventDate) whereWhenHtmlParts.push(`op ${eventDate}`);
  const whereWhenHtml = whereWhenHtmlParts.length > 0 ? ` ${whereWhenHtmlParts.join(" ")}` : "";
  const whereWhenTextParts = [];
  if (eventPlaceText) whereWhenTextParts.push(`in ${eventPlaceText}`);
  if (eventDateText) whereWhenTextParts.push(`op ${eventDateText}`);
  const whereWhenText = whereWhenTextParts.length > 0 ? ` ${whereWhenTextParts.join(" ")}` : "";

  if (!isEn && siteKey === "rolexbugatti") {
    const locationHtml = eventPlace ? `<p><strong>Locatie:</strong> ${eventPlace}</p>` : "";
    const locationText = eventPlaceText ? ` Locatie: ${eventPlaceText}.` : "";
    const scheduleHtml =
      showStartTime || doorsOpenTime
        ? `<p><strong>Show begint om:</strong> ${showStartTime || "-"}<br/><strong>Zaal open om:</strong> ${doorsOpenTime || "-"}</p>`
        : "";
    const scheduleText =
      showStartTimeText || doorsOpenTimeText
        ? ` Show begint om: ${showStartTimeText || "-"}. Zaal open om: ${doorsOpenTimeText || "-"}.`
        : "";
    const codewordHtml = orderCodeword
      ? `<p><strong>Codewoord:</strong><br/><code style="display:inline-block;padding:4px 8px;border-radius:8px;background:#111827;color:#fbbf24">${safeOrderCodeword}</code></p>`
      : `<p>Geen codewoord beschikbaar? Deel in dat geval de ticketlink direct met je gasten.</p>`;
    const codewordText = orderCodeword
      ? ` Codewoord: ${orderCodeword}.`
      : " Geen codewoord beschikbaar? Deel in dat geval de ticketlink direct met je gasten.";
    const eventPageHtml = eventPageUrl
      ? `<p><strong>Eventpagina:</strong> <a href="${eventPageUrl}">${eventPageUrl}</a></p>`
      : "";
    const eventPageText = eventPageUrlText ? ` Eventpagina: ${eventPageUrlText}.` : "";

    return {
      subject: "Je tickets voor Rolex Bugatti Live",
      html:
        `<p>Hey ${customerName},</p>` +
        `<p>Leuk dat je naar de Rolex Bugatti Live show komt${whereWhenHtml}.</p>` +
        `<p><strong>Show:</strong> ${eventNames || "Rolex Bugatti Live"}</p>` +
        locationHtml +
        scheduleHtml +
        eventPageHtml +
        `<p>Heb er zin in. Zie je daar!</p>` +
        `<p>Op de knop hieronder vind je je tickets:</p>` +
        `<p style="margin:12px 0 10px 0"><a data-ticket-main-cta href="${TICKET_ACCESS_URL_PLACEHOLDER}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#fbbf24;color:#111827;text-decoration:none;font-weight:700">Open je tickets</a></p>` +
        `<p style="margin:0 0 14px 0;font-size:13px;color:#475569">Werkt de knop niet? Gebruik deze link: <a href="${TICKET_ACCESS_URL_PLACEHOLDER}">${TICKET_ACCESS_URL_PLACEHOLDER}</a></p>` +
        `<p>Kom je niet tegelijk aan? Geef gasten die later komen simpelweg dit codewoord:</p>` +
        codewordHtml +
        `<p>Of deel het ticket per e-mail via de ticketpagina: klik op de ticketknop en scroll naar beneden.</p>` +
        `<p><strong>Orderreferentie:</strong> ${escapeHtml(context.orderId || "")}</p>` +
        `<p>Met vriendelijke groet,<br/>Rolex Bugatti</p>`,
      text:
        `Hey ${customerNameText}, leuk dat je naar de Rolex Bugatti Live show komt${whereWhenText}.` +
        ` Show: ${eventNamesRaw.join(", ") || "Rolex Bugatti Live"}.` +
        locationText +
        scheduleText +
        eventPageText +
        ` Heb er zin in. Zie je daar!` +
        ` Op de knop hieronder vind je je tickets: ${TICKET_ACCESS_URL_PLACEHOLDER}. Werkt de knop niet? Gebruik dezelfde link als fallback.` +
        ` Kom je niet tegelijk aan? Geef gasten die later komen simpelweg dit codewoord.${codewordText}` +
        ` Of deel het ticket per e-mail via de ticketpagina: klik op de ticketknop en scroll naar beneden.` +
        ` Orderreferentie: ${context.orderId || ""}.` +
        ` Met vriendelijke groet, Rolex Bugatti`,
    };
  }

  if (isEn) {
    return {
      subject: "Your tickets for Rolex Bugatti Live",
      html: `<p>Hey ${customerName},</p><p>Great that you're coming to the show. Looking forward to it!</p><p><strong>Show:</strong> ${eventNames || "Rolex Bugatti Live"}</p><p><strong>Tickets:</strong> ${context.quantityTotal || 0}</p><p><strong>Total paid:</strong> ${totalFormatted}</p><p>Order reference: ${escapeHtml(context.orderId || "")}</p><p>Not arriving together? Open the ticket link and forward tickets by email.</p>${fallbackCodewordHtml}<p>Best regards,<br/>Rolex Bugatti</p>`,
      text: `Hey ${context.customerName || "there"}, great that you're coming to the show. Looking forward to it! Show: ${context.eventNames?.join(", ") || "Rolex Bugatti Live"}. Tickets: ${context.quantityTotal || 0}. Total paid: ${totalFormatted}. Order reference: ${context.orderId || ""}. Not arriving together? Open the ticket link and forward tickets by email.${fallbackCodewordText} Best regards, Rolex Bugatti`,
    };
  }

  return {
    subject: "Je tickets voor Rolex Bugatti Live",
    html: `<p>Hey ${customerName},</p><p>Leuk dat je naar de show komt. Heb er zin in!</p><p><strong>Show:</strong> ${eventNames || "Rolex Bugatti Live"}</p><p><strong>Aantal tickets:</strong> ${context.quantityTotal || 0}</p><p><strong>Totaal betaald:</strong> ${totalFormatted}</p><p>Orderreferentie: ${escapeHtml(context.orderId || "")}</p><p>Kom je niet tegelijk aan? Open je ticketlink en stuur tickets door per e-mail.</p>${fallbackCodewordHtml}<p>Je gasten kunnen dit codewoord ook bij de scanner noemen voor handmatige check-in.</p><p>Mvg,<br/>Rolex Bugatti</p>`,
    text: `Hey ${context.customerName || "daar"}, leuk dat je naar de show komt. Heb er zin in! Show: ${context.eventNames?.join(", ") || "Rolex Bugatti Live"}. Aantal tickets: ${context.quantityTotal || 0}. Totaal betaald: ${totalFormatted}. Orderreferentie: ${context.orderId || ""}. Kom je niet tegelijk aan? Open je ticketlink en stuur tickets door per e-mail.${fallbackCodewordText} Je gasten kunnen dit codewoord ook bij de scanner noemen voor handmatige check-in. Mvg, Rolex Bugatti`,
  };
}

async function queueTicketOrderEmail(env, { site, orderId, eventProductId, recipientEmail, recipientName, locale, context }) {
  return queueTicketOrderEmailInternal(env, {
    site,
    orderId,
    eventProductId,
    recipientEmail,
    recipientName,
    locale,
    context,
    forceNew: false,
    logAction: "queued",
  });
}

async function queueTicketOrderEmailInternal(
  env,
  { site, orderId, eventProductId, recipientEmail, recipientName, locale, context, forceNew = false, logAction = "queued" },
) {
  if (!recipientEmail) return null;
  const db = getTicketsDb(env);
  if (!db) return null;

  if (!forceNew) {
    const existing = await db
      .prepare(
        `SELECT id, status
         FROM ticket_email_outbox
         WHERE site_key = ? AND order_id = ? AND template_key = 'ticket_confirmation'
         ORDER BY created_at DESC
         LIMIT 1`,
      )
      .bind(site.key, orderId)
      .first();
    if (existing?.id && existing?.status !== "failed") {
      return existing.id;
    }
  }

  const rendered = renderTicketEmailTemplate({
    site,
    locale: locale || getDefaultTicketEmailLocale(env),
    context,
  });
  const now = new Date().toISOString();
  const id = forceNew ? crypto.randomUUID() : `ticket_confirmation_${site.key}_${orderId}`;
  await insertTicketEmailOutboxItem(env, {
    id,
    siteKey: site.key,
    orderId,
    eventProductId,
    recipientEmail,
    templateKey: "ticket_confirmation",
    subjectResolved: rendered.subject,
    bodyHtmlResolved: rendered.html,
    attachmentsJson: JSON.stringify([]),
    status: "pending",
    provider: getEmailProvider(env, site) || null,
    providerMessageId: null,
    errorMessage: null,
    sendAfterAt: now,
    sentAt: null,
    failedAt: null,
    createdAt: now,
    updatedAt: now,
  });
  await insertTicketEmailLog(env, {
    id: crypto.randomUUID(),
    siteKey: site.key,
    emailOutboxId: id,
    action: logAction || "queued",
    payloadJson: JSON.stringify({ templateKey: "ticket_confirmation", recipientEmail, recipientName, orderId }),
    createdAt: now,
  });
  return id;
}

async function queueTicketOrderEmailResend(env, { site, orderId, eventProductId, recipientEmail, recipientName, locale, context }) {
  return queueTicketOrderEmailInternal(env, {
    site,
    orderId,
    eventProductId,
    recipientEmail,
    recipientName,
    locale,
    context,
    forceNew: true,
    logAction: "requeued",
  });
}

async function sendTicketEmailOutboxItem(env, item) {
  const site = resolveSiteContextByKey(env, String(item.site_key || DEFAULT_SITE_KEY));
  const provider = getEmailProvider(env, site);
  const fromAddress = getEmailFromAddress(env, site);
  if (!provider || !fromAddress) {
    throw new Error("Email provider of senderadres ontbreekt");
  }

  let bodyHtmlResolved = String(item.body_html_resolved || "").trim();
  const isEnglishTicketEmail = /your tickets/i.test(String(item.subject_resolved || ""));
  const ticketAttachmentMode = getTicketAttachmentMode(site);
  let ticketAccessUrlForText = "";
  let ticketCodesForText = [];
  let ticketExpiresForText = "";
  let attachments = [];
  try {
    const parsed = item.attachments_json ? JSON.parse(item.attachments_json) : [];
    attachments = Array.isArray(parsed) ? parsed : [];
  } catch {
    attachments = [];
  }

  if (item.template_key === "ticket_confirmation" && item.order_id) {
    const includePngAttachments = ticketAttachmentMode === "png";
    const deliveryAssets = await buildTicketEmailDeliveryAssets(env, site, String(item.order_id), {
      includePngAttachments,
    });
    if (!attachments || attachments.length === 0) {
      if (ticketAttachmentMode === "png") {
        attachments = deliveryAssets.attachments;
      } else if (ticketAttachmentMode === "pdf") {
        const generatedPdf = await generateTicketOrderPdfAttachment(env, site, String(item.order_id));
        attachments = generatedPdf ? [generatedPdf] : [];
      } else {
        attachments = [];
      }
    }
    ticketAccessUrlForText = String(deliveryAssets.ticketAccessUrl || "").trim();
    ticketCodesForText = Array.isArray(deliveryAssets.ticketCodes) ? deliveryAssets.ticketCodes.slice(0, 24) : [];
    ticketExpiresForText = formatTicketLinkExpiry(deliveryAssets.expiresAtIso || "");
    if (bodyHtmlResolved.includes(TICKET_ACCESS_URL_PLACEHOLDER)) {
      const safeTicketAccessUrl = escapeHtml(ticketAccessUrlForText || "");
      bodyHtmlResolved = bodyHtmlResolved
        .split(TICKET_ACCESS_URL_PLACEHOLDER)
        .join(safeTicketAccessUrl || "#");
    }
    bodyHtmlResolved = addTicketLinkSectionToEmailHtml(bodyHtmlResolved, {
      ticketAccessUrl: deliveryAssets.ticketAccessUrl,
      expiresAtIso: deliveryAssets.expiresAtIso,
      isEnglish: isEnglishTicketEmail,
      ticketAttachmentMode,
      ticketCodes: deliveryAssets.ticketCodes,
    });
  }
  let bodyTextResolved = bodyHtmlResolved ? String(bodyHtmlResolved).replace(/<[^>]+>/g, " ").replace(/[ \t]+/g, " ").trim() : "";
  if (ticketAccessUrlForText) {
    bodyTextResolved += isEnglishTicketEmail
      ? `\n\nOpen tickets: ${ticketAccessUrlForText}\nLink valid until: ${ticketExpiresForText}`
      : `\n\nOpen tickets: ${ticketAccessUrlForText}\nLink geldig t/m: ${ticketExpiresForText}`;
  }
  if (ticketAttachmentMode === "none" && ticketCodesForText.length > 0) {
    const codeLines = ticketCodesForText
      .map((entry) => `Ticket #${Number(entry?.ticketNumber || 0) || 1}: ${String(entry?.code || "").trim()}`)
      .join("\n");
    bodyTextResolved += isEnglishTicketEmail
      ? `\n\nTicket codes (manual fallback):\n${codeLines}`
      : `\n\nTicketcodes (handmatige fallback):\n${codeLines}`;
  }

  if (provider === "mailchannels") {
    const apiKey = getMailchannelsApiKey(env, site);
    if (!apiKey) throw new Error("MAILCHANNELS_API_KEY ontbreekt");
    const mailchannelsPayload = {
      personalizations: [{ to: [{ email: item.recipient_email }] }],
      from: { email: fromAddress, name: getEmailFromName(env, site) || undefined },
      reply_to: getEmailReplyTo(env, site)
        ? { email: getEmailReplyTo(env, site), name: getEmailFromName(env, site) || getEmailReplyTo(env, site) }
        : undefined,
      subject: item.subject_resolved,
      content: [
        { type: "text/plain", value: bodyTextResolved },
        { type: "text/html", value: bodyHtmlResolved },
      ],
    };
    if (attachments.length > 0) {
      mailchannelsPayload.attachments = attachments.map((attachment) => ({
        filename: attachment.name,
        content: attachment.content,
        type: attachment.contentType || "application/octet-stream",
        disposition: "attachment",
      }));
    }
    const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(mailchannelsPayload),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Mailchannels delivery mislukt (${response.status}): ${text.slice(0, 400)}`);
    }
    return `mailchannels:${item.id}`;
  }

  if (provider === "brevo") {
    const apiKey = getBrevoApiKey(env, site);
    if (!apiKey) throw new Error("BREVO_API_KEY ontbreekt");
    const brevoPayload = {
      sender: {
        email: fromAddress,
        name: getEmailFromName(env, site) || undefined,
      },
      to: [{ email: item.recipient_email }],
      replyTo: getEmailReplyTo(env, site)
        ? { email: getEmailReplyTo(env, site), name: getEmailFromName(env, site) || getEmailReplyTo(env, site) }
        : undefined,
      subject: item.subject_resolved,
      htmlContent: bodyHtmlResolved,
    };
    if (attachments.length > 0) {
      brevoPayload.attachment = attachments.map((attachment) => ({
        name: attachment.name,
        content: attachment.content,
      }));
    }
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(brevoPayload),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Brevo delivery mislukt (${response.status}): ${text.slice(0, 400)}`);
    }
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }
    return `brevo:${data?.messageId || item.id}`;
  }

  throw new Error(`Niet-ondersteunde email provider: ${provider}`);
}

async function processSingleTicketEmailOutboxItem(env, item) {
  const site = resolveSiteContextByKey(env, String(item.site_key || DEFAULT_SITE_KEY));
  const provider = getEmailProvider(env, site);
  const fromAddress = getEmailFromAddress(env, site);
  if (!provider || !fromAddress) {
    return { status: "skipped", provider: provider || null, reason: "provider_or_sender_missing" };
  }
  const claimed = await claimTicketEmailOutboxItem(env, item.id);
  if (!claimed) {
    return { status: "skipped", provider: provider || null, reason: "already_processing" };
  }
  try {
    const providerMessageId = await sendTicketEmailOutboxItem(env, item);
    await updateTicketEmailOutboxItem(env, {
      id: item.id,
      status: "sent",
      provider,
      providerMessageId,
      errorMessage: null,
      sentAt: new Date().toISOString(),
      failedAt: null,
      updatedAt: new Date().toISOString(),
    });
    await insertTicketEmailLog(env, {
      id: crypto.randomUUID(),
      siteKey: String(item.site_key || DEFAULT_SITE_KEY),
      emailOutboxId: item.id,
      action: "sent",
      payloadJson: JSON.stringify({ provider, providerMessageId }),
      createdAt: new Date().toISOString(),
    });
    return { status: "sent", provider, providerMessageId };
  } catch (err) {
    await updateTicketEmailOutboxItem(env, {
      id: item.id,
      status: "failed",
      provider,
      providerMessageId: null,
      errorMessage: err instanceof Error ? err.message : String(err),
      sentAt: null,
      failedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await insertTicketEmailLog(env, {
      id: crypto.randomUUID(),
      siteKey: String(item.site_key || DEFAULT_SITE_KEY),
      emailOutboxId: item.id,
      action: "failed",
      payloadJson: JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      createdAt: new Date().toISOString(),
    });
    throw err;
  }
}

async function claimTicketEmailOutboxItem(env, id) {
  const db = getTicketsDb(env);
  if (!db) return false;
  const now = new Date().toISOString();
  const result = await db
    .prepare(
      `UPDATE ticket_email_outbox
       SET status = 'processing',
           updated_at = ?,
           error_message = NULL
       WHERE id = ?
         AND status = 'pending'`,
    )
    .bind(now, id)
    .run();
  const changed = Number(result?.meta?.changes || result?.changes || 0);
  return changed > 0;
}

async function processDueTicketEmailOutbox(env) {
  if (!getTicketsDb(env)) return { processed: 0, sent: 0, failed: 0, skipped: true };

  const items = await listPendingTicketEmailOutbox(env, 20);
  const stats = { processed: 0, sent: 0, failed: 0 };
  for (const item of items) {
    stats.processed += 1;
    try {
      const result = await processSingleTicketEmailOutboxItem(env, item);
      if (result?.status === "skipped") {
        continue;
      }
      stats.sent += 1;
    } catch {
      stats.failed += 1;
    }
  }
  return stats;
}

async function getTicketOrderEmailContext(env, siteKey, orderId) {
  const db = getTicketsDb(env);
  if (!db) return null;
  const site = resolveSiteContextByKey(env, siteKey);

  const order = await db
    .prepare(
      `SELECT
          id,
          site_key,
          customer_name,
          customer_email,
          order_codeword,
          total_paid_cents,
          quantity_total
       FROM ticket_orders
       WHERE site_key = ?
         AND id = ?
       LIMIT 1`,
    )
    .bind(siteKey, orderId)
    .first();
  if (!order) return null;
  const ensuredCodeword = await ensureTicketOrderCodeword(db, siteKey, String(order.id || orderId), order.order_codeword);

  const linesResult = await db
    .prepare(
      `SELECT event_product_id, event_slug, event_name
       FROM ticket_order_lines
       WHERE site_key = ?
         AND order_id = ?
       ORDER BY created_at ASC`,
    )
    .bind(siteKey, orderId)
    .all();

  const lines = Array.isArray(linesResult?.results) ? linesResult.results : [];
  const eventNames = lines
    .map((line) => String(line?.event_name || "").trim())
    .filter(Boolean);
  const eventCatalog = await getEventCatalogByIds(
    env,
    site,
    lines.map((line) => String(line?.event_product_id || "").trim()).filter(Boolean),
  );
  const firstLine = lines[0] || null;
  const firstEventDetails = buildTicketEmailEventDetails(
    String(firstLine?.event_name || "").trim(),
    firstLine ? eventCatalog.get(String(firstLine.event_product_id || "").trim()) || null : null,
  );
  const firstEventSlug = String(firstLine?.event_slug || firstLine?.event_product_id || "").trim();

  return {
    orderId: String(order.id || orderId),
    eventProductId: String(lines[0]?.event_product_id || ""),
    recipientEmail: String(order.customer_email || "").trim(),
    recipientName: String(order.customer_name || "").trim(),
    context: {
      customerName: String(order.customer_name || "Gast").trim() || "Gast",
      orderId: String(order.id || orderId),
      orderCodeword: ensuredCodeword || normalizeOrderCodeword(order.order_codeword || ""),
      quantityTotal: Number(order.quantity_total || 0) || 0,
      eventNames,
      totalPaidCents: Number(order.total_paid_cents || 0) || 0,
      eventCount: eventNames.length,
      eventSlug: firstEventSlug,
      eventPageUrl: firstEventSlug ? buildEventPageUrl(env, site, firstEventSlug) : "",
      eventPlace: firstEventDetails.eventPlace,
      eventDate: firstEventDetails.eventDate,
      showStartTime: firstEventDetails.showStartTime,
      doorsOpenTime: firstEventDetails.doorsOpenTime,
    },
  };
}

async function handleAdminResendTicketEmail(req, env, url) {
  try {
    const db = getTicketsDb(env);
    if (!db) {
      return jsonResponse({ ok: false, error: "TICKETS_DB binding ontbreekt" }, 500);
    }

    const siteKey = String(url.searchParams.get("site") || resolveDefaultSiteContext(env).key || DEFAULT_SITE_KEY).trim();
    const ticketMatch = url.pathname.match(/^\/admin\/tickets\/([^/]+)\/resend$/);
    const ticketId = String(ticketMatch?.[1] || "").trim();
    if (!ticketId) {
      return jsonResponse({ ok: false, error: "ticketId ontbreekt" }, 400);
    }

    const ticket = await db
      .prepare(
        `SELECT id, order_id, event_product_id
         FROM ticket_items
         WHERE site_key = ?
           AND id = ?
         LIMIT 1`,
      )
      .bind(siteKey, ticketId)
      .first();
    if (!ticket?.order_id) {
      return jsonResponse({ ok: false, error: "Ticket niet gevonden" }, 404);
    }

    const site = resolveSiteContextByKey(env, siteKey);
    const emailContext = await getTicketOrderEmailContext(env, siteKey, String(ticket.order_id));
    if (!emailContext?.recipientEmail) {
      return jsonResponse({ ok: false, error: "Geen ontvanger gevonden voor deze order" }, 400);
    }

    const outboxId = await queueTicketOrderEmailResend(env, {
      site,
      orderId: emailContext.orderId,
      eventProductId: emailContext.eventProductId || String(ticket.event_product_id || ""),
      recipientEmail: emailContext.recipientEmail,
      recipientName: emailContext.recipientName,
      locale: getDefaultTicketEmailLocale(env),
      context: emailContext.context,
    });

    const outboxItem = await db
      .prepare(`SELECT * FROM ticket_email_outbox WHERE site_key = ? AND id = ? LIMIT 1`)
      .bind(siteKey, outboxId)
      .first();
    if (!outboxItem) {
      throw new Error("Nieuwe outboxregel niet gevonden");
    }

    let delivery = { status: "pending" };
    try {
      delivery = await processSingleTicketEmailOutboxItem(env, outboxItem);
    } catch (err) {
      return jsonResponse(
        {
          ok: false,
          error: err instanceof Error ? err.message : String(err),
          outboxId,
        },
        500,
      );
    }

    return jsonResponse({
      ok: true,
      ticketId,
      orderId: emailContext.orderId,
      outboxId,
      status: delivery.status || "sent",
      provider: delivery.provider || null,
      providerMessageId: delivery.providerMessageId || null,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
}

async function persistOrderRecord(env, record) {
  const kv = getOrdersKV(env);
  const existingRaw = await kv.get(record.key);
  if (existingRaw) {
    const existing = JSON.parse(existingRaw);
    if (existing.status === ORDER_STATUS_SYNCED) return existing;
  }
  await kv.put(record.key, JSON.stringify(record), { expirationTtl: getOrderTtlSeconds(env) });
  await setOrderSyncNextDueAtIfEarlier(env, Number(record.nextAttemptAt) || Date.now());
  return record;
}

async function triggerOrderSync(orderKey, env) {
  if (env.ORDER_SYNC_QUEUE) {
    await env.ORDER_SYNC_QUEUE.send({ orderKey });
    return;
  }
  await syncOrderByKey(orderKey, env);
}

async function triggerOrderSyncSafely(orderKey, env, options = {}) {
  try {
    if (options?.force) {
      await syncOrderByKey(orderKey, env, { force: true });
    } else {
      await triggerOrderSync(orderKey, env);
    }
    return { ok: true };
  } catch (error) {
    console.error("Order sync failed but ticket flow continues:", error instanceof Error ? error.message : String(error));
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function syncOrderByKey(orderKey, env, options = {}) {
  const kv = getOrdersKV(env);
  const raw = await kv.get(orderKey);
  if (!raw) return;

  const record = JSON.parse(raw);
  if (!record) return;
  // Force mode is used by /confirm-payment so a previously "synced" record can be healed if the sheet row is missing.
  if (!options?.force && record.status === ORDER_STATUS_SYNCED) return;
  if (!options?.force && record.nextAttemptAt && Date.now() < Number(record.nextAttemptAt)) return;

  try {
    const site = resolveSiteContextByKey(env, record.siteKey);
    if (!site?.sheetId) {
      throw new Error(`Missing sheet configuration for site ${record.siteKey || DEFAULT_SITE_KEY}`);
    }
    const token = await getGoogleAccessToken(env, site);
    await appendOrderRow({
      token,
      sheetId: site.sheetId,
      site,
      values: [
        record.order.orderDatetime,
        record.order.customerName,
        record.order.customerEmail,
        record.order.address,
        record.order.productId,
        record.order.amountTotal,
        record.order.transactionId,
        record.order.eventId,
      ],
    });

    const synced = {
      ...record,
      status: ORDER_STATUS_SYNCED,
      attempts: (record.attempts || 0) + 1,
      syncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextAttemptAt: null,
      lastError: null,
    };
    await kv.put(orderKey, JSON.stringify(synced), { expirationTtl: getOrderTtlSeconds(env) });
  } catch (err) {
    const attempts = (record.attempts || 0) + 1;
    const failed = {
      ...record,
      status: ORDER_STATUS_FAILED,
      attempts,
      lastError: err instanceof Error ? err.message : String(err),
      nextAttemptAt: computeNextAttemptAt(attempts, env),
      updatedAt: new Date().toISOString(),
    };
    await kv.put(orderKey, JSON.stringify(failed), { expirationTtl: getOrderTtlSeconds(env) });
    await setOrderSyncNextDueAtIfEarlier(env, Number(failed.nextAttemptAt) || Date.now());
    throw err;
  }
}

async function getOrderSyncMeta(env) {
  const kv = getOrdersKV(env);
  const raw = await kv.get(ORDER_SYNC_META_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const nextDueAt = Number(parsed?.nextDueAt);
    if (!Number.isFinite(nextDueAt) || nextDueAt <= 0) return null;
    return { nextDueAt };
  } catch {
    return null;
  }
}

async function setOrderSyncMetaNextDueAt(env, nextDueAt) {
  const kv = getOrdersKV(env);
  const payload = {
    nextDueAt: Math.max(1, Math.floor(Number(nextDueAt) || Date.now())),
    updatedAt: new Date().toISOString(),
  };
  await kv.put(ORDER_SYNC_META_KEY, JSON.stringify(payload), { expirationTtl: getOrderTtlSeconds(env) });
}

async function setOrderSyncNextDueAtIfEarlier(env, candidateNextDueAt) {
  const candidate = Number(candidateNextDueAt);
  if (!Number.isFinite(candidate) || candidate <= 0) return;
  const current = await getOrderSyncMeta(env);
  if (!current || candidate < current.nextDueAt) {
    await setOrderSyncMetaNextDueAt(env, candidate);
  }
}

function recordNextDueAt(candidate, record) {
  if (!record) return candidate;
  if (record.status === ORDER_STATUS_SYNCED) return candidate;
  const nextAttemptAt = Number(record.nextAttemptAt);
  if (!Number.isFinite(nextAttemptAt) || nextAttemptAt <= 0) return candidate;
  if (candidate == null || nextAttemptAt < candidate) return nextAttemptAt;
  return candidate;
}

async function runScheduledOrderSync(env) {
  const meta = await getOrderSyncMeta(env);
  const now = Date.now();
  if (meta && meta.nextDueAt > now) {
    return { skipped: true, reason: "next_due_not_reached", nextDueAt: meta.nextDueAt };
  }
  return processDueOrderSyncs(env);
}

async function processDueOrderSyncs(env) {
  const kv = getOrdersKV(env);
  let cursor = undefined;
  const stats = { processed: 0, synced: 0, failed: 0, skipped: 0 };
  let nextDueAt = null;
  let hitBatchLimit = false;

  do {
    const page = await kv.list({ prefix: ORDER_KEY_PREFIX, cursor, limit: 100 });
    for (const item of page.keys) {
      if (stats.processed >= DEFAULT_SYNC_BATCH_LIMIT) {
        hitBatchLimit = true;
        break;
      }
      try {
        const beforeRaw = await kv.get(item.name);
        const before = beforeRaw ? JSON.parse(beforeRaw) : null;
        nextDueAt = recordNextDueAt(nextDueAt, before);
        await syncOrderByKey(item.name, env);
        const afterRaw = await kv.get(item.name);
        const after = afterRaw ? JSON.parse(afterRaw) : null;
        nextDueAt = recordNextDueAt(nextDueAt, after);
        if (before?.status === after?.status) stats.skipped += 1;
        else if (after?.status === ORDER_STATUS_SYNCED) stats.synced += 1;
        else if (after?.status === ORDER_STATUS_FAILED) stats.failed += 1;
      } catch {
        // Keep going; failed item is scheduled for retry.
        stats.failed += 1;
      }
      stats.processed += 1;
    }
    if (hitBatchLimit) break;
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  if (hitBatchLimit) {
    await setOrderSyncMetaNextDueAt(env, Date.now() + getOrderSyncContinueScanMs(env));
  } else if (nextDueAt != null) {
    await setOrderSyncMetaNextDueAt(env, nextDueAt);
  } else {
    await setOrderSyncMetaNextDueAt(env, Date.now() + getOrderSyncIdleScanMs(env));
  }

  return stats;
}

async function handleGetProducts(env, req, site = resolveDefaultSiteContext(env)) {
  const cache = caches.default;
  const cacheKey = req ? buildProductsCacheRequest(req, site) : null;
  const requestUrl = req ? new URL(req.url) : null;
  const forceRefresh =
    requestUrl &&
    ["1", "true", "yes"].includes((requestUrl.searchParams.get("nocache") || "").toLowerCase());

  if (cacheKey && !forceRefresh) {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
  }

  // KV cache first
  if (env.PRODUCTS_CACHE && !forceRefresh) {
    const kvCached = await env.PRODUCTS_CACHE.get(getProductsCacheKey(site), "json").catch(() => null);
    if (kvCached && cacheKey) {
      const res = jsonResponse({ products: kvCached }, 200, true);
      cache.put(cacheKey, res.clone()).catch(() => {});
      return res;
    }
    if (kvCached) return jsonResponse({ products: kvCached }, 200, true);
  }

  try {
    const { products } = await readProductsSheet(env, site, { includeInactive: false });
    const res = jsonResponse(
      { products },
      200,
      true,
      "public, max-age=180, s-maxage=900, stale-while-revalidate=900",
    );
    if (cacheKey) cache.put(cacheKey, res.clone());
    if (env.PRODUCTS_CACHE) {
      await env.PRODUCTS_CACHE.put(getProductsCacheKey(site), JSON.stringify(products), { expirationTtl: PRODUCTS_CACHE_TTL });
    }
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
}

async function handleCreateCheckoutSession(req, env, site = resolveDefaultSiteContext(env)) {
  try {
    const { cart } = await req.json();
    if (!Array.isArray(cart) || cart.length === 0) {
      return new Response("Cart is leeg", { status: 400 });
    }

    const ticketSubtotalCents = cart.reduce((sum, item) => {
      const amountCents = Math.round(item.price * 100) || item.amountCents || 0;
      return sum + (Number.isFinite(amountCents) ? amountCents * (item.quantity && item.quantity > 0 ? item.quantity : 1) : 0);
    }, 0);
    const serviceFeeCents = calculateServiceFeeCents(cart);
    const totalCents = ticketSubtotalCents + serviceFeeCents;
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

    if (serviceFeeCents > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          unit_amount: serviceFeeCents,
          product_data: {
            name: "Servicekosten",
            metadata: { productId: "service-fee" },
          },
        },
        quantity: 1,
      });
    }

    const stripe = getStripeClient(env, site);
    const successBase = site.checkoutSuccessUrl || env.CHECKOUT_SUCCESS_URL || "https://sitedesk.co/success";
    const cancelUrl = site.checkoutCancelUrl || env.CHECKOUT_CANCEL_URL || "https://sitedesk.co/cancel";
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

    const preferredMethodTypes = getConfiguredStripePaymentMethodTypes(site, ["card", "ideal"]);
    const sessionParams = {
      mode: "payment",
      line_items: lineItems,
      metadata: {
        productId: cart
          .map((item) => item.id || item.name || "product")
          .join("|")
          .slice(0, 450),
        siteKey: site.key,
        cartCount: String(cart.length),
        ticketSubtotalAmount: (ticketSubtotalCents / 100).toFixed(2),
        serviceFeeAmount: (serviceFeeCents / 100).toFixed(2),
        totalAmount: (totalCents / 100).toFixed(2),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    };
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        ...sessionParams,
        payment_method_types: preferredMethodTypes,
      });
    } catch (err) {
      const fallbackMethodTypes = getPaymentMethodTypesWithoutWero(preferredMethodTypes);
      if (!shouldRetryWithoutWero(err, preferredMethodTypes, fallbackMethodTypes)) {
        throw err;
      }
      console.warn("Wero not available for checkout session, retrying without wero", {
        siteKey: site?.key || null,
      });
      session = await stripe.checkout.sessions.create({
        ...sessionParams,
        payment_method_types: fallbackMethodTypes,
      });
    }

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

async function handleCreatePaymentIntent(req, env, site = resolveDefaultSiteContext(env)) {
  try {
    const { cart, email } = await req.json();
    if (!Array.isArray(cart) || cart.length === 0) {
      return jsonResponse({ message: "Cart is leeg" }, 400);
    }

    const ticketSubtotalCents = cart.reduce((sum, item) => {
      const amountCents = Number(item.amountCents || Math.round((Number(item.price) || 0) * 100) || 0);
      const quantity = Number(item.quantity || 1);
      return sum + Math.max(0, amountCents) * Math.max(1, quantity);
    }, 0);
    const serviceFeeCents = calculateServiceFeeCents(cart);
    const totalCents = ticketSubtotalCents + serviceFeeCents;

    if (!Number.isFinite(totalCents) || totalCents <= 0) {
      return jsonResponse({ message: "Ongeldig bedrag" }, 400);
    }

    const stripe = getStripeClient(env, site);
    const paymentIntentParams = {
      amount: totalCents,
      currency: "eur",
      metadata: {
        productId: cart
          .map((item) => item.id || item.name || "ticket")
          .join("|")
          .slice(0, 450),
        productName: cart
          .map((item) => item.name || "Ticket")
          .join(" | ")
          .slice(0, 450),
        siteKey: site.key,
        cartCount: String(cart.length),
        ticketSubtotalAmount: (ticketSubtotalCents / 100).toFixed(2),
        serviceFeeAmount: (serviceFeeCents / 100).toFixed(2),
        totalAmount: (totalCents / 100).toFixed(2),
      },
    };

    if (typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      paymentIntentParams.receipt_email = email.trim();
      paymentIntentParams.metadata.customerEmail = email.trim().slice(0, 450);
    }

    const preferredMethodTypes = getConfiguredStripePaymentMethodTypes(site);
    if (preferredMethodTypes.length > 0) {
      paymentIntentParams.payment_method_types = preferredMethodTypes;
    } else {
      paymentIntentParams.automatic_payment_methods = {
        enabled: true,
        allow_redirects: "never",
      };
    }

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    } catch (err) {
      const fallbackMethodTypes = getPaymentMethodTypesWithoutWero(preferredMethodTypes);
      if (!shouldRetryWithoutWero(err, preferredMethodTypes, fallbackMethodTypes)) {
        throw err;
      }
      console.warn("Wero not available for payment intent, retrying without wero", {
        siteKey: site?.key || null,
      });
      paymentIntent = await stripe.paymentIntents.create({
        ...paymentIntentParams,
        payment_method_types: fallbackMethodTypes,
      });
    }
    await storeTicketCheckoutContext(env, paymentIntent, site, {
      customerEmail: typeof email === "string" ? email.trim() : "",
      cart,
    });

      return jsonResponse({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amountDueNowCents: totalCents,
        serviceFeeCents,
      });
  } catch (err) {
    return jsonResponse({ message: err instanceof Error ? err.message : String(err) }, 500);
  }
}

async function handleConfirmPayment(req, env, site = resolveDefaultSiteContext(env), ctx = null) {
  try {
    const { paymentIntentId } = await req.json();
    const id = String(paymentIntentId || "").trim();
    if (!id) {
      return jsonResponse({ message: "paymentIntentId ontbreekt" }, 400);
    }

    const stripe = getStripeClient(env, site);
    const paymentIntent = await stripe.paymentIntents.retrieve(id, {
      expand: ["latest_charge"],
    });

    if (paymentIntent.status !== "succeeded") {
      return jsonResponse({ message: "Betaling nog niet voltooid", status: paymentIntent.status }, 409);
    }

    const orderRecord = buildOrderRecordFromPaymentIntent(`payment_intent:${paymentIntent.id}`, paymentIntent, site);
    await persistOrderRecord(env, orderRecord);
    const syncResult = await triggerOrderSyncSafely(orderRecord.key, env, { force: true });
    await issueTicketsFromPaymentIntent(env, paymentIntent, site);
    if (ctx?.waitUntil) {
      ctx.waitUntil(processDueTicketEmailOutbox(env));
    }

    return jsonResponse({
      ok: true,
      paymentIntentId: paymentIntent.id,
      orderSyncOk: syncResult.ok,
      orderSyncError: syncResult.ok ? null : syncResult.error,
    });
  } catch (err) {
    return jsonResponse({ message: err instanceof Error ? err.message : String(err) }, 500);
  }
}

async function handleAdminRequest(req, env, url) {
  if (url.pathname === "/admin/login" && req.method === "POST") {
    return handleAdminLogin(req, env);
  }

  const adminCheck = await verifyAdmin(req, env);
  if (adminCheck instanceof Response) return adminCheck;
  const site = resolveSiteContext(req, url, env);

  if (url.pathname === "/admin/products" && req.method === "GET") {
    return handleAdminListProducts(env, site);
  }

  if (url.pathname === "/admin/products" && req.method === "POST") {
    return handleAdminCreateProduct(req, env, site);
  }

  if (url.pathname === "/admin/tickets" && req.method === "GET") {
    return handleAdminListTickets(url, env);
  }

  if (url.pathname === "/admin/tickets/stats" && req.method === "GET") {
    return handleAdminTicketStats(url, env);
  }

  if (url.pathname === "/admin/tickets/event-summary" && req.method === "GET") {
    return handleAdminTicketEventSummary(url, env);
  }

  if (url.pathname === "/admin/tickets/validate" && req.method === "POST") {
    return handleAdminValidateTicket(req, env, url);
  }

  if (url.pathname === "/admin/tickets/check-in" && req.method === "POST") {
    return handleAdminCheckInTicket(req, env, url);
  }

  if (url.pathname === "/admin/tickets/check-in-order" && req.method === "POST") {
    return handleAdminCheckInOrder(req, env, url);
  }

  const ticketResendMatch = url.pathname.match(/^\/admin\/tickets\/([^/]+)\/resend$/);
  if (ticketResendMatch && req.method === "POST") {
    return handleAdminResendTicketEmail(req, env, url);
  }

  if (url.pathname === "/admin/products/batch" && req.method === "POST") {
    return handleAdminBatchUpdateProducts(req, env);
  }

  if (url.pathname === "/admin/order-sync/status" && req.method === "GET") {
    const limit = Number(url.searchParams.get("limit") || DEFAULT_ORDER_LIST_LIMIT);
    const includeItems = ["1", "true", "yes"].includes(
      (url.searchParams.get("details") || "").toLowerCase(),
    );
    return handleAdminOrderSyncStatus(env, limit, includeItems);
  }

  if (url.pathname === "/admin/order-sync/run" && req.method === "POST") {
    const stats = await processDueOrderSyncs(env);
    return jsonResponse({ message: "Order sync run completed", stats });
  }

  if (url.pathname === "/admin/stripe-health" && req.method === "GET") {
    return handleAdminStripeHealth(env);
  }

  // /admin/products/{rowNumber}
  const productMatch = url.pathname.match(/^\/admin\/products\/(\d+)$/);
  if (productMatch && req.method === "PUT") {
    const rowNumber = parseInt(productMatch[1], 10);
    return handleAdminUpdateProduct(req, env, rowNumber, site);
  }

  const archiveMatch = url.pathname.match(/^\/admin\/products\/(\d+)\/archive$/);
  if (archiveMatch && req.method === "POST") {
    const rowNumber = parseInt(archiveMatch[1], 10);
    return handleAdminArchiveProduct(env, rowNumber, site);
  }

  if (url.pathname === "/admin/images/upload" && req.method === "POST") {
    return handleAdminImageUpload(req, env, site);
  }

  if (url.pathname === "/admin/images" && req.method === "GET") {
    return handleAdminListImages(env, site);
  }

  if (url.pathname === "/admin/models" && req.method === "GET") {
    return handleAdminListModels(env, site);
  }

  if (url.pathname === "/admin/images/backfill-upload-dates" && req.method === "POST") {
    return handleAdminBackfillImageUploadDates(env);
  }

  const imageRowMatch = url.pathname.match(/^\/admin\/images\/(\d+)$/);
  if (imageRowMatch && req.method === "PUT") {
    const rowNumber = parseInt(imageRowMatch[1], 10);
    return handleAdminUpdateImage(req, env, rowNumber, site);
  }
  if (imageRowMatch && req.method === "DELETE") {
    const rowNumber = parseInt(imageRowMatch[1], 10);
    return handleAdminDeleteImage(env, rowNumber, site);
  }

  const modelRowMatch = url.pathname.match(/^\/admin\/models\/(\d+)$/);
  if (modelRowMatch && req.method === "PUT") {
    const rowNumber = parseInt(modelRowMatch[1], 10);
    return handleAdminUpdateModel(req, env, rowNumber, site);
  }
  if (modelRowMatch && req.method === "DELETE") {
    const rowNumber = parseInt(modelRowMatch[1], 10);
    return handleAdminDeleteModel(env, rowNumber, site);
  }

  return jsonResponse({ error: "Not Found" }, 404);
}

async function handleAdminLogin(req, env) {
  try {
    const body = await safeJson(req);
    const password = (body?.password || "").toString();
    const site = resolveSiteContext(req, new URL(req.url), env);
    const adminPasswordConfig = getOptionalSiteSecretValue(env, site, site?.admin_password_secret || "", "ADMIN_PASSWORD");
    if (!adminPasswordConfig?.value) return jsonResponse({ error: "ADMIN_PASSWORD not set" }, 500);
    if (!password || password !== adminPasswordConfig.value) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const token = await deriveAdminToken(site.key, adminPasswordConfig.value, env.ADMIN_SESSION_SECRET);
    return jsonResponse({ token, siteKey: site.key });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
}

async function handleAdminListProducts(env, site) {
  const data = await readProductsSheet(env, site, { includeInactive: true, includeRowNumber: true });
  return jsonResponse({ products: data.products, headers: data.headersRaw, sheetName: data.sheetName });
}

async function handleAdminCreateProduct(req, env, site) {
  const { products, headersRaw, sheetName } = await readProductsSheet(env, site, {
    includeInactive: true,
    includeRowNumber: true,
  });
  const normalizedHeaders = headersRaw.map((h) => h.toLowerCase());
  const body = await safeJson(req);
  const payload = normalizeKeys(body?.values || {});
  const row = normalizedHeaders.map((key) => payload[key] ?? "");

  await appendProductRow({
    env,
    site,
    sheetName,
    values: row,
  });

  await clearProductsCache(env, site);
  await prefillProductsCache(env, null, site);

  return jsonResponse({
    message: "Product toegevoegd",
    headers: headersRaw,
    inserted: payload,
    rowNumber: products.length + 2, // + header + new row
  });
}

async function handleAdminUpdateProduct(req, env, rowNumber, site) {
  const { products, headersRaw, sheetName } = await readProductsSheet(env, site, {
    includeInactive: true,
    includeRowNumber: true,
  });
  const existing = products.find((p) => p._rowNumber === rowNumber);
  if (!existing) return jsonResponse({ error: "Row not found" }, 404);

  const payload = normalizeKeys(await safeJson(req));
  const headersForWrite = await ensureSheetHeaders({
    env,
    site,
    sheetName,
    headersRaw,
    requiredKeys: Object.keys(payload || {}),
  });
  const merged = { ...existing, ...payload, _rowNumber: rowNumber };
  await replaceRow({
    env,
    site,
    sheetName,
    headers: headersForWrite,
    rowNumber,
    values: merged,
  });
  await clearProductsCache(env, site);
  await prefillProductsCache(env, null, site);
  return jsonResponse({ message: "Product bijgewerkt", product: merged });
}

async function handleAdminBatchUpdateProducts(req, env) {
  const { products, headersRaw, sheetName } = await readProductsSheet(env, {
    includeInactive: true,
    includeRowNumber: true,
  });
  const body = await safeJson(req);
  const updatesRaw = Array.isArray(body?.updates) ? body.updates : [];
  if (updatesRaw.length === 0) {
    return jsonResponse({ error: "Geen updates opgegeven" }, 400);
  }

  const byRow = new Map();
  for (const item of updatesRaw) {
    const rowNumber = Number(item?.rowNumber || 0);
    if (!Number.isFinite(rowNumber) || rowNumber < 2) continue;
    const values = normalizeKeys(item?.values || {});
    if (!byRow.has(rowNumber)) byRow.set(rowNumber, {});
    Object.assign(byRow.get(rowNumber), values);
  }

  const rows = Array.from(byRow.entries());
  if (rows.length === 0) {
    return jsonResponse({ error: "Geen geldige updates" }, 400);
  }

  const requiredKeys = new Set();
  for (const [, values] of rows) {
    Object.keys(values || {}).forEach((key) => requiredKeys.add(String(key || "").toLowerCase()));
  }
  const headersForWrite = await ensureSheetHeaders({
    env,
    sheetName,
    headersRaw,
    requiredKeys: Array.from(requiredKeys),
  });

  const updatedRows = [];
  for (const [rowNumber, values] of rows) {
    const existing = products.find((p) => p._rowNumber === rowNumber);
    if (!existing) continue;
    const merged = { ...existing, ...values, _rowNumber: rowNumber };
    await replaceRow({
      env,
      sheetName,
      headers: headersForWrite,
      rowNumber,
      values: merged,
    });
    updatedRows.push(rowNumber);
  }

  if (updatedRows.length === 0) {
    return jsonResponse({ error: "Geen bestaande rijen gevonden voor update" }, 404);
  }

  await clearProductsCache(env);
  await prefillProductsCache(env);
  return jsonResponse({ message: "Batch product updates opgeslagen", updatedRows });
}

async function handleAdminArchiveProduct(env, rowNumber, site) {
  const { products, headersRaw, sheetName } = await readProductsSheet(env, site, {
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
    site,
    sheetName,
    headers: headersRaw,
    rowNumber,
    values: merged,
  });
  await clearProductsCache(env, site);
  await prefillProductsCache(env, null, site);
  return jsonResponse({ message: "Product gearchiveerd", product: merged });
}

async function handleAdminImageUpload(req, env, site) {
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
  const imageFilename = parsed?.result?.filename || file.name || "";
  const uploadedAt = parsed?.result?.uploaded || parsed?.result?.uploaded_at || new Date().toISOString();

  const rowNumber = parseInt((form.get("rowNumber") || form.get("row") || "").toString(), 10);
  const columnRaw = (form.get("column") || "image").toString();
  let updatedRow = null;
  if (Number.isFinite(rowNumber) && rowNumber > 1 && imageId) {
    const { products, headersRaw, sheetName } = await readProductsSheet(env, site, {
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
          site,
          sheetName,
          headers: headersRaw,
          rowNumber,
          values: merged,
        });
        updatedRow = merged;
      }
    }
  }

  if (imageId || imageUrl) {
    await appendImageSheetRow(env, site, {
      imageId: imageId || "",
      imageUrl: imageUrl || "",
      fileName: imageFilename || "",
      alt: (form.get("alt") || "").toString(),
      title: (form.get("title") || "").toString(),
      uploadedAt,
    }).catch(() => {});
  }

  await clearProductsCache(env, site);
  await prefillProductsCache(env, null, site);

  return jsonResponse({ imageId, imageUrl, updatedRow });
}

async function handleAdminBackfillImageUploadDates(env) {
  if (!env.CF_IMAGES_ACCOUNT_ID || !env.CF_IMAGES_TOKEN) {
    return jsonResponse({ error: "Cloudflare Images niet geconfigureerd" }, 500);
  }

  const { images, headersRaw, sheetName } = await readImagesSheet(env, { includeRowNumber: true });
  const uploadDateHeader = findHeaderByCandidates(headersRaw, [
    "uploaddate",
    "upload_date",
    "uploaded_at",
    "created_at",
    "datum",
  ]);
  const imageIdHeader = findHeaderByCandidates(headersRaw, ["id", "image_id", "imageid"]);

  if (!uploadDateHeader) return jsonResponse({ error: "Geen Uploaddate kolom gevonden" }, 400);
  if (!imageIdHeader) return jsonResponse({ error: "Geen image id kolom gevonden" }, 400);

  let updated = 0;
  let skipped = 0;
  let missingInCf = 0;

  for (const row of images) {
    const rowNumber = Number(row?._rowNumber || 0);
    if (!rowNumber) {
      skipped += 1;
      continue;
    }
    const existingDate = String(row[uploadDateHeader.toLowerCase()] || "").trim();
    if (existingDate) {
      skipped += 1;
      continue;
    }
    const imageId = String(row[imageIdHeader.toLowerCase()] || "").trim();
    if (!imageId) {
      skipped += 1;
      continue;
    }

    const uploadedAt = await getCloudflareImageUploadedAt(env, imageId);
    if (!uploadedAt) {
      missingInCf += 1;
      continue;
    }

    const merged = { ...row, [uploadDateHeader]: uploadedAt, _rowNumber: rowNumber };
    await replaceRow({
      env,
      sheetName,
      headers: headersRaw,
      rowNumber,
      values: merged,
    });
    updated += 1;
  }

  return jsonResponse({
    message: "Backfill afgerond",
    updated,
    skipped,
    missingInCf,
  });
}

async function handleAdminListImages(env, site) {
  const data = await readImagesSheet(env, site, { includeRowNumber: true });
  return jsonResponse({
    images: data.images,
    headers: data.headersRaw,
    sheetName: data.sheetName,
    cfImagesAccountId: env.CF_IMAGES_ACCOUNT_ID || "",
  });
}

async function handleAdminUpdateImage(req, env, rowNumber, site) {
  const { images, headersRaw, sheetName } = await readImagesSheet(env, site, {
    includeRowNumber: true,
  });
  const existing = images.find((p) => p._rowNumber === rowNumber);
  if (!existing) return jsonResponse({ error: "Row not found" }, 404);

  const payload = normalizeKeys(await safeJson(req));
  const merged = { ...existing, ...payload, _rowNumber: rowNumber };
  await replaceRow({
    env,
    site,
    sheetName,
    headers: headersRaw,
    rowNumber,
    values: merged,
  });
  return jsonResponse({ message: "Image bijgewerkt", image: merged });
}

async function handleAdminDeleteImage(env, rowNumber, site) {
  const { sheetName, token } = await readImagesSheet(env, site, { includeRowNumber: true });
  const sheetId = await getSheetIdByName(env, token, sheetName, site);
  if (sheetId === null) return jsonResponse({ error: "Sheet not found" }, 404);

  const deleteRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${site.sheetId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      }),
    },
  );

  if (!deleteRes.ok) {
    const text = await deleteRes.text();
    throw new Error(`Image row delete failed: ${text}`);
  }

  return jsonResponse({ message: "Image verwijderd", rowNumber });
}

async function handleAdminListModels(env, site) {
  const data = await readModelsSheet(env, site, { includeRowNumber: true });
  return jsonResponse({
    models: data.models,
    headers: data.headersRaw,
    sheetName: data.sheetName,
  });
}

async function handleAdminUpdateModel(req, env, rowNumber, site) {
  const { models, headersRaw, sheetName } = await readModelsSheet(env, site, {
    includeRowNumber: true,
  });
  const existing = models.find((p) => p._rowNumber === rowNumber);
  if (!existing) return jsonResponse({ error: "Row not found" }, 404);

  const payload = normalizeKeys(await safeJson(req));
  const merged = { ...existing, ...payload, _rowNumber: rowNumber };
  await replaceRow({
    env,
    site,
    sheetName,
    headers: headersRaw,
    rowNumber,
    values: merged,
  });
  return jsonResponse({ message: "Model bijgewerkt", model: merged });
}

async function handleAdminDeleteModel(env, rowNumber, site) {
  const { sheetName, token } = await readModelsSheet(env, site, { includeRowNumber: true });
  const sheetId = await getSheetIdByName(env, token, sheetName, site);
  if (sheetId === null) return jsonResponse({ error: "Sheet not found" }, 404);

  const deleteRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${site.sheetId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      }),
    },
  );

  if (!deleteRes.ok) {
    const text = await deleteRes.text();
    throw new Error(`Model row delete failed: ${text}`);
  }

  return jsonResponse({ message: "Model verwijderd", rowNumber });
}

async function handleAdminStripeHealth(env) {
  try {
    const site = resolveDefaultSiteContext(env);
    const stripe = getStripeClient(env, site);
    const stripeSecret = getStripeSecretConfig(env, site);
    const webhookSecret = getStripeWebhookSecretConfig(env, site);
    const account = await stripe.accounts.retrieve();
    return jsonResponse({
      ok: true,
      site: site.key,
      stripe: {
        accountId: account.id,
        livemode: Boolean(account.livemode),
        country: account.country || null,
        email: account.email || null,
      },
      worker: {
        stripeSecretName: stripeSecret.key,
        webhookSecretName: webhookSecret.key,
        hasWebhookSecret: Boolean(webhookSecret.value),
        hasStripeSecret: Boolean(stripeSecret.value),
      },
    });
  } catch (err) {
    return jsonResponse(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      500,
    );
  }
}

async function handleAdminOrderSyncStatus(env, limitRaw, includeItems = false) {
  try {
    const meta = await getOrderSyncMeta(env);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : DEFAULT_ORDER_LIST_LIMIT;
    if (!includeItems) {
      return jsonResponse({
        ok: true,
        mode: "meta",
        nextDueAt: meta?.nextDueAt || null,
        note: "Use details=1 to include item scan (uses KV list quota).",
      });
    }

    const kv = getOrdersKV(env);
    const page = await kv.list({ prefix: ORDER_KEY_PREFIX, limit: 500 });

    const summary = {
      total: 0,
      pending_sync: 0,
      synced: 0,
      failed_sync: 0,
      unknown: 0,
    };
    const items = [];

    for (const key of page.keys) {
      const raw = await kv.get(key.name);
      if (!raw) continue;
      const record = JSON.parse(raw);
      summary.total += 1;
      if (record.status === ORDER_STATUS_PENDING) summary.pending_sync += 1;
      else if (record.status === ORDER_STATUS_SYNCED) summary.synced += 1;
      else if (record.status === ORDER_STATUS_FAILED) summary.failed_sync += 1;
      else summary.unknown += 1;

      items.push({
        key: record.key,
        eventId: record.eventId,
        status: record.status,
        attempts: record.attempts || 0,
        nextAttemptAt: record.nextAttemptAt || null,
        syncedAt: record.syncedAt || null,
        updatedAt: record.updatedAt || null,
        lastError: record.lastError || null,
      });
    }

    items.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));

    return jsonResponse({
      ok: true,
      mode: "details",
      nextDueAt: meta?.nextDueAt || null,
      summary,
      items: items.slice(0, limit),
      hasMore: items.length > limit,
    });
  } catch (err) {
    return jsonResponse(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      500,
    );
  }
}

async function handleAdminListTickets(url, env) {
  try {
    const db = getTicketsDb(env);
    if (!db) {
      return jsonResponse({ ok: false, error: "TICKETS_DB binding ontbreekt" }, 500);
    }

    const siteKey = String(url.searchParams.get("site") || resolveDefaultSiteContext(env).key || DEFAULT_SITE_KEY).trim();
    const query = String(url.searchParams.get("q") || "").trim().toLowerCase();
    const eventProductId = String(url.searchParams.get("event") || "").trim();
    const status = String(url.searchParams.get("status") || "").trim().toLowerCase();
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 50) || 50));

    const result = await db
      .prepare(
        `SELECT
            ti.id,
            ti.order_id,
            ti.event_product_id,
            ti.event_name,
            ti.ticket_number,
            ti.holder_name,
            ti.holder_email,
            ti.qr_token,
            o.customer_name,
            o.customer_email,
            o.order_codeword,
            ti.status,
            ti.issued_at,
            ti.checked_in_at,
            o.total_paid_cents,
            o.quantity_total
         FROM ticket_items ti
         JOIN ticket_orders o ON o.id = ti.order_id
         WHERE ti.site_key = ?
           AND (? = '' OR ti.event_product_id = ?)
           AND (? = '' OR LOWER(ti.status) = ?)
           AND (
             ? = ''
             OR LOWER(COALESCE(ti.holder_name, '')) LIKE ?
             OR LOWER(COALESCE(ti.holder_email, '')) LIKE ?
             OR LOWER(COALESCE(o.customer_name, '')) LIKE ?
             OR LOWER(COALESCE(o.customer_email, '')) LIKE ?
             OR LOWER(COALESCE(o.order_codeword, '')) LIKE ?
             OR LOWER(COALESCE(ti.event_name, '')) LIKE ?
             OR LOWER(COALESCE(ti.order_id, '')) LIKE ?
           )
         ORDER BY ti.issued_at DESC, ti.created_at DESC
         LIMIT ?`,
      )
      .bind(
        siteKey,
        eventProductId,
        eventProductId,
        status,
        status,
        query,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        limit,
      )
      .all();

    return jsonResponse({
      ok: true,
      items: Array.isArray(result?.results) ? result.results : [],
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
}

async function handleAdminTicketStats(url, env) {
  try {
    const db = getTicketsDb(env);
    if (!db) {
      return jsonResponse({ ok: false, error: "TICKETS_DB binding ontbreekt" }, 500);
    }

    const siteKey = String(url.searchParams.get("site") || resolveDefaultSiteContext(env).key || DEFAULT_SITE_KEY).trim();
    const eventProductId = String(url.searchParams.get("event") || "").trim();

    const stats = await db
      .prepare(
        `SELECT
            COUNT(*) AS total_tickets,
            COUNT(DISTINCT ti.order_id) AS total_orders,
            SUM(CASE WHEN ti.status = 'checked_in' THEN 1 ELSE 0 END) AS checked_in_count,
            SUM(CASE WHEN ti.status = 'issued' THEN 1 ELSE 0 END) AS issued_count,
            SUM(CASE WHEN ti.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count,
            SUM(CASE WHEN ti.status = 'refunded' THEN 1 ELSE 0 END) AS refunded_count
         FROM ticket_items ti
         WHERE ti.site_key = ?
           AND (? = '' OR ti.event_product_id = ?)` ,
      )
      .bind(siteKey, eventProductId, eventProductId)
      .first();

    const totalTickets = Number(stats?.total_tickets || 0);
    const checkedInCount = Number(stats?.checked_in_count || 0);
    const issuedCount = Number(stats?.issued_count || 0);
    const cancelledCount = Number(stats?.cancelled_count || 0);
    const refundedCount = Number(stats?.refunded_count || 0);

    return jsonResponse({
      ok: true,
      stats: {
        totalTickets,
        totalOrders: Number(stats?.total_orders || 0),
        checkedInCount,
        issuedCount,
        cancelledCount,
        refundedCount,
        remainingCount: issuedCount,
        noShowEstimate: issuedCount,
      },
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
}

async function handleAdminTicketEventSummary(url, env) {
  try {
    const db = getTicketsDb(env);
    if (!db) {
      return jsonResponse({ ok: false, error: "TICKETS_DB binding ontbreekt" }, 500);
    }

    const siteKey = String(url.searchParams.get("site") || resolveDefaultSiteContext(env).key || DEFAULT_SITE_KEY).trim();
    const result = await db
      .prepare(
        `WITH ticket_stats AS (
           SELECT
             ti.event_product_id AS event_product_id,
             MIN(ti.event_name) AS event_name,
             COUNT(*) AS total_tickets,
             COUNT(DISTINCT ti.order_id) AS total_orders,
             SUM(CASE WHEN ti.status = 'checked_in' THEN 1 ELSE 0 END) AS checked_in_count,
             SUM(CASE WHEN ti.status = 'issued' THEN 1 ELSE 0 END) AS remaining_count,
             SUM(CASE WHEN ti.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count,
             SUM(CASE WHEN ti.status = 'refunded' THEN 1 ELSE 0 END) AS refunded_count
           FROM ticket_items ti
           WHERE ti.site_key = ?
           GROUP BY ti.event_product_id
         ),
         line_revenue AS (
           SELECT
             ol.event_product_id AS event_product_id,
             SUM(COALESCE(ol.unit_price_cents, 0) * COALESCE(ol.quantity, 0)) AS ticket_revenue_cents,
             SUM(
               CASE
                 WHEN COALESCE(o.ticket_subtotal_cents, 0) <= 0 THEN 0
                 ELSE ROUND(
                   (COALESCE(ol.unit_price_cents, 0) * COALESCE(ol.quantity, 0) * 1.0 / COALESCE(o.ticket_subtotal_cents, 0))
                   * COALESCE(o.service_fee_cents, 0)
                 )
               END
             ) AS service_fee_revenue_cents
           FROM ticket_order_lines ol
           JOIN ticket_orders o ON o.id = ol.order_id
           WHERE ol.site_key = ?
           GROUP BY ol.event_product_id
         )
         SELECT
           ts.event_product_id,
           ts.event_name,
           ts.total_tickets,
           ts.total_orders,
           ts.checked_in_count,
           ts.remaining_count,
           ts.cancelled_count,
           ts.refunded_count,
           COALESCE(lr.ticket_revenue_cents, 0) AS ticket_revenue_cents,
           COALESCE(lr.service_fee_revenue_cents, 0) AS service_fee_revenue_cents,
           COALESCE(lr.ticket_revenue_cents, 0) + COALESCE(lr.service_fee_revenue_cents, 0) AS total_revenue_cents
         FROM ticket_stats ts
         LEFT JOIN line_revenue lr ON lr.event_product_id = ts.event_product_id
         ORDER BY ts.event_name COLLATE NOCASE ASC`,
      )
      .bind(siteKey, siteKey)
      .all();

    return jsonResponse({
      ok: true,
      items: Array.isArray(result?.results) ? result.results : [],
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
}

async function getAdminTicketLookup(db, siteKey, code, eventProductId = "") {
  return db
    .prepare(
      `SELECT
          ti.id,
          ti.order_id,
          ti.event_product_id,
          ti.event_name,
          ti.ticket_number,
          ti.holder_name,
          ti.holder_email,
          ti.qr_token,
          ti.status,
          ti.issued_at,
          ti.checked_in_at,
          o.customer_name,
          o.customer_email,
          o.order_codeword,
          o.total_paid_cents,
          o.quantity_total
       FROM ticket_items ti
       JOIN ticket_orders o ON o.id = ti.order_id
       WHERE ti.site_key = ?
         AND (? = '' OR ti.event_product_id = ?)
         AND (
           LOWER(ti.qr_token) = ?
           OR LOWER(ti.id) = ?
         )
       LIMIT 1`,
    )
    .bind(siteKey, eventProductId, eventProductId, code, code)
    .first();
}

async function getAdminOrderBundle(db, siteKey, orderId, eventProductId = "") {
  const orderLookup = String(orderId || "").trim();
  if (!orderLookup) return null;
  const orderLookupLower = orderLookup.toLowerCase();
  const orderLookupCodeword = normalizeOrderCodeword(orderLookup);

  const orderSummary = await db
    .prepare(
      `SELECT
          o.id AS order_id,
          o.customer_name,
          o.customer_email,
          o.order_codeword,
          o.total_paid_cents,
          o.service_fee_cents,
          o.quantity_total,
          COUNT(ti.id) AS total_tickets,
          SUM(CASE WHEN ti.status = 'checked_in' THEN 1 ELSE 0 END) AS checked_in_count,
          SUM(CASE WHEN ti.status = 'issued' THEN 1 ELSE 0 END) AS issued_count,
          MIN(ti.event_name) AS event_name,
          MIN(ti.event_product_id) AS event_product_id
       FROM ticket_orders o
       JOIN ticket_items ti ON ti.order_id = o.id
       WHERE o.site_key = ?
         AND (
           LOWER(o.id) = ?
           OR LOWER(COALESCE(o.order_codeword, '')) = ?
         )
         AND (? = '' OR ti.event_product_id = ?)
       GROUP BY o.id, o.customer_name, o.customer_email, o.order_codeword, o.total_paid_cents, o.service_fee_cents, o.quantity_total
       LIMIT 1`,
    )
    .bind(siteKey, orderLookupLower, orderLookupCodeword, eventProductId, eventProductId)
    .first();

  if (!orderSummary) return null;
  const ensuredOrderCodeword = await ensureTicketOrderCodeword(
    db,
    siteKey,
    String(orderSummary.order_id || ""),
    orderSummary.order_codeword,
  );

  const ticketsResult = await db
    .prepare(
      `SELECT
          ti.id,
          ti.order_id,
          ti.event_product_id,
          ti.event_name,
          ti.ticket_number,
          ti.holder_name,
          ti.holder_email,
          ti.qr_token,
          ti.status,
          ti.issued_at,
          ti.checked_in_at,
          o.customer_name,
          o.customer_email,
          o.order_codeword,
          o.total_paid_cents,
          o.quantity_total
       FROM ticket_items ti
       JOIN ticket_orders o ON o.id = ti.order_id
       WHERE ti.site_key = ?
         AND ti.order_id = ?
         AND (? = '' OR ti.event_product_id = ?)
       ORDER BY ti.ticket_number ASC, ti.created_at ASC`,
    )
    .bind(siteKey, orderId, eventProductId, eventProductId)
    .all();

  const tickets = Array.isArray(ticketsResult?.results) ? ticketsResult.results : [];
  const totalTickets = Number(orderSummary.total_tickets || 0);
  const checkedInCount = Number(orderSummary.checked_in_count || 0);
  const issuedCount = Number(orderSummary.issued_count || 0);

  return {
    order: {
      ...orderSummary,
      order_codeword: ensuredOrderCodeword || normalizeOrderCodeword(orderSummary.order_codeword || ""),
      total_tickets: totalTickets,
      checked_in_count: checkedInCount,
      issued_count: issuedCount,
      remaining_count: issuedCount,
    },
    tickets,
  };
}

async function insertTicketCheckinLog(db, { siteKey, ticketId, eventProductId, actorId, notes, method }) {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO ticket_checkins
        (id, site_key, ticket_item_id, event_product_id, checkin_method, actor_type, actor_id, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      siteKey,
      ticketId,
      eventProductId || "",
      method || "admin_manual",
      "admin",
      actorId || "admin",
      notes || null,
      now,
    )
    .run();
}

async function markTicketCheckedIn(db, { siteKey, ticketId, eventProductId, actorId, notes, method }) {
  const current = await db
    .prepare(
      `SELECT id, status, checked_in_at
       FROM ticket_items
       WHERE site_key = ? AND id = ?
       LIMIT 1`,
    )
    .bind(siteKey, ticketId)
    .first();

  if (!current) {
    return { ok: false, status: "not_found" };
  }

  const currentStatus = String(current.status || "issued");
  if (currentStatus !== "issued") {
    await insertTicketCheckinLog(db, {
      siteKey,
      ticketId,
      eventProductId,
      actorId,
      notes: notes || `already_${currentStatus}`,
      method: method || "admin_manual",
    });
    return { ok: true, status: currentStatus, checkedInAt: current.checked_in_at || null };
  }

  const now = new Date().toISOString();
  await db
    .prepare(
      `UPDATE ticket_items
       SET status = 'checked_in', checked_in_at = ?, checked_in_by = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(now, actorId || "admin", now, ticketId)
    .run();

  await insertTicketCheckinLog(db, {
    siteKey,
    ticketId,
    eventProductId,
    actorId,
    notes,
    method: method || "admin_manual",
  });

  return { ok: true, status: "checked_in", checkedInAt: now };
}

async function handleAdminValidateTicket(req, env, url) {
  try {
    const db = getTicketsDb(env);
    if (!db) {
      return jsonResponse({ ok: false, error: "TICKETS_DB binding ontbreekt" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const siteKey = String(body?.site || url.searchParams.get("site") || resolveDefaultSiteContext(env).key || DEFAULT_SITE_KEY).trim();
    const code = String(body?.code || "").trim();
    const eventProductId = String(body?.event || "").trim();
    const autoCheckIn = body?.autoCheckIn !== false;

    if (!code) {
      return jsonResponse({ ok: false, error: "QR-code of ticketcode ontbreekt" }, 400);
    }

    const normalizedCode = code.toLowerCase();
    const ticket = await getAdminTicketLookup(db, siteKey, normalizedCode, eventProductId);
    if (ticket) {
      let resultStatus = String(ticket.status || "issued");
      if (autoCheckIn) {
        const result = await markTicketCheckedIn(db, {
          siteKey,
          ticketId: ticket.id,
          eventProductId: ticket.event_product_id,
          actorId: "admin_scan",
          method: "qr_scan",
          notes: `code:${code}`,
        });
        resultStatus = result.status;
        ticket.status = result.status;
        if (result.checkedInAt) {
          ticket.checked_in_at = result.checkedInAt;
        }
      }

      return jsonResponse({
        ok: true,
        kind: "ticket",
        status: resultStatus,
        ticket,
      });
    }

    const bundle = await getAdminOrderBundle(db, siteKey, code, eventProductId);
    if (bundle) {
      return jsonResponse({
        ok: true,
        kind: "order",
        status: "order_found",
        order: bundle.order,
        tickets: bundle.tickets,
      });
    }

    return jsonResponse({ ok: false, status: "not_found", message: "Ticket, order of codewoord niet gevonden" }, 404);
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
}

async function handleAdminCheckInTicket(req, env, url) {
  try {
    const db = getTicketsDb(env);
    if (!db) {
      return jsonResponse({ ok: false, error: "TICKETS_DB binding ontbreekt" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const siteKey = String(body?.site || url.searchParams.get("site") || resolveDefaultSiteContext(env).key || DEFAULT_SITE_KEY).trim();
    const ticketId = String(body?.ticketId || "").trim();
    if (!ticketId) {
      return jsonResponse({ ok: false, error: "ticketId ontbreekt" }, 400);
    }

    const ticket = await db
      .prepare(
        `SELECT
            ti.id,
            ti.order_id,
            ti.event_product_id,
            ti.event_name,
            ti.ticket_number,
            ti.holder_name,
            ti.holder_email,
            ti.status,
            ti.issued_at,
            ti.checked_in_at,
            o.customer_name,
            o.customer_email,
            o.order_codeword
         FROM ticket_items ti
         JOIN ticket_orders o ON o.id = ti.order_id
         WHERE ti.site_key = ?
           AND ti.id = ?
         LIMIT 1`,
      )
      .bind(siteKey, ticketId)
      .first();

    if (!ticket) {
      return jsonResponse({ ok: false, error: "Ticket niet gevonden" }, 404);
    }

    const result = await markTicketCheckedIn(db, {
      siteKey,
      ticketId,
      eventProductId: ticket.event_product_id,
      actorId: "admin_manual",
      method: "manual_checkin",
      notes: "manual_single",
    });

    ticket.status = result.status;
    if (result.checkedInAt) {
      ticket.checked_in_at = result.checkedInAt;
    }

    return jsonResponse({ ok: true, status: result.status, ticket });
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
}

async function handleAdminCheckInOrder(req, env, url) {
  try {
    const db = getTicketsDb(env);
    if (!db) {
      return jsonResponse({ ok: false, error: "TICKETS_DB binding ontbreekt" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const siteKey = String(body?.site || url.searchParams.get("site") || resolveDefaultSiteContext(env).key || DEFAULT_SITE_KEY).trim();
    const orderId = String(body?.orderId || "").trim();
    const eventProductId = String(body?.event || "").trim();
    const minusX = Math.max(0, Number(body?.minusX || 0) || 0);

    if (!orderId) {
      return jsonResponse({ ok: false, error: "orderId ontbreekt" }, 400);
    }

    const bundle = await getAdminOrderBundle(db, siteKey, orderId, eventProductId);
    if (!bundle) {
      return jsonResponse({ ok: false, error: "Order niet gevonden" }, 404);
    }

    const openTickets = bundle.tickets.filter((ticket) => String(ticket.status || "") === "issued");
    const checkInCount = Math.max(0, openTickets.length - minusX);
    const toCheckIn = openTickets.slice(0, checkInCount);

    for (const ticket of toCheckIn) {
      const result = await markTicketCheckedIn(db, {
        siteKey,
        ticketId: ticket.id,
        eventProductId: ticket.event_product_id,
        actorId: "admin_order",
        method: "order_bulk",
        notes: `order_bulk_minus_${minusX}`,
      });
      ticket.status = result.status;
      if (result.checkedInAt) {
        ticket.checked_in_at = result.checkedInAt;
      }
    }

    const refreshedBundle = await getAdminOrderBundle(db, siteKey, orderId, eventProductId);
    return jsonResponse({
      ok: true,
      status: checkInCount > 0 ? "checked_in" : "noop",
      checkedInNow: checkInCount,
      minusX,
      order: refreshedBundle?.order || bundle.order,
      tickets: refreshedBundle?.tickets || bundle.tickets,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
}

async function verifyAdmin(req, env) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return jsonResponse({ error: "Unauthorized" }, 401);

  const site = resolveSiteContext(req, new URL(req.url), env);
  const adminPasswordConfig = getOptionalSiteSecretValue(env, site, site?.admin_password_secret || "", "ADMIN_PASSWORD");
  if (!adminPasswordConfig?.value) return jsonResponse({ error: "ADMIN_PASSWORD not set" }, 500);
  const expected = await deriveAdminToken(site.key, adminPasswordConfig.value, env.ADMIN_SESSION_SECRET);
  if (token !== expected) return jsonResponse({ error: "Unauthorized" }, 401);
  return true;
}

async function deriveAdminToken(siteKey, password, secret) {
  const data = `${siteKey || DEFAULT_SITE_KEY}:${password}:${secret || ADMIN_SESSION_SALT}`;
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return base64url(hashBuffer);
}

async function readProductsSheet(env, siteOrOptions = {}, maybeOptions = {}) {
  const site =
    siteOrOptions && (siteOrOptions.sheetId || siteOrOptions.key)
      ? siteOrOptions
      : resolveDefaultSiteContext(env);
  const options =
    siteOrOptions && (siteOrOptions.sheetId || siteOrOptions.key)
      ? maybeOptions || {}
      : siteOrOptions || {};
  const { includeInactive = true } = options;
  const token = await getGoogleAccessToken(env, site);
  const rangesToTry = getRangeCandidates(env, site);

  let data;
  let lastError = null;
  let rangeUsed = rangesToTry[0];
  for (const range of rangesToTry) {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${site.sheetId}/values/${encodeURIComponent(range)}`,
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

async function readImagesSheet(env, site = resolveDefaultSiteContext(env), { includeRowNumber = true } = {}) {
  const token = await getGoogleAccessToken(env, site);
  const rangesToTry = getImageRangeCandidates(env, site);

  let data;
  let lastError = null;
  let rangeUsed = rangesToTry[0];
  for (const range of rangesToTry) {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${site.sheetId}/values/${encodeURIComponent(range)}`,
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
    throw new Error(`Images sheet read failed: ${lastError || "no data"}`);
  }

  const values = data.values;
  const headersRaw = values[0].map((h) => (h || "").toString().trim());
  const headers = headersRaw.map((h) => h.toLowerCase());
  const rows = values.slice(1);

  const images = rows.map((row, idx) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? "";
    });
    if (includeRowNumber) obj._rowNumber = idx + 2;
    return obj;
  });

  const sheetName = rangeUsed.split("!")[0] || "Images";

  return { headers, headersRaw, images, sheetName, rangeUsed, token };
}

function getRangeCandidates(env, site = resolveDefaultSiteContext(env)) {
  return [
    site.productsRange,
    env.PRODUCTS_RANGE,
    PRODUCTS_RANGE_DEFAULT,
    "Sheet1!A:ZZ",
    "Blad1!A:ZZ",
    "Products!A:ZZ",
  ].filter(Boolean);
}

function getImageRangeCandidates(env, site = resolveDefaultSiteContext(env)) {
  return [
    site.imagesRange,
    env.IMAGES_RANGE,
    "Images!A:ZZ",
    "Image!A:ZZ",
    "Afbeeldingen!A:ZZ",
    "Blad2!A:ZZ",
  ].filter(Boolean);
}

function getModelRangeCandidates(env, site = resolveDefaultSiteContext(env)) {
  return [
    site.modelsRange,
    env.MODELS_RANGE,
    MODELS_RANGE_DEFAULT,
    "3DModels!A:ZZ",
    "3DModel!A:ZZ",
    "Models3D!A:ZZ",
    "Models!A:ZZ",
  ].filter(Boolean);
}

async function readModelsSheet(env, site = resolveDefaultSiteContext(env), { includeRowNumber = true } = {}) {
  const token = await getGoogleAccessToken(env, site);
  const rangesToTry = getModelRangeCandidates(env, site);

  let data;
  let lastError = null;
  let rangeUsed = rangesToTry[0];
  for (const range of rangesToTry) {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${site.sheetId}/values/${encodeURIComponent(range)}`,
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
    throw new Error(`3DModels sheet read failed: ${lastError || "no data"}`);
  }

  const values = data.values;
  const headersRaw = values[0].map((h) => (h || "").toString().trim());
  const headers = headersRaw.map((h) => h.toLowerCase());
  const rows = values.slice(1);

  const models = rows.map((row, idx) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? "";
    });
    if (includeRowNumber) obj._rowNumber = idx + 2;
    return obj;
  });

  const sheetName = rangeUsed.split("!")[0] || "3DModels";
  return { headers, headersRaw, models, sheetName, rangeUsed, token };
}

async function replaceRow({ env, site = resolveDefaultSiteContext(env), sheetName, headers, rowNumber, values }) {
  const token = await getGoogleAccessToken(env, site);
  const normalizedHeaders = headers.map((h) => h.toLowerCase());
  const payload = normalizeKeys(values);
  const rowValues = normalizedHeaders.map((h) => payload[h] ?? "");
  const range = `${sheetName}!A${rowNumber}:${columnLetter(normalizedHeaders.length)}${rowNumber}`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${site.sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
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

async function ensureSheetHeaders({ env, site = resolveDefaultSiteContext(env), sheetName, headersRaw, requiredKeys }) {
  const existing = Array.isArray(headersRaw) ? headersRaw.map((h) => String(h || "").trim()) : [];
  const existingSet = new Set(existing.map((h) => h.toLowerCase()));
  const missing = [];
  for (const key of requiredKeys || []) {
    const normalized = String(key || "").trim().toLowerCase();
    if (!normalized || normalized === "_rownumber") continue;
    if (existingSet.has(normalized)) continue;
    missing.push(normalized);
    existingSet.add(normalized);
  }
  if (missing.length === 0) return existing;

  const nextHeaders = [...existing, ...missing];
  const token = await getGoogleAccessToken(env, site);
  const range = `${sheetName}!A1:${columnLetter(nextHeaders.length)}1`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${site.sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [nextHeaders] }),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets header update failed: ${text}`);
  }
  return nextHeaders;
}

async function appendProductRow({ env, site = resolveDefaultSiteContext(env), sheetName, values }) {
  const token = await getGoogleAccessToken(env, site);
  const range = `${sheetName}!A:AZ`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${site.sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
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

async function appendImageSheetRow(env, site = resolveDefaultSiteContext(env), { imageId, imageUrl, fileName, alt, title, uploadedAt }) {
  const { headersRaw, sheetName } = await readImagesSheet(env, site, { includeRowNumber: false });
  const loweredHeaders = headersRaw.map((h) => h.toLowerCase());
  const now = new Date().toISOString();

  const findHeader = (candidates, fallback = "") => {
    const idx = loweredHeaders.findIndex((h) => candidates.includes(h));
    if (idx === -1) return fallback;
    return headersRaw[idx];
  };

  const rowPayload = {
    [findHeader(["image_id", "imageid", "id"], "image_id")]: imageId,
    [findHeader(["image_url", "url", "src"], "image_url")]: imageUrl,
    [findHeader(["title", "name", "filename", "file_name"], "title")]: title || fileName || imageId,
    [findHeader(["alt", "alt_text", "alternative"], "alt")]: alt || "",
    [findHeader(["seo_title", "meta_title", "title_seo"], "seo_title")]: title || "",
    [findHeader(["uploaddate", "upload_date", "uploaded_at", "created_at", "datum"], "uploaddate")]:
      uploadedAt || now,
  };

  const rowValues = loweredHeaders.map((_, idx) => {
    const header = headersRaw[idx];
    return rowPayload[header] ?? "";
  });

  await appendProductRow({ env, site, sheetName, values: rowValues });
}

async function getSheetIdByName(env, token, sheetName, site = resolveDefaultSiteContext(env)) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${site.sheetId}?fields=sheets.properties`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  const sheets = Array.isArray(data?.sheets) ? data.sheets : [];
  const found = sheets.find((s) => s?.properties?.title === sheetName);
  return Number.isFinite(found?.properties?.sheetId) ? found.properties.sheetId : null;
}

function findHeaderByCandidates(headers, candidates) {
  for (const candidate of candidates) {
    const hit = resolveColumn(candidate, headers);
    if (hit) return hit;
  }
  return null;
}

async function getCloudflareImageUploadedAt(env, imageId) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CF_IMAGES_ACCOUNT_ID}/images/v1/${encodeURIComponent(imageId)}`,
    {
      headers: {
        Authorization: `Bearer ${env.CF_IMAGES_TOKEN}`,
      },
    },
  );
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  return data?.result?.uploaded || data?.result?.uploaded_at || null;
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

async function clearProductsCache(env, site = resolveDefaultSiteContext(env)) {
  if (env.PRODUCTS_CACHE) {
    try {
      await env.PRODUCTS_CACHE.delete(getProductsCacheKey(site));
    } catch {
      // ignore
    }
  }
  try {
    const cache = caches.default;
    await cache.delete(`/products?__site=${encodeURIComponent(site.key)}`);
    await cache.delete("/products");
  } catch {
    // ignore
  }
}

async function prefillProductsCache(env, url, site = resolveDefaultSiteContext(env)) {
  try {
    const { products } = await readProductsSheet(env, site, { includeInactive: false });
    if (env.PRODUCTS_CACHE) {
      await env.PRODUCTS_CACHE.put(getProductsCacheKey(site), JSON.stringify(products), {
        expirationTtl: PRODUCTS_CACHE_TTL,
      });
    }
    if (url) {
      const cache = caches.default;
      const cacheKey = buildProductsCacheRequest(new URL("/products", url).toString(), site);
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
