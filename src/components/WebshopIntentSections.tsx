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
            {isEn ? "Custom build" : "Maatwerk build"}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {isEn ? "Need an ecommerce store built by specialists?" : "Webshop laten ontwikkelen door specialisten?"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isEn
              ? "We build and manage custom ecommerce setups focused on speed, conversion, and maintainability."
              : "Wij ontwikkelen en beheren maatwerk webshops gericht op snelheid, conversie en beheersbaarheid."}
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
            {isEn ? "Execution partner" : "Uitvoerpartner"}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {isEn ? "Looking for an ecommerce builder?" : "Webshop bouwer gezocht?"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              isEn ? "Clear scope and timeline before build starts" : "Duidelijke scope en planning voor start",
              isEn ? "Custom frontend and checkout flows" : "Maatwerk frontend en checkout flows",
              isEn ? "Technical ownership and monthly support" : "Technisch eigenaarschap en maandelijkse support",
              isEn ? "Performance-first implementation from day one" : "Performance-first implementatie vanaf dag één",
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
            {isEn ? "WooCommerce too slow?" : "WooCommerce te traag?"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isEn
              ? "Move to an Edge-first setup with lower latency, fewer plugin bottlenecks, and cleaner maintenance."
              : "Stap over naar een Edge-first setup met lagere latency, minder plugin-knelpunten en eenvoudiger onderhoud."}
          </p>
          <div id="maatwerk-edge-webshop" className="rounded-xl bg-secondary/60 border border-border p-5">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isEn ? "Custom Edge ecommerce without Shopify commission" : "Maatwerk Edge webshop zonder Shopify commissie"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isEn
                ? "Use this as sitelink anchor for professional and migration-focused campaigns."
                : "Gebruik deze anchor als sitelink voor professionele en migratiegerichte campagnes."}
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
