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

const workerUrl = "https://delicate-forest-100d.rdo90.workers.dev";

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

  // Direct send via Pages email binding
  const emailSender = env.SEB || (env as any).EMAIL;
  if (!emailSender) {
    return new Response(JSON.stringify({ message: "Email binding missing: add SEB (Email sending) in Functions bindings" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }

  try {
    await emailSender.send({
      from: "contact@sitedesk.co",
      to: ["info@sitedesk.co"],
      replyTo: body.email,
      subject: `Nieuw bericht van ${body.name}`,
      content: [
        {
          type: "text/plain",
          value: `Naam: ${body.name}\nEmail: ${body.email}\nBericht: ${body.message}`,
        },
      ],
    });

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
