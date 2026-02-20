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
  Undo2,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { getLocaleFromPath } from "@/lib/i18n";

const Features = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";

  const features = [
    {
      icon: Smartphone,
      title: "Responsive Design",
      description: isEn ? "Perfect on desktop, tablet, and mobile." : "Perfect op elk apparaat: desktop, tablet en mobiel.",
    },
    {
      icon: Search,
      title: isEn ? "SEO Optimized" : "SEO-geoptimaliseerd",
      description: isEn ? "More visible in Google with a strong technical base." : "Beter vindbaar in Google. Wij zorgen voor de technische basis.",
    },
    {
      icon: Shield,
      title: isEn ? "SSL and Security" : "SSL en beveiliging",
      description: isEn ? "A secure website for you and your visitors." : "Het groene slotje in de browser. Je site is 100% veilig.",
    },
    {
      icon: Zap,
      title: isEn ? "Fast Hosting" : "Supersnelle hosting",
      description: isEn ? "Loads fast on every device." : "Razendsnel geladen op elk apparaat. Geen wachten.",
    },
    {
      icon: RefreshCw,
      title: isEn ? "Daily Backups" : "Dagelijkse back-ups",
      description: isEn ? "If anything goes wrong, we restore quickly." : "Wij bewaken je site als een fort. Mocht er iets misgaan, herstellen we direct.",
    },
    {
      icon: Headphones,
      title: isEn ? "Desk Updates" : "De Desk-updates",
      description: isEn ? "Changes via email or WhatsApp, delivered quickly." : "Wijzigingen via mail of WhatsApp, binnen 24-48u doorgevoerd (2x/maand incl.).",
    },
    {
      icon: Mail,
      title: isEn ? "Business Email" : "Zakelijke e-mail",
      description: isEn
        ? "Professional address like info@yourdomain.com, easy in Gmail or Outlook."
        : "Professioneel e-mailadres (info@jouwdomein.nl), eenvoudig te gebruiken via Gmail of Outlook.",
    },
    {
      icon: BarChart3,
      title: "Privacy-First Analytics",
      description: isEn ? "Real-time insights, privacy friendly." : "Real-time inzicht in bezoekers. 100% AVG-proof, geen cookiebanners nodig.",
    },
    {
      icon: ArrowLeftRight,
      title: isEn ? "Free Migration" : "Gratis verhuisservice",
      description: isEn ? "Already have a domain? We migrate without downtime." : "Heb je al een domein? Wij regelen de verhuizing zonder downtime.",
    },
    {
      icon: Clock,
      title: isEn ? "Monthly Cancelation" : "Maandelijks opzegbaar",
      description: isEn ? "No lock-in contracts." : "Geen wurgcontracten. Wij geloven in onze service.",
    },
    {
      icon: Undo2,
      title: isEn ? "30-Day Guarantee" : "30-dagen garantie",
      description: isEn ? "Not satisfied? Get your money back." : "Niet tevreden? Je krijgt je geld direct terug. Geen vragen.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 gradient-subtle">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            {isEn ? "What you get" : "Wat je krijgt"}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {isEn ? "Everything you need" : "Alles wat je nodig hebt"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isEn
              ? "For less than a coffee a day, you get a complete professional online presence."
              : "Voor minder dan een kop koffie per dag krijg je een complete professionele online aanwezigheid."}
          </p>
        </div>

        <div className="max-w-md mx-auto bg-card rounded-2xl p-6 shadow-lg border border-border mb-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-5xl font-bold text-foreground">EUR 1</div>
            <div className="text-left">
              <div className="text-muted-foreground text-sm">{isEn ? "per day" : "per dag"}</div>
              <div className="text-xs text-muted-foreground">(EUR 30/{isEn ? "month" : "maand"})</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-success">EUR 0 {isEn ? "setup" : "opstartkosten"}</span> · {isEn ? "Less than a coffee a day" : "Minder dan een kop koffie per dag"}
          </p>
        </div>

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
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-6 py-3 rounded-full">
            <Check size={20} />
            <span className="font-medium">{isEn ? "All included, no hidden costs" : "Alles inclusief, geen verborgen kosten"}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
