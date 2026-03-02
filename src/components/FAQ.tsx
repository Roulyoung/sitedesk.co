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
        ? "No. You pay one fixed price and that covers hosting, security, updates, support, backups, and business email. No surprise invoices when your site needs attention."
        : "Nee. Je betaalt een vaste prijs en daarmee zijn hosting, beveiliging, updates, support, back-ups en zakelijke e-mail geregeld. Dus geen verrassingsfacturen als je site aandacht nodig heeft.",
    },
    {
      question: isEn ? "Can I keep my own domain?" : "Kan ik mijn eigen domeinnaam houden?",
      answer: isEn
        ? "Yes. Keep your current domain or let us register a new one. We handle the move, so you stay reachable without technical hassle."
        : "Ja. Je kunt je huidige domeinnaam behouden of via ons een nieuwe registreren. Wij regelen de overstap, zodat je bereikbaar blijft zonder technisch gedoe.",
    },
    {
      question: isEn ? "How fast can my site go live?" : "Hoe snel kan mijn website live staan?",
      answer: isEn
        ? "Usually within 5 to 7 working days after a short intake. That means you can move quickly from idea to a professional online presence."
        : "Meestal binnen 5 tot 7 werkdagen na een korte intake. Zo ga je snel van plan naar een professionele online aanwezigheid.",
    },
    {
      question: isEn ? "What does a custom webshop cost?" : "Wat kost een maatwerk webshop?",
      answer: isEn
        ? "That depends on your catalog, integrations, checkout flow, and migration scope. We first define what actually drives revenue, then give you a clear fixed proposal."
        : "Dat hangt af van je assortiment, koppelingen, checkout-flow en migratie. We bepalen eerst wat echt omzet gaat opleveren, daarna krijg je een heldere vaste prijsopgave.",
    },
    {
      question: isEn ? "How long does a webshop project take?" : "Hoe lang duurt een webshoptraject?",
      answer: isEn
        ? "Most projects go live in phases. A first conversion-ready version is usually delivered within a few weeks, so you can start selling before everything is perfect."
        : "De meeste trajecten gaan gefaseerd live. Een eerste conversiegerichte versie leveren we meestal binnen enkele weken op, zodat je al kunt verkopen voordat alles tot in detail is doorontwikkeld.",
    },
    {
      question: isEn ? "Can you migrate from WooCommerce or Shopify?" : "Kunnen jullie migreren vanaf WooCommerce of Shopify?",
      answer: isEn
        ? "Yes. We migrate the structure, key content, and products to a cleaner and faster setup, so you can leave behind plugin drag and technical debt."
        : "Ja. We migreren structuur, kerncontent en producten naar een schonere en snellere setup, zodat je plugin-gedoe en technische schuld achter je laat.",
    },
    {
      question: isEn ? "How do I request changes?" : "Hoe vraag ik wijzigingen aan?",
      answer: isEn
        ? "Send your changes by email or WhatsApp to your Desk contact. You do not need to figure out the technical side, we just get it done."
        : "Stuur je wijzigingen via mail of WhatsApp naar je Desk-contact. Jij hoeft het technische deel niet uit te zoeken, wij regelen dat gewoon.",
    },
    {
      question: isEn ? "Am I stuck in a long contract?" : "Zit ik vast aan een lang contract?",
      answer: isEn
        ? "No. You pay monthly and can cancel monthly. You stay because it works, not because a contract traps you."
        : "Nee. Je betaalt maandelijks en kunt per maand opzeggen. Je blijft omdat het werkt, niet omdat een contract je vasthoudt.",
    },
    {
      question: isEn ? "What if I am not satisfied?" : "Wat als ik niet tevreden ben?",
      answer: isEn
        ? "Then you get your money back within the first 30 days. That gives you room to start without risk."
        : "Dan krijg je binnen de eerste 30 dagen je geld terug. Zo kun je zonder risico starten.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4">FAQ</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {isEn ? "Questions serious business owners ask" : "Vragen die serieuze ondernemers stellen"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isEn ? "Straight answers about costs, timelines, risk, and support." : "Duidelijke antwoorden over kosten, doorlooptijd, risico en support."}
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
