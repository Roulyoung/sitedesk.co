import { Check, X } from "lucide-react";

const comparisonData = [
  {
    feature: "Opstartkosten",
    traditional: "€1.500 - €3.000",
    sitedesk: "€0",
    sitedeskBetter: true,
  },
  {
    feature: "Maandelijkse kosten",
    traditional: "€50 - €100",
    sitedesk: "€30 (€1/dag)",
    sitedeskBetter: true,
  },
  {
    feature: "Onderhoud & Updates",
    traditional: "€75 per uur",
    sitedesk: "Inclusief",
    sitedeskBetter: true,
  },
  {
    feature: "Cookiebanners",
    traditional: "Verplicht & irritant",
    sitedesk: "Niet nodig",
    sitedeskBetter: true,
  },
  {
    feature: "Support",
    traditional: "\"Stuur een ticket\"",
    sitedesk: "Persoonlijke 'Desk' service",
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
    <section className="py-20 md:py-32 gradient-subtle">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            Vergelijk
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Waarom ondernemers voor de Desk kiezen
          </h2>
          <p className="text-lg text-muted-foreground">
            Zie zelf het verschil met traditionele websitebouwers.
          </p>
        </div>

        {/* Comparison table */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
            {/* Header row */}
            <div className="grid grid-cols-3 bg-secondary/50">
              <div className="p-4 md:p-6 font-semibold text-foreground">
                Feature
              </div>
              <div className="p-4 md:p-6 text-center font-semibold text-muted-foreground border-x border-border">
                Traditionele Bouwer
              </div>
              <div className="p-4 md:p-6 text-center">
                <span className="font-bold text-accent">Sitedesk.co</span>
              </div>
            </div>

            {/* Data rows */}
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
