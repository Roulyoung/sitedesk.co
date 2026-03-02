import { Check, X } from "lucide-react";

const comparisonData = [
  {
    feature: "Opstartkosten",
    traditional: "EUR 1.500 - EUR 3.000",
    sitedesk: "EUR 0",
    sitedeskBetter: true,
  },
  {
    feature: "Maandelijkse kosten",
    traditional: "EUR 50 - EUR 100",
    sitedesk: "EUR 30 (EUR 1/dag)",
    sitedeskBetter: true,
  },
  {
    feature: "Onderhoud & Updates",
    traditional: "EUR 75 per uur",
    sitedesk: "Inclusief",
    sitedeskBetter: true,
  },
  {
    feature: "Cookiebanners",
    traditional: "Verplicht & irritant",
    sitedesk: "Geen irritante cookiebanners nodig",
    sitedeskBetter: true,
  },
  {
    feature: "Support",
    traditional: "\"Stuur een ticket\"",
    sitedesk: "1 vast aanspreekpunt dat snel schakelt",
    sitedeskBetter: true,
  },
  {
    feature: "SSL Certificaat",
    traditional: "Extra kosten",
    sitedesk: "Inclusief",
    sitedeskBetter: true,
  },
  {
    feature: "Zakelijke E-mail",
    traditional: "Extra kosten",
    sitedesk: "Inclusief",
    sitedeskBetter: true,
  },
  {
    feature: "Opzegtermijn",
    traditional: "6-12 maanden",
    sitedesk: "Maandelijks opzegbaar",
    sitedeskBetter: true,
  },
];

const Comparison = () => {
  return (
    <section id="vergelijking" className="py-20 md:py-32 gradient-subtle">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            Vergelijk
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Waarom ondernemers minder gedoe en meer grip kiezen
          </h2>
          <p className="text-lg text-muted-foreground">
            Zie het verschil tussen een website die tijd en geld kost, en een website die gewoon geregeld is.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
            <div className="grid grid-cols-3 bg-secondary/50">
              <div className="p-4 md:p-6 font-semibold text-foreground">
                Wat telt voor ondernemers
              </div>
              <div className="p-4 md:p-6 text-center font-semibold text-muted-foreground border-x border-border">
                Traditionele Bouwer
              </div>
              <div className="p-4 md:p-6 text-center">
                <span className="font-bold text-accent">Sitedesk.co</span>
              </div>
            </div>

            {comparisonData.map((row, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 ${
                  index !== comparisonData.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="p-4 md:p-6 text-sm md:text-base text-foreground font-medium">
                  {row.feature}
                </div>
                <div className="p-4 md:p-6 text-center text-sm md:text-base text-muted-foreground border-x border-border flex items-center justify-center gap-2">
                  <X size={16} className="text-destructive flex-shrink-0 hidden sm:block" />
                  <span>{row.traditional}</span>
                </div>
                <div className="p-4 md:p-6 text-center text-sm md:text-base font-medium flex items-center justify-center gap-2 bg-success/5">
                  <Check size={16} className="text-success flex-shrink-0" />
                  <span className="text-foreground">{row.sitedesk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
