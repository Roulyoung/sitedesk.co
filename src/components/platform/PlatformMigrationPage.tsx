import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import {
  getAlternateHrefLangs,
  getLocaleFromPath,
  stripLocaleFromPath,
  withLocalePath,
  type SupportedLocale,
} from "@/lib/i18n";
import {
  getLocalizedMigrationText,
  migrationPlatforms,
  type PlatformMigrationConfig,
} from "@/lib/platformMigrationConfigs";

const ProductThreeDViewer = lazy(() => import("@/components/product/ProductThreeDViewer"));
const LEAD_SUBMIT_ENDPOINT = "https://stripe-webhook.rdo90.workers.dev/submit";
const MIGRATION_MODEL_URL =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb";

const getUiCopy = (locale: SupportedLocale) => {
  if (locale === "en") {
    return {
      loadedIn: "Loaded in",
      migrationCheck: "Migration Check",
      oldWorld: "The old world",
      problem: "Problem",
      solution: "The Sitedesk solution",
      whatYouGet: "What you get back from us",
      shopUrl: "Store URL",
      email: "Email",
      phone: "Phone (optional)",
      currentPlatform: "Current platform",
      appsPlugins: "Apps / plugins / integrations",
      other: "Other",
      extraContext: "Extra context (optional)",
      emptyCompany: "Company name (leave empty)",
      shopPlaceholder: "yourdomain.com or https://yourdomain.com",
      emailPlaceholder: "name@domain.com",
      phonePlaceholder: "+31 6 ...",
      appsPlaceholder: "For example 12 or MyParcel, Mollie",
      notesPlaceholder: "For example multilingual, B2B pricing, stock sync, a large SEO content structure...",
      submit: "Start free Migration Check",
      sending: "Sending...",
      invalidUrl: "Enter a valid store URL.",
      invalidEmail: "Enter a valid email address.",
      sendFailed: "Sending failed. Try again.",
      successPrefix: "We review",
      successMiddle: "and send your migration check to",
      guaranteeLabel: "Migration guarantee",
      guaranteeHeadline: "No big difference? The migration is free.",
      guaranteePoints: [
        "No clear speed gain",
        "No clear stability gain",
        "No clear improvement in day-to-day management",
      ],
      guaranteeFooter: "Then there should be no migration invoice.",
      loading3d: "Loading 3D model...",
      analyze: "Analyze",
      guaranteed: "100/100 Guaranteed",
      migrationRequestNameSuffix: "migration check",
      migrationMessageTitle: "Migration check request",
      fields: {
        platform: "Platform",
        pluginCount: "Apps/plugins/integrations",
        phone: "Phone",
        email: "Email",
        notes: "Extra context",
      },
    };
  }

  return {
    loadedIn: "Geladen in",
    migrationCheck: "Migratie-check",
    oldWorld: "De oude wereld",
    problem: "Probleem",
    solution: "De Sitedesk oplossing",
    whatYouGet: "Wat je van ons terugkrijgt",
    shopUrl: "Shop URL",
    email: "E-mail",
    phone: "Telefoon (optioneel)",
    currentPlatform: "Huidig platform",
    appsPlugins: "Apps / plugins / koppelingen",
    other: "Anders",
    extraContext: "Extra context (optioneel)",
    emptyCompany: "Bedrijfsnaam (laat leeg)",
    shopPlaceholder: "jouwdomein.nl of https://jouwdomein.nl",
    emailPlaceholder: "naam@domein.nl",
    phonePlaceholder: "+31 6 ...",
    appsPlaceholder: "Bijv. 12 of MyParcel, Mollie",
    notesPlaceholder: "Bijv. meertaligheid, B2B prijzen, voorraadkoppeling, veel SEO-landingspagina's...",
    submit: "Start gratis Migratie-Check",
    sending: "Verzenden...",
    invalidUrl: "Vul een geldige shop URL in.",
    invalidEmail: "Vul een geldig e-mailadres in.",
    sendFailed: "Versturen mislukt. Probeer opnieuw.",
    successPrefix: "We bekijken",
    successMiddle: "en sturen je migratie-check naar",
    guaranteeLabel: "Migratiegarantie",
    guaranteeHeadline: "Geen groot verschil? Dan is de migratie gratis.",
    guaranteePoints: [
      "Geen duidelijke snelheidswinst",
      "Geen duidelijke winst in stabiliteit",
      "Geen duidelijke verbetering in beheer en doorontwikkeling",
    ],
    guaranteeFooter: "Dan hoort daar geen migratiefactuur bij.",
    loading3d: "3D model laden...",
    analyze: "Analyseer",
    guaranteed: "100/100 Guaranteed",
    migrationRequestNameSuffix: "migratie-check",
    migrationMessageTitle: "Migratie-check aanvraag",
    fields: {
      platform: "Platform",
      pluginCount: "Aantal plugins/koppelingen",
      phone: "Telefoon",
      email: "E-mail",
      notes: "Extra context",
    },
  };
};

