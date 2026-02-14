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
  "https://script.google.com/macros/s/AKfycbxxF9bO6eiPzC7VdikFWpFyCiYRi4ltL1B4Zz_bRhtT5r3DofVOPyitcEaY6VotLvru8A/exec";

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

    const leadType = (body?.leadType ?? "contact").toString().trim().toLowerCase();
    const name = (body?.name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim();
    const message = (body?.message ?? "").toString().trim();
    const honeypot = (body?.company ?? "").toString().trim();
    const phone = (body?.phone ?? "").toString().trim();
    const shopUrl = (body?.shopUrl ?? "").toString().trim();
    const monthlyRevenue = (body?.monthlyRevenue ?? "").toString().trim();
    const currentLoadTime = (body?.currentLoadTime ?? "").toString().trim();
    const estimatedLoss = (body?.estimatedLoss ?? "").toString().trim();

    // Honeypot
    if (honeypot) {
      return new Response(JSON.stringify({ message: "OK" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const isCalculatorLead = leadType === "calculator";
    if (isCalculatorLead) {
      if (!shopUrl || (!email && !phone)) {
        return new Response(JSON.stringify({ message: "Validation failed" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
        });
      }
    } else if (!name || !email || !message) {
      return new Response(JSON.stringify({ message: "Validation failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const resolvedName = isCalculatorLead ? name || "Calculator lead" : name;
    // Keep backward compatibility with older Apps Script versions that require email.
    const resolvedEmail = email || (isCalculatorLead ? "no-email@sitedesk.co" : "");
    const resolvedMessage =
      isCalculatorLead && !message
        ? [
            "Calculator lead aanvraag",
            `Shop URL: ${shopUrl || "-"}`,
            `Telefoon: ${phone || "-"}`,
            `E-mail: ${resolvedEmail || "-"}`,
            `Maandelijkse omzet: ${monthlyRevenue || "-"}`,
            `Huidige laadtijd: ${currentLoadTime || "-"}`,
            `Geschat omzetverlies p/m: ${estimatedLoss || "-"}`,
          ].join("\n")
        : message;

    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadType,
        name: resolvedName,
        email: resolvedEmail,
        message: resolvedMessage,
        phone,
        shopUrl,
        monthlyRevenue,
        currentLoadTime,
        estimatedLoss,
        company: honeypot,
        secret: CONTACT_SECRET,
      }),
    });

    const text = await upstream.text();
    let upstreamJson: any = null;
    try {
      upstreamJson = text ? JSON.parse(text) : null;
    } catch {
      upstreamJson = null;
    }

    if (!upstream.ok || (upstreamJson && upstreamJson.ok === false)) {
      return new Response(
        JSON.stringify({
          message: upstreamJson?.error || "Delivery failed",
          detail: upstreamJson?.detail || text || upstream.statusText,
        }),
        {
          status: upstream.ok ? 502 : upstream.status,
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
        },
      );
    }

    return new Response(JSON.stringify({ message: "Received" }), {
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
