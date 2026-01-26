import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Zijn er verborgen kosten?",
    answer: "Nee, absoluut niet. Je betaalt €1 per dag (€30/maand) en daarmee is alles inclusief: hosting, SSL, updates, support, back-ups en zelfs je zakelijke e-mailadres. Geen verrassingen.",
  },
  {
    question: "Kan ik mijn eigen domeinnaam gebruiken?",
    answer: "Ja, natuurlijk! Je kunt je bestaande domeinnaam behouden of via ons een nieuwe registreren. Wij regelen de technische verhuizing gratis en zonder downtime.",
  },
  {
    question: "Hoe snel is mijn website live?",
    answer: "Gemiddeld binnen 5-7 werkdagen. Na je aanmelding plannen we een kort intake-gesprek om je wensen te bespreken, waarna we direct aan de slag gaan.",
  },
  {
    question: "Wat als ik wijzigingen wil doorvoeren?",
    answer: "Stuur je wijzigingen via mail of WhatsApp naar je persoonlijke 'Desk'. Wij voeren ze binnen 24-48 uur door. Je hebt 2 update-rondes per maand inclusief.",
  },
  {
    question: "Moet ik een lange termijn contract tekenen?",
    answer: "Nee! Je betaalt maandelijks en kunt per maand opzeggen. Wij geloven in de kwaliteit van onze service, dus we houden je niet vast met wurgcontracten.",
  },
  {
    question: "Wat als ik niet tevreden ben?",
    answer: "Dan krijg je binnen de eerste 30 dagen je geld volledig terug. Geen vragen, geen gedoe. Wij willen alleen tevreden klanten.",
  },
  {
    question: "Heb ik echt geen cookiebanner nodig?",
    answer: "Correct! We gebruiken privacy-vriendelijke analytics (Umami) die geen cookies plaatsen en 100% AVG-proof zijn. Dus geen irritante cookiebanners voor je bezoekers.",
  },
  {
    question: "Wie zit er achter Sitedesk?",
    answer: "Sitedesk is opgericht door ondernemers voor ondernemers. We snappen dat je druk bent met je business en geen tijd hebt voor technisch gedoe. Daarom doen wij het voor je.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Veelgestelde vragen
          </h2>
          <p className="text-lg text-muted-foreground">
            Alles wat je wilt weten over Sitedesk.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background rounded-xl border border-border px-6 data-[state=open]:border-accent/30 data-[state=open]:shadow-md transition-all duration-200"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-accent hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
