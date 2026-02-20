import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getLocaleFromPath } from "@/lib/i18n";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const Contact = () => {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";

  const trackConversion = () => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: "AW-16878177204/contact_form_submit",
        value: 1.0,
        currency: "EUR",
      });
      window.gtag("event", "generate_lead");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name")?.toString().trim() ?? "",
      email: formData.get("email")?.toString().trim() ?? "",
      message: formData.get("message")?.toString().trim() ?? "",
      company: formData.get("company")?.toString().trim() ?? "",
    };

    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/submit", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || (isEn ? "Sending failed. Please try again." : "Versturen mislukt. Probeer opnieuw."));
      }

      setStatus("success");
      trackConversion();
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : isEn ? "Sending failed. Please try again." : "Versturen mislukt. Probeer opnieuw.");
    }
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-card scroll-mt-28">
      <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
            <MessageSquare size={16} />
            <span>{isEn ? "Contact" : "Contact"}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{isEn ? "Prefer direct contact?" : "Liever direct schakelen?"}</h2>
          <p className="text-lg text-muted-foreground">
            {isEn
              ? "Call or WhatsApp us for quick questions, or leave your details. We usually reply within one working day."
              : "Bel of app ons voor snelle vragen, of laat je gegevens achter. We reageren meestal binnen een werkdag."}
          </p>
          <div className="space-y-3 text-muted-foreground">
            <div className="flex items-center gap-3">
              <Phone className="text-accent" size={18} />
              <a href="tel:+31640326650" className="hover:text-foreground transition-colors">
                +31 6 4032 6650
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-accent" size={18} />
              <a href="mailto:info@sitedesk.co" className="hover:text-foreground transition-colors">
                info@sitedesk.co
              </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="secondary">
              <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer">
                {isEn ? "WhatsApp us" : "WhatsApp ons"}
              </a>
            </Button>
          </div>
        </div>

        <form
          className="bg-background border border-border rounded-2xl p-8 shadow-md space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="hidden">
            <label htmlFor="company">{isEn ? "Company (leave empty)" : "Bedrijfsnaam (laat leeg)"}</label>
            <input id="company" name="company" type="text" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2" htmlFor="name">
              {isEn ? "Name" : "Naam"}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder={isEn ? "Your name" : "Jouw naam"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2" htmlFor="email">
              {isEn ? "Email" : "E-mail"}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder={isEn ? "name@domain.com" : "naam@domein.nl"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2" htmlFor="message">
              {isEn ? "Message" : "Bericht"}
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder={isEn ? "Tell us what you need and we will respond quickly." : "Vertel kort wat je zoekt, dan reageren wij snel."}
            />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={status === "sending"}>
            {status === "sending" ? (isEn ? "Sending..." : "Verzenden...") : isEn ? "Send message" : "Verstuur bericht"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {isEn
              ? "By sending this form, you agree to be contacted by email or phone."
              : "Door te versturen ga je akkoord met een reactie via mail of telefoon. We delen niets met derden."}
          </p>
          <div className="text-sm text-center" aria-live="polite">
            {status === "success" && (
              <span className="text-success">{isEn ? "Message received. We will contact you soon." : "Bericht ontvangen! We nemen snel contact op."}</span>
            )}
            {status === "error" && <span className="text-destructive">{errorMessage}</span>}
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
