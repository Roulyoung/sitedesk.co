import { 
  Check, 
  Smartphone, 
  Search, 
  Shield, 
  Zap, 
  RefreshCw, 
  Headphones,
  Mail,
  BarChart3,
  ArrowLeftRight,
  Clock,
  Undo2
} from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Perfect op elk apparaat - desktop, tablet en mobiel.",
  },
  {
    icon: Search,
    title: "SEO-Geoptimaliseerd",
    description: "Beter vindbaar in Google. Wij zorgen voor de technische basis.",
  },
  {
    icon: Shield,
    title: "SSL & Beveiliging",
    description: "Het groene slotje in de browser. Je site is 100% veilig.",
  },
  {
    icon: Zap,
    title: "Supersnelle Hosting",
    description: "Razendsnel geladen op elk apparaat. Geen wachten.",
  },
  {
    icon: RefreshCw,
    title: "Dagelijkse Back-ups",
    description: "Wij bewaken je site als een fort. Mocht er iets misgaan, herstellen we direct.",
  },
  {
    icon: Headphones,
    title: "De 'Desk' Updates",
    description: "Wijzigingen via mail of WhatsApp, binnen 24-48u doorgevoerd (2x/maand incl.).",
  },
  {
    icon: Mail,
    title: "Zakelijke E-mail",
    description: "Professioneel e-mailadres (info@jouwdomein.nl), eenvoudig te gebruiken via Gmail of Outlook.",
  },
  {
    icon: BarChart3,
    title: "Privacy-First Analytics",
    description: "Real-time inzicht in bezoekers. 100% AVG-proof, geen cookiebanners nodig.",
  },
  {
    icon: ArrowLeftRight,
    title: "Gratis Verhuisservice",
    description: "Heb je al een domein? Wij regelen de verhuizing zonder downtime.",
  },
  {
    icon: Clock,
    title: "Maandelijks Opzegbaar",
    description: "Geen wurgcontracten. Wij geloven in onze service.",
  },
  {
    icon: Undo2,
    title: "30-Dagen Garantie",
    description: "Niet tevreden? Je krijgt je geld direct terug. Geen vragen.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 gradient-subtle">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            Wat je krijgt
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Alles wat je nodig hebt
          </h2>
          <p className="text-lg text-muted-foreground">
            Voor minder dan een kop koffie per dag krijg je een complete professionele online aanwezigheid.
          </p>
        </div>

        {/* Price anchor */}
        <div className="max-w-md mx-auto bg-card rounded-2xl p-6 shadow-lg border border-border mb-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-5xl font-bold text-foreground">€1</div>
            <div className="text-left">
              <div className="text-muted-foreground text-sm">per dag</div>
              <div className="text-xs text-muted-foreground">(€30/maand)</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-success">€0 opstartkosten</span> • Minder dan een kop koffie per dag
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 border border-border hover:border-accent/30 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* All included badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-6 py-3 rounded-full">
            <Check size={20} />
            <span className="font-medium">Alles inclusief - geen verborgen kosten</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