export default function PlatformMigrationPage({ config }: { config: PlatformMigrationConfig }) {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const ui = getUiCopy(locale);
  const pathWithoutLocale = stripLocaleFromPath(location.pathname);
  const alternateLinks = getAlternateHrefLangs(pathWithoutLocale);
  const canonical = `https://sitedesk.co${location.pathname}`;
  const [urlToAnalyze, setUrlToAnalyze] = useState("");
  const [loadMs, setLoadMs] = useState(0);
  const [checkStatus, setCheckStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [checkError, setCheckError] = useState("");
  const [checkSuccess, setCheckSuccess] = useState<{ url: string; email: string } | null>(null);

  useEffect(() => {
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (!navEntry) {
      setLoadMs(0);
      return;
    }
    setLoadMs(Math.max(1, Math.round(navEntry.responseEnd)));
  }, []);

  const loadSeconds = useMemo(() => (loadMs / 1000).toFixed(2), [loadMs]);
  const pageTitle = String(getLocalizedMigrationText(config.title, locale));
  const pageDescription = String(getLocalizedMigrationText(config.description, locale));
  const navLabel = String(getLocalizedMigrationText(config.navLabel, locale));
  const heroEyebrow = String(getLocalizedMigrationText(config.heroEyebrow, locale));
  const heroTitle = String(getLocalizedMigrationText(config.heroTitle, locale));
  const heroCopy = String(getLocalizedMigrationText(config.heroCopy, locale));
  const heroLeftLabel = String(getLocalizedMigrationText(config.heroLeftLabel, locale));
  const heroLeftItems = getLocalizedMigrationText(config.heroLeftItems, locale) as string[];
  const heroRightLabel = String(getLocalizedMigrationText(config.heroRightLabel, locale));
  const matrixTitle = String(getLocalizedMigrationText(config.matrixTitle, locale));
  const checkTitle = String(getLocalizedMigrationText(config.checkTitle, locale));
  const checkCopy = String(getLocalizedMigrationText(config.checkCopy, locale));
  const checkDeliverables = getLocalizedMigrationText(config.checkDeliverables, locale) as string[];
  const zeroEffortTitle = String(getLocalizedMigrationText(config.zeroEffortTitle, locale));
  const zeroEffortCopy = String(getLocalizedMigrationText(config.zeroEffortCopy, locale));
  const threeDTitle = String(getLocalizedMigrationText(config.threeDTitle, locale));
  const threeDCopy = String(getLocalizedMigrationText(config.threeDCopy, locale));
  const threeDFootnote = String(getLocalizedMigrationText(config.threeDFootnote, locale));
  const rebuildTitle = String(getLocalizedMigrationText(config.rebuildTitle, locale));
  const rebuildCopy = String(getLocalizedMigrationText(config.rebuildCopy, locale));
  const rebuildExtra = String(getLocalizedMigrationText(config.rebuildExtra, locale));
  const keywordTitle = String(getLocalizedMigrationText(config.keywordTitle, locale));
  const keywordIntro = String(getLocalizedMigrationText(config.keywordIntro, locale));
  const keywordPhrases = getLocalizedMigrationText(config.keywordPhrases, locale) as string[];
  const keywordMeta = keywordPhrases.join(", ");
  const riskTitle = String(getLocalizedMigrationText(config.riskTitle, locale));
  const riskCopy = String(getLocalizedMigrationText(config.riskCopy, locale));
  const timelineTitle = String(getLocalizedMigrationText(config.timelineTitle, locale));
  const extraMileTitle = String(getLocalizedMigrationText(config.extraMileTitle, locale));
  const seoTitle = String(getLocalizedMigrationText(config.seoTitle, locale));
  const seoCopy = String(getLocalizedMigrationText(config.seoCopy, locale));
  const seoExtra = String(getLocalizedMigrationText(config.seoExtra, locale));
  const stickyPrompt = String(getLocalizedMigrationText(config.stickyPrompt, locale));

  const startMigrationCheck = () => {
    const formSection = document.getElementById("migratie-check");
    const urlInput = document.getElementById("shopUrl") as HTMLInputElement | null;
    const emailInput = document.getElementById("email") as HTMLInputElement | null;

    if (urlInput && urlToAnalyze.trim()) {
      urlInput.value = urlToAnalyze.trim();
      urlInput.dispatchEvent(new Event("input", { bubbles: true }));
      urlInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.setTimeout(() => {
      if (emailInput) emailInput.focus();
      else if (urlInput) urlInput.focus();
    }, 300);
  };

  const handleMigrationCheckSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const rawUrl = String(formData.get("shopUrl") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const platform = String(formData.get("platform") ?? "").trim();
    const pluginCount = String(formData.get("pluginCount") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();
    const honeypot = String(formData.get("company") ?? "").trim();
    const normalizedUrl = rawUrl && /^https?:\/\//i.test(rawUrl) ? rawUrl : rawUrl ? `https://${rawUrl}` : "";

    let parsedUrl: URL | null = null;
    try {
      parsedUrl = normalizedUrl ? new URL(normalizedUrl) : null;
    } catch {
      parsedUrl = null;
    }

    const hostname = parsedUrl?.hostname?.trim() ?? "";
    const isValidDomain = Boolean(hostname && (hostname.includes(".") || hostname === "localhost"));

    if (!isValidDomain) {
      setCheckStatus("error");
      setCheckError(ui.invalidUrl);
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCheckStatus("error");
      setCheckError(ui.invalidEmail);
      return;
    }

    const url = parsedUrl?.toString() ?? normalizedUrl;
    const message = [
      ui.migrationMessageTitle,
      `Shop URL: ${url}`,
      `${ui.fields.platform}: ${platform || "-"}`,
      `${ui.fields.pluginCount}: ${pluginCount || "-"}`,
      `${ui.fields.phone}: ${phone || "-"}`,
      `${ui.fields.email}: ${email}`,
      `${ui.fields.notes}: ${notes || "-"}`,
    ].join("\n");

    setCheckStatus("sending");
    setCheckError("");
    setCheckSuccess(null);

    try {
      const response = await fetch(LEAD_SUBMIT_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadType: "migration",
          name: `${navLabel} ${ui.migrationRequestNameSuffix}`,
          email,
          message,
          phone,
          company: honeypot,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || ui.sendFailed);
      }

      setCheckStatus("success");
      setCheckSuccess({ url, email });
      form.reset();
    } catch (error) {
      setCheckStatus("error");
      setCheckError(error instanceof Error ? error.message : ui.sendFailed);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywordMeta} />
        <link rel="canonical" href={canonical} />
        {alternateLinks.map((alt) => (
          <link key={alt.locale} rel="alternate" hrefLang={alt.locale} href={alt.href} />
        ))}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <Header />
      <main className="pt-24 md:pt-28 pb-28">
        <section className="container mx-auto py-12 md:py-16">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              {ui.loadedIn} {loadSeconds}s
            </span>
            <div className="flex flex-wrap gap-2">
              {migrationPlatforms.map((platform) => (
                <NavLink
                  key={platform.key}
                  to={withLocalePath(platform.route, locale)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    config.key === platform.key
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {String(getLocalizedMigrationText(platform.navLabel, locale))}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{heroEyebrow}</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{heroTitle}</h1>
              <p className="text-lg text-muted-foreground">{heroCopy}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <a href="#migratie-check">{ui.submit}</a>
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(145deg,#fff7f5_0%,#fffaf6_38%,#f0fdf9_100%)] p-6 shadow-[0_35px_90px_-42px_rgba(15,23,42,0.34)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.22),transparent_34%)]" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="rounded-[1.5rem] border border-rose-300/60 bg-[linear-gradient(160deg,#fff1f2_0%,#ffe4e6_52%,#fff7f7_100%)] p-5 shadow-[0_18px_35px_-24px_rgba(190,24,93,0.35)]">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">{heroLeftLabel}</p>
                    <span className="rounded-full border border-rose-300/70 bg-rose-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-800">
                      Frictie
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {heroLeftItems.map((label, index) => (
                      <div
                        key={label}
                        className="rounded-xl border border-rose-200 bg-white px-3.5 py-3 text-sm font-medium text-rose-950 shadow-[0_14px_24px_-24px_rgba(136,19,55,0.8)]"
                      >
                        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-200 text-[11px] font-bold text-rose-900">
                          {index + 1}
                        </span>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-emerald-300/60 bg-[linear-gradient(160deg,#ecfdf5_0%,#d1fae5_48%,#ecfeff_100%)] p-5 shadow-[0_18px_35px_-24px_rgba(5,150,105,0.34)]">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">{heroRightLabel}</p>
                    <span className="rounded-full border border-emerald-300/70 bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
                      Schoon systeem
                    </span>
                  </div>
                  <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-5 rounded-[1.25rem] border border-emerald-200 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdfa_100%)] p-4 text-center shadow-[0_20px_32px_-28px_rgba(6,95,70,0.9)]">
                    <div className="relative flex h-28 w-28 items-center justify-center">
                      <div className="absolute inset-0 rotate-45 rounded-[1.75rem] bg-gradient-to-br from-emerald-400 via-teal-300 to-cyan-300 shadow-[0_30px_45px_-24px_rgba(13,148,136,0.55)]" />
                      <div className="relative z-10 text-xs font-black uppercase tracking-[0.28em] text-emerald-950">
                        Fast
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-emerald-950">Minder ballast. Meer controle. Hogere snelheid.</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">Custom logic</span>
                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-900">Edge delivery</span>
                        <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-900">No plugin chaos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto py-12 md:py-16">
          <h2 className="mb-6 text-3xl md:text-4xl font-bold text-foreground">{matrixTitle}</h2>
          <div className="overflow-hidden rounded-[1.9rem] border border-slate-200 bg-[linear-gradient(180deg,#fffdf8_0%,#fff7f5_22%,#f8fafc_100%)] shadow-[0_30px_70px_-42px_rgba(15,23,42,0.34)]">
            <table className="w-full min-w-[740px] text-left">
              <thead className="bg-[linear-gradient(90deg,#18181b_0%,#3f3f46_18%,#0f766e_100%)]">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-100">{ui.problem}</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.22em] text-rose-100">{ui.oldWorld}</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.22em] text-emerald-100">{ui.solution}</th>
                </tr>
              </thead>
              <tbody>
                {config.matrixRows.map((row, index) => (
                  <tr
                    key={String(getLocalizedMigrationText(row.problem, locale))}
                    className={`border-t border-slate-200/80 ${index % 2 === 0 ? "bg-[#fffaf8]" : "bg-[#f8fbfb]"}`}
                  >
                    <td className="px-5 py-5 align-top">
                      <div className="inline-flex items-start gap-3 rounded-2xl bg-white/80 px-3 py-3 shadow-[0_14px_24px_-24px_rgba(15,23,42,0.85)]">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="pt-1 text-sm font-semibold text-foreground">
                          {String(getLocalizedMigrationText(row.problem, locale))}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-5 align-top">
                      <div className="rounded-2xl border border-rose-200 bg-[linear-gradient(180deg,#fff1f2_0%,#ffe4e6_100%)] p-4 text-sm leading-relaxed text-rose-950 shadow-[0_18px_30px_-26px_rgba(159,18,57,0.75)]">
                        {String(getLocalizedMigrationText(row.nightmare, locale))}
                      </div>
                    </td>
                    <td className="px-5 py-5 align-top">
                      <div className="rounded-2xl border border-emerald-200 bg-[linear-gradient(180deg,#ecfdf5_0%,#d1fae5_100%)] p-4 text-sm font-medium leading-relaxed text-emerald-950 shadow-[0_18px_30px_-26px_rgba(5,150,105,0.75)]">
                        {String(getLocalizedMigrationText(row.solution, locale))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="migratie-check" className="container mx-auto py-12 md:py-16 scroll-mt-28">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{ui.migrationCheck}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">{checkTitle}</h2>
              <p className="text-lg text-muted-foreground">{checkCopy}</p>
              <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
                <p className="text-sm font-semibold text-foreground">{ui.whatYouGet}</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {checkDeliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <form onSubmit={handleMigrationCheckSubmit} className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-lg space-y-4">
              <div className="hidden">
                <label htmlFor="company">{ui.emptyCompany}</label>
                <input id="company" name="company" type="text" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="shopUrl">
                  {ui.shopUrl}
                </label>
                <input
                  id="shopUrl"
                  name="shopUrl"
                  type="text"
                  required
                  placeholder={ui.shopPlaceholder}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="email">
                    {ui.email}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={ui.emailPlaceholder}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="phone">
                    {ui.phone}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={ui.phonePlaceholder}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="platform">
                    {ui.currentPlatform}
                  </label>
                  <select
                    id="platform"
                    name="platform"
                    defaultValue={config.defaultPlatform}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  >
                    <option>WooCommerce</option>
                    <option>Shopify</option>
                    <option>Lightspeed</option>
                    <option>Magento</option>
                    <option>PrestaShop</option>
                    <option>{ui.other}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="pluginCount">
                    {ui.appsPlugins}
                  </label>
                  <input
                    id="pluginCount"
                    name="pluginCount"
                    type="text"
                    placeholder={ui.appsPlaceholder}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground" htmlFor="notes">
                  {ui.extraContext}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder={ui.notesPlaceholder}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={checkStatus === "sending"}>
                {checkStatus === "sending" ? ui.sending : ui.submit}
              </Button>
              {checkError && <p className="text-sm text-destructive">{checkError}</p>}
              {checkStatus === "success" && checkSuccess && (
                <p className="text-sm text-foreground">
                  {ui.successPrefix} <span className="font-semibold">{checkSuccess.url}</span> {ui.successMiddle}{" "}
                  <span className="font-semibold">{checkSuccess.email}</span>.
                </p>
              )}
            </form>
          </div>
        </section>

        <section className="container mx-auto py-12 md:py-16">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-8">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">{zeroEffortTitle}</h2>
            <p className="text-lg text-muted-foreground">{zeroEffortCopy}</p>
          </div>
        </section>

        <section className="container mx-auto py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">{threeDTitle}</h2>
              <p className="text-lg text-muted-foreground">{threeDCopy}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/60 p-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-muted-foreground">{ui.loading3d}</div>}>
                  <ProductThreeDViewer url={MIGRATION_MODEL_URL} scale={9} />
                </Suspense>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{threeDFootnote}</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto py-12 md:py-16">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-8">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">{rebuildTitle}</h2>
            <p className="text-lg text-muted-foreground">{rebuildCopy}</p>
            <p className="mt-4 text-base text-muted-foreground">{rebuildExtra}</p>
          </div>
        </section>

        <section className="container mx-auto py-12 md:py-16">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-8">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">{keywordTitle}</h2>
            <p className="text-lg text-muted-foreground">{keywordIntro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {keywordPhrases.map((phrase) => (
                <span
                  key={phrase}
                  className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-foreground"
                >
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto py-12 md:py-16">
          <div className="grid gap-6 rounded-[2rem] border border-accent/35 bg-[linear-gradient(135deg,#fef3c7_0%,#fff8eb_34%,#ecfdf5_100%)] p-8 md:grid-cols-[1.2fr_0.8fr] md:items-start shadow-[0_28px_60px_-38px_rgba(15,23,42,0.35)]">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-accent">{ui.guaranteeLabel}</p>
              <h2 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">{riskTitle}</h2>
              <p className="text-lg text-foreground/90">{riskCopy}</p>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-300/60 bg-white p-5 shadow-[0_18px_28px_-26px_rgba(6,95,70,0.9)]">
              <p className="text-lg font-bold text-emerald-950">{ui.guaranteeHeadline}</p>
              <ul className="mt-4 space-y-2.5 text-sm font-medium text-emerald-950">
                {ui.guaranteePoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200 text-[11px] font-bold text-emerald-900">
                      +
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-semibold text-emerald-900">{ui.guaranteeFooter}</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto py-12 md:py-16">
          <h2 className="mb-6 text-3xl md:text-4xl font-bold text-foreground">{timelineTitle}</h2>
          <div className="grid gap-3 md:grid-cols-4">
            {config.timelineSteps.map((step) => (
              <div key={String(getLocalizedMigrationText(step.day, locale))} className="rounded-xl border border-border/70 bg-card/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {String(getLocalizedMigrationText(step.day, locale))}
                </p>
                <p className="mt-2 text-sm text-foreground">{String(getLocalizedMigrationText(step.text, locale))}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto py-12 md:py-16">
          <h2 className="mb-6 text-3xl md:text-4xl font-bold text-foreground">{extraMileTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {config.extraMileCards.map((card) => (
              <div key={String(getLocalizedMigrationText(card.title, locale))} className="rounded-xl border border-border/70 bg-card/60 p-5">
                <p className="text-lg font-semibold text-foreground">{String(getLocalizedMigrationText(card.title, locale))}</p>
                <p className="mt-2 text-sm text-muted-foreground">{String(getLocalizedMigrationText(card.copy, locale))}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto py-12 md:py-16">
          <div className="rounded-2xl border border-emerald-300/50 bg-emerald-50/80 p-8">
            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-emerald-900">{seoTitle}</h2>
            <p className="text-lg text-emerald-900/90">{seoCopy}</p>
            <p className="mt-4 text-base text-emerald-900/90">{seoExtra}</p>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-[#fffaf2] shadow-[0_-24px_48px_-28px_rgba(15,23,42,0.35)]">
        <form
          className="container mx-auto flex flex-col gap-3 py-3 md:flex-row md:items-center md:gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            startMigrationCheck();
          }}
        >
          <p className="text-sm font-medium text-foreground">{stickyPrompt}</p>
          <input
            type="text"
            value={urlToAnalyze}
            onChange={(event) => setUrlToAnalyze(event.target.value)}
            placeholder={ui.shopPlaceholder}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm md:max-w-md"
          />
          <Button type="submit" variant="hero">
            {ui.analyze}
          </Button>
          <span className="inline-flex items-center rounded-full border border-emerald-400/50 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
            {ui.guaranteed}
          </span>
        </form>
      </div>

      <Footer />
      <FloatingContact />
    </div>
  );
}
