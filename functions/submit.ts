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

export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;
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
  } catch {
    return new Response(JSON.stringify({ message: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }

  // Send directly via MailChannels (no bindings required)
  const to = "info@sitedesk.co";
  const from = "contact@sitedesk.co";

  const mailPayload = {
    personalizations: [
      {
        to: [{ email: to }],
      },
    ],
    from: { email: from, name: "Sitedesk Contact" },
    reply_to: { email: body.email, name: body.name },
    subject: `Nieuw bericht van ${body.name}`,
    content: [
      {
        type: "text/plain",
        value: `Naam: ${body.name}\nEmail: ${body.email}\nBericht:\n${body.message}`,
      },
      {
        type: "text/html",
        value: `<p><strong>Naam:</strong> ${escapeHtml(body.name)}</p><p><strong>Email:</strong> ${escapeHtml(body.email)}</p><p><strong>Bericht:</strong><br/>${escapeHtml(body.message).replace(/\n/g, "<br/>")}</p>`,
      },
    ],
  };

  try {
    const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mailPayload),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ message: "Delivery failed", detail: text || res.statusText }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
      );
    }

    return new Response(JSON.stringify({ message: "Received" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Delivery failed", detail: String(err) }), {
      status: 502,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }
};

function escapeHtml(input: string) {
  return input.replace(/[<>&'"]/g, (c) => {
    switch (c) {
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
        return c;
    }
  });
}
