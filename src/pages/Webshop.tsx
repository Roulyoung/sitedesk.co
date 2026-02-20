import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { getAlternateHrefLangs, getLocaleFromPath, stripLocaleFromPath, withLocalePath } from "@/lib/i18n";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const benchmarkLoadTimes = [0, 2, 4, 6] as const;

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

const benefitCards = [
  {
    title: "Managed Service",
    copy: "Wij zijn je tech-team. Geen gedoe met updates of instellingen.",
    icon: ShieldCheck,
  },
  {
    title: "Google Sheets CMS",
    copy: "Update prijzen en voorraad in een spreadsheet die je al kent.",
    icon: Sparkles,
  },
  {
    title: "Stripe Lean Checkout",
    copy: "Razendsnelle betaalervaring die de conversie op mobiel verdubbelt.",
    icon: Zap,
  },
];

const comparisonRows = [
  {
    feature: "Laadtijd",
    sitedesk: "0ms",
    shopify: "2.5s - 5s",
    woocommerce: "3s - 10s+",
    magento: "3s - 8s",
    prestashop: "3s - 7s",
  },
  {
    feature: "PageSpeed mobiel",
    sitedesk: "90 - 100",
    shopify: "40 - 60",
    woocommerce: "20 - 50",
    magento: "25 - 55",
    prestashop: "30 - 60",
  },
  {
    feature: "Beheer",
    sitedesk: "Google Sheets (real-time)",
    shopify: "Dashboard + apps",
    woocommerce: "WP-Admin + plugins",
    magento: "Complex admin panel",
    prestashop: "Backoffice + modules",
  },
  {
    feature: "Doorontwikkeling",
    sitedesk: "Inclusief in maandbedrag",
    shopify: "Apps + developers",
    woocommerce: "Developer + plugin onderhoud",
    magento: "Developer team nodig",
    prestashop: "Module stack + developer",
  },
  {
    feature: "Veiligheid",
    sitedesk: "Edge + beperkt aanvalsoppervlak",
    shopify: "SaaS afhankelijk",
    woocommerce: "Plugin en hosting risico",
    magento: "Patch management zwaar",
    prestashop: "Module kwetsbaarheden mogelijk",
  },
];

