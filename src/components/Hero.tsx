import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-subtle" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up">
              <Check size={16} />
              <span>30 dagen niet-goed-geld-terug garantie</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-up stagger-1">
              Jouw website,{" "}
              <span className="text-gradient">perfect beheerd.</span>
              <br />
              <span className="text-primary">€1/dag.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up stagger-2">
              Stop met stress, start met online succes. Wij bouwen, hosten en onderhouden alles. 
              Jij focust op je business.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up stagger-3">
              <Button variant="hero" size="xl" className="group">
                Start Vandaag - €1/dag
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-up stagger-4">
              <div className="flex -space-x-2">
                {["SD", "MK", "JB", "LM", "AN"].map((label) => (
                  <div
                    key={label}
                    className="w-10 h-10 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Vele ondernemers</span> al ontzorgd
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative animate-fade-up stagger-2">
            <div className="relative z-10">
              {/* Browser mockup */}
              <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
                {/* Browser header */}
                <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/50" />
                    <div className="w-3 h-3 rounded-full bg-accent/50" />
                    <div className="w-3 h-3 rounded-full bg-success/50" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-background rounded-md px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success/50 flex items-center justify-center">
                        <Check size={8} className="text-success" />
                      </div>
                      jouwbedrijf.nl
                    </div>
                  </div>
                </div>
                
                {/* Website preview */}
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-accent/5 p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-24 h-6 bg-primary/20 rounded" />
                    <div className="flex gap-4">
                      <div className="w-12 h-4 bg-muted rounded" />
                      <div className="w-12 h-4 bg-muted rounded" />
                      <div className="w-12 h-4 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <div className="w-3/4 h-8 bg-primary/20 rounded mb-4" />
                    <div className="w-1/2 h-4 bg-muted rounded mb-6" />
                    <div className="w-32 h-10 gradient-accent rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -right-4 top-1/4 bg-card rounded-xl shadow-lg p-4 border border-border animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                    <Check className="text-success" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">SSL Actief</p>
                    <p className="text-xs text-muted-foreground">100% Veilig</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-4 bottom-1/4 bg-card rounded-xl shadow-lg p-4 border border-border animate-float" style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent font-bold">⚡</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Razendsnel</p>
                    <p className="text-xs text-muted-foreground">0.8s laadtijd</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
