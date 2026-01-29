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

async function sendMail(env: any, data: { name: string; email: string; message: string }) {
  const emailSender = env.SEB || (env as any).EMAIL;
  if (!emailSender) {
    throw new Error("Email binding missing. Add an Email sending binding named 'SEB' (or 'EMAIL') in Pages Settings.");
  }

  const to = env.MAIL_TO || "info@sitedesk.co";
  const from = env.MAIL_FROM || "contact@sitedesk.co";

  const plain = `Naam: ${data.name}\nEmail: ${data.email}\n\nBericht:\n${data.message}`;
  const html = `<p><strong>Naam:</strong> ${escapeHtml(data.name)}</p>
<p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
<p><strong>Bericht:</strong><br/>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>`;

  await emailSender.send({
    from,
    to: [to],
    replyTo: data.email,
    subject: `Nieuw contactformulier - ${data.name}`,
    content: [
      { type: "text/plain", value: plain },
      { type: "text/html", value: html },
    ],
  });
}

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
          ip: request.headers.get("CF-Connecting-IP") ?? "unknown",
        }),
      });
    }

    await sendMail(env, { name, email, message });

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
