import { MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto py-16">
        <h2 className="sr-only">Footer navigatie</h2>
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/icon-sitedesk.png"
                alt="Sitedesk logo"
                className="w-10 h-10 rounded-lg bg-primary-foreground/10 p-1.5"
              />
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-xl">Sitedesk</span>
                <span className="text-primary-foreground/60 text-sm">.co</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 max-w-sm mb-6">
              Jouw digitale rechterhand. Professionele websites voor ondernemers,
              volledig beheerd voor slechts €1 per dag.
            </p>
            <div className="space-y-2 text-sm text-primary-foreground/70">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5" />
                <div>
                  <div>Den Ouden Holding B.V.</div>
                  <div>Keizerrijk 44, 1012VM Amsterdam, Netherlands</div>
                </div>
              </div>
            </div>
          </div>

          {/* Oplossingen */}
          <div>
            <h3 className="font-semibold mb-4">Onze Oplossingen</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>
                <a href="/" className="hover:text-primary-foreground transition-colors">
                  Webshops
                </a>
              </li>
              <li>
                <a href="/zakelijke-websites" className="hover:text-primary-foreground transition-colors">
                  Zakelijke Websites
                </a>
              </li>
            </ul>
          </div>

          {/* Navigatie */}
          <div>
            <h3 className="font-semibold mb-4">Navigatie</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>
                <a href="/#contact" className="hover:text-primary-foreground transition-colors">
                  Plan een call
                </a>
              </li>
              <li>
                <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer" className="hover:text-primary-foreground transition-colors">
                  WhatsApp direct
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Juridisch</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Algemene Voorwaarden
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm text-primary-foreground/60">
          <p suppressHydrationWarning>© {new Date().getFullYear()} Sitedesk.co. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
