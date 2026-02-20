export const SUPPORTED_LOCALES = ["nl", "en", "de"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "nl";

const parseActiveLocales = () => {
  const raw =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_ACTIVE_LOCALES) || "nl,en";
  const requested = String(raw)
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const filtered = requested.filter((locale): locale is SupportedLocale =>
    SUPPORTED_LOCALES.includes(locale as SupportedLocale),
  );

  const withDefault = filtered.includes(DEFAULT_LOCALE)
    ? filtered
    : [DEFAULT_LOCALE, ...filtered];

  return [...new Set(withDefault)];
};

export const ACTIVE_LOCALES: SupportedLocale[] = parseActiveLocales();
const ACTIVE_NON_DEFAULT_LOCALES = ACTIVE_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

export const isSupportedLocale = (value: string | null | undefined): value is SupportedLocale =>
  Boolean(value && SUPPORTED_LOCALES.includes(value as SupportedLocale));

export const isActiveLocale = (value: string | null | undefined): value is SupportedLocale =>
  Boolean(value && ACTIVE_LOCALES.includes(value as SupportedLocale));

export const normalizeLocale = (value: string | null | undefined): SupportedLocale => {
  if (!value) return DEFAULT_LOCALE;
  const cleaned = value.toLowerCase().trim();
  return isSupportedLocale(cleaned) ? cleaned : DEFAULT_LOCALE;
};

export const getLocalePrefix = (locale: SupportedLocale) =>
  locale === DEFAULT_LOCALE ? "" : `/${locale}`;

export const splitLocalePath = (pathname: string) => {
  const normalizedPathname = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const parts = normalizedPathname.split("/").filter(Boolean);
  const maybeLocale = parts[0]?.toLowerCase();

  if (isActiveLocale(maybeLocale) && maybeLocale !== DEFAULT_LOCALE) {
    const rest = `/${parts.slice(1).join("/")}`;
    return {
      locale: maybeLocale,
      pathWithoutLocale: rest === "/" ? "/" : rest.replace(/\/+$/, "") || "/",
    };
  }

  return {
    locale: DEFAULT_LOCALE,
    pathWithoutLocale: normalizedPathname || "/",
  };
};

export const getLocaleFromPath = (pathname: string): SupportedLocale => splitLocalePath(pathname).locale;

export const stripLocaleFromPath = (pathname: string) => splitLocalePath(pathname).pathWithoutLocale;

export const withLocalePath = (path: string, locale: SupportedLocale) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const clean = normalized === "/" ? "/" : normalized.replace(/\/+$/, "");
  const prefix = getLocalePrefix(locale);

  if (!prefix) return clean;
  return clean === "/" ? prefix : `${prefix}${clean}`;
};

export const getAlternateHrefLangs = (pathWithoutLocale: string) => {
  const clean = pathWithoutLocale.startsWith("/") ? pathWithoutLocale : `/${pathWithoutLocale}`;
  const normalized = clean === "/" ? "/" : clean.replace(/\/+$/, "");

  const alternates = ACTIVE_LOCALES.map((locale) => ({
    locale,
    href: `https://sitedesk.co${withLocalePath(normalized, locale)}`,
  }));

  return [
    ...alternates,
    { locale: "x-default", href: `https://sitedesk.co${normalized}` },
  ];
};

export const getLocalizedValue = (row: Record<string, unknown>, base: string, locale: SupportedLocale) => {
  const candidates = [
    `${base}_${locale}`,
    `${locale}_${base}`,
    `${base}_${DEFAULT_LOCALE}`,
    `${DEFAULT_LOCALE}_${base}`,
    base,
  ];

  for (const key of candidates) {
    const value = row[key];
    if (value != null && String(value).trim() !== "") return String(value);
  }
  return "";
};

export const getLocalizedSlug = (row: Record<string, unknown>, locale: SupportedLocale) => {
  const candidates = [
    `slug_${locale}`,
    `${locale}_slug`,
    "slug",
    `slug_${DEFAULT_LOCALE}`,
  ];

  for (const key of candidates) {
    const value = row[key];
    if (value != null && String(value).trim() !== "") return String(value).trim();
  }
  return "";
};

export const getNonDefaultLocales = () => ACTIVE_NON_DEFAULT_LOCALES;

export type LandingSectionKey =
  | "tech"
  | "calculator"
  | "comparison"
  | "offer"
  | "sheets"
  | "contact";

const LANDING_SECTION_IDS: Record<SupportedLocale, Record<LandingSectionKey, string>> = {
  nl: {
    tech: "techniek",
    calculator: "omzetverlies",
    comparison: "concurrentievergelijking",
    offer: "aanbod",
    sheets: "sheets",
    contact: "contact",
  },
  en: {
    tech: "technology",
    calculator: "revenue-loss",
    comparison: "comparison",
    offer: "offer",
    sheets: "sheets",
    contact: "contact",
  },
  de: {
    tech: "technik",
    calculator: "umsatzverlust",
    comparison: "vergleich",
    offer: "angebot",
    sheets: "sheets",
    contact: "kontakt",
  },
};

export const getLandingSectionId = (locale: SupportedLocale, key: LandingSectionKey) =>
  LANDING_SECTION_IDS[locale]?.[key] || LANDING_SECTION_IDS[DEFAULT_LOCALE][key];

export const getLandingSectionHash = (locale: SupportedLocale, key: LandingSectionKey) =>
  `#${getLandingSectionId(locale, key)}`;

export const getLandingSectionKeyById = (
  locale: SupportedLocale,
  id: string | null | undefined,
): LandingSectionKey | null => {
  if (!id) return null;
  const clean = String(id).replace(/^#/, "").trim();
  const entries = Object.entries(LANDING_SECTION_IDS[locale] || {}) as Array<
    [LandingSectionKey, string]
  >;
  const found = entries.find(([, value]) => value === clean);
  return found ? found[0] : null;
};

export const translateLandingHash = (
  hash: string,
  fromLocale: SupportedLocale,
  toLocale: SupportedLocale,
) => {
  if (!hash) return "";
  const key = getLandingSectionKeyById(fromLocale, hash);
  if (!key) return hash;
  return getLandingSectionHash(toLocale, key);
};
