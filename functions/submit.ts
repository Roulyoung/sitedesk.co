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

    // Send directly via MailChannels (no bindings required)
    const to = "info@sitedesk.co";
    const from = "contact@sitedesk.co";

    const name = (body?.name ?? "").toString();
    const email = (body?.email ?? "").toString();
    const message = (body?.message ?? "").toString();

    // Temporary: short-circuit to verify route works. Uncomment mail send below when confirmed.
    return new Response(
      JSON.stringify({ message: "Received (mail send disabled for test)", name, email, origin }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
    );

    /*
    const mailPayload = {
      personalizations: [
        {
          to: [{ email: to }],
        },
      ],
      from: { email: from, name: "Sitedesk Contact" },
      reply_to: { email, name },
      subject: `Nieuw bericht van ${name}`,
      content: [
        {
          type: "text/plain",
          value: `Naam: ${name}\nEmail: ${email}\nBericht:\n${message}`,
        },
        {
          type: "text/html",
          value: `<p><strong>Naam:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Bericht:</strong><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
        },
      ],
    };

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
    */
  } catch (err) {
    return new Response(JSON.stringify({ message: "Unhandled error", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(null) },
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
