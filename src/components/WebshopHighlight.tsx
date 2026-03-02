import { ArrowRight, CheckCircle2, Sparkles, Zap, ShieldCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { getLandingSectionHash, getLocaleFromPath, withLocalePath } from "@/lib/i18n";

const WebshopHighlight = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";

  const benefits = [
    {
      icon: Zap,
      title: isEn ? "Built for speed and conversion" : "Gebouwd voor snelheid en conversie",
      copy: isEn ? "Ultra-fast storefronts that reduce drop-off and protect your ad spend." : "Supersnelle storefronts die minder afhakers geven en je advertentiebudget beter laten renderen.",
    },
    {
      icon: Sparkles,
      title: isEn ? "Fully custom" : "Volledig op maat",
      copy: isEn ? "No bloated themes or generic templates. We build around your product and funnel." : "Geen opgeblazen themes of generieke templates. We bouwen rond jouw product en funnel.",
    },
    {
      icon: ShieldCheck,
      title: isEn ? "Managed by us" : "Door ons beheerd",
      copy: isEn ? "We stay on as your tech team for updates, improvements, and support." : "Wij blijven je tech-team voor updates, doorontwikkeling en support.",
    },
    {
      icon: MessageCircle,
      title: isEn ? "Easy to manage" : "Makkelijk te beheren",
      copy: isEn ? "Fast changes, lean tooling, and no dependency on slow plugin stacks." : "Snelle wijzigingen, lean tooling en geen afhankelijkheid van trage plugin-stacks.",
    },
  ];

  return (
    <section id="webshop-highlight" className="py-20 md:py-28 bg-card">
      <div className="container mx-auto">
        <div className="rounded-[2rem] border border-border bg-background p-8 md:p-10 shadow-lg">
          <div className="max-w-3xl">
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              {isEn ? "Custom webshops" : "Maatwerk webshops"}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
              {isEn ? "Need a webshop? We build the fastest custom webshops in the Netherlands." : "Webshop nodig? Wij bouwen de snelste maatwerk webshops van Nederland."}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {isEn
                ? "For ambitious brands that want more than a standard theme. We build high-performance webshops focused on speed, conversion, and control."
                : "Voor ambitieuze merken die meer nodig hebben dan een standaard theme. Wij bouwen high-performance webshops gericht op snelheid, conversie en grip."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mt-10">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-2xl border border-border bg-secondary/40 p-5">
                <benefit.icon className="text-accent mb-4" size={22} />
                <h3 className="text-base font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.copy}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Button asChild variant="hero" size="lg" className="group">
              <a href={withLocalePath("/webshop", locale)}>
                {isEn ? "View webshop service" : "Bekijk webshop service"}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={`${withLocalePath("/", locale)}${getLandingSectionHash(locale, "contact")}`}>
                {isEn ? "Discuss your webshop" : "Bespreek je webshop"}
              </a>
            </Button>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-success/10 px-4 py-3 text-sm text-foreground">
            <CheckCircle2 className="text-success mt-0.5" size={18} />
            <span>
              {isEn
                ? "Ideal if your current shop is slowing down growth, costing margin, or limiting what you want to build."
                : "Ideaal als je huidige shop je groei afremt, marge kost of beperkt wat je wilt bouwen."}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebshopHighlight;
