import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

type HeaderProps = {
  variant?: "home" | "webshop";
};

const Header = ({ variant = "home" }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks =
    variant === "webshop"
      ? [
          { href: "#techniek", label: "Techniek" },
          { href: "#aanbod", label: "Aanbod" },
          { href: "#sheets", label: "Sheets" },
          { href: "#contact", label: "Contact" },
        ]
      : [
          { href: "#hoe-het-werkt", label: "Hoe het werkt" },
          { href: "#features", label: "Wat je krijgt" },
          { href: "#faq", label: "FAQ" },
          { href: "#contact", label: "Contact" },
        ];

  const cta =
    variant === "webshop"
      ? { href: "#contact", label: "Plan een call" }
      : { href: "#contact", label: "Plan een call" };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img
              src="/icon-sitedesk.png"
              alt="Sitedesk logo"
              className="w-9 h-9 rounded-lg object-contain"
            />
            <span className="font-bold text-xl text-foreground">Sitedesk</span>
            <span className="text-muted-foreground text-sm">.co</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className={`border-accent/60 text-accent hover:bg-accent/10 ${
                variant === "webshop" ? "bg-accent/5 shadow-glow border-accent/80" : ""
              }`}
            >
              <a href="/webshop">Webshop</a>
            </Button>
            <Button asChild variant="hero" size="default">
              <a href={cta.href}>{cta.label}</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors text-base font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-accent text-accent hover:bg-accent/10"
                onClick={() => setIsMenuOpen(false)}
              >
                <a href="/webshop">Webshop</a>
              </Button>
              <Button asChild variant="hero" size="lg" className="mt-2">
                <a href={cta.href}>{cta.label}</a>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;