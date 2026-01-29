import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare } from "lucide-react";

const Contact = () => {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Versturen mislukt. Probeer opnieuw.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Versturen mislukt. Probeer opnieuw.");
    }
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
            <MessageSquare size={16} />
            <span>Contact</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Liever direct schakelen?
          </h2>
          <p className="text-lg text-muted-foreground">
            Bel of app ons voor snelle vragen, of laat je gegevens achter. We reageren meestal binnen één werkdag.
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
              <a href="mailto:hallo@sitedesk.co" className="hover:text-foreground transition-colors">
                hallo@sitedesk.co
              </a>
            </div>
          </div>
        </div>

        <form
          className="bg-background border border-border rounded-2xl p-8 shadow-md space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Honeypot anti-spam */}
          <div className="hidden">
            <label htmlFor="company">Bedrijfsnaam (laat leeg)</label>
            <input id="company" name="company" type="text" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2" htmlFor="name">
              Naam
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="Jouw naam"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="naam@domein.nl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2" htmlFor="message">
              Bericht
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="Vertel kort wat je zoekt, dan reageren wij snel."
            />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={status === "sending"}>
            {status === "sending" ? "Verzenden..." : "Verstuur bericht"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Door te versturen ga je akkoord met een reactie via mail of telefoon. We delen niets met derden.
          </p>
          <div className="text-sm text-center" aria-live="polite">
            {status === "success" && <span className="text-success">Bericht ontvangen! We nemen snel contact op.</span>}
            {status === "error" && <span className="text-destructive">{errorMessage}</span>}
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
