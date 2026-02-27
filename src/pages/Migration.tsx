import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { getAlternateHrefLangs, getLocaleFromPath, stripLocaleFromPath, withLocalePath } from "@/lib/i18n";

const Migration = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";
  const isDe = locale === "de";
  const pathWithoutLocale = stripLocaleFromPath(location.pathname);
  const alternateLinks = getAlternateHrefLangs(pathWithoutLocale);
  const canonical = `https://sitedesk.co${location.pathname}`;

  const title = isEn
    ? "Webshop Migration | Move to Sitedesk"
    : isDe
      ? "Webshop-Migration | Wechsel zu Sitedesk"
      : "Webshop Migratie | Overstappen naar Sitedesk";
  const description = isEn
    ? "Migrate your webshop to Sitedesk without downtime. We move products, URLs and content to a faster edge setup."
    : isDe
      ? "Migrieren Sie Ihren Webshop ohne Downtime zu Sitedesk. Wir ueberzetten Produkte, URLs und Inhalte in eine schnellere Edge-Umgebung."
      : "Migreer je webshop zonder downtime naar Sitedesk. Wij zetten producten, URLs en content over naar een snellere edge-setup.";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        {alternateLinks.map((alt) => (
          <link key={alt.locale} rel="alternate" hrefLang={alt.locale} href={alt.href} />
        ))}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <Header />
      <main className="pt-24 md:pt-28">
        <section className="container mx-auto py-16 md:py-24">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              {isEn ? "Migration" : isDe ? "Migration" : "Migratie"}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {isEn
                ? "Move to a faster webshop stack without losing your SEO."
                : isDe
                  ? "Wechseln Sie zu einem schnelleren Webshop-Stack ohne SEO-Verlust."
                  : "Stap over op een snellere webshop-stack zonder SEO-verlies."}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isEn
                ? "We migrate products, category structure, redirects and critical pages with a staged rollout."
                : isDe
                  ? "Wir migrieren Produkte, Kategorien, Redirects und kritische Seiten mit einem gestaffelten Rollout."
                  : "We migreren producten, categoriestructuur, redirects en kritieke pagina's met een gefaseerde livegang."}
            </p>
            <div className="rounded-xl border border-border/70 bg-card/70 p-6">
              <ul className="space-y-3 text-foreground">
                <li>{isEn ? "1. Inventory and URL mapping." : isDe ? "1. Inventar und URL-Mapping." : "1. Inventarisatie en URL-mapping."}</li>
                <li>{isEn ? "2. Data migration from your current platform." : isDe ? "2. Datenmigration von Ihrer aktuellen Plattform." : "2. Datamigratie vanuit je huidige platform."}</li>
                <li>{isEn ? "3. SEO-safe go-live with redirects and monitoring." : isDe ? "3. SEO-sicherer Go-live mit Redirects und Monitoring." : "3. SEO-veilige livegang met redirects en monitoring."}</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <a href={`${withLocalePath("/", locale)}#contact`}>
                  {isEn ? "Plan migration call" : isDe ? "Migrations-Call planen" : "Plan migratiegesprek"}
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={withLocalePath("/demo", locale)}>{isEn ? "View demo" : isDe ? "Demo ansehen" : "Bekijk demo"}</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Migration;
