import { Palette, Wrench, Rocket } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getLocaleFromPath } from "@/lib/i18n";

const HowItWorks = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";

  const steps = [
    {
      icon: Palette,
      step: "1",
      title: isEn ? "Pick your style" : "Kies je stijl",
      description: isEn
        ? "You choose a template that fits your business. We fully tailor it to your goals."
        : "Jij kiest een template die past bij jouw business. Wij personaliseren het volledig naar jouw wensen.",
    },
    {
      icon: Wrench,
      step: "2",
      title: isEn ? "We build and manage" : "Wij bouwen en beheren",
      description: isEn
        ? "Sit back. We handle design, updates, security, and support."
        : "Leun achterover. Wij regelen alles van design tot updates, beveiliging en support.",
    },
    {
      icon: Rocket,
      step: "3",
      title: isEn ? "Live for EUR 1/day" : "Online voor EUR 1/dag",
      description: isEn
        ? "Your professional site stays online and up to date. No hidden costs."
        : "Jouw professionele site, altijd online, altijd up-to-date. Zonder verborgen kosten.",
    },
  ];

  return (
    <section id="hoe-het-werkt" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            {isEn ? "How it works" : "Hoe het werkt"}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {isEn ? "Go live in 3 steps" : "In 3 stappen online"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isEn
              ? "No technical knowledge needed. We handle the full process for you."
              : "Geen technische kennis nodig. Wij nemen het complete traject uit handen."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-border" />
              )}

              <div className="relative bg-background rounded-2xl p-8 text-center border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm shadow-md">
                  {step.step}
                </div>

                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="text-accent" size={28} />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
