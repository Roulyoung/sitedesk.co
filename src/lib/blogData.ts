export type ContentBlock =
  | { type: "text"; value: string }
  | { type: "h2"; value: string }
  | { type: "calc_box"; data: { leftTitle: string; leftItems: string[]; rightTitle: string; rightItems: string[]; summary?: string } }
  | { type: "cta_box"; data?: { title?: string; body?: string } };

export type Post = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  tags?: string[];
  readingTime?: string;
  content: ContentBlock[];
};

export const posts: Post[] = [
  {
    id: "waarom-0ms-geen-luxe-is",
    title: "Waarom een laadtijd van 0ms geen luxe is, maar pure noodzaak",
    excerpt: "Elke seconde vertraging kost directe omzet. Ontdek waarom de Edge-architectuur dit definitief oplost.",
    date: "2026-02-10",
    tags: ["Performance", "Edge", "CRO"],
    readingTime: "6 min",
    content: [
      { type: "text", value: "Je opent een webshop op je telefoon. Je ziet een wit scherm. Eén seconde gaat voorbij... twee seconden... drie... Je bent weg, toch? In 2026 is de online consument ongeduldiger dan ooit. Snelheid is niet langer nice-to-have; het is de fundering van je winstgevendheid." },
      { type: "h2", value: "De harde cijfers: elke seconde telt" },
      { type: "text", value: "Wanneer we zeggen dat traagheid omzet kost, baseren we dat niet op een onderbuikgevoel. De data van tech-giganten is onverbiddelijk." },
      { type: "text", value: "De 53%-grens: 53% van mobiele bezoekers haakt af na 3 seconden laden. (Google/SOASTA)" },
      { type: "text", value: "Conversie-killer: 1s laadtijd = 3x hogere conversie vs 5s. (Portent)" },
      { type: "text", value: "Amazon-effect: Elke 100ms vertraging kost 1% omzet. (Amazon)" },
      { type: "text", value: "Conclusie: Draait je shop met ~4s laadtijd? Dan verdampt de helft van je marketingbudget nog voor de betaalknop in beeld komt." },
      { type: "h2", value: "Het probleem van de centrale database" },
      { type: "text", value: "Traditionele shops renderen vanaf een centrale server. Elke klik wacht op server, database en HTML-build. Hoe meer plugins, hoe zwaarder de lijn." },
      { type: "text", value: "Meer apps = meer latency. Meer thema's = grotere bundels. De bezoeker wacht, jij verliest omzet." },
      { type: "h2", value: "De oplossing: Edge-architectuur (Sitedesk Engine)" },
      { type: "text", value: "Wij deployen je shop op Cloudflare Edge. Niet één server, maar duizenden nodes dichter bij je bezoeker." },
      { type: "text", value: "0ms gevoel: Assets staan al naast je bezoeker." },
      { type: "text", value: "Geen database-calls: Data serveert direct vanaf de Edge." },
      { type: "text", value: "Headless-snelheid: Frontend en Sheets-backend zijn ontkoppeld voor pure performance." },
      { type: "h2", value: "De rekensom: wat levert 0ms op?" },
      { type: "text", value: "Stel je hebt een bescheiden shop. Alleen al op snelheid pak je elke maand duizenden euro’s terug." },
      {
        type: "calc_box",
        data: {
          leftTitle: "Huidige situatie (4s)",
          leftItems: ["Bezoekers: 5.000", "Gemiddelde orderwaarde: €60,-", "Conversie: 1,5%", "Maandomzet: €4.500,-"],
          rightTitle: "Met Sitedesk Edge (0ms gevoel)",
          rightItems: ["Bezoekers: 5.000", "Gemiddelde orderwaarde: €60,-", "Conversie: 2,2% (conservatief)", "Maandomzet: €6.600,-"],
          summary: "Resultaat: +€2.100 per maand (+€25.200 per jaar) puur door techniek.",
        },
      },
      { type: "h2", value: "Waarom Sitedesk de logische investering is" },
      { type: "text", value: "Een nieuwe shop voelt vaak als een kostenpost. Wij zien het als het verwijderen van een blok aan je been. Onze Pilot Deal verdient zichzelf direct terug en verlaagt je hoofdpijn-belasting." },
      { type: "text", value: "Geen server-onderhoud. Geen trage admin-dashboards: beheer alles in Google Sheets. Wij zijn je tech-team: wij bouwen, beheren en optimaliseren." },
      { type: "h2", value: "Klaar voor 0ms? Zo pakken we het aan" },
      { type: "text", value: "Snelheid is het verschil tussen winnen en verliezen. Wil je weten hoeveel omzet je nu laat liggen? Plan een gratis Speed-Check of stuur een WhatsApp. We laten je zien wat 0ms voor jouw merk doet." },
      { type: "cta_box", data: { title: "Pilot Deal: 0ms of niets", body: "€1.000 eenmalig, €150 p/m. Inclusief hosting, onbeperkt support én doorontwikkeling. Verdient zichzelf in maand 1 terug." } },
      { type: "text", value: "Gepubliceerd door Sitedesk Performance Lab — Wij bouwen de snelste e-commerce infrastructuur op de Edge." },
    ],
  },
  {
    id: "waarom-woocommerce-je-groei-belemmert",
    title: "Waarom WooCommerce je groei belemmert (en waarom het in het AI-tijdperk gevaarlijk is)",
    excerpt: "WooCommerce lijkt gratis, maar in 2026 is het een legacy-tax: traag, kwetsbaar en kostbaar in onderhoud. Ontdek waarom een Edge-architectuur de enige logische stap is.",
    date: "2026-02-14",
    tags: ["WooCommerce", "Security", "Headless"],
    readingTime: "7 min",
    content: [
      { type: "text", value: "Je webshop begon waarschijnlijk met WooCommerce. Het is gratis, het is bekend en \"iedereen gebruikt het.\" Maar wat ooit een veilige keuze leek, is in 2026 veranderd in een blok aan het been van elke serieuze ondernemer. In een wereld waar AI de standaarden voor snelheid en veiligheid bepaalt, is de traditionele WordPress-shop niet langer een fundament, maar een risico." },
      { type: "h2", value: "De illusie van gratis: De verborgen \"Legacy Tax\"" },
      { type: "text", value: "De grootste leugen in e-commerce is dat WooCommerce gratis is. Ja, de plugin kost niets, maar de infrastructuur die nodig is om een zware PHP-site snel te houden, is peperduur. WooCommerce is een monolithisch systeem: de database, de admin-omgeving en de voorkant van je shop zitten aan elkaar vastgeketend." },
      { type: "text", value: "Wanneer je shop groeit, groeit de database-vervuiling (bloat). Elke klik van een klant vereist een zware 'call' naar een centrale server. Dit veroorzaakt een trage Time to First Byte (TTFB). Voor Google is dit een direct signaal om je lager te ranken. Je betaalt de prijs voor \"gratis\" dus elke dag in de vorm van gemiste conversies." },
      { type: "h2", value: "De AI-Security Paradox: Waarom WordPress een schietschijf is" },
      { type: "text", value: "Met de komst van AI is het speelveld voor hackers fundamenteel veranderd. AI-bots kunnen nu 24/7 het internet scannen op specifieke kwetsbaarheden in plugins. Omdat de gemiddelde WooCommerce-shop draait op 20 tot 50 verschillende plugins van verschillende makers, is er altijd wel ergens een zwakke schakel." },
      { type: "text", value: "Geautomatiseerde aanvallen: AI kan binnen seconden duizenden varianten van een exploit proberen op jouw inlogpagina of database." },
      { type: "text", value: "De server is het probleem: Omdat je shop op een traditionele server staat, hebben hackers een fysiek doelwit om te kraken." },
      { type: "text", value: "Bij Sitedesk lossen we dit op door ontkoppeling. Jouw webshop staat op de Edge (Cloudflare), niet op een kwetsbare centrale server. Er valt simpelweg niets te kraken aan de voorkant, omdat de data veilig in een afgeschermde backend (zoals Google Sheets) leeft." },
      { type: "h2", value: "De rekensom: WooCommerce vs. Sitedesk Edge" },
      {
        type: "calc_box",
        data: {
          leftTitle: "WooCommerce Onderhoud",
          leftItems: [
            "Updates, beveiligingspatches en conflicterende plugins: ±4 uur/maand",
            "Developer-tarief €90,-/uur",
            "Totale onderhoudskosten: ±€360,- p/m",
          ],
          rightTitle: "Sitedesk Snelheidssysteem",
          rightItems: [
            "Vast bedrag: €150,- p/m",
            "Geen onderhoud, geen updates",
            "Edge-performance inbegrepen",
          ],
          summary: "Besparing: €2.520,- per jaar aan technische hoofdpijn, plus extra omzet door snelheid.",
        },
      },
      { type: "h2", value: "De verlossing van de ontkoppelde backend" },
      { type: "text", value: "De toekomst van e-commerce is Headless. Dit betekent dat we de 'voorkant' loskoppelen van de 'achterkant'. Waarom zou je door een traag WordPress-dashboard navigeren als je ook gewoon je voorraad kunt bijwerken in een Google Sheet? Het is sneller, veiliger en AI-ready. Onze lichte data-infrastructuur wordt efficiënter verwerkt dan een rommelige WooCommerce-database." },
      { type: "h2", value: "Conclusie: Durf je afscheid te nemen van 2015?" },
      { type: "text", value: "WooCommerce was fantastisch in het vorige decennium. Maar in een tijdperk waar klanten 0ms laadtijd verwachten en AI-bots constant aan de deur rammelen, is het tijd voor een professionele architectuur. Sitedesk biedt je de verlossing van de plugin-hel." },
      { type: "cta_box", data: { title: "Pilot Deal: Stap nu over naar de Edge", body: "€1.000 eenmalig, €150 p/m. Wij migreren je producten, richten je Google Sheets-backend in en zetten je shop op de wereldwijde Edge-infrastructuur." } },
      { type: "text", value: "Gepubliceerd door Sitedesk Performance Lab — Wij bouwen de snelste e-commerce infrastructuur op de Edge." },
    ],
  },
];
