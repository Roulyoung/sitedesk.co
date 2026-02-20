import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLocation } from "react-router-dom";
import { getLocaleFromPath } from "@/lib/i18n";

const FAQ = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";

  const faqs = [
    {
      question: isEn ? "Are there hidden costs?" : "Zijn er verborgen kosten?",
      answer: isEn
        ? "No. You pay EUR 1 per day (EUR 30/month), including hosting, SSL, updates, support, backups, and business email."
        : "Nee. Je betaalt EUR 1 per dag (EUR 30/maand) en daarmee is alles inclusief: hosting, SSL, updates, support, back-ups en je zakelijke e-mailadres.",
    },
    {
      question: isEn ? "Can I use my own domain?" : "Kan ik mijn eigen domeinnaam gebruiken?",
      answer: isEn
        ? "Yes. Keep your current domain or register a new one. We handle migration without downtime."
        : "Ja. Je kunt je bestaande domeinnaam behouden of via ons een nieuwe registreren. Wij regelen de technische verhuizing zonder downtime.",
    },
    {
      question: isEn ? "How fast can my site go live?" : "Hoe snel is mijn website live?",
      answer: isEn
        ? "Usually within 5-7 working days after a short intake call."
        : "Gemiddeld binnen 5-7 werkdagen. Na een korte intake gaan we direct aan de slag.",
    },
    {
      question: isEn ? "How do I request changes?" : "Wat als ik wijzigingen wil doorvoeren?",
      answer: isEn
        ? "Send updates by email or WhatsApp to your Desk contact and we implement them quickly."
        : "Stuur wijzigingen via mail of WhatsApp naar je persoonlijke Desk. Wij voeren ze snel door.",
    },
    {
      question: isEn ? "Do I need a long-term contract?" : "Moet ik een lange termijn contract tekenen?",
      answer: isEn
        ? "No. Monthly payment and monthly cancellation."
        : "Nee. Je betaalt maandelijks en kunt per maand opzeggen.",
    },
    {
      question: isEn ? "What if I am not satisfied?" : "Wat als ik niet tevreden ben?",
      answer: isEn
        ? "You get your money back within the first 30 days."
        : "Dan krijg je binnen de eerste 30 dagen je geld volledig terug.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">FAQ</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {isEn ? "Frequently asked questions" : "Veelgestelde vragen"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isEn ? "Everything you need to know about Sitedesk." : "Alles wat je wilt weten over Sitedesk."}
          </p>
        </div>

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
                <AccordionContent className="text-muted-foreground pb-5">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