const Webshop = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";
  const pathWithoutLocale = stripLocaleFromPath(location.pathname);
  const alternateLinks = getAlternateHrefLangs(pathWithoutLocale);
  const pageTitle = isEn
    ? "Ultra-Fast Edge Webshop | EUR 1,000 setup + EUR 150 p/m | Sitedesk"
    : "Supersnelle Webshop op Edge | €1.000 setup + €150 p/m | Sitedesk";
  const pageDescription =
    isEn
      ? "Sitedesk builds, hosts and maintains ultra-fast edge webshops. Includes Google Sheets CMS, Stripe checkout and support. Early Adopter: EUR 1,000 setup + EUR 150 p/m lifetime."
      : "Sitedesk bouwt, host en onderhoudt supersnelle webshops op Edge. Inclusief Google Sheets CMS, Stripe checkout en support. Early Adopter: €1.000 setup + €150 p/m lifetime.";
  const canonicalUrl = `https://sitedesk.co${location.pathname}`;
  const imageUrl = "https://sitedesk.co/icon-sitedesk.png";
  const [monthlyRevenue, setMonthlyRevenue] = useState(10000);
  const [currentLoadTime, setCurrentLoadTime] = useState(4);
  const [monthlyVisitors, setMonthlyVisitors] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");
  const [reportStatus, setReportStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [reportError, setReportError] = useState("");

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

  const benchmarkRows = useMemo(
    () =>
      benchmarkLoadTimes.map((seconds) => {
        const lossPercent = getConversionLossPercent(seconds);
        const missedRevenue = monthlyRevenue * (lossPercent / 100);
        return {
          label: seconds === 0 ? "0ms (Sitedesk)" : seconds === 6 ? "6+ seconden" : `${seconds} seconden`,
          lossLabel: seconds === 0 ? "0%" : seconds === 6 ? `-${lossPercent}%+` : `-${lossPercent}%`,
          missedLabel: seconds === 0 ? "EUR 0 (maximale winst)" : formatCurrency(missedRevenue),
          isSitedesk: seconds === 0,
        };
      }),
    [monthlyRevenue],
  );
  useEffect(() => {
    const ids = ["techniek", "omzetverlies", "concurrentievergelijking", "aanbod", "sheets", "contact"];
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
  }, []);

  const trackLead = () => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: "AW-16878177204/contact_form_submit",
        value: 1.0,
        currency: "EUR",
      });
      window.gtag("event", "generate_lead");
    }
  };

  const postLead = async (payload: Record<string, string>) => {
    const res = await fetch("/submit", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || "Versturen mislukt. Probeer opnieuw.");
    }
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
      setContactError(err instanceof Error ? err.message : "Versturen mislukt. Probeer opnieuw.");
    }
  };

  const handleReportSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const rawUrl = String(formData.get("shopUrl") ?? "").trim();
    const url = rawUrl && /^https?:\/\//i.test(rawUrl) ? rawUrl : rawUrl ? `https://${rawUrl}` : "";
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!url) {
      setReportStatus("error");
      setReportError("Vul je shop URL in.");
      return;
    }

    if (!email && !phone) {
      setReportStatus("error");
      setReportError("Vul minimaal e-mail of telefoonnummer in.");
      return;
    }

    const payload = {
      leadType: "calculator",
      name: "Calculator lead",
      email,
      phone,
      shopUrl: url,
      monthlyRevenue: String(monthlyRevenue),
      currentLoadTime: currentLoadTime.toFixed(1),
      estimatedLoss: formatCurrency(missedMonthlyRevenue),
      message: [
        "Calculator lead aanvraag",
        `Shop URL: ${url}`,
        `Telefoon: ${phone || "-"}`,
        `E-mail: ${email || "-"}`,
        `Maandelijkse omzet: ${formatCurrency(monthlyRevenue)}`,
        `Huidige laadtijd: ${currentLoadTime.toFixed(1)} seconden`,
        `Geschat omzetverlies p/m: ${formatCurrency(missedMonthlyRevenue)}`,
      ].join("\n"),
      company: String(formData.get("company") ?? "").trim(),
    };

    setReportStatus("sending");
    setReportError("");

    try {
      await postLead(payload);
      trackLead();
      setReportStatus("success");
      form.reset();
      setMonthlyVisitors("");
    } catch (err) {
      setReportStatus("error");
      setReportError(err instanceof Error ? err.message : "Versturen mislukt. Probeer opnieuw.");
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
        <meta property="og:locale" content="nl_NL" />
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
                  <span>Headless Edge E-commerce</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
                  {isEn ? "The fastest e-commerce engine for ambitious brands." : "De snelste e-commerce engine voor ambitieuze merken."}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {isEn
                    ? "Stop losing revenue to slow systems. We are your fully managed tech department and build high-performance edge webshops that are as easy to manage as a spreadsheet."
                    : "Stop met het verliezen van omzet door trage systemen. Wij zijn je volledig beheerde tech-afdeling en bouwen high-performance webshops op Edge-technologie die net zo makkelijk te beheren zijn als een spreadsheet."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="hero" size="lg" className="group">
                    <a href="#contact">
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
                    <div className="text-foreground font-semibold">{isEn ? "Fully managed" : "Volledig ontzorgd"}</div>
                    <p>{isEn ? "We are your fixed tech team, daily updates included." : "Wij zijn je vaste tech-team, dagelijkse wijzigingen inbegrepen."}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border shadow-sm">
                    <div className="text-foreground font-semibold">{isEn ? "No developer needed" : "Geen developer nodig"}</div>
                    <p>{isEn ? "Send requests via WhatsApp or phone, we handle it." : "Stuur wensen via WhatsApp of telefoon, wij regelen het."}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border shadow-sm">
                    <div className="text-foreground font-semibold">{isEn ? "Fast results" : "Snel resultaat"}</div>
                    <p>{isEn ? "Changes and CRO tests without queue time." : "Aanpassingen en CRO-tests zonder wachtrij."}</p>
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
                    <p className="text-xs text-muted-foreground mt-2">Apps, thema&apos;s en servers houden je tegen.</p>
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
                      Headless storefront, realtime Sheets CMS en ultra-lean checkout.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-secondary/60 border border-border rounded-xl p-3">
                    <CheckCircle2 className="text-success" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">100/100 PageSpeed</p>
                      <p className="text-xs text-muted-foreground">Mobiel en desktop, direct na livegang.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Techniek */}
        <section id="techniek" className="container mx-auto scroll-mt-28">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider">
                De techniek
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Headless Edge op Cloudflare: 0ms laadtijd, hacker-proof.
              </h2>
              <p className="text-muted-foreground text-lg">
                Content en data worden direct vanaf de Edge geserveerd—geen trage centrale database of overvolle app
                layer. Geocache + serverless functions leveren je shop in milliseconden, met automatische DDoS-bescherming
                en zero trust security.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> Geen origin-wachttijd: assets staan al bij de
                  bezoeker in de buurt.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> Edge security: geen openstaande database-poorten
                  of kwetsbare plugins.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> Realtime invalidation: prijzen en voorraad binnen
                  seconden vernieuwd.
                </li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h3 className="text-sm font-semibold text-foreground mb-4">Sitedesk Edge vs. traditionele stack</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/70 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Sitedesk Edge</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Altijd dichtbij de bezoeker, direct geleverd</li>
                    <li>• Geen wachttijd: content staat al klaar</li>
                    <li>• Lichtgewicht stack zonder app-bagage</li>
                    <li>• Afgeschermd oppervlak: geen open poorten of plugins</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/30">
                  <h3 className="font-semibold text-foreground mb-2">Shopify / Woo</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Routes lopen via een drukke centrale omgeving</li>
                    <li>• Extra apps en thema’s vertragen alles</li>
                    <li>• Bezoeker wacht op opstart en database-calls</li>
                    <li>• Breder aanvalsoppervlak door plugins en hosting</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-success/10 text-foreground text-sm">
                0ms gevoel: Edge delivery + lean JS bundels. Geen plugins, geen warm-up.
              </div>
            </div>
          </div>
        </section>

        {/* Live Experience */}
        <section className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider">
                Live experience
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground">Genoeg over techniek. Ervaar het zelf.</h3>
              <p className="text-muted-foreground text-lg">
                We kunnen je alles vertellen over onze architectuur, maar snelheid moet je voelen. Onze demo-shop draait
                op exact dezelfde engine die we voor jou inzetten. Geen caching-trucs, geen concessies. Alleen de
                snelste e-commerce ervaring van 2026.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { value: "100/100", label: "Google PageSpeed" },
                  { value: "Instant", label: "Pagina overgangen" },
                  { value: "0ms", label: "Database latency" },
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
                    Lanceer Demo Shop
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
                  <a href="#contact">{isEn ? "Book a call" : "Plan een call"}</a>
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
                      <a href={withLocalePath("/shop", locale)} data-umami-event="view-demo-shop">Naar demo</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Omzetverlies calculator */}
        <section id="omzetverlies" className="container mx-auto scroll-mt-28">
          <div className="text-center max-w-4xl mx-auto mb-10">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
              Conversie verlies calculator
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hoeveel omzet verlies jij aan de concurrent door een trage webshop?
            </h2>
            <p className="text-lg text-muted-foreground">
              Onderzoek van onder andere Google en Amazon laat zien dat extra laadtijd direct conversie kost.
              53% van mobiele bezoekers haakt af als een pagina langer dan 3 seconden laadt.
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
              <h3 className="text-xl font-bold text-foreground">Vul je cijfers in</h3>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground" htmlFor="monthlyRevenue">
                  Huidige maandelijkse omzet
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
                  Huidige laadtijd in seconden
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
                  Ingesteld op <span className="font-semibold text-foreground">{currentLoadTime.toFixed(1)} seconden</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground" htmlFor="monthlyVisitors">
                  Maandelijkse bezoekers (optioneel)
                </label>
                <input
                  id="monthlyVisitors"
                  type="number"
                  min={0}
                  step={100}
                  value={monthlyVisitors}
                  onChange={(event) => setMonthlyVisitors(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Bijv. 25000"
                />
              </div>

              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm text-muted-foreground">Geschatte misgelopen omzet per maand</p>
                <p className="text-3xl font-extrabold text-destructive">{formatCurrency(missedMonthlyRevenue)}</p>
                <p className="text-sm text-muted-foreground">Dat is ongeveer {formatCurrency(missedDailyRevenue)} per dag.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Huidig verlies bij {currentLoadTime.toFixed(1)} seconden: <span className="font-semibold text-foreground">-{currentLossPercent}%</span>
                </p>
                {monthlyVisitorsValue > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Geschat aantal verloren bezoekers per maand:{" "}
                    <span className="font-semibold text-foreground">{estimatedLostVisitors.toLocaleString("nl-NL")}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="xl:col-span-3 space-y-6">
              <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="grid grid-cols-3 bg-secondary/60 text-sm md:text-base font-semibold">
                  <div className="p-4 md:p-5 text-foreground">Laadtijd</div>
                  <div className="p-4 md:p-5 text-center text-foreground">Conversie verlies</div>
                  <div className="p-4 md:p-5 text-right text-foreground">Misgelopen omzet p/m</div>
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
                  Wil je een gratis rapport voor jouw shop?
                </h3>
                <p className="text-primary-foreground/85 mb-5">
                  We vergelijken jouw huidige shop met een Sitedesk Edge shop en laten exact zien waar je omzet laat liggen.
                </p>
                <form onSubmit={handleReportSubmit} className="grid md:grid-cols-2 gap-3">
                  <div className="hidden">
                    <label htmlFor="company">Bedrijfsnaam (laat leeg)</label>
                    <input id="company" name="company" type="text" />
                  </div>
                  <input
                    type="text"
                    name="shopUrl"
                    placeholder="jouwshop.nl of https://jouwshop.nl"
                    className="rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary-foreground/60"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="E-mail (optioneel)"
                    className="rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary-foreground/60"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Telefoon (optioneel)"
                    className="rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary-foreground/60"
                  />
                  <Button
                    type="submit"
                    variant="heroOutline"
                    size="lg"
                    className="border-primary-foreground text-primary-foreground"
                    disabled={reportStatus === "sending"}
                  >
                    {reportStatus === "sending" ? "Verzenden..." : "Vraag gratis rapport aan"}
                  </Button>
                </form>
                {reportError && <p className="text-sm mt-3 text-primary-foreground">{reportError}</p>}
                {reportStatus === "success" && (
                  <p className="text-sm mt-3 text-primary-foreground">
                    Aanvraag ontvangen. We nemen snel contact met je op.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Concurrentievergelijking */}
        <section id="concurrentievergelijking" className="container mx-auto scroll-mt-28">
          <div className="text-center max-w-4xl mx-auto mb-10">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
              Concurrentievergelijking
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Sitedesk vs Shopify, WooCommerce, Magento en PrestaShop
            </h3>
            <p className="text-lg text-muted-foreground">
              Een snel overzicht van performance, beheer en operationele complexiteit.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xl">
            <table className="min-w-[980px] w-full text-sm md:text-base">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="p-4 text-left font-semibold text-foreground">Kenmerk</th>
                  <th className="p-4 text-left font-semibold text-foreground">Sitedesk</th>
                  <th className="p-4 text-left font-semibold text-muted-foreground">Shopify</th>
                  <th className="p-4 text-left font-semibold text-muted-foreground">WooCommerce</th>
                  <th className="p-4 text-left font-semibold text-muted-foreground">Magento</th>
                  <th className="p-4 text-left font-semibold text-muted-foreground">PrestaShop</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-t border-border align-top">
                    <td className="p-4 font-semibold text-foreground">{row.feature}</td>
                    <td className="p-4 text-foreground font-semibold bg-success/5">{row.sitedesk}</td>
                    <td className="p-4 text-muted-foreground">{row.shopify}</td>
                    <td className="p-4 text-muted-foreground">{row.woocommerce}</td>
                    <td className="p-4 text-muted-foreground">{row.magento}</td>
                    <td className="p-4 text-muted-foreground">{row.prestashop}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Benefits grid */}
        <section id="voordelen" className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-10 items-start">
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                Meer snelheid. Minder gedoe.
              </h3>
              <p className="text-muted-foreground">
                Edge rendering, Sheets CMS en een checkout zonder ballast. Elke feature is gericht op conversie en
                minder overhead.
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
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pilot / Aanbod */}
        <section id="aanbod" className="container mx-auto scroll-mt-28">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 md:p-12 shadow-xl">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                  <Sparkles size={16} />
                  Exclusieve Early Adopter Deal
                </div>
                <div className="bg-card text-foreground rounded-2xl p-6 shadow-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-accent">Pilot Aanbod</span>
                    <span className="text-xs bg-accent/20 text-foreground px-3 py-1 rounded-full">Nog 7 plekken</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground line-through">€2.500 setup</p>
                    <p className="text-3xl font-bold text-foreground">€1.000 eenmalig</p>
                    <p className="text-muted-foreground line-through">€245 p/m</p>
                    <p className="text-2xl font-semibold text-foreground">€150 p/m (lifetime)</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Inclusief hosting, onbeperkt support en doorontwikkeling van je shop: features, CRO-tests en koppelingen. Niet alleen hosting.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button asChild variant="hero" size="lg" className="bg-primary text-primary-foreground">
                      <a href="#contact">{isEn ? "Book a call" : "Plan een call"}</a>
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
                <p className="text-primary-foreground/80 text-sm leading-relaxed">
                  We zoeken 10 ambitieuze webshops die willen bewijzen dat snelheid de nummer 1 groeifactor is. Nu eenmalig
                  €1.000 setup en €150 p/m (lifetime) in plaats van €2.500 + €245 p/m.
                </p>
              </div>
              <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wide text-primary-foreground/80">
                    Wat je krijgt
                  </span>
                  <ShieldCheck size={18} />
                </div>
                <ul className="space-y-3 text-primary-foreground/80">
                  <li>✓ Edge hosting + 100/100 PageSpeed</li>
                  <li>✓ Google Sheets CMS & realtime updates</li>
                  <li>✓ Stripe Lean checkout, mobile-first</li>
                  <li>✓ Onbeperkt support en maatwerk plugins</li>
                </ul>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { label: "Go live", value: "10 werkdagen" },
                    { label: "PageSpeed", value: "100/100" },
                    { label: "Checkout", value: "Stripe Lean" },
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

        {/* Google Sheets beheer */}
        <section id="sheets" className="container mx-auto scroll-mt-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider">
                Google Sheets beheer
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground">CMS in Sheets, live in 1 seconde.</h3>
              <p className="text-muted-foreground text-lg">
                Pas prijzen, voorraad en productteksten aan in een spreadsheet die je al kent. Veranderingen worden
                binnen één seconde live doorgezet—geen trage admin dashboards of plugin-chaos.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> Geen inlogstress: gewoon in Sheets werken.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> Realtime sync naar Edge-cache, zonder deploys.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> Team kan prijzen en voorraad beheren zonder developer.
                </li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="text-sm font-semibold text-foreground mb-4">Google Sheets als CMS</div>
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
                        <th className="px-3 py-2 text-left">Prijs</th>
                        <th className="px-3 py-2 text-left">Voorraad</th>
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
              <p className="text-sm text-muted-foreground mt-4">Geen trage admin-dashboards meer. Spreadsheet updaten → shop live.</p>
            </div>
          </div>
        </section>

        {/* Managed service story */}
        <section className="container mx-auto pb-20 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-foreground">De &quot;We Got You&quot; belofte</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Stop met het zoeken naar freelancers of het kopen van dure plugins. Wij zijn je tech-team.
                Stuur wijzigingen via WhatsApp of telefoon en wij voeren ze uit. Geen extra developers nodig en geen losse facturen.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> WhatsApp of bel: wij plannen en passen direct aan.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> Nieuwe features, CRO-tests en koppelingen vallen binnen je maandbedrag.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="text-success" size={18} /> Geen developers aannemen of tickets beheren: wij doen het werk.
                </li>
              </ul>
              <div className="p-4 rounded-2xl bg-card border border-border shadow-md">
                <p className="text-foreground font-semibold mb-2">Exclusieve Pilot Deal</p>
                <p className="text-muted-foreground">
                  Tijdelijke Early Adopter Deal: €150,- per maand (lifetime) en setup €1.000 voor de eerste 10 klanten. Inclusief hosting, onbeperkt support en doorontwikkeling van je shop (features, CRO-tests, koppelingen). Wij bouwen wat jij nodig hebt, jij focust op de verkoop.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <a href="#contact">{isEn ? "Book a call" : "Plan een call"}</a>
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
                  <span className="font-semibold text-foreground">Geen verborgen kosten</span>
                </div>
                <p className="text-muted-foreground">
                  Geen &quot;pro&quot; abonnementen, geen app-store verrassingen. Eén maandprijs en klaar.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="text-success" size={20} />
                  <span className="font-semibold text-foreground">Altijd razendsnel</span>
                </div>
                <p className="text-muted-foreground">
                  Edge-first architectuur levert direct content op elke regio. Geen warm-up, geen caches die leeglopen.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="text-success" size={20} />
                  <span className="font-semibold text-foreground">Bouwt mee met je groei</span>
                </div>
                <p className="text-muted-foreground">
                  Wij itereren mee op CRO, nieuwe flows en koppelingen. Je hoeft nooit meer na te denken over techniek.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="container mx-auto pb-20 scroll-mt-28">
          <div className="grid lg:grid-cols-2 gap-12 items-start bg-card border border-border rounded-3xl p-8 md:p-12 shadow-lg">
            <div className="space-y-4">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider">
                {isEn ? "Direct contact and demo" : "Direct contact & demo"}
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                {isEn ? "Questions about switching? We review your current speed for free." : "Vragen over de overstap? Wij kijken gratis mee naar je huidige laadtijd."}
              </h3>
              <p className="text-muted-foreground text-lg">
                {isEn
                  ? "We Got You: we build what you need, without extra costs. Book a demo or send a direct message."
                  : "We Got You: wij bouwen wat je nodig hebt, zonder extra kosten. Plan een demo of stuur direct een bericht."}
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
                  <a href="#contact">{isEn ? "Book a call" : "Plan een call"}</a>
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

