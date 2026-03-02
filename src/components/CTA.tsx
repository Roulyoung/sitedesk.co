import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getLandingSectionHash, getLocaleFromPath, withLocalePath } from "@/lib/i18n";

const CTA = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";

  const benefits = [
    isEn ? "No setup fee" : "Geen opstartkosten",
    isEn ? "Start risk-free for 30 days" : "Start 30 dagen zonder risico",
    isEn ? "Stay only if it works for you" : "Blijf alleen als het voor je werkt",
  ];

  return (
    <section id="start-webshop" className="py-20 md:py-32 gradient-hero text-primary-foreground">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {isEn ? "Ready for a website that stops costing you time?" : "Klaar voor een website die je geen tijd meer kost?"}
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
            {isEn
              ? "Start today and get a professional website that stays fast, updated, and taken care of without extra hassle on your side."
              : "Start vandaag en krijg een professionele website die snel, up-to-date en geregeld blijft, zonder extra gedoe aan jouw kant."}
          </p>

          <div className="inline-flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl px-8 py-6 mb-8">
            <div className="text-5xl md:text-6xl font-bold">EUR 1</div>
            <div className="text-left">
              <div className="text-primary-foreground/80">{isEn ? "per day" : "per dag"}</div>
              <div className="text-sm text-primary-foreground/60">{isEn ? "One fixed price, everything handled" : "Een vaste prijs, alles geregeld"}</div>
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
              {isEn ? "Start without website hassle" : "Start zonder website-gedoe"}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>

          <p className="mt-6 text-sm text-primary-foreground/60">{isEn ? "No credit card needed - Start right away" : "Geen creditcard nodig - Direct aan de slag"}</p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
