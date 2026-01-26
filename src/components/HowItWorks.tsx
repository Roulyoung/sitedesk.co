import { Palette, Wrench, Rocket } from "lucide-react";

const steps = [
  {
    icon: Palette,
    step: "1",
    title: "Kies je stijl",
    description: "Jij kiest een template die past bij jouw business. Wij personaliseren het volledig naar jouw wensen.",
  },
  {
    icon: Wrench,
    step: "2",
    title: "Wij bouwen & beheren",
    description: "Leun achterover. Wij regelen alles van design tot updates, beveiliging en support.",
  },
  {
    icon: Rocket,
    step: "3",
    title: "Online voor €1/dag",
    description: "Jouw professionele site, altijd online, altijd up-to-date. Zonder verborgen kosten.",
  },
];

const HowItWorks = () => {
  return (
    <section id="hoe-het-werkt" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            Hoe het werkt
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            In 3 stappen online
          </h2>
          <p className="text-lg text-muted-foreground">
            Geen technische kennis nodig. Wij nemen het complete traject uit handen.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-border" />
              )}

              <div className="relative bg-background rounded-2xl p-8 text-center border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm shadow-md">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="text-accent" size={28} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
