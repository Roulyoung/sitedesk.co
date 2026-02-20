import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import PainPoints from "@/components/PainPoints";
import Comparison from "@/components/Comparison";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { getAlternateHrefLangs, getLocaleFromPath, stripLocaleFromPath } from "@/lib/i18n";

const Index = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";
  const pathWithoutLocale = stripLocaleFromPath(location.pathname);
  const canonical = `https://sitedesk.co${location.pathname}`;
  const alternateLinks = getAlternateHrefLangs(pathWithoutLocale);
  const title = isEn ? "Managed Website for EUR 1/day | Sitedesk" : "Jouw website perfect beheerd voor EUR 1/dag | Sitedesk";
  const description = isEn
    ? "Sitedesk builds, hosts, and maintains your website for EUR 1 per day. Fast, secure, and fully managed."
    : "Sitedesk bouwt, host en onderhoudt je website voor EUR 1 per dag. Snel, veilig en volledig beheerd.";

  return (
    <div className="min-h-screen">
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
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <PainPoints />
        <Comparison />
        <FAQ />
        <Contact />
        <CTA />
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Index;
