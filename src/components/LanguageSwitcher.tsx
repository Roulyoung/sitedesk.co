import { useLocation } from "react-router-dom";
import {
  ACTIVE_LOCALES,
  DEFAULT_LOCALE,
  getLocaleFromPath,
  translateLandingHash,
  stripLocaleFromPath,
  withLocalePath,
  type SupportedLocale,
} from "@/lib/i18n";
import { t } from "@/lib/messages";

const LanguageSwitcher = () => {
  const location = useLocation();
  const currentLocale = getLocaleFromPath(location.pathname);
  const basePath = stripLocaleFromPath(location.pathname);

  const toLocaleUrl = (targetLocale: SupportedLocale) => {
    const localizedPath = withLocalePath(basePath, targetLocale);
    const search = location.search || "";
    const hash =
      basePath === "/"
        ? translateLandingHash(location.hash || "", currentLocale, targetLocale)
        : location.hash || "";
    return `${localizedPath}${search}${hash}`;
  };

  if (ACTIVE_LOCALES.length > 3) {
    return (
      <select
        aria-label="Language"
        className="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground"
        value={currentLocale}
        onChange={(event) => {
          const next = event.target.value as SupportedLocale;
          window.location.href = toLocaleUrl(next);
        }}
      >
        {ACTIVE_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {t(DEFAULT_LOCALE, `lang.${locale}` as const)}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="inline-flex items-center rounded-md border border-border bg-background p-1" aria-label="Language switcher">
      {ACTIVE_LOCALES.map((locale) => {
        const active = locale === currentLocale;
        return (
          <a
            key={locale}
            href={toLocaleUrl(locale)}
            hrefLang={locale}
            lang={locale}
            aria-current={active ? "true" : undefined}
            className={`px-2 py-1 text-xs font-semibold rounded ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(DEFAULT_LOCALE, `lang.${locale}` as const)}
          </a>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
