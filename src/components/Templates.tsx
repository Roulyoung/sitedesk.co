import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const templates = [
  {
    name: "Starter",
    category: "Freelancer",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    name: "Professional",
    category: "Consultant",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    name: "Creative",
    category: "Designer",
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    name: "Business",
    category: "Ondernemer",
    color: "from-emerald-500/20 to-teal-500/20",
  },
];

const Templates = () => {
  return (
    <section id="templates" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            Templates
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Kies je stijl
          </h2>
          <p className="text-lg text-muted-foreground">
            Moderne, professionele templates voor elke branche. Wij personaliseren ze volledig naar jouw wensen.
          </p>
        </div>

        {/* Templates grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {templates.map((template, index) => (
            <div
              key={index}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl border border-border hover:border-accent/30 transition-all duration-300 hover:shadow-xl">
                {/* Preview */}
                <div className={`aspect-[3/4] bg-gradient-to-br ${template.color} p-4`}>
                  {/* Mini browser */}
                  <div className="bg-card rounded-lg overflow-hidden shadow-lg h-full">
                    <div className="bg-secondary/50 px-2 py-1.5 flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="w-16 h-2 bg-primary/20 rounded" />
                      <div className="space-y-1">
                        <div className="w-full h-1.5 bg-muted rounded" />
                        <div className="w-3/4 h-1.5 bg-muted rounded" />
                      </div>
                      <div className="w-12 h-4 gradient-accent rounded" />
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-primary-foreground font-semibold">Bekijk template</span>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 text-center">
                <h3 className="font-semibold text-foreground">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.category}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="group">
            Bekijk alle templates
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Templates;
