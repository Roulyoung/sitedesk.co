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
      title: isEn ? "Mobile-first experience" : "Sterk op mobiel",
      description: isEn
        ? "Your site looks trustworthy and sells clearly on every screen, especially where customers first find you: mobile."
        : "Je site ziet er betrouwbaar uit en verkoopt duidelijk op elk scherm, vooral waar klanten je vaak als eerste zien: mobiel.",
    },
    {
      icon: Search,
      title: isEn ? "Found by the right customers" : "Beter gevonden door klanten",
      description: isEn
        ? "Built on a strong SEO foundation so more people searching for your offer can actually find you in Google."
        : "Gebouwd op een sterke SEO-basis zodat meer mensen die zoeken naar jouw aanbod je ook echt vinden in Google.",
    },
    {
      icon: Shield,
      title: isEn ? "More trust, more action" : "Meer vertrouwen, meer actie",
      description: isEn
        ? "A secure setup helps visitors feel safe enough to contact you, request a quote, or buy."
        : "Een veilige setup geeft bezoekers sneller vertrouwen om contact op te nemen, een offerte aan te vragen of te kopen.",
    },
    {
      icon: Zap,
      title: isEn ? "Speed that keeps visitors on the page" : "Snelheid die bezoekers vasthoudt",
      description: isEn
        ? "Fast pages reduce drop-off and help you get more value from every click and campaign."
        : "Snelle pagina's zorgen voor minder afhakers en halen meer waarde uit elke klik en campagne.",
    },
    {
      icon: RefreshCw,
      title: isEn ? "No panic when something breaks" : "Geen paniek als er iets misgaat",
      description: isEn
        ? "If anything ever goes wrong, we can restore fast so your site and your peace of mind stay intact."
        : "Gaat er ooit iets mis, dan kunnen we snel herstellen zodat je site en je rust behouden blijven.",
    },
    {
      icon: Headphones,
      title: isEn ? "Send a message, your site gets updated" : "Jij stuurt een bericht, wij passen je site aan",
      description: isEn
        ? "Request changes by email or WhatsApp and skip the hassle of figuring it out yourself."
        : "Vraag wijzigingen aan via mail of WhatsApp en bespaar jezelf het uitzoekwerk en gedoe.",
    },
    {
      icon: Mail,
      title: isEn ? "Look professional in every reply" : "Kom professioneel over in elke mail",
      description: isEn
        ? "Use a professional email address on your own domain so every quote, lead, and reply feels more credible."
        : "Gebruik een professioneel e-mailadres op je eigen domein zodat elke offerte, lead en reactie geloofwaardiger overkomt.",
    },
    {
      icon: BarChart3,
      title: isEn ? "Know what works without annoying visitors" : "Zie wat werkt zonder bezoekers te irriteren",
      description: isEn
        ? "Get clear visitor insights while staying privacy friendly and avoiding disruptive cookie banners."
        : "Krijg helder inzicht in bezoekers terwijl je privacyvriendelijk blijft en storende cookiebanners vermijdt.",
    },
    {
      icon: ArrowLeftRight,
      title: isEn ? "Switch without losing customers" : "Stap over zonder klanten te verliezen",
      description: isEn
        ? "Already have a site or domain? We handle the move smoothly so you can switch without stress or downtime."
        : "Heb je al een site of domein? Wij regelen de overstap soepel zodat je zonder stress of downtime kunt switchen.",
    },
    {
      icon: Clock,
      title: isEn ? "Stay because it works" : "Blijf omdat het werkt",
      description: isEn
        ? "No lock-in contracts. You keep control and can leave monthly if it is not the right fit."
        : "Geen langdurige contracten. Jij houdt de controle en kunt per maand stoppen als het niet past.",
    },
    {
      icon: Undo2,
      title: isEn ? "Start with confidence" : "Start met vertrouwen",
      description: isEn
        ? "Try it for 30 days. If it does not feel right, you get your money back."
        : "Probeer het 30 dagen. Voelt het niet goed, dan krijg je je geld terug.",
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
            {isEn ? "Everything handled, so you can keep running your business" : "Alles geregeld, zodat jij kunt ondernemen"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isEn
              ? "For less than a coffee a day, your website stays fast, secure, up to date, and out of your way."
              : "Voor minder dan een kop koffie per dag blijft je website snel, veilig, up-to-date en vooral uit je handen."}
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
            <span className="font-semibold text-success">EUR 0 {isEn ? "setup" : "opstartkosten"}</span> - {isEn ? "One fixed price, no technical surprises" : "Een vaste prijs, zonder technische verrassingen"}
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
            <span className="font-medium">{isEn ? "Everything included, so you do not need extra suppliers" : "Alles inbegrepen, dus geen extra partijen nodig"}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
