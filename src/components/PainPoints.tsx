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
      solution: isEn ? "We handle it for you" : "Wij doen het voor je",
    },
    {
      problem: isEn ? "SEO too complex?" : "SEO te ingewikkeld?",
      solution: isEn ? "Automatically optimized" : "Automatisch geoptimaliseerd",
    },
    {
      problem: isEn ? "High web design costs?" : "Hoge kosten voor webdesigners?",
      solution: isEn ? "EUR 1/day, all included" : "EUR 1/dag, alles inclusief",
    },
    {
      problem: isEn ? "Afraid of downtime?" : "Angst voor downtime?",
      solution: isEn ? "99.9% uptime guaranteed" : "99.9% uptime gegarandeerd",
    },
    {
      problem: isEn ? "Technical issues?" : "Technische problemen?",
      solution: isEn ? "24/7 monitoring" : "24/7 monitoring",
    },
  ];

  return (
    <section className="py-20 md:py-32 gradient-hero text-primary-foreground">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
              {isEn ? "Sound familiar?" : "Herkenbaar?"}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{isEn ? "Stop this hassle" : "Stop met dit gedoe"}</h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              {isEn
                ? "You are a business owner, not a webmaster. Let us handle the website work so you can focus on growth."
                : "Je bent ondernemer, geen webmaster. Laat het website-gedoe aan ons over en focus op wat je goed kunt."}
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
