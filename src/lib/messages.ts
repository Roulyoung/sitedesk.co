import type { SupportedLocale } from "@/lib/i18n";

type MessageKey =
  | "lang.nl"
  | "lang.en"
  | "lang.de"
  | "nav.tech"
  | "nav.calculator"
  | "nav.comparison"
  | "nav.offer"
  | "nav.sheets"
  | "nav.demo"
  | "nav.blog"
  | "nav.business"
  | "cta.whatsapp"
  | "cta.planCall"
  | "footer.solutions"
  | "footer.navigation"
  | "footer.legal"
  | "footer.webshops"
  | "footer.businessSites"
  | "footer.planCall"
  | "footer.whatsapp"
  | "success.title"
  | "success.subtitle"
  | "success.summary"
  | "success.product"
  | "success.amount"
  | "success.backToStore"
  | "cancel.title"
  | "cancel.subtitle"
  | "cancel.backToShop"
  | "cancel.toCart";

const MESSAGES: Record<SupportedLocale, Record<MessageKey, string>> = {
  nl: {
    "lang.nl": "NL",
    "lang.en": "EN",
    "lang.de": "DE",
    "nav.tech": "Techniek",
    "nav.calculator": "Calculator",
    "nav.comparison": "Vergelijking",
    "nav.offer": "Aanbod",
    "nav.sheets": "Sheets",
    "nav.demo": "Demo",
    "nav.blog": "Blog",
    "nav.business": "Zakelijke Websites",
    "cta.whatsapp": "WhatsApp",
    "cta.planCall": "Plan een call",
    "footer.solutions": "Onze Oplossingen",
    "footer.navigation": "Navigatie",
    "footer.legal": "Juridisch",
    "footer.webshops": "Webshops",
    "footer.businessSites": "Zakelijke Websites",
    "footer.planCall": "Plan een call",
    "footer.whatsapp": "WhatsApp direct",
    "success.title": "Bedankt voor je bestelling!",
    "success.subtitle": "Je ontvangt binnen enkele minuten een bevestiging per e-mail.",
    "success.summary": "Besteloverzicht",
    "success.product": "Product",
    "success.amount": "Bedrag",
    "success.backToStore": "Terug naar de winkel",
    "cancel.title": "Bestelling geannuleerd",
    "cancel.subtitle": "Geen zorgen, je hebt nog niets betaald. Wil je verder winkelen of opnieuw proberen?",
    "cancel.backToShop": "Terug naar de shop",
    "cancel.toCart": "Naar winkelmand",
  },
  en: {
    "lang.nl": "NL",
    "lang.en": "EN",
    "lang.de": "DE",
    "nav.tech": "Tech",
    "nav.calculator": "Calculator",
    "nav.comparison": "Comparison",
    "nav.offer": "Offer",
    "nav.sheets": "Sheets",
    "nav.demo": "Demo",
    "nav.blog": "Blog",
    "nav.business": "Business Websites",
    "cta.whatsapp": "WhatsApp",
    "cta.planCall": "Book a call",
    "footer.solutions": "Solutions",
    "footer.navigation": "Navigation",
    "footer.legal": "Legal",
    "footer.webshops": "Webshops",
    "footer.businessSites": "Business Websites",
    "footer.planCall": "Book a call",
    "footer.whatsapp": "WhatsApp now",
    "success.title": "Thanks for your order!",
    "success.subtitle": "You will receive a confirmation email within a few minutes.",
    "success.summary": "Order summary",
    "success.product": "Product",
    "success.amount": "Amount",
    "success.backToStore": "Back to store",
    "cancel.title": "Order canceled",
    "cancel.subtitle": "No worries, you have not been charged. Continue shopping or try again.",
    "cancel.backToShop": "Back to shop",
    "cancel.toCart": "Go to cart",
  },
  de: {
    "lang.nl": "NL",
    "lang.en": "EN",
    "lang.de": "DE",
    "nav.tech": "Technik",
    "nav.calculator": "Rechner",
    "nav.comparison": "Vergleich",
    "nav.offer": "Angebot",
    "nav.sheets": "Sheets",
    "nav.demo": "Demo",
    "nav.blog": "Blog",
    "nav.business": "Business-Websites",
    "cta.whatsapp": "WhatsApp",
    "cta.planCall": "Call planen",
    "footer.solutions": "Unsere Loesungen",
    "footer.navigation": "Navigation",
    "footer.legal": "Rechtliches",
    "footer.webshops": "Webshops",
    "footer.businessSites": "Business-Websites",
    "footer.planCall": "Call planen",
    "footer.whatsapp": "Direkt WhatsApp",
    "success.title": "Danke fuer deine Bestellung!",
    "success.subtitle": "Du erhaeltst in wenigen Minuten eine Bestaetigung per E-Mail.",
    "success.summary": "Bestelluebersicht",
    "success.product": "Produkt",
    "success.amount": "Betrag",
    "success.backToStore": "Zurueck zum Shop",
    "cancel.title": "Bestellung abgebrochen",
    "cancel.subtitle": "Kein Problem, es wurde noch nichts belastet. Weiter einkaufen oder erneut versuchen.",
    "cancel.backToShop": "Zurueck zum Shop",
    "cancel.toCart": "Zum Warenkorb",
  },
};

export const t = (locale: SupportedLocale, key: MessageKey) => MESSAGES[locale]?.[key] || MESSAGES.nl[key] || key;
