const allowedOrigins = new Set([
  "https://sitedesk.co",
  "https://www.sitedesk.co",
  "http://localhost:5173",
]);

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && allowedOrigins.has(origin) ? origin : "https://sitedesk.co";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function sendMail(env: any, payload: { name: string; email: string; message: string }) {
  const to = env.MAIL_TO || "info@sitedesk.co";
  const from = env.MAIL_FROM || "no-reply@sitedesk.co";

  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from, name: "Sitedesk Contact" },
    reply_to: { email: payload.email, name: payload.name },
    subject: `Nieuw contactformulier - ${payload.name}`,
    content: [
      {
        type: "text/plain",
        value: `Naam: ${payload.name}\nEmail: ${payload.email}\n\nBericht:\n${payload.message}`,
      },
      {
        type: "text/html",
        value: `<p><strong>Naam:</strong> ${payload.name}</p><p><strong>Email:</strong> ${payload.email}</p><p><strong>Bericht:</strong><br/>${payload.message
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br/>")}</p>`,
      },
    ],
  };

  const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Mail send failed: ${resp.status} ${text}`);
  }
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
  } catch (err) {
    return new Response(JSON.stringify({ message: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }

  const name = (body?.name ?? "").toString().trim();
  const email = (body?.email ?? "").toString().trim();
  const message = (body?.message ?? "").toString().trim();
  const honeypot = (body?.company ?? "").toString().trim();

  if (honeypot) {
    return new Response(JSON.stringify({ message: "OK" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }

  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!name || !emailRegex.test(email) || message.length < 5) {
    return new Response(JSON.stringify({ message: "Validation failed" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }

  try {
    if (env.CONTACT_WEBHOOK) {
      await fetch(env.CONTACT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name,
          email,
          message,
          receivedAt: new Date().toISOString(),
          ip: context.request.headers.get("CF-Connecting-IP") ?? "unknown",
        }),
      });
    }

    // Send email via MailChannels (uses defaults if env not set)
    await sendMail(env, { name, email, message });

    return new Response(JSON.stringify({ message: "Received" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Delivery failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }
};
