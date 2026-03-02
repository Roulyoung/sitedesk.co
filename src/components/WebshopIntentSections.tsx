import { ArrowRight, Check } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getLandingSectionHash, getLocaleFromPath, withLocalePath } from "@/lib/i18n";

const WebshopIntentSections = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";

  return (
    <section className="py-20 md:py-32 bg-card">
      <div className="container mx-auto space-y-8">
        <section id="webshop-laten-ontwikkelen" className="rounded-2xl border border-border bg-background p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent mb-3">
            {isEn ? "Built for growth" : "Gebouwd voor groei"}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {isEn ? "Need a webshop that sells faster than your current stack?" : "Een webshop nodig die sneller verkoopt dan je huidige stack?"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isEn
              ? "We build and manage custom ecommerce stores focused on faster load times, better conversion and less technical overhead."
              : "Wij bouwen en beheren maatwerk webshops gericht op snellere laadtijden, betere conversie en minder technische overhead."}
          </p>
          <a
            href={`${withLocalePath("/", locale)}${getLandingSectionHash(locale, "contact")}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-primary-foreground hover:opacity-90 transition"
          >
            {isEn ? "Discuss your project" : "Bespreek je project"}
            <ArrowRight size={16} />
          </a>
        </section>

        <section id="webshop-bouwer-gezocht" className="rounded-2xl border border-border bg-background p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent mb-3">
            {isEn ? "Fixed partner" : "Vaste partner"}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {isEn ? "Looking for a webshop builder that keeps improving after launch?" : "Een webshop bouwer gezocht die ook na livegang blijft doorbouwen?"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              isEn ? "Clear scope and timeline before we start" : "Duidelijke scope en planning voordat we starten",
              isEn ? "Custom storefront and checkout flows built for conversion" : "Maatwerk storefront en checkout flows gebouwd voor conversie",
              isEn ? "One team responsible for build, support and improvements" : "Een team verantwoordelijk voor bouw, support en verbeteringen",
              isEn ? "Performance-first from day one" : "Performance-first vanaf dag een",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-border p-4">
                <Check className="mt-0.5 text-success" size={18} />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="woocommerce-te-traag" className="rounded-2xl border border-border bg-background p-8 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent mb-3">
            {isEn ? "Migration" : "Migratie"}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {isEn ? "WooCommerce too slow?" : "Is WooCommerce te traag?"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isEn
              ? "Move to a faster setup with fewer plugin bottlenecks, less maintenance drag and more room to scale."
              : "Stap over naar een snellere setup met minder plugin-knelpunten, minder onderhoudsdruk en meer ruimte om te schalen."}
          </p>
          <div id="maatwerk-edge-webshop" className="rounded-xl bg-secondary/60 border border-border p-5">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isEn ? "Custom webshop without platform drag" : "Maatwerk webshop zonder platform-ballast"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isEn
                ? "Ideal for brands that want more speed and control without stacking more apps and monthly tooling."
                : "Voor merken die meer snelheid en controle willen zonder steeds meer apps en maandelijkse tooling te stapelen."}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-secondary/40 p-6 md:p-8">
          <p className="text-sm text-muted-foreground">
            {isEn
              ? "No ecommerce store needed yet? Start with a lightning-fast business website."
              : "Nog geen webshop nodig? Start met een razendsnelle zakelijke website."}
          </p>
          <a
            href={withLocalePath("/zakelijke-websites", locale)}
            className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-accent hover:text-accent/80"
          >
            {isEn ? "View managed website option" : "Bekijk managed website optie"}
            <ArrowRight size={14} />
          </a>
        </section>
      </div>
    </section>
  );
};

export default WebshopIntentSections;
