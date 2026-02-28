import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, MessageCircle, ChevronDown } from "lucide-react";
import { getLandingSectionHash, getLocaleFromPath, withLocalePath } from "@/lib/i18n";
import { t } from "@/lib/messages";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getMigrationMenuLabel, getPlatformRoute, migrationPlatforms } from "@/lib/platformMigrationConfigs";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileTechOpen, setIsMobileTechOpen] = useState(false);
  const [isMobileMigrationOpen, setIsMobileMigrationOpen] = useState(false);
  const [isDesktopTechOpen, setIsDesktopTechOpen] = useState(false);
  const [isDesktopMigrationOpen, setIsDesktopMigrationOpen] = useState(false);
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

  const homeTo = withLocalePath("/", locale);
  const comparisonTo = `${homeTo}${getLandingSectionHash(locale, "comparison")}`;
  const sheetsTo = `${homeTo}${getLandingSectionHash(locale, "sheets")}`;
  const calculatorTo = `${homeTo}${getLandingSectionHash(locale, "calculator")}`;
  const migrationRoutes = migrationPlatforms.map((platform) => ({
    key: platform.key,
    to: withLocalePath(getPlatformRoute(platform, locale), locale),
    label: getMigrationMenuLabel(platform, locale),
  }));
  const demoTo = withLocalePath("/demo", locale);
  const blogTo = withLocalePath("/blog", locale);
  const techActive = isActive(comparisonTo, "hash") || isActive(sheetsTo, "hash");
  const migrationActive = migrationRoutes.some((route) => isActive(route.to, "route"));

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
        <a href={homeTo} className="flex items-center gap-2">
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
          <NavLink
            to={homeTo}
            className={`text-sm font-medium transition-colors ${
              isActive(homeTo, "route")
                ? "text-foreground border-b-2 border-accent pb-1"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t(locale, "nav.home")}
          </NavLink>

          <div
            className="relative"
            onMouseEnter={() => setIsDesktopTechOpen(true)}
            onMouseLeave={() => setIsDesktopTechOpen(false)}
          >
            <button
              type="button"
              className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                techActive
                  ? "text-foreground border-b-2 border-accent pb-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-haspopup="menu"
              aria-expanded={isDesktopTechOpen}
              onClick={() => setIsDesktopTechOpen((value) => !value)}
            >
              {t(locale, "nav.tech")}
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className={`absolute left-0 top-full z-50 min-w-56 pt-2 ${isDesktopTechOpen ? "block" : "hidden"}`}>
              <div className="rounded-md border border-border bg-card p-2 shadow-lg">
              <NavLink
                to={comparisonTo}
                className={`block rounded px-3 py-2 text-sm transition-colors ${
                  isActive(comparisonTo, "hash")
                    ? "text-foreground bg-accent/15"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
                onClick={(e) => {
                  setIsMenuOpen(false);
                  setIsDesktopTechOpen(false);
                  handleNavClick(e, comparisonTo, "hash");
                }}
              >
                {t(locale, "nav.comparison")}
              </NavLink>
              <NavLink
                to={sheetsTo}
                className={`block rounded px-3 py-2 text-sm transition-colors ${
                  isActive(sheetsTo, "hash")
                    ? "text-foreground bg-accent/15"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
                onClick={(e) => {
                  setIsMenuOpen(false);
                  setIsDesktopTechOpen(false);
                  handleNavClick(e, sheetsTo, "hash");
                }}
              >
                {t(locale, "nav.sheets")}
              </NavLink>
              </div>
            </div>
          </div>

          <NavLink
            to={calculatorTo}
            className={`text-sm font-medium transition-colors ${
              isActive(calculatorTo, "hash")
                ? "text-foreground border-b-2 border-accent pb-1"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={(e) => {
              setIsMenuOpen(false);
              handleNavClick(e, calculatorTo, "hash");
            }}
          >
            {t(locale, "nav.calculator")}
          </NavLink>

          <div
            className="relative"
            onMouseEnter={() => setIsDesktopMigrationOpen(true)}
            onMouseLeave={() => setIsDesktopMigrationOpen(false)}
          >
            <button
              type="button"
              className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                migrationActive
                  ? "text-foreground border-b-2 border-accent pb-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-haspopup="menu"
              aria-expanded={isDesktopMigrationOpen}
              onClick={() => setIsDesktopMigrationOpen((value) => !value)}
            >
              {t(locale, "nav.migration")}
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className={`absolute left-0 top-full z-50 min-w-64 pt-2 ${isDesktopMigrationOpen ? "block" : "hidden"}`}>
              <div className="rounded-md border border-border bg-card p-2 shadow-lg">
                {migrationRoutes.map((route) => (
                  <NavLink
                    key={route.key}
                    to={route.to}
                    className={`block rounded px-3 py-2 text-sm transition-colors ${
                      isActive(route.to, "route")
                        ? "text-foreground bg-accent/15"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDesktopMigrationOpen(false);
                    }}
                  >
                    {route.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          <NavLink
            to={demoTo}
            className={`text-sm font-medium transition-colors ${
              isActive(demoTo, "route")
                ? "text-foreground border-b-2 border-accent pb-1"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t(locale, "nav.demo")}
          </NavLink>

          <NavLink
            to={blogTo}
            className={`text-sm font-medium transition-colors ${
              isActive(blogTo, "route")
                ? "text-foreground border-b-2 border-accent pb-1"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {t(locale, "nav.blog")}
          </NavLink>
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
            <NavLink
              to={homeTo}
              className={`text-base font-medium py-2 ${
                isActive(homeTo, "route")
                  ? "text-foreground border-b-2 border-accent pb-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t(locale, "nav.home")}
            </NavLink>

            <div>
              <button
                type="button"
                className={`w-full text-left text-base font-medium py-2 inline-flex items-center justify-between ${
                  techActive ? "text-foreground" : "text-muted-foreground"
                }`}
                onClick={() => setIsMobileTechOpen((value) => !value)}
                aria-expanded={isMobileTechOpen}
              >
                {t(locale, "nav.tech")}
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileTechOpen ? "rotate-180" : ""}`} />
              </button>
              {isMobileTechOpen && (
                <div className="pl-4 border-l border-border/60 flex flex-col gap-2 mt-1">
                  <NavLink
                    to={comparisonTo}
                    className={`text-sm py-1 ${
                      isActive(comparisonTo, "hash") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={(e) => {
                      setIsMenuOpen(false);
                      setIsMobileTechOpen(false);
                      handleNavClick(e, comparisonTo, "hash");
                    }}
                  >
                    {t(locale, "nav.comparison")}
                  </NavLink>
                  <NavLink
                    to={sheetsTo}
                    className={`text-sm py-1 ${
                      isActive(sheetsTo, "hash") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={(e) => {
                      setIsMenuOpen(false);
                      setIsMobileTechOpen(false);
                      handleNavClick(e, sheetsTo, "hash");
                    }}
                  >
                    {t(locale, "nav.sheets")}
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink
              to={calculatorTo}
              className={`text-base font-medium py-2 ${
                isActive(calculatorTo, "hash")
                  ? "text-foreground border-b-2 border-accent pb-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={(e) => {
                setIsMenuOpen(false);
                handleNavClick(e, calculatorTo, "hash");
              }}
            >
              {t(locale, "nav.calculator")}
            </NavLink>

            <div>
              <button
                type="button"
                className={`w-full text-left text-base font-medium py-2 inline-flex items-center justify-between ${
                  migrationActive ? "text-foreground" : "text-muted-foreground"
                }`}
                onClick={() => setIsMobileMigrationOpen((value) => !value)}
                aria-expanded={isMobileMigrationOpen}
              >
                {t(locale, "nav.migration")}
                <ChevronDown className={`h-4 w-4 transition-transform ${isMobileMigrationOpen ? "rotate-180" : ""}`} />
              </button>
              {isMobileMigrationOpen && (
                <div className="pl-4 border-l border-border/60 flex flex-col gap-2 mt-1">
                  {migrationRoutes.map((route) => (
                    <NavLink
                      key={route.key}
                      to={route.to}
                      className={`text-sm py-1 ${
                        isActive(route.to, "route") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsMobileMigrationOpen(false);
                      }}
                    >
                      {route.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <NavLink
              to={demoTo}
              className={`text-base font-medium py-2 ${
                isActive(demoTo, "route")
                  ? "text-foreground border-b-2 border-accent pb-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t(locale, "nav.demo")}
            </NavLink>

            <NavLink
              to={blogTo}
              className={`text-base font-medium py-2 ${
                isActive(blogTo, "route")
                  ? "text-foreground border-b-2 border-accent pb-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t(locale, "nav.blog")}
            </NavLink>
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
