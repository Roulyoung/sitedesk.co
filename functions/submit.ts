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
  "https://script.google.com/macros/s/AKfycbzlUQPfbNeVh9XS7oz0alKRbG3k7pJiHHEnh7O4ceWJcGVU0NhHe0R2YwoIMnwCQBNOxg/exec";

function normalizeAndValidateShopUrl(input: string) {
  const raw = (input || "").trim();
  if (!raw) return "";
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    const host = (url.hostname || "").trim();
    if (!host || (!host.includes(".") && host !== "localhost")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function isValidEmail(input: string) {
  const email = (input || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type PagespeedSummary = {
  mobilePerformanceScore: string;
  desktopPerformanceScore: string;
  scoreEstimatedLoss: string;
  pagespeedSummary: string;
};

async function fetchPagespeedReport(url: string, strategy: "mobile" | "desktop") {
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", strategy);
  endpoint.searchParams.set("category", "PERFORMANCE");

  const response = await fetch(endpoint.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Pagespeed ${strategy} failed: ${response.status}`);
  const data = await response.json<any>();
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

function getLossPercentFromPerformanceScore(score: number | null) {
  if (score == null) return 0;
  if (score >= 90) return 0.03;
  if (score >= 80) return 0.05;
  if (score >= 70) return 0.08;
  if (score >= 60) return 0.12;
  if (score >= 50) return 0.18;
  return 0.25;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, value));
}

async function buildPagespeedSummary(shopUrl: string, monthlyRevenueRaw: string): Promise<PagespeedSummary> {
  try {
    const [mobile, desktop] = await Promise.all([
      fetchPagespeedReport(shopUrl, "mobile"),
      fetchPagespeedReport(shopUrl, "desktop"),
    ]);
    const monthlyRevenue = Number(String(monthlyRevenueRaw).replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", "."));
    const lossPercent = getLossPercentFromPerformanceScore(mobile.score);
    const scoreEstimatedLoss =
      Number.isFinite(monthlyRevenue) && monthlyRevenue > 0 ? formatCurrency(monthlyRevenue * lossPercent) : "";

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
  } catch {
    return {
      mobilePerformanceScore: "",
      desktopPerformanceScore: "",
      scoreEstimatedLoss: "",
      pagespeedSummary: "",
    };
  }
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

    const leadType = (body?.leadType ?? "contact").toString().trim().toLowerCase();
    const name = (body?.name ?? "").toString().trim();
    const email = (body?.email ?? body?.["E-mail"] ?? "").toString().trim();
    const message = (body?.message ?? "").toString().trim();
    const honeypot = (body?.company ?? "").toString().trim();
    const phone = (body?.phone ?? body?.Telefoon ?? "").toString().trim();
    const shopUrl = normalizeAndValidateShopUrl((body?.shopUrl ?? body?.URL ?? "").toString().trim());
    const monthlyRevenue = (body?.monthlyRevenue ?? body?.["Maandelijkse Omzet"] ?? "").toString().trim();
    const currentLoadTime = (body?.currentLoadTime ?? body?.["Huidige Laadtijd"] ?? "").toString().trim();
    const estimatedLoss = (body?.estimatedLoss ?? body?.["Geschat Verlies"] ?? "").toString().trim();
    let mobilePerformanceScore = "";
    let desktopPerformanceScore = "";
    let scoreEstimatedLoss = "";
    let pagespeedSummary = "";

    // Honeypot
    if (honeypot) {
      return new Response(JSON.stringify({ message: "OK" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const isCalculatorLead = leadType === "calculator";
    if (isCalculatorLead) {
      if (!shopUrl || !isValidEmail(email)) {
        return new Response(JSON.stringify({ message: "Validation failed" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
        });
      }
      const pagespeed = await buildPagespeedSummary(shopUrl, monthlyRevenue);
      mobilePerformanceScore = pagespeed.mobilePerformanceScore;
      desktopPerformanceScore = pagespeed.desktopPerformanceScore;
      scoreEstimatedLoss = pagespeed.scoreEstimatedLoss;
      pagespeedSummary = pagespeed.pagespeedSummary;
    } else if (!name || !email || !message) {
      return new Response(JSON.stringify({ message: "Validation failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const resolvedName = isCalculatorLead ? name || "Calculator lead" : name;
    const resolvedEmail = email;
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
            `Mobiele Lighthouse score: ${mobilePerformanceScore ? `${mobilePerformanceScore}/100` : "-"}`,
            `Desktop Lighthouse score: ${desktopPerformanceScore ? `${desktopPerformanceScore}/100` : "-"}`,
            `Geschat omzetverlies p/m op basis van live score: ${scoreEstimatedLoss || "-"}`,
            `Pagespeed samenvatting: ${pagespeedSummary || "-"}`,
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
        mobilePerformanceScore,
        desktopPerformanceScore,
        scoreEstimatedLoss,
        pagespeedSummary,
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
