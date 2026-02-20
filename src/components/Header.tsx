import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageCircle } from "lucide-react";
import { getLandingSectionHash, getLocaleFromPath, withLocalePath, type LandingSectionKey } from "@/lib/i18n";
import { t } from "@/lib/messages";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const navLinks = [
  { sectionKey: "tech" as LandingSectionKey, labelKey: "nav.tech", type: "hash" as const },
  { sectionKey: "calculator" as LandingSectionKey, labelKey: "nav.calculator", type: "hash" as const },
  { sectionKey: "comparison" as LandingSectionKey, labelKey: "nav.comparison", type: "hash" as const },
  { sectionKey: "offer" as LandingSectionKey, labelKey: "nav.offer", type: "hash" as const },
  { sectionKey: "sheets" as LandingSectionKey, labelKey: "nav.sheets", type: "hash" as const },
  { to: "/shop", labelKey: "nav.demo", type: "route" as const },
  { to: "/blog", labelKey: "nav.blog", type: "route" as const },
  { to: "/zakelijke-websites", labelKey: "nav.business", type: "route" as const },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [prevPath, setPrevPath] = useState(location.pathname);
  const locale = getLocaleFromPath(location.pathname);

  const isBrowser = typeof window !== "undefined";

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    to: string,
    type: "route" | "hash",
  ) => {
    if (!isBrowser) return;
    if (type !== "hash") return;
    const url = new URL(to, window.location.origin);
    const targetId = url.hash.replace("#", "");
    if (location.pathname === url.pathname) {
      event.preventDefault();
      setIsMenuOpen(false);
      scrollToHash(targetId);
    }
  };

  const isActive = (to: string, type: "route" | "hash") => {
    const origin = isBrowser ? window.location.origin : "https://sitedesk.co";
    if (type === "hash") {
      const url = new URL(to, origin);
      return location.pathname === url.pathname && location.hash === url.hash;
    }
    const url = new URL(to, origin);
    return location.pathname === url.pathname;
  };

  const scrollToHash = (targetId: string) => {
    if (!isBrowser) return;
    const el = document.getElementById(targetId);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    if (!isBrowser) return;
    if (location.pathname !== prevPath && !location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      setPrevPath(location.pathname);
    }

    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      scrollToHash(targetId);
    }
  }, [location.pathname, location.hash]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20">
        <a href={withLocalePath("/", locale)} className="flex items-center gap-2">
          <img
            src="/icon-sitedesk.png"
            alt="Sitedesk logo"
            className="w-9 h-9 rounded-lg object-contain"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
          <span className="font-bold text-xl text-foreground">Sitedesk</span>
          <span className="text-muted-foreground text-sm">.co</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const resolvedTo =
              link.type === "hash"
                ? `${withLocalePath("/", locale)}${getLandingSectionHash(locale, link.sectionKey)}`
                : withLocalePath(link.to, locale);
            const active = isActive(resolvedTo, link.type);
            return (
              <NavLink
                key={link.type === "hash" ? link.sectionKey : link.to}
                to={resolvedTo}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-foreground border-b-2 border-accent pb-1"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={(e) => {
                  setIsMenuOpen(false);
                  handleNavClick(e, resolvedTo, link.type);
                }}
              >
                {t(locale, link.labelKey)}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Button asChild variant="outline" size="sm" className="border-accent text-accent hover:bg-accent/10">
            <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer">
              <MessageCircle className="w-4 h-4" />
              {t(locale, "cta.whatsapp")}
            </a>
          </Button>
          <Button asChild variant="hero" size="default">
            <a href={`${withLocalePath("/", locale)}${getLandingSectionHash(locale, "contact")}`}>{t(locale, "cta.planCall")}</a>
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div id="mobile-nav" className="container mx-auto md:hidden py-4 border-t border-border/50 animate-fade-in">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const resolvedTo =
                link.type === "hash"
                  ? `${withLocalePath("/", locale)}${getLandingSectionHash(locale, link.sectionKey)}`
                  : withLocalePath(link.to, locale);
              const active = isActive(resolvedTo, link.type);
              return (
                <NavLink
                  key={link.type === "hash" ? link.sectionKey : link.to}
                  to={resolvedTo}
                  className={`text-base font-medium py-2 ${
                    active
                      ? "text-foreground border-b-2 border-accent pb-1"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    handleNavClick(e, resolvedTo, link.type);
                  }}
                >
                  {t(locale, link.labelKey)}
                </NavLink>
              );
            })}
            <div className="pt-1">
              <LanguageSwitcher />
            </div>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-accent text-accent hover:bg-accent/10"
              onClick={() => setIsMenuOpen(false)}
            >
              <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer">
                <MessageCircle />
                {t(locale, "cta.whatsapp")}
              </a>
            </Button>
            <Button asChild variant="hero" size="lg" className="mt-2" onClick={() => setIsMenuOpen(false)}>
              <a href={`${withLocalePath("/", locale)}${getLandingSectionHash(locale, "contact")}`}>{t(locale, "cta.planCall")}</a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
