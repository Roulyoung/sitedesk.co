import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import WebshopIntentSections from "@/components/WebshopIntentSections";
import PagespeedProofSection from "@/components/PagespeedProofSection";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  MessageCircle,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  getAlternateHrefLangs,
  getLandingSectionId,
  getLocaleFromPath,
  stripLocaleFromPath,
  withLocalePath,
} from "@/lib/i18n";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const benchmarkLoadTimes = [0, 2, 4, 6] as const;
const LEAD_SUBMIT_ENDPOINT = "https://stripe-webhook.rdo90.workers.dev/submit";

type LeadResponse = {
  message?: string;
  analysis?: {
    mobilePerformanceScore?: string;
    desktopPerformanceScore?: string;
    estimatedLoss?: string;
    scoreEstimatedLoss?: string;
    estimatedLossFormatted?: string;
    scoreEstimatedLossFormatted?: string;
    pagespeedSummary?: string;
    usedFallback?: boolean;
  } | null;
};

const getConversionLossPercent = (seconds: number) => {
  if (seconds <= 0) return 0;
  if (seconds <= 4) return Math.round(seconds * 6);
  return Math.min(70, Math.round(24 + (seconds - 4) * 8));
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, value));

const extractNumericValue = (value: string | number | undefined | null) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? "").replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const benefitCards = [
  {
    title: "No tech team to manage",
    copy: {
      nl: "Wij houden je shop draaiend en bouwen door, zonder tickets, losse developers of technisch gedoe.",
      en: "We keep your store running and improving, without tickets, extra developers or technical hassle.",
    },
    icon: ShieldCheck,
  },
  {
    title: "Your team updates faster",
    copy: {
      nl: "Pas prijzen, voorraad en content aan in een omgeving die je team al kent, zonder developer-wachtrij.",
      en: "Update prices, stock and content in a tool your team already knows, without waiting on a developer.",
    },
    icon: Sparkles,
  },
  {
    title: "Less checkout friction",
    copy: {
      nl: "Een lichte checkout die sneller voelt op mobiel en minder klanten laat afhaken voor de betaling.",
      en: "A lean checkout that feels faster on mobile and lets fewer customers drop off before payment.",
    },
    icon: Zap,
  },
];

const comparisonRows = [
  {
    feature: { nl: "Laadtijd", en: "Load time" },
    sitedesk: "0ms",
    shopify: "2.5s - 5s",
    woocommerce: "3s - 10s+",
    magento: "3s - 8s",
    prestashop: "3s - 7s",
  },
  {
    feature: { nl: "PageSpeed mobiel", en: "Mobile PageSpeed" },
    sitedesk: "90 - 100",
    shopify: "40 - 60",
    woocommerce: "20 - 50",
    magento: "25 - 55",
    prestashop: "30 - 60",
  },
  {
    feature: { nl: "Beheer", en: "Management" },
    sitedesk: { nl: "Google Sheets (real-time)", en: "Google Sheets (real-time)" },
    shopify: { nl: "Dashboard + apps", en: "Dashboard + apps" },
    woocommerce: { nl: "WP-Admin + plugins", en: "WP Admin + plugins" },
    magento: { nl: "Complex admin panel", en: "Complex admin panel" },
    prestashop: { nl: "Backoffice + modules", en: "Back office + modules" },
  },
  {
    feature: { nl: "Doorontwikkeling", en: "Continuous development" },
    sitedesk: { nl: "Inclusief in maandbedrag", en: "Included in monthly fee" },
    shopify: { nl: "Apps + developers", en: "Apps + developers" },
    woocommerce: { nl: "Developer + plugin onderhoud", en: "Developer + plugin maintenance" },
    magento: { nl: "Developer team nodig", en: "Developer team required" },
    prestashop: { nl: "Module stack + developer", en: "Module stack + developer" },
  },
  {
    feature: { nl: "Veiligheid", en: "Security" },
    sitedesk: { nl: "Edge + beperkt aanvalsoppervlak", en: "Edge + reduced attack surface" },
    shopify: { nl: "SaaS afhankelijk", en: "SaaS dependent" },
    woocommerce: { nl: "Plugin en hosting risico", en: "Plugin and hosting risk" },
    magento: { nl: "Patch management zwaar", en: "Heavy patch management" },
    prestashop: { nl: "Module kwetsbaarheden mogelijk", en: "Potential module vulnerabilities" },
  },
];

const Webshop = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";
  const pathWithoutLocale = stripLocaleFromPath(location.pathname);
  const alternateLinks = getAlternateHrefLangs(pathWithoutLocale);
  const sectionIds = useMemo(
    () => ({
      tech: getLandingSectionId(locale, "tech"),
      scalable: getLandingSectionId(locale, "scalable"),
      calculator: getLandingSectionId(locale, "calculator"),
      comparison: getLandingSectionId(locale, "comparison"),
      offer: getLandingSectionId(locale, "offer"),
      sheets: getLandingSectionId(locale, "sheets"),
      contact: getLandingSectionId(locale, "contact"),
    }),
    [locale],
  );
  let pageTitle = isEn
    ? "Webshop that sells faster | Sitedesk"
    : "Supersnelle Webshop op Edge | €1.000 setup + €150 p/m | Sitedesk";
  let pageDescription =
    isEn
      ? "Sitedesk builds and manages custom webshops that load faster, convert better and cost less time to run."
      : "Sitedesk bouwt en beheert maatwerk webshops die sneller laden, beter converteren en minder tijd kosten om te runnen.";
  pageTitle = isEn ? "Webshop that sells faster | Sitedesk" : "Webshop die sneller verkoopt | Sitedesk";
  pageDescription = isEn
    ? "Sitedesk builds and manages custom webshops that load faster, convert better and cost less time to run."
    : "Sitedesk bouwt en beheert maatwerk webshops die sneller laden, beter converteren en minder tijd kosten om te runnen.";
  const canonicalUrl = `https://sitedesk.co${location.pathname}`;
  const imageUrl = "https://sitedesk.co/icon-sitedesk.png";
  const [monthlyRevenue, setMonthlyRevenue] = useState(10000);
  const [currentLoadTime, setCurrentLoadTime] = useState(4);
  const [monthlyVisitors, setMonthlyVisitors] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");
  const [reportStatus, setReportStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [reportError, setReportError] = useState("");
  const [reportSuccessDetails, setReportSuccessDetails] = useState<{ url: string; email: string } | null>(null);
  const [reportAnalysis, setReportAnalysis] = useState<LeadResponse["analysis"]>(null);

  const currentLossPercent = useMemo(() => getConversionLossPercent(currentLoadTime), [currentLoadTime]);
  const missedMonthlyRevenue = useMemo(
    () => monthlyRevenue * (currentLossPercent / 100),
    [monthlyRevenue, currentLossPercent],
  );
  const missedDailyRevenue = useMemo(() => missedMonthlyRevenue / 30, [missedMonthlyRevenue]);

  const monthlyVisitorsValue = useMemo(() => {
    if (!monthlyVisitors.trim()) return 0;
    const parsed = Number(monthlyVisitors);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }, [monthlyVisitors]);

  const estimatedLostVisitors = useMemo(() => {
    if (!monthlyVisitorsValue) return 0;
    return Math.round(monthlyVisitorsValue * (currentLossPercent / 100));
  }, [monthlyVisitorsValue, currentLossPercent]);

  const reportAnalysisHeadline = useMemo(() => {
    const mobileScore = Number(reportAnalysis?.mobilePerformanceScore || 0);
    if (!mobileScore) return "Zo scoort je shop nu ongeveer technisch";
    if (mobileScore < 40) return "Je shop laat hier serieus omzet liggen";
    if (mobileScore < 60) return "Er zit duidelijk conversiewinst in je snelheid";
    if (mobileScore < 80) return "De basis is er, maar technisch laat je nog marge liggen";
    return "Je shop presteert redelijk, maar er is nog winst te pakken";
  }, [reportAnalysis]);

  const reportAnalysisSubcopy = useMemo(() => {
    const mobileScore = Number(reportAnalysis?.mobilePerformanceScore || 0);
    if (!mobileScore) return "";
    if (mobileScore < 40) return "Dit is het soort score waarbij bezoekers afhaken, advertenties duurder worden en SEO-kansen blijven liggen.";
    if (mobileScore < 60) return "Niet rampzalig, maar wel langzaam genoeg om conversie en advertentierendement merkbaar te drukken.";
    if (mobileScore < 80) return "Voor veel shops voelt dit 'prima', maar in de praktijk kost het nog steeds orders en marge.";
    return "Voor de meeste bezoekers is dit acceptabel, maar sneller laden vertaalt nog steeds naar extra conversie.";
  }, [reportAnalysis]);

  const reportLossRange = useMemo(() => {
    const baseLoss =
      extractNumericValue(reportAnalysis?.scoreEstimatedLoss) ||
      extractNumericValue(reportAnalysis?.estimatedLoss) ||
      missedMonthlyRevenue;
    if (!baseLoss) return null;
    const min = Math.round(baseLoss * 0.85);
    const max = Math.round(baseLoss * 1.15);
    return {
      min,
      max,
      label: `${formatCurrency(min)} tot ${formatCurrency(max)}`,
    };
  }, [reportAnalysis, missedMonthlyRevenue]);

  const benchmarkRows = useMemo(
    () =>
      benchmarkLoadTimes.map((seconds) => {
        const lossPercent = getConversionLossPercent(seconds);
        const missedRevenue = monthlyRevenue * (lossPercent / 100);
        return {
          label:
            seconds === 0
              ? "0ms (Sitedesk)"
              : seconds === 6
                ? isEn
                  ? "6+ seconds"
                  : "6+ seconden"
                : `${seconds} ${isEn ? "seconds" : "seconden"}`,
          lossLabel: seconds === 0 ? "0%" : seconds === 6 ? `-${lossPercent}%+` : `-${lossPercent}%`,
          missedLabel: seconds === 0 ? (isEn ? "EUR 0 (maximum margin)" : "EUR 0 (maximale winst)") : formatCurrency(missedRevenue),
          isSitedesk: seconds === 0,
        };
      }),
    [monthlyRevenue, isEn],
  );
  useEffect(() => {
    const ids = [
      sectionIds.tech,
      sectionIds.scalable,
      sectionIds.calculator,
      sectionIds.comparison,
      sectionIds.offer,
      sectionIds.sheets,
      sectionIds.contact,
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          const hash = `#${visible.target.id}`;
          if (window.location.hash !== hash) {
            window.history.replaceState(null, "", hash);
          }
        }
      },
      { threshold: 0.4 },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  const trackLead = () => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: "AW-16878177204/84WcCP27oPUbELSXkvA-",
        value: 1.0,
        currency: "EUR",
      });
      window.gtag("event", "generate_lead");
    }
  };

  const postLead = async (payload: Record<string, string>) => {
    const res = await fetch(LEAD_SUBMIT_ENDPOINT, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || (isEn ? "Sending failed. Please try again." : "Versturen mislukt. Probeer opnieuw."));
    }
    return data as LeadResponse;
  };

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      leadType: "contact",
      name: formData.get("name")?.toString().trim() ?? "",
      email: formData.get("email")?.toString().trim() ?? "",
      message: formData.get("message")?.toString().trim() ?? "",
      company: formData.get("company")?.toString().trim() ?? "",
    };

    setContactStatus("sending");
    setContactError("");
    try {
      await postLead(payload);
      trackLead();
      setContactStatus("success");
      form.reset();
    } catch (err) {
      setContactStatus("error");
      setContactError(err instanceof Error ? err.message : (isEn ? "Sending failed. Please try again." : "Versturen mislukt. Probeer opnieuw."));
    }
  };

  const handleReportSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const rawUrl = String(formData.get("shopUrl") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
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
      setReportStatus("error");
      setReportError(isEn ? "Enter a valid shop domain." : "Vul een geldige domeinnaam in.");
      return;
    }

    if (!email) {
      setReportStatus("error");
      setReportError(isEn ? "Enter a valid email address." : "Vul een geldig e-mailadres in.");
      return;
    }

    const url = parsedUrl?.toString() ?? normalizedUrl;

    const payload = {
      leadType: "calculator",
      name: "Calculator lead",
      email,
      phone,
      URL: url,
      "E-mail": email,
      Telefoon: phone,
      "Maandelijkse Omzet": String(monthlyRevenue),
      "Huidige Laadtijd": currentLoadTime.toFixed(1),
      "Geschat Verlies": formatCurrency(missedMonthlyRevenue),
      shopUrl: url,
      monthlyRevenue: String(monthlyRevenue),
      currentLoadTime: currentLoadTime.toFixed(1),
      estimatedLoss: formatCurrency(missedMonthlyRevenue),
      message: [
        isEn ? "Calculator lead request" : "Calculator lead aanvraag",
        `Shop URL: ${url}`,
        `${isEn ? "Phone" : "Telefoon"}: ${phone || "-"}`,
        `E-mail: ${email || "-"}`,
        `${isEn ? "Monthly revenue" : "Maandelijkse omzet"}: ${formatCurrency(monthlyRevenue)}`,
        `${isEn ? "Current load time" : "Huidige laadtijd"}: ${currentLoadTime.toFixed(1)} ${isEn ? "seconds" : "seconden"}`,
        `${isEn ? "Estimated revenue loss p/m" : "Geschat omzetverlies p/m"}: ${formatCurrency(missedMonthlyRevenue)}`,
      ].join("\n"),
      company: String(formData.get("company") ?? "").trim(),
    };

    setReportStatus("sending");
    setReportError("");
    setReportSuccessDetails(null);
    setReportAnalysis(null);

    try {
      const response = await postLead(payload);
      trackLead();
      setReportStatus("success");
      setReportSuccessDetails({ url, email });
      setReportAnalysis(response?.analysis ?? null);
      form.reset();
      setMonthlyVisitors("");
    } catch (err) {
      setReportStatus("error");
      setReportError(err instanceof Error ? err.message : (isEn ? "Sending failed. Please try again." : "Versturen mislukt. Probeer opnieuw."));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        {alternateLinks.map((alt) => (
          <link key={alt.locale} rel="alternate" hrefLang={alt.locale} href={alt.href} />
        ))}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Sitedesk" />
        <meta property="og:locale" content={isEn ? "en_US" : "nl_NL"} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>
      <Header />
      <main className="pt-20 md:pt-24 space-y-24 md:space-y-32">
        {/* Hero */}
        <section id="speed-shock" className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-subtle" />
          <div className="absolute -right-24 top-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -left-24 bottom-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

          <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-semibold">
                  <Zap size={16} />
                  <span>{isEn ? "Built to stop conversion loss" : "Gebouwd om conversieverlies te stoppen"}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
                  {isEn ? "Stop losing revenue to a slow webshop." : "Stop met omzet verliezen aan een trage webshop."}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {isEn
                    ? "We build and manage custom webshops that load faster, convert better and are easier to run without developer bottlenecks."
                    : "Wij bouwen en beheren maatwerk webshops die sneller laden, beter converteren en makkelijker te runnen zijn zonder developer-knelpunten."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="hero" size="lg" className="group">
                    <a href={`#${sectionIds.contact}`}>
                      {isEn ? "Book a call" : "Plan een call"}
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-accent text-accent hover:bg-accent/10"
                  >
                    <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                      <MessageCircle />
                      {isEn ? "WhatsApp now" : "WhatsApp direct"}
                    </a>
                  </Button>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                  <div className="p-3 rounded-xl bg-card border border-border shadow-sm">
                    <div className="text-foreground font-semibold">{isEn ? "More control, less hassle" : "Meer grip, minder gedoe"}</div>
                    <p>{isEn ? "One fixed team that keeps your shop running and improving." : "Een vast team dat je shop draaiend houdt en blijft verbeteren."}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border shadow-sm">
                    <div className="text-foreground font-semibold">{isEn ? "No dev bottlenecks" : "Geen dev bottlenecks"}</div>
                    <p>{isEn ? "Your team can update products fast and send bigger changes straight to us." : "Je team past producten snel aan en legt grotere wijzigingen direct bij ons neer."}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border shadow-sm">
                    <div className="text-foreground font-semibold">{isEn ? "Faster growth loops" : "Snellere groeicyclus"}</div>
                    <p>{isEn ? "Launch changes and CRO tests without long queue times." : "Voer wijzigingen en CRO-tests door zonder lange wachttijd."}</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-card border border-border rounded-2xl shadow-xl p-6 space-y-5 animate-fade-up">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">Shopify/WooCommerce</span>
                      <span className="text-destructive font-bold text-lg">3s - 10s</span>
                    </div>
                    <div className="h-3 rounded-full bg-destructive/10 overflow-hidden mt-2">
                      <div className="h-full w-[90%] bg-destructive/80 animate-[pulse_2s_ease-in-out_infinite]" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {isEn ? "More waiting means more drop-off before visitors even see your offer." : "Meer wachttijd betekent meer afhakers voordat bezoekers je aanbod zien."}
                    </p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">Sitedesk Edge</span>
                      <span className="text-success font-bold text-lg">0ms</span>
                    </div>
                    <div className="h-3 rounded-full bg-success/10 overflow-hidden mt-2">
                      <div className="h-full w-[10%] bg-success shadow-glow" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {isEn
                        ? "Pages open fast, your team works faster and checkout creates less friction."
                        : "Pagina's openen sneller, je team werkt sneller en de checkout geeft minder frictie."}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-secondary/60 border border-border rounded-xl p-3">
                    <CheckCircle2 className="text-success" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">100/100 PageSpeed</p>
                      <p className="text-xs text-muted-foreground">
                        {isEn ? "A speed score that helps more visitors stay and buy." : "Een snelheidsscore die helpt om meer bezoekers vast te houden en te laten kopen."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PagespeedProofSection
          className="-mt-10 md:-mt-14"
          badgeLabel={{
            nl: "Live bewijslast: snelheid",
            en: "Live proof: speed",
          }}
          title={{
            nl: "Bekijk direct hoe snel een Sitedesk-shop echt laadt",
            en: "See how fast a real Sitedesk shop actually loads",
          }}
        />

        {/* Techniek */}
        <section id={sectionIds.tech} className="container mx-auto scroll-mt-28">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider">
                {isEn ? "Why it converts faster" : "Waarom dit sneller converteert"}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {isEn ? "Faster shops, fewer drop-offs, less technical risk." : "Snellere shops, minder afhakers, minder technisch risico."}
              </h2>
              <p className="text-muted-foreground text-lg">
                {isEn
                  ? "Your shop is built to feel direct from the first click, without the usual plugin weight, slow app layers or fragile maintenance."
                  : "Content en data worden direct vanaf de Edge geserveerd—geen trage centrale database of overvolle app layer. Geocache + serverless functions leveren je shop in milliseconden, met automatische DDoS-bescherming en zero trust security."}
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> {isEn ? "Visitors see your shop faster, so fewer drop off before browsing." : "Bezoekers zien je shop sneller, waardoor minder mensen afhaken voordat ze browsen."}
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> {isEn ? "Less plugin and hosting risk means fewer technical fires and fewer lost sales." : "Minder plugin- en hostingrisico betekent minder technische brandjes en minder gemiste omzet."}
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> {isEn ? "Price and stock updates go live fast, without waiting on deploys." : "Prijs- en voorraadwijzigingen staan snel live, zonder te wachten op deploys."}
                </li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-semibold text-foreground mb-4">{isEn ? "Sitedesk Edge vs. traditional stack" : "Sitedesk Edge vs. traditionele stack"}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/70 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Sitedesk Edge</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>{isEn ? "• Always close to the visitor, delivered instantly" : "• Altijd dichtbij de bezoeker, direct geleverd"}</li>
                    <li>{isEn ? "• No wait time: content is already ready" : "• Geen wachttijd: content staat al klaar"}</li>
                    <li>{isEn ? "• Lightweight stack without app bloat" : "• Lichtgewicht stack zonder app-bagage"}</li>
                    <li>{isEn ? "• Reduced attack surface: no open ports or plugins" : "• Afgeschermd oppervlak: geen open poorten of plugins"}</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/30">
                  <h3 className="font-semibold text-foreground mb-2">Shopify / Woo</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>{isEn ? "• Routes pass through a busy central environment" : "• Routes lopen via een drukke centrale omgeving"}</li>
                    <li>{isEn ? "• Extra apps and themes slow everything down" : "• Extra apps en thema’s vertragen alles"}</li>
                    <li>{isEn ? "• Visitors wait for boot-up and database calls" : "• Bezoeker wacht op opstart en database-calls"}</li>
                    <li>{isEn ? "• Larger attack surface due to plugins and hosting" : "• Breder aanvalsoppervlak door plugins en hosting"}</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-success/10 text-foreground text-sm">
                {isEn ? "0ms feel: edge delivery + lean JS bundles. No plugins, no warm-up." : "0ms gevoel: Edge delivery + lean JS bundels. Geen plugins, geen warm-up."}
              </div>
            </div>
          </div>
        </section>

        <section id={sectionIds.scalable} className="container mx-auto scroll-mt-28">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/80 p-8 md:p-10 text-primary-foreground shadow-xl">
            <div className="pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" aria-hidden />
            <div className="max-w-3xl">
              <span className="inline-block text-primary-foreground/85 font-semibold text-sm uppercase tracking-wider">
                {isEn ? "Built for scalability" : "Gebouwd voor schaalbaarheid"}
              </span>
              <h3 className="mt-3 text-3xl md:text-4xl font-bold text-primary-foreground">
                {isEn ? "Scale hard without the usual platform bottlenecks" : "Schaal hard zonder de gebruikelijke platform-bottlenecks"}
              </h3>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <article className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-300/20 text-emerald-200">
                  <ServerCog size={20} />
                </div>
                <h4 className="text-lg font-semibold text-primary-foreground">
                  {isEn ? "Zero-Constraint Scaling" : "Zero-Constraint Schalen"}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
                  {isEn
                    ? "Our serverless architecture scales seamlessly with your explosive growth. Process well over 100,000 orders per month without any delay or database bottlenecks."
                    : "Onze serverless architectuur schaalt naadloos mee met jouw explosieve groei. Verwerk moeiteloos meer dan 100.000 bestellingen per maand zonder enige vertraging of database-bottlenecks."}
                </p>
              </article>
              <article className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-300/20 text-emerald-300">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="text-lg font-semibold text-primary-foreground">
                  {isEn ? "Enterprise-Grade Security" : "Enterprise-Grade Security"}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
                  {isEn
                    ? "No outdated plugins that make your site vulnerable. We provide a closed, stable environment where security is the standard for every order flow."
                    : "Geen verouderde plugins die je site kwetsbaar maken. Wij leveren een afgesloten, stabiele omgeving waar security de standaard is voor elke orderstroom."}
                </p>
              </article>
              <article className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-300/20 text-amber-300">
                  <Globe2 size={20} />
                </div>
                <h4 className="text-lg font-semibold text-primary-foreground">
                  {isEn ? "Global Edge Performance" : "Global Edge Performance"}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
                  {isEn
                    ? "Customers abroad experience the same millisecond speed as customers around the corner. Conversion does not stop at borders, even during peak load."
                    : "Je klant in het buitenland ervaart dezelfde milliseconden-snelheid als je klant om de hoek. Conversie stopt niet bij de landsgrenzen, zelfs niet bij piekbelasting."}
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Live Experience */}
        <section className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider">
                {isEn ? "Feel the difference" : "Voel het verschil"}
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground">{isEn ? "Feel what less friction looks like." : "Voel hoe minder frictie eruitziet."}</h3>
              <p className="text-muted-foreground text-lg">
                {isEn
                  ? "A webshop should feel instant. The demo runs on the same setup we use for clients, so you can judge the speed and smoothness for yourself."
                  : "Een webshop moet direct aanvoelen. De demo draait op dezelfde setup die we voor klanten gebruiken, zodat je zelf de snelheid en soepelheid kunt ervaren."}
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { value: "100/100", label: isEn ? "Helps reduce drop-off" : "Helpt afhakers verlagen" },
                  { value: "Instant", label: isEn ? "Feels immediate" : "Voelt direct" },
                  { value: "0ms", label: isEn ? "No database wait" : "Geen database-wachttijd" },
                ].map((metric) => (
                  <div key={metric.label} className="p-4 rounded-xl bg-card border border-border shadow-md">
                    <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="hero"
                  size="lg"
                  className="shadow-glow"
                >
                  <a href={withLocalePath("/shop", locale)} data-umami-event="view-demo-shop">
                    {isEn ? "Launch demo shop" : "Lanceer Demo Shop"}
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-accent text-accent hover:bg-accent/10"
                >
                  <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer">
                    <MessageCircle />
                    {isEn ? "WhatsApp now" : "WhatsApp direct"}
                  </a>
                </Button>
                <Button asChild variant="hero" size="lg">
                  <a href={`#${sectionIds.contact}`}>{isEn ? "Book a call" : "Plan een call"}</a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-accent/10 blur-3xl rounded-3xl" aria-hidden />
              <div className="relative bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-secondary/60 px-4 py-3 flex items-center gap-2 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/50" />
                    <div className="w-3 h-3 rounded-full bg-accent/50" />
                    <div className="w-3 h-3 rounded-full bg-success/50" />
                  </div>
                  <div className="text-sm text-muted-foreground">demo.sitedesk.co/shop</div>
                </div>
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-primary/20 rounded" />
                    <div className="h-6 w-48 bg-primary/30 rounded" />
                    <div className="h-3 w-32 bg-muted rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 rounded-xl bg-card border border-border shadow-sm" />
                    <div className="h-20 rounded-xl bg-card border border-border shadow-sm" />
                    <div className="h-20 rounded-xl bg-card border border-border shadow-sm" />
                    <div className="h-20 rounded-xl bg-card border border-border shadow-sm" />
                  </div>
                  <div className="flex justify-end">
                    <Button asChild variant="hero" size="sm">
                      <a href={withLocalePath("/shop", locale)} data-umami-event="view-demo-shop">{isEn ? "Go to demo" : "Naar demo"}</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Omzetverlies calculator */}
        <section id={sectionIds.calculator} className="container mx-auto scroll-mt-28">
          <div className="text-center max-w-4xl mx-auto mb-10">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
              {isEn ? "Conversion loss calculator" : "Conversie verlies calculator"}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isEn ? "How much revenue is your webshop leaking every month?" : "Hoeveel omzet lekt je webshop elke maand weg?"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isEn
                ? "Research by Google and Amazon shows extra load time directly hurts conversion. 53% of mobile visitors drop off when a page takes longer than 3 seconds."
                : "Onderzoek van onder andere Google en Amazon laat zien dat extra laadtijd direct conversie kost. 53% van mobiele bezoekers haakt af als een pagina langer dan 3 seconden laadt."}
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Bron:{" "}
              <a
                href="https://think.storage.googleapis.com/docs/mobile-page-speed-new-industry-benchmarks.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Google mobile page speed benchmarks
              </a>
            </p>
          </div>

          <div className="grid xl:grid-cols-5 gap-6 items-start">
            <div className="xl:col-span-2 bg-card border border-border rounded-2xl shadow-xl p-6 space-y-5">
              <h3 className="text-xl font-bold text-foreground">{isEn ? "Enter your numbers" : "Vul je cijfers in"}</h3>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground" htmlFor="monthlyRevenue">
                  {isEn ? "Current monthly revenue" : "Huidige maandelijkse omzet"}
                </label>
                <input
                  id="monthlyRevenue"
                  type="number"
                  min={0}
                  step={500}
                  value={monthlyRevenue}
                  onChange={(event) => setMonthlyRevenue(Math.max(0, Number(event.target.value) || 0))}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground" htmlFor="loadTimeRange">
                  {isEn ? "Current load time in seconds" : "Huidige laadtijd in seconden"}
                </label>
                <input
                  id="loadTimeRange"
                  type="range"
                  min={0}
                  max={8}
                  step={0.5}
                  value={currentLoadTime}
                  onChange={(event) => setCurrentLoadTime(Number(event.target.value))}
                  className="w-full accent-accent"
                />
                <div className="text-sm text-muted-foreground">
                  {isEn ? "Set to" : "Ingesteld op"} <span className="font-semibold text-foreground">{currentLoadTime.toFixed(1)} {isEn ? "seconds" : "seconden"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground" htmlFor="monthlyVisitors">
                  {isEn ? "Monthly visitors (optional)" : "Maandelijkse bezoekers (optioneel)"}
                </label>
                <input
                  id="monthlyVisitors"
                  type="number"
                  min={0}
                  step={100}
                  value={monthlyVisitors}
                  onChange={(event) => setMonthlyVisitors(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder={isEn ? "E.g. 25000" : "Bijv. 25000"}
                />
              </div>

              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm text-muted-foreground">{isEn ? "Estimated missed revenue per month" : "Geschatte misgelopen omzet per maand"}</p>
                <p className="text-3xl font-extrabold text-destructive">{formatCurrency(missedMonthlyRevenue)}</p>
                <p className="text-sm text-muted-foreground">{isEn ? `That is about ${formatCurrency(missedDailyRevenue)} per day.` : `Dat is ongeveer ${formatCurrency(missedDailyRevenue)} per dag.`}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {isEn ? "Current loss at" : "Huidig verlies bij"} {currentLoadTime.toFixed(1)} {isEn ? "seconds" : "seconden"}: <span className="font-semibold text-foreground">-{currentLossPercent}%</span>
                </p>
                {monthlyVisitorsValue > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {isEn ? "Estimated lost visitors per month:" : "Geschat aantal verloren bezoekers per maand:"}{" "}
                    <span className="font-semibold text-foreground">{estimatedLostVisitors.toLocaleString(isEn ? "en-GB" : "nl-NL")}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="xl:col-span-3 space-y-6">
              <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="grid grid-cols-3 bg-secondary/60 text-sm md:text-base font-semibold">
                  <div className="p-4 md:p-5 text-foreground">{isEn ? "Load time" : "Laadtijd"}</div>
                  <div className="p-4 md:p-5 text-center text-foreground">{isEn ? "Conversion loss" : "Conversie verlies"}</div>
                  <div className="p-4 md:p-5 text-right text-foreground">{isEn ? "Missed revenue p/m" : "Misgelopen omzet p/m"}</div>
                </div>

                {benchmarkRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-3 border-t border-border text-sm md:text-base">
                    <div className={`p-4 md:p-5 ${row.isSitedesk ? "text-foreground font-semibold" : "text-foreground"}`}>
                      {row.label}
                    </div>
                    <div className={`p-4 md:p-5 text-center ${row.isSitedesk ? "text-foreground font-semibold" : "text-foreground font-semibold"}`}>
                      {row.lossLabel}
                    </div>
                    <div className={`p-4 md:p-5 text-right ${row.isSitedesk ? "text-foreground font-semibold" : "text-foreground font-semibold"}`}>
                      {row.missedLabel}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-primary text-primary-foreground rounded-2xl p-6 md:p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-2">
                  {isEn ? "Want a free report for your shop?" : "Wil je een gratis rapport voor jouw shop?"}
                </h3>
                <p className="text-primary-foreground/85 mb-5">
                  {isEn
                    ? "We compare your current shop with a Sitedesk Edge shop and show exactly where revenue is leaking."
                    : "We vergelijken jouw huidige shop met een Sitedesk Edge shop en laten exact zien waar je omzet laat liggen."}
                </p>
                <form onSubmit={handleReportSubmit} className="grid md:grid-cols-2 gap-3">
                  <div className="hidden">
                    <label htmlFor="company">{isEn ? "Company name (leave empty)" : "Bedrijfsnaam (laat leeg)"}</label>
                    <input id="company" name="company" type="text" />
                  </div>
                  <input
                    type="text"
                    name="shopUrl"
                    placeholder={isEn ? "yourshop.com or https://yourshop.com" : "jouwshop.nl of https://jouwshop.nl"}
                    required
                    className="rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary-foreground/60"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder={isEn ? "Email" : "E-mail"}
                    required
                    className="rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary-foreground/60"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder={isEn ? "Phone (optional)" : "Telefoon (optioneel)"}
                    className="rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary-foreground/60"
                  />
                  <Button
                    type="submit"
                    variant="heroOutline"
                    size="lg"
                    className="border-primary-foreground text-primary-foreground"
                    disabled={reportStatus === "sending"}
                  >
                    {reportStatus === "sending" ? (isEn ? "Sending..." : "Verzenden...") : isEn ? "Request free report" : "Vraag gratis rapport aan"}
                  </Button>
                </form>
                {reportError && <p className="text-sm mt-3 text-primary-foreground">{reportError}</p>}
                {reportStatus === "success" && (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm text-primary-foreground">
                      {reportSuccessDetails
                        ? `Bedankt! We analyseren ${reportSuccessDetails.url} en sturen het uitgebreide rapport naar ${reportSuccessDetails.email}.`
                        : isEn
                          ? "Request received. We will contact you soon."
                          : "Aanvraag ontvangen. We nemen snel contact met je op."}
                    </p>
                    {reportAnalysis && (
                      <div className="rounded-2xl border border-primary-foreground/25 bg-primary-foreground/10 p-4 md:p-5 text-sm text-primary-foreground space-y-4">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Snelle indicatie</p>
                          <h4 className="text-lg font-semibold text-primary-foreground">{reportAnalysisHeadline}</h4>
                          {reportAnalysisSubcopy && (
                            <p className="text-primary-foreground/80 leading-relaxed">{reportAnalysisSubcopy}</p>
                          )}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="rounded-xl bg-primary-foreground/10 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">Mobile score</p>
                            <p className="text-2xl font-bold">{reportAnalysis.mobilePerformanceScore || "-"}</p>
                          </div>
                          <div className="rounded-xl bg-primary-foreground/10 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">Desktop score</p>
                            <p className="text-2xl font-bold">{reportAnalysis.desktopPerformanceScore || "-"}</p>
                          </div>
                        </div>
                        <p>
                          Op basis van een maandelijkse omzet van{" "}
                          <span className="font-semibold">{formatCurrency(monthlyRevenue)}</span> laat je shop realistisch tussen{" "}
                          <span className="font-semibold">{reportLossRange?.label || formatCurrency(missedMonthlyRevenue)}</span>{" "}
                          per maand liggen door technische vertraging. Dat is omzet die je al hebt ingekocht, geadverteerd en binnengehaald, maar niet volledig verzilvert.
                        </p>
                        {reportAnalysis.pagespeedSummary && (
                          <p className="text-primary-foreground/80 leading-relaxed">
                            {reportAnalysis.usedFallback
                              ? "Deze indicatie is berekend op basis van je ingevulde laadtijd, omdat de live Google PageSpeed API tijdelijk geen quota gaf."
                              : "Deze indicatie komt uit een live PageSpeed-analyse van je shop."}{" "}
                            {reportAnalysis.pagespeedSummary}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Concurrentievergelijking */}
        <section id={sectionIds.comparison} className="container mx-auto scroll-mt-28">
          <div className="text-center max-w-4xl mx-auto mb-10">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
              {isEn ? "Platform comparison" : "Platformvergelijking"}
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {isEn ? "Why growth-focused shops outgrow standard platforms" : "Waarom groeigerichte shops standaard platforms ontgroeien"}
            </h3>
            <p className="text-lg text-muted-foreground">
              {isEn ? "A quick look at speed, day-to-day management and how much technical drag each platform adds." : "Een snel overzicht van snelheid, dagelijks beheer en hoeveel technische ballast elk platform toevoegt."}
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xl">
            <table className="min-w-[980px] w-full text-sm md:text-base">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="p-4 text-left font-semibold text-foreground">{isEn ? "Feature" : "Kenmerk"}</th>
                  <th className="p-4 text-left font-semibold text-foreground">Sitedesk</th>
                  <th className="p-4 text-left font-semibold text-muted-foreground">Shopify</th>
                  <th className="p-4 text-left font-semibold text-muted-foreground">WooCommerce</th>
                  <th className="p-4 text-left font-semibold text-muted-foreground">Magento</th>
                  <th className="p-4 text-left font-semibold text-muted-foreground">PrestaShop</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature.nl} className="border-t border-border align-top">
                    <td className="p-4 font-semibold text-foreground">{isEn ? row.feature.en : row.feature.nl}</td>
                    <td className="p-4 text-foreground font-semibold bg-success/5">
                      {typeof row.sitedesk === "string" ? row.sitedesk : isEn ? row.sitedesk.en : row.sitedesk.nl}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {typeof row.shopify === "string" ? row.shopify : isEn ? row.shopify.en : row.shopify.nl}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {typeof row.woocommerce === "string" ? row.woocommerce : isEn ? row.woocommerce.en : row.woocommerce.nl}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {typeof row.magento === "string" ? row.magento : isEn ? row.magento.en : row.magento.nl}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {typeof row.prestashop === "string" ? row.prestashop : isEn ? row.prestashop.en : row.prestashop.nl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <PagespeedProofSection
          badgeLabel={{
            nl: "Live bewijslast: benchmark",
            en: "Live proof: benchmark",
          }}
          title={{
            nl: "Na de vergelijking: toets onze snelheid live in PageSpeed",
            en: "After the comparison: validate our speed live in PageSpeed",
          }}
        />

        {/* Benefits grid */}
        <section id="voordelen" className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-10 items-start">
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                {isEn ? "More conversion. Less technical drag." : "Meer conversie. Minder technische ballast."}
              </h3>
              <p className="text-muted-foreground">
                {isEn
                  ? "Every part of the stack is built to help you sell faster, manage easier and waste less time on platform overhead."
                  : "Elk onderdeel van de stack is gebouwd om sneller te verkopen, makkelijker te beheren en minder tijd te verspillen aan platform-overhead."}
              </p>
            </div>
            <div className="md:col-span-3 grid md:grid-cols-3 gap-6">
              {benefitCards.map((benefit) => (
                <div
                  key={benefit.title}
                  className="p-6 rounded-2xl bg-card border border-border shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <benefit.icon size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{isEn ? benefit.copy.en : benefit.copy.nl}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pilot / Aanbod */}
        <section id={sectionIds.offer} className="container mx-auto scroll-mt-28">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 md:p-12 shadow-xl">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                  <Sparkles size={16} />
                  {isEn ? "Early adopter offer" : "Early adopter aanbod"}
                </div>
                <div className="bg-card text-foreground rounded-2xl p-6 shadow-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-accent">{isEn ? "Offer" : "Aanbod"}</span>
                    <span className="text-xs bg-accent/20 text-foreground px-3 py-1 rounded-full">{isEn ? "7 spots left" : "Nog 7 plekken"}</span>
                  </div>
                  <div className="hidden space-y-2">
                    <p className="text-muted-foreground line-through">€2.500 setup</p>
                    <p className="text-3xl font-bold text-foreground">{isEn ? "€1,000 one-time" : "€1.000 eenmalig"}</p>
                    <p className="text-muted-foreground line-through">€245 p/m</p>
                    <p className="text-2xl font-semibold text-foreground">€150 p/m (lifetime)</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground line-through">EUR 2.500 setup</p>
                    <p className="text-3xl font-bold text-foreground">{isEn ? "EUR 1,000 one-time" : "EUR 1.000 eenmalig"}</p>
                    <p className="text-muted-foreground line-through">EUR 245 p/m</p>
                    <p className="text-2xl font-semibold text-foreground">EUR 150 p/m (lifetime)</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    {isEn
                      ? "Includes hosting, support and continuous improvements, so your shop keeps moving without extra retainers."
                      : "Inclusief hosting, support en doorontwikkeling, zodat je shop door blijft groeien zonder extra retainers."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button asChild variant="hero" size="lg" className="bg-primary text-primary-foreground">
                      <a href={`#${sectionIds.contact}`}>{isEn ? "Book a call" : "Plan een call"}</a>
                    </Button>
                    <Button
                      asChild
                      variant="heroOutline"
                      size="lg"
                      className="border-primary-foreground text-primary-foreground"
                    >
                      <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer">
                        {isEn ? "WhatsApp now" : "WhatsApp direct"}
                      </a>
                    </Button>
                  </div>
                </div>
                <p className="hidden text-primary-foreground/80 text-sm leading-relaxed">
                  {isEn
                    ? "We are looking for 10 ambitious webshops that want to prove speed is the #1 growth factor. Now €1,000 setup and €150 p/m (lifetime) instead of €2,500 + €245 p/m."
                    : "We zoeken 10 ambitieuze webshops die willen bewijzen dat snelheid de nummer 1 groeifactor is. Nu eenmalig €1.000 setup en €150 p/m (lifetime) in plaats van €2.500 + €245 p/m."}
                </p>
                <p className="text-primary-foreground/80 text-sm leading-relaxed">
                  {isEn
                    ? "For the first 10 brands, we keep the entry low so you can switch to a faster webshop without a heavy upfront cost."
                    : "Voor de eerste 10 merken houden we de instap laag, zodat je kunt overstappen naar een snellere webshop zonder zware opstartkosten."}
                </p>
              </div>
              <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wide text-primary-foreground/80">
                    {isEn ? "What this gives you" : "Wat dit je oplevert"}
                  </span>
                  <ShieldCheck size={18} />
                </div>
                <ul className="hidden space-y-3 text-primary-foreground/80">
                  <li>✓ Edge hosting + 100/100 PageSpeed</li>
                  <li>{isEn ? "Product and stock updates without developer delay" : "Product- en voorraadupdates zonder developer-vertraging"}</li>
                  <li>✓ Stripe Lean checkout, mobile-first</li>
                  <li>{isEn ? "✓ Unlimited support and custom plugins" : "✓ Onbeperkt support en maatwerk plugins"}</li>
                </ul>
                <ul className="space-y-3 text-primary-foreground/80">
                  <li>{isEn ? "Fast storefront that keeps more visitors on-site" : "Snelle storefront die meer bezoekers vasthoudt"}</li>
                  <li>{isEn ? "Product and stock updates without developer delay" : "Product- en voorraadupdates zonder developer-vertraging"}</li>
                  <li>{isEn ? "Checkout with less mobile friction" : "Checkout met minder mobiele frictie"}</li>
                  <li>{isEn ? "Ongoing support and custom improvements included" : "Doorlopende support en maatwerk verbeteringen inbegrepen"}</li>
                </ul>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: isEn ? "Go live" : "Livegang", value: isEn ? "10 business days" : "10 werkdagen" },
                    { label: isEn ? "Speed" : "Snelheid", value: "100/100" },
                    { label: isEn ? "Focus" : "Focus", value: isEn ? "Conversion" : "Conversie" },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-primary-foreground/10">
                      <div className="text-xs uppercase tracking-wide text-primary-foreground/70">{item.label}</div>
                      <div className="text-xl font-bold">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Google Sheets management */}
        <section id={sectionIds.sheets} className="container mx-auto scroll-mt-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider">
                {isEn ? "Fast product management" : "Snel productbeheer"}
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground">{isEn ? "Update your shop without a slow admin or developer queue." : "Werk je shop bij zonder traag dashboard of developer-wachtrij."}</h3>
              <p className="text-muted-foreground text-lg">
                {isEn
                  ? "Update prices, stock and product copy in a spreadsheet your team already knows. Changes go live fast, without slow dashboards or plugin clutter."
                  : "Pas prijzen, voorraad en productteksten aan in een spreadsheet die je al kent. Veranderingen worden binnen één seconde live doorgezet—geen trage admin dashboards of plugin-chaos."}
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> {isEn ? "Your team works in a familiar tool instead of a clunky admin." : "Je team werkt in een vertrouwde tool in plaats van een log admin."}
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> {isEn ? "Updates go live fast, without waiting on deployments." : "Updates staan snel live, zonder te wachten op deployments."}
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> {isEn ? "Pricing and stock changes no longer depend on a developer." : "Prijs- en voorraadwijzigingen hangen niet meer af van een developer."}
                </li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="text-sm font-semibold text-foreground mb-4">{isEn ? "Google Sheets as CMS" : "Google Sheets als CMS"}</div>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-secondary/70 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>products.csv (live)</span>
                  <span className="text-foreground font-semibold">Synced • 1s</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50 text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">Product</th>
                        <th className="px-3 py-2 text-left">{isEn ? "Price" : "Prijs"}</th>
                        <th className="px-3 py-2 text-left">{isEn ? "Stock" : "Voorraad"}</th>
                        <th className="px-3 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Edge Hoodie", price: "€79", stock: "24", status: "Live" },
                        { name: "Performance Tee", price: "€39", stock: "58", status: "Live" },
                        { name: "Checkout Add-on", price: "€19", stock: "∞", status: "Live" },
                      ].map((row) => (
                        <tr key={row.name} className="border-t border-border">
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2">{row.price}</td>
                          <td className="px-3 py-2">{row.stock}</td>
                          <td className="px-3 py-2 text-foreground flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-success" /> {row.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {isEn ? "No more slow admin dashboards. Update spreadsheet → shop live." : "Geen trage admin-dashboards meer. Spreadsheet updaten → shop live."}
              </p>
            </div>
          </div>
        </section>

        <WebshopIntentSections />

        {/* Managed service story */}
        <section className="container mx-auto pb-20 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-foreground">{isEn ? "Your webshop without the usual technical drag" : "Je webshop zonder de gebruikelijke technische ballast"}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {isEn
                  ? "Stop juggling freelancers, plugins and technical issues. We act as your fixed ecommerce team and keep improving the shop with you."
                  : "Stop met schakelen tussen freelancers, plugins en technische issues. Wij zijn je vaste ecommerce-team en verbeteren de shop met je mee."}
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> {isEn ? "Send changes directly and we turn them into action." : "Stuur wijzigingen direct door en wij zetten ze om in actie."}
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> {isEn ? "New features, CRO tests and integrations stay inside one monthly fee." : "Nieuwe features, CRO-tests en koppelingen blijven binnen een vast maandbedrag."}
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> {isEn ? "No developer hiring, ticket management or platform firefighting." : "Geen developers aannemen, tickets beheren of platform-brandjes blussen."}
                </li>
              </ul>
              <div className="p-4 rounded-2xl bg-card border border-border shadow-md">
                <p className="text-foreground font-semibold mb-2">{isEn ? "Exclusive Pilot Deal" : "Exclusieve Pilot Deal"}</p>
                <p className="text-muted-foreground">
                  {isEn
                    ? "Temporary Early Adopter deal: €150 per month (lifetime) and €1,000 setup for the first 10 customers. Includes hosting, unlimited support and ongoing development."
                    : "Tijdelijke Early Adopter Deal: €150,- per maand (lifetime) en setup €1.000 voor de eerste 10 klanten. Inclusief hosting, onbeperkt support en doorontwikkeling van je shop (features, CRO-tests, koppelingen). Wij bouwen wat jij nodig hebt, jij focust op de verkoop."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <a href={`#${sectionIds.contact}`}>{isEn ? "Book a call" : "Plan een call"}</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-accent text-accent hover:bg-accent/10"
                >
                  <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer">
                    <MessageCircle />
                    {isEn ? "WhatsApp now" : "WhatsApp direct"}
                  </a>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-secondary/70 border border-border shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="text-success" size={20} />
                  <span className="font-semibold text-foreground">{isEn ? "No hidden costs" : "Geen verborgen kosten"}</span>
                </div>
                <p className="text-muted-foreground">
                  {isEn ? 'No "pro" subscriptions, no app store surprises. One monthly fee and done.' : 'Geen "pro" abonnementen, geen app-store verrassingen. Eén maandprijs en klaar.'}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="text-success" size={20} />
                  <span className="font-semibold text-foreground">{isEn ? "Always lightning fast" : "Altijd razendsnel"}</span>
                </div>
                <p className="text-muted-foreground">
                  {isEn ? "Edge-first architecture delivers instant content in every region. No warm-up, no drained caches." : "Edge-first architectuur levert direct content op elke regio. Geen warm-up, geen caches die leeglopen."}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="text-success" size={20} />
                  <span className="font-semibold text-foreground">{isEn ? "Built for your growth" : "Bouwt mee met je groei"}</span>
                </div>
                <p className="text-muted-foreground">
                  {isEn ? "We iterate with you on CRO, new flows and integrations. You no longer have to worry about tech." : "Wij itereren mee op CRO, nieuwe flows en koppelingen. Je hoeft nooit meer na te denken over techniek."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id={sectionIds.contact} className="container mx-auto pb-20 scroll-mt-28">
          <div className="grid lg:grid-cols-2 gap-12 items-start bg-card border border-border rounded-3xl p-8 md:p-12 shadow-lg">
            <div className="space-y-4">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider">
                {isEn ? "Free speed review" : "Gratis speed review"}
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                {isEn ? "Want to know where your webshop is losing money?" : "Wil je weten waar je webshop geld laat liggen?"}
              </h3>
              <p className="text-muted-foreground text-lg">
                {isEn
                  ? "We review your current speed, show where friction hurts conversion and explain what a faster setup would change."
                  : "We bekijken je huidige snelheid, laten zien waar frictie conversie kost en leggen uit wat een snellere setup verandert."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-accent text-accent hover:bg-accent/10"
                >
                  <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer">
                    <MessageCircle />
                    {isEn ? "WhatsApp now" : "WhatsApp direct"}
                  </a>
                </Button>
                <Button asChild variant="hero" size="lg">
                  <a href={`#${sectionIds.contact}`}>{isEn ? "Book a call" : "Plan een call"}</a>
                </Button>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleContactSubmit}>
              <div className="hidden">
                <label htmlFor="contact-company">{isEn ? "Company (leave empty)" : "Bedrijfsnaam (laat leeg)"}</label>
                <input id="contact-company" name="company" type="text" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="name">
                  {isEn ? "Name" : "Naam"}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder={isEn ? "Your name" : "Jouw naam"}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="email">
                  {isEn ? "Email" : "E-mail"}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="naam@domein.nl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="message">
                  {isEn ? "Message" : "Bericht"}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder={isEn ? "Tell us briefly about your shop or current load time." : "Vertel kort over je shop of huidige laadtijd."}
                  required
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={contactStatus === "sending"}>
                {contactStatus === "sending" ? (isEn ? "Sending..." : "Verzenden...") : isEn ? "Plan free speed check" : "Plan gratis speed-check"}
              </Button>
              <p className="text-xs text-muted-foreground">
                {isEn
                  ? "We respond within 1 business day. No obligations, just direct insights into your speed."
                  : "We reageren binnen 1 werkdag. Geen verplichtingen, wel directe inzichten in je snelheid."}
              </p>
              <div className="text-sm" aria-live="polite">
                {contactStatus === "success" && (
                  <span className="text-success">{isEn ? "Message received. We will contact you soon." : "Bericht ontvangen. We nemen snel contact op."}</span>
                )}
                {contactStatus === "error" && <span className="text-destructive">{contactError}</span>}
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Webshop;

