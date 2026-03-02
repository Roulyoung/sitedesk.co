import { X, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { getLandingSectionHash, getLocaleFromPath, withLocalePath } from "@/lib/i18n";

const PainPoints = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";

  const painPoints = [
    {
      problem: isEn ? "No time for updates?" : "Geen tijd voor updates?",
      solution: isEn ? "Your site stays current without stealing your time" : "Je site blijft actueel zonder jouw tijd te vragen",
    },
    {
      problem: isEn ? "SEO too complex?" : "SEO te ingewikkeld?",
      solution: isEn ? "A stronger foundation to get found by new customers" : "Een sterkere basis om beter gevonden te worden",
    },
    {
      problem: isEn ? "High web design costs?" : "Hoge kosten voor webdesigners?",
      solution: isEn ? "One fixed price instead of surprise invoices" : "Een vaste prijs in plaats van losse verrassingsfacturen",
    },
    {
      problem: isEn ? "Afraid of downtime?" : "Angst voor downtime?",
      solution: isEn ? "Stay reachable when customers want to buy or contact you" : "Blijf bereikbaar wanneer klanten willen kopen of contact zoeken",
    },
    {
      problem: isEn ? "Technical issues?" : "Technische problemen?",
      solution: isEn ? "Problems get spotted before they cost you customers" : "Problemen worden gezien voordat ze klanten kosten",
    },
  ];

  return (
    <section id="woocommerce-pijn" className="py-20 md:py-32 gradient-hero text-primary-foreground">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              {isEn ? "Sound familiar?" : "Herkenbaar?"}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {isEn ? "Stop running your website as a side job" : "Stop met je website runnen als bijbaan"}
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              {isEn
                ? "You are a business owner, not a webmaster. Let us take the website work off your plate so you can focus on clients, delivery, and growth."
                : "Je bent ondernemer, geen webmaster. Laat het websitewerk van je bord verdwijnen zodat jij kunt focussen op klanten, levering en groei."}
            </p>

            <Button asChild variant="hero" size="lg" className="group">
              <a href={`${withLocalePath("/", locale)}${getLandingSectionHash(locale, "contact")}`}>
                {isEn ? "Start today" : "Start vandaag nog"}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>

          <div className="space-y-4">
            {painPoints.map((item, index) => (
              <div
                key={index}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-5 border border-primary-foreground/10"
              >
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <X size={16} className="text-destructive" />
                      </div>
                      <span className="text-primary-foreground/70 line-through decoration-destructive/50">{item.problem}</span>
                    </div>
                  </div>

                  <ArrowRight size={20} className="text-primary-foreground/40 flex-shrink-0" />

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={16} className="text-success" />
                      </div>
                      <span className="text-primary-foreground font-medium">{item.solution}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;
