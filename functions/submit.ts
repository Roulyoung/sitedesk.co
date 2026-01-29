const allowedOrigins = new Set([
  "https://sitedesk.co",
  "https://www.sitedesk.co",
  "http://localhost:5173",
]);

function isAllowedOrigin(origin: string | null) {
  if (!origin) return null;
  if (allowedOrigins.has(origin)) return origin;
  if (origin.endsWith(".pages.dev")) return origin;
  return null;
}

function corsHeaders(origin: string | null) {
  const allowOrigin = isAllowedOrigin(origin) || "https://sitedesk.co";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Shared secret for Apps Script
const CONTACT_SECRET = "OHUASDFIHUO87AIHUASDF&^^^&%kuhA123"; // set the same value in Apps Script
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxybdi6Eg-aP6YTocsWce3bVm62q6Q6-MJXwUJIqX2YVqWZua1cVbIq8C4eAHhsfR4F1A/exec";

export const onRequest: PagesFunction = async (context) => {
  try {
    const { request } = context;
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ message: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    let body: any;
    try {
      body = await request.json();
    } catch (err) {
      return new Response(JSON.stringify({ message: "Invalid JSON", detail: String(err) }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const name = (body?.name ?? "").toString();
    const email = (body?.email ?? "").toString();
    const message = (body?.message ?? "").toString();
    const honeypot = (body?.company ?? "").toString();

    // Honeypot
    if (honeypot) {
      return new Response(JSON.stringify({ message: "OK" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ message: "Validation failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message, secret: CONTACT_SECRET }),
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      return new Response(
        text || JSON.stringify({ message: "Delivery failed", detail: upstream.statusText }),
        { status: upstream.status, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
      );
    }

    return new Response(text || JSON.stringify({ message: "Received" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Unhandled error", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(null) },
    });
  }
};
