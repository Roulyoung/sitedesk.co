import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getLandingSectionHash, getLocaleFromPath, withLocalePath } from "@/lib/i18n";

const CTA = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";

  const benefits = [
    isEn ? "EUR 0 setup" : "EUR 0 opstartkosten",
    isEn ? "30-day money-back guarantee" : "30 dagen geld-terug garantie",
    isEn ? "Cancel monthly" : "Maandelijks opzegbaar",
  ];

  return (
    <section className="py-20 md:py-32 gradient-hero text-primary-foreground">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{isEn ? "Ready to go live?" : "Klaar om online te gaan?"}</h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
            {isEn
              ? "Start today with your professional website. We handle the rest."
              : "Start vandaag nog met jouw professionele website. Wij regelen de rest."}
          </p>

          <div className="inline-flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl px-8 py-6 mb-8">
            <div className="text-5xl md:text-6xl font-bold">EUR 1</div>
            <div className="text-left">
              <div className="text-primary-foreground/80">{isEn ? "per day" : "per dag"}</div>
              <div className="text-sm text-primary-foreground/60">{isEn ? "All included" : "Alles inclusief"}</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-primary-foreground/90">
                <Check size={18} className="text-success" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <Button asChild variant="hero" size="xl" className="group">
            <a href={`${withLocalePath("/", locale)}${getLandingSectionHash(locale, "contact")}`}>
              {isEn ? "Start now - pay EUR 1/day" : "Start nu - betaal EUR 1/dag"}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>

          <p className="mt-6 text-sm text-primary-foreground/60">{isEn ? "No credit card needed · Start right away" : "Geen creditcard nodig · Direct aan de slag"}</p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
