import { useEffect } from "react";
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
  XCircle,
} from "lucide-react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const comparisonRows = [
  {
    feature: "Laadtijd",
    sitedesk: "0ms",
    shopify: "2.5s - 5s",
    woocommerce: "3s - 10s+",
  },
  {
    feature: "PageSpeed Score",
    sitedesk: "100/100",
    shopify: "40 - 60",
    woocommerce: "20 - 50",
  },
  {
    feature: "Beheer",
    sitedesk: "Google Sheets (real-time)",
    shopify: "Complexe dashboard + apps",
    woocommerce: "WP-Admin (traag)",
  },
  {
    feature: "Veiligheid",
    sitedesk: "Hacker-proof (Edge)",
    shopify: "SaaS afhankelijk",
    woocommerce: "Database kwetsbaar",
  },
  {
    feature: "Kosten",
    sitedesk: "Vast maandbedrag",
    shopify: "Hoge app-fees + % omzet",
    woocommerce: "Hosting + onderhoud + plugins",
  },
];

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

const Webshop = () => {
  useEffect(() => {
    const ids = ["techniek", "aanbod", "sheets", "contact"];
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

  const handleContactSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    trackLead();
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header variant="webshop" />
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
                  De Snelheids-shock: Van 10 seconden naar 0ms.
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Managed Headless E-commerce voor MKB. 100/100 PageSpeed, beheer via Google Sheets,
                  en conversie-optimalisatie zonder dure plugins.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="hero" size="lg" className="group">
                    <a href="#contact">
                      Plan een call
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
                      WhatsApp direct
                    </a>
                  </Button>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                  <div className="p-3 rounded-xl bg-card border border-border shadow-sm">
                    <div className="text-foreground font-semibold">0ms Edge</div>
                    <p>Serverless deploys, wereldwijd geocache.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border shadow-sm">
                    <div className="text-foreground font-semibold">100/100</div>
                    <p>Core Web Vitals standaard groen.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border shadow-sm">
                    <div className="text-foreground font-semibold">Sheets-native</div>
                    <p>Team kan beheren zonder developer.</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-card border border-border rounded-2xl shadow-xl p-6 space-y-5 animate-fade-up">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">Shopify/WooCommerce</span>
                      <span className="text-destructive font-bold text-lg">10s</span>
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
        <section id="techniek" className="container mx-auto">
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
              <p className="text-sm font-semibold text-foreground mb-4">Sitedesk Edge vs. traditionele stack</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/70 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">Sitedesk Edge</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Altijd dichtbij de bezoeker, direct geleverd</li>
                    <li>• Geen wachttijd: content staat al klaar</li>
                    <li>• Lichtgewicht stack zonder app-bagage</li>
                    <li>• Afgeschermd oppervlak: geen open poorten of plugins</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/30">
                  <h4 className="font-semibold text-foreground mb-2">Shopify / Woo</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Routes lopen via een drukke centrale omgeving</li>
                    <li>• Extra apps en thema’s vertragen alles</li>
                    <li>• Bezoeker wacht op opstart en database-calls</li>
                    <li>• Breder aanvalsoppervlak door plugins en hosting</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-success/10 text-success text-sm">
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
              <Button
                asChild
                variant="hero"
                size="lg"
                className="shadow-glow"
              >
                <a href="/shop" data-umami-event="view-demo-shop">
                  Lanceer Demo Shop
                </a>
              </Button>
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
                      <a href="/shop" data-umami-event="view-demo-shop">Naar demo</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section id="vergelijking" className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
              De vergelijking
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Sitedesk vs. de rest
            </h2>
            <p className="text-lg text-muted-foreground">
              Laat je e-commerce niet vertragen door legacy platforms. Zie direct het verschil.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-4 bg-secondary/60 text-sm md:text-base font-semibold">
              <div className="p-4 md:p-6 text-foreground">Kenmerk</div>
              <div className="p-4 md:p-6 text-center text-foreground">Sitedesk</div>
              <div className="p-4 md:p-6 text-center text-muted-foreground border-x border-border">
                Shopify (Advanced)
              </div>
              <div className="p-4 md:p-6 text-center text-muted-foreground">WooCommerce</div>
            </div>

            {comparisonRows.map((row, index) => (
              <div
                key={row.feature}
                className={`grid grid-cols-4 text-sm md:text-base ${
                  index !== comparisonRows.length - 1 ? "border-t border-border" : ""
                }`}
              >
                <div className="p-4 md:p-6 font-medium text-foreground">{row.feature}</div>
                <div className="p-4 md:p-6 text-center bg-success/5 border-x border-success/20 relative">
                  <div className="absolute inset-0 bg-success/5 blur-xl" aria-hidden />
                  <div className="relative inline-flex items-center gap-2 text-foreground font-semibold">
                    <CheckCircle2 className="text-success" size={18} />
                    <span>{row.sitedesk}</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 text-center border-x border-border flex items-center justify-center gap-2">
                  <XCircle className="text-destructive" size={18} />
                  <span>{row.shopify}</span>
                </div>
                <div className="p-4 md:p-6 text-center flex items-center justify-center gap-2">
                  <XCircle className="text-destructive" size={18} />
                  <span>{row.woocommerce}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Wist je dat 40% van je bezoekers afhaakt na 3 seconden wachten? Met Sitedesk heb je die discussie nooit meer.
          </p>
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
                  <h4 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pilot / Aanbod */}
        <section id="aanbod" className="container mx-auto">
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
                    <span className="text-xs bg-accent/20 text-accent px-3 py-1 rounded-full">Nog 7 plekken</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground line-through">€2.500 setup</p>
                    <p className="text-3xl font-bold text-foreground">€1.000 eenmalig</p>
                    <p className="text-muted-foreground line-through">€245 p/m</p>
                    <p className="text-2xl font-semibold text-foreground">€150 p/m (lifetime)</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Inclusief hosting, onbeperkt support en alle maatwerk plugins die je nodig hebt.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button asChild variant="hero" size="lg" className="bg-primary text-primary-foreground">
                      <a href="#contact">Claim pilotplek</a>
                    </Button>
                    <Button asChild variant="heroOutline" size="lg" className="border-primary-foreground text-primary-foreground">
                      <a href="#techniek">Zie de techniek</a>
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
        <section id="sheets" className="container mx-auto">
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
                  <span className="text-success font-semibold">Synced • 1s</span>
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
                          <td className="px-3 py-2 text-success flex items-center gap-2">
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
                Heb je een nieuwe functie nodig? Een extra koppeling? Een maatwerk veld? Wij bouwen en onderhouden het
                voor je. Zonder extra facturen, zonder gedoe.
              </p>
              <div className="p-4 rounded-2xl bg-card border border-border shadow-md">
                <p className="text-foreground font-semibold mb-2">Exclusieve Pilot Deal</p>
                <p className="text-muted-foreground">
                  Tijdelijke Early Adopter Deal: Nu slechts €150,- per maand (lifetime!) en setup tijdelijk €1.000 voor de eerste 10 klanten. Inclusief hosting, onbeperkt support en alle maatwerk plugins die je nodig hebt. Wij bouwen wat jij nodig hebt, jij focust op de verkoop.
                </p>
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

        <section id="contact" className="container mx-auto pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start bg-card border border-border rounded-3xl p-8 md:p-12 shadow-lg">
            <div className="space-y-4">
              <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider">
                Direct contact & demo
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                Vragen over de overstap? Wij kijken gratis mee naar je huidige laadtijd.
              </h3>
              <p className="text-muted-foreground text-lg">
                We Got You: wij bouwen wat je nodig hebt, zonder extra kosten. Plan een demo of stuur direct een bericht.
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
                    WhatsApp direct
                  </a>
                </Button>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleContactSubmit}>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="naam">
                  Naam
                </label>
                <input
                  id="naam"
                  name="naam"
                  type="text"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Jouw naam"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="email">
                  E-mail
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
                <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="bericht">
                  Bericht
                </label>
                <textarea
                  id="bericht"
                  name="bericht"
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Vertel kort over je shop of huidige laadtijd."
                  required
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full">
                Plan gratis speed-check
              </Button>
              <p className="text-xs text-muted-foreground">
                We reageren binnen 1 werkdag. Geen verplichtingen, wel directe inzichten in je snelheid.
              </p>
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
