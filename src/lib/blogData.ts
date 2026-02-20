export type CalcBoxData = {
  title?: string;
  items?: string[];
  leftTitle?: string;
  leftItems?: string[];
  rightTitle?: string;
  rightItems?: string[];
  summary?: string;
};

export type ContentBlock =
  | { type: "text"; value: string }
  | { type: "h2"; value: string }
  | { type: "calc_box"; data: CalcBoxData }
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
    title: "Waarom een laadtijd van 0ms voor je webshop geen luxe is, maar pure noodzaak",
    excerpt: "Elke seconde vertraging kost directe omzet. Ontdek waarom de Edge-architectuur dit definitief oplost.",
    date: "2026-02-10",
    tags: ["Performance", "Edge", "CRO"],
    readingTime: "6 min",
    content: [
      {
        type: "text",
        value:
          "Je opent een webshop op je telefoon. Je ziet een wit scherm. Eén seconde gaat voorbij... twee seconden... drie... Je bent weg, toch? In 2026 is de online consument ongeduldiger dan ooit. Snelheid is niet langer nice-to-have; het is de fundering van je winstgevendheid.",
      },
      { type: "h2", value: "De harde cijfers: elke seconde telt" },
      {
        type: "text",
        value: "Wanneer we zeggen dat traagheid omzet kost, baseren we dat niet op een onderbuikgevoel. De data van tech-giganten is onverbiddelijk.",
      },
      { type: "text", value: "De 53%-grens: 53% van mobiele bezoekers haakt af na 3 seconden laden. (Google/SOASTA)" },
      { type: "text", value: "Conversie-killer: 1s laadtijd = 3x hogere conversie vs 5s. (Portent)" },
      { type: "text", value: "Amazon-effect: Elke 100ms vertraging kost 1% omzet. (Amazon)" },
      {
        type: "text",
        value:
          "Conclusie: Draait je shop met ~4s laadtijd? Dan verdampt de helft van je marketingbudget nog voor de betaalknop in beeld komt.",
      },
      { type: "h2", value: "Het probleem van de centrale database" },
      {
        type: "text",
        value: "Traditionele shops renderen vanaf een centrale server. Elke klik wacht op server, database en HTML-build. Hoe meer plugins, hoe zwaarder de lijn.",
      },
      { type: "text", value: "Meer apps = meer latency. Meer thema's = grotere bundels. De bezoeker wacht, jij verliest omzet." },
      { type: "h2", value: "De oplossing: Edge-architectuur (Sitedesk Engine)" },
      {
        type: "text",
        value:
          "Wij deployen je shop op Cloudflare Edge. Niet één server, maar duizenden nodes dichter bij je bezoeker. Assets staan al naast je klant en data wordt direct geserveerd.",
      },
      { type: "text", value: "Headless-snelheid: Frontend en Sheets-backend zijn ontkoppeld voor pure performance." },
      { type: "h2", value: "De rekensom: wat levert 0ms op?" },
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
      {
        type: "text",
        value:
          "Een nieuwe shop voelt vaak als een kostenpost. Wij zien het als het verwijderen van een blok aan je been. Onze Pilot Deal verdient zichzelf direct terug en verlaagt je hoofdpijn-belasting.",
      },
      {
        type: "text",
        value: "Geen server-onderhoud. Geen trage admin-dashboards: beheer alles in Google Sheets. Wij zijn je tech-team: wij bouwen, beheren en optimaliseren.",
      },
      { type: "h2", value: "Klaar voor 0ms? Zo pakken we het aan" },
      {
        type: "text",
        value:
          "Snelheid is het verschil tussen winnen en verliezen. Wil je weten hoeveel omzet je nu laat liggen? Plan een gratis Speed-Check of stuur een WhatsApp. We laten je zien wat 0ms voor jouw merk doet.",
      },
      {
        type: "cta_box",
        data: {
          title: "Pilot Deal: 0ms of niets",
          body: "€1.000 eenmalig, €150 p/m. Inclusief hosting, onbeperkt support en doorontwikkeling. Verdient zichzelf in maand 1 terug.",
        },
      },
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
      {
        type: "text",
        value:
          "Je webshop begon waarschijnlijk met WooCommerce. Het is gratis, het is bekend en \"iedereen gebruikt het.\" Maar wat ooit een veilige keuze leek, is in 2026 veranderd in een blok aan het been van elke serieuze ondernemer. In een wereld waar AI de standaarden voor snelheid en veiligheid bepaalt, is de traditionele WordPress-shop niet langer een fundament, maar een risico.",
      },
      { type: "h2", value: "De illusie van gratis: De verborgen \"Legacy Tax\"" },
      {
        type: "text",
        value:
          "De grootste leugen in e-commerce is dat WooCommerce gratis is. Ja, de plugin kost niets, maar de infrastructuur die nodig is om een zware PHP-site snel te houden, is peperduur. WooCommerce is een monolithisch systeem: de database, de admin-omgeving en de voorkant van je shop zitten aan elkaar vastgeketend.",
      },
      {
        type: "text",
        value:
          "Wanneer je shop groeit, groeit de database-vervuiling (bloat). Elke klik van een klant vereist een zware 'call' naar een centrale server. Dit veroorzaakt een trage Time to First Byte (TTFB). Voor Google is dit een direct signaal om je lager te ranken. Je betaalt de prijs voor \"gratis\" dus elke dag in de vorm van gemiste conversies.",
      },
      { type: "h2", value: "De AI-Security Paradox: Waarom WordPress een schietschijf is" },
      {
        type: "text",
        value:
          "Met de komst van AI is het speelveld voor hackers fundamenteel veranderd. AI-bots kunnen nu 24/7 het internet scannen op specifieke kwetsbaarheden in plugins. Omdat de gemiddelde WooCommerce-shop draait op 20 tot 50 verschillende plugins van verschillende makers, is er altijd wel ergens een zwakke schakel.",
      },
      {
        type: "text",
        value:
          "Geautomatiseerde aanvallen: AI kan binnen seconden duizenden varianten van een exploit proberen op jouw inlogpagina of database. De server is het probleem: omdat je shop op een traditionele server staat, hebben hackers een fysiek doelwit om te kraken. Bij Sitedesk lossen we dit op door ontkoppeling. Jouw webshop staat op de Edge (Cloudflare), niet op een kwetsbare centrale server. Er valt niets te kraken aan de voorkant, omdat de data veilig in een afgeschermde backend (zoals Google Sheets) leeft.",
      },
      { type: "h2", value: "De rekensom: WooCommerce vs. Sitedesk Edge" },
      {
        type: "calc_box",
        data: {
          leftTitle: "WooCommerce Onderhoud",
          leftItems: ["Updates, beveiligingspatches en conflicterende plugins: 4 uur/maand", "Developer-tarief €90,-/uur", "Totale onderhoudskosten: €360,- p/m"],
          rightTitle: "Sitedesk Snelheidssysteem",
          rightItems: ["Vast bedrag: €150,- p/m", "Geen onderhoud, geen updates", "Edge-performance inbegrepen"],
          summary: "Besparing: €2.520,- per jaar aan technische hoofdpijn, plus extra omzet door snelheid.",
        },
      },
      { type: "h2", value: "De verlossing van de ontkoppelde backend" },
      {
        type: "text",
        value:
          "De toekomst van e-commerce is Headless. Dit betekent dat we de 'voorkant' loskoppelen van de 'achterkant'. Waarom zou je door een traag WordPress-dashboard navigeren als je ook gewoon je voorraad kunt bijwerken in een Google Sheet? Het is sneller, veiliger en AI-ready. Onze lichte data-infrastructuur wordt efficiënter verwerkt dan een rommelige WooCommerce-database.",
      },
      { type: "h2", value: "Conclusie: Durf je afscheid te nemen van 2015?" },
      {
        type: "text",
        value:
          "WooCommerce was fantastisch in het vorige decennium. Maar in een tijdperk waar klanten 0ms laadtijd verwachten en AI-bots constant aan de deur rammelen, is het tijd voor een professionele architectuur. Sitedesk biedt je de verlossing van de plugin-hel.",
      },
      {
        type: "cta_box",
        data: {
          title: "Pilot Deal: Stap nu over naar de Edge",
          body: "€1.000 eenmalig, €150 p/m. Wij migreren je producten, richten je Google Sheets-backend in en zetten je shop op de wereldwijde Edge-infrastructuur.",
        },
      },
      { type: "text", value: "Gepubliceerd door Sitedesk Performance Lab — Wij bouwen de snelste e-commerce infrastructuur op de Edge." },
    ],
  },
  {
    id: "verborgen-kosten-woocommerce-webshop-stagnatie",
    title: "De verborgen kosten van WooCommerce: Waarom je webshop-groei stagneert",
    excerpt:
      "In een wereld waar AI de standaarden voor snelheid en veiligheid bepaalt, is de traditionele WordPress-shop een risico geworden. Ontdek waarom WooCommerce je groei belemmert.",
    date: "2026-02-11",
    tags: ["E-commerce", "WooCommerce", "AI Security"],
    readingTime: "5 min",
    content: [
      {
        type: "text",
        value:
          "Je webshop begon waarschijnlijk met WooCommerce. Het is gratis, bekend en 'iedereen gebruikt het.' Maar wat ooit een veilige keuze leek, is in 2026 veranderd in een blok aan het been van elke serieuze ondernemer. In een wereld waar AI de standaarden voor snelheid en veiligheid bepaalt, is de traditionele WordPress-shop niet langer een fundament, maar een risico.",
      },
      { type: "h2", value: "De illusie van gratis: De verborgen Legacy Tax" },
      {
        type: "text",
        value:
          "De grootste leugen in e-commerce is dat WooCommerce gratis is. Ja, de plugin kost niets, maar de infrastructuur die nodig is om een zware PHP-site snel te houden, is peperduur. WooCommerce is een monolithisch systeem: de database, de admin-omgeving en de voorkant van je shop zitten aan elkaar vastgeketend.",
      },
      {
        type: "text",
        value:
          "Wanneer je shop groeit, groeit de database-vervuiling (bloat). Elke klik van een klant vereist een zware 'call' naar een centrale server. Dit veroorzaakt een trage Time to First Byte (TTFB). Voor Google is dit een direct signaal om je lager te ranken. Je betaalt de prijs voor 'gratis' dus elke dag in de vorm van gemiste conversies.",
      },
      { type: "h2", value: "De AI-Security Paradox: Waarom WordPress een schietschijf is" },
      {
        type: "text",
        value:
          "Met de komst van AI is het speelveld voor hackers fundamenteel veranderd. AI-bots kunnen nu 24/7 het internet scannen op specifieke kwetsbaarheden in plugins. Omdat de gemiddelde WooCommerce-shop draait op 20 tot 50 verschillende plugins van verschillende makers, is er altijd wel ergens een zwakke schakel.",
      },
      {
        type: "text",
        value:
          "**Geautomatiseerde aanvallen:** AI kan binnen seconden duizenden varianten van een exploit proberen op jouw inlogpagina of database. **De Server is het probleem:** Omdat je shop op een traditionele server staat, hebben hackers een fysiek doelwit om te kraken. Bij Sitedesk lossen we dit op door ontkoppeling via de Edge (Cloudflare). Er valt niets te kraken aan de voorkant, omdat de data veilig in een afgeschermde backend leeft.",
      },
      {
        type: "calc_box",
        data: {
          title: "De Rekensom: WooCommerce vs. Sitedesk Edge",
          items: [
            "WooCommerce Onderhoud (updates/fixes): €360,- per maand (4u @ €90,-).",
            "Sitedesk Snelheidssysteem: €150,- per maand (all-in).",
            "Besparing: €2.520,- per jaar + 100% minder technische stress.",
          ],
        },
      },
      { type: "h2", value: "De verlossing van de ontkoppelde backend" },
      {
        type: "text",
        value:
          "De toekomst van e-commerce is Headless. Dit betekent dat we de 'voorkant' loskoppelen van de 'achterkant'. Waarom zou je door een traag WordPress-dashboard navigeren als je ook gewoon je voorraad kunt bijwerken in een Google Sheet? Het is sneller, veiliger en AI-ready. AI-modellen verwerken jouw productdata veel efficiënter vanuit een schone API dan vanuit de rommelige soep van een WooCommerce-database.",
      },
      { type: "h2", value: "Conclusie: Durf je afscheid te nemen van 2015?" },
      {
        type: "text",
        value:
          "WooCommerce was fantastisch in het vorige decennium. Maar in een tijdperk waar klanten 0ms laadtijd verwachten en AI-bots constant aan de deur rammelen, is het tijd voor een professionele architectuur. Sitedesk biedt je de verlossing van de plugin-hel.",
      },
      { type: "cta_box" },
    ],
  },
  {
    id: "future-proof-webshop-langetermijninvestering",
    title: "Jouw webshop als langetermijninvestering: Future-proof bouwen zonder technische schuld",
    excerpt:
      "Waarom een ontkoppelde, headless webshop op de Edge de enige manier is om technische schuld te vermijden en je groei te versnellen.",
    date: "2026-02-16",
    tags: ["Headless", "Investering", "Technical Debt"],
    readingTime: "6 min",
    content: [
      {
        type: "text",
        value:
          "Veel ondernemers zien een nieuwe webshop als een noodzakelijk kwaad: een kostenpost die je om de drie tot vijf jaar volledig moet afschrijven en opnieuw moet bouwen. Traditionele monolieten (Shopify, WooCommerce) lijmen data, techniek en design aan elkaar vast. Veroudert het design of wordt de techniek traag? Dan moet alles op de schop. Bij Sitedesk breken we deze cyclus.",
      },
      { type: "h2", value: "De scheiding van Kerk en Staat: Data vs. Design" },
      {
        type: "text",
        value:
          "Het geheim van een future-proof webshop is ontkoppeling (Headless Architecture). We scheiden de data (producten, prijzen, orders) van het design (wat de klant ziet).",
      },
      {
        type: "text",
        value:
          "Design is tijdelijk: trends veranderen. Over drie jaar wil je misschien een compleet nieuwe look. Bij een ontkoppelde shop vervang je alleen de voorkant; je stabiele backend (Google Sheets) blijft draaien. Data is eeuwig: jouw productgeschiedenis en structuur zijn goud waard. Door dit in een universeel formaat te houden, ben je nooit gegijzeld door een specifiek platform.",
      },
      { type: "h2", value: "Voorkom de technische schuld" },
      {
        type: "text",
        value:
          "Technical Debt is de prijs die je later betaalt voor snelle, goedkope oplossingen nu. Een shop volgepropt met plugins bouwt elke dag schuld op. Elke update kan conflicteren tot het vastloopt. Door te bouwen op de Edge-architectuur van Sitedesk elimineer je deze schuld.",
      },
      {
        type: "text",
        value:
          "Geen onderhouds-loop: geen kwetsbare plugins, dus geen wekelijkse reparaties. Schaalbaarheid: of je nu 10 of 10.000 producten hebt, de structuur blijft identiek en razendsnel.",
      },
      { type: "h2", value: "De rekensom: Afschrijving vs. Groei" },
      {
        type: "calc_box",
        data: {
          title: "Total Cost of Ownership (5 jaar)",
          leftTitle: "Traditionele shop (Magento/Woo)",
          leftItems: [
            "Bouwkosten: €2.500 - €5.000",
            "Maandelijks onderhoud: €150 - €300",
            "Grote redesign (na 3 jr): €2.000 (volledige herbouw)",
            "Totale kosten (5 jr): €13.500 - €25.000",
          ],
          rightTitle: "Sitedesk Edge investering",
          rightItems: [
            "Bouwkosten: €1.000 (Pilot Deal)",
            "Maandelijks onderhoud: €0 (inbegrepen in hosting)",
            "Redesign (na 3 jr): €500 (alleen voorkant)",
            "Totale kosten (5 jr): ~€10.000",
          ],
          summary:
            "Het echte verschil zit in uptime en focus: minder tijd aan fixes, meer tijd aan marketing en verkoop levert de ROI.",
        },
      },
      { type: "h2", value: "Klaar voor de toekomst (en AI)" },
      {
        type: "text",
        value:
          "Een future-proof shop is ook AI-ready. Sitedesk houdt je data schoon en gestructureerd, zodat je later moeiteloos AI-tools koppelt voor aanbevelingen of voorraadvoorspellingen. Trage, vervuilde databases van traditionele shops kunnen dat niet bijbenen.",
      },
      {
        type: "text",
        value:
          "Investeren in Sitedesk is investeren in een fundament dat niet rot. Je bouwt een asset die meer waard wordt naarmate je groeit, in plaats van een systeem dat je langzaam naar beneden trekt.",
      },
      {
        type: "cta_box",
        data: {
          title: "Pilot Deal: bouw voor groei, niet voor schuld",
          body: "€1.000 eenmalig, €150 p/m. Inclusief hosting, onderhoud en doorontwikkeling — de basis voor een future-proof, AI-ready webshop.",
        },
      },
    ],
  },
];

export const postsEn: Post[] = [
  {
    id: "waarom-0ms-geen-luxe-is",
    title: "Why a 0ms load time for your webshop is not a luxury, but a hard requirement",
    excerpt: "Every second of delay costs direct revenue. Discover why edge architecture solves this permanently.",
    date: "2026-02-10",
    tags: ["Performance", "Edge", "CRO"],
    readingTime: "6 min",
    content: [
      {
        type: "text",
        value:
          "You open a webshop on your phone. You see a white screen. One second passes... two seconds... three... you are gone, right? In 2026, online shoppers are more impatient than ever. Speed is no longer a nice-to-have; it is the foundation of profitability.",
      },
      { type: "h2", value: "The hard numbers: every second matters" },
      {
        type: "text",
        value:
          "When we say slow performance costs revenue, we are not guessing. The data from major platforms is clear.",
      },
      { type: "text", value: "The 53% line: 53% of mobile visitors leave after 3 seconds of loading. (Google/SOASTA)" },
      { type: "text", value: "Conversion killer: 1s load time = 3x higher conversion than 5s. (Portent)" },
      { type: "text", value: "Amazon effect: every 100ms delay costs 1% revenue. (Amazon)" },
      {
        type: "text",
        value:
          "Conclusion: if your store runs at around 4 seconds, a large part of your marketing budget disappears before shoppers even see the checkout button.",
      },
      { type: "h2", value: "The central database problem" },
      {
        type: "text",
        value:
          "Traditional stores render from a central server. Every click waits for server response, database queries and HTML generation. The more plugins, the heavier the chain.",
      },
      { type: "text", value: "More apps means more latency. More themes means bigger bundles. Visitors wait, you lose revenue." },
      { type: "h2", value: "The solution: edge architecture (Sitedesk Engine)" },
      {
        type: "text",
        value:
          "We deploy your store on Cloudflare Edge. Not one server, but thousands of nodes close to your visitors. Assets are already near the customer and data is served instantly.",
      },
      { type: "text", value: "Headless speed: frontend and Sheets backend are decoupled for pure performance." },
      { type: "h2", value: "The math: what does 0ms deliver?" },
      {
        type: "calc_box",
        data: {
          leftTitle: "Current situation (4s)",
          leftItems: ["Visitors: 5,000", "Average order value: EUR 60", "Conversion: 1.5%", "Monthly revenue: EUR 4,500"],
          rightTitle: "With Sitedesk Edge (0ms feel)",
          rightItems: ["Visitors: 5,000", "Average order value: EUR 60", "Conversion: 2.2% (conservative)", "Monthly revenue: EUR 6,600"],
          summary: "Result: +EUR 2,100 per month (+EUR 25,200 per year) from technology alone.",
        },
      },
      { type: "h2", value: "Why Sitedesk is the logical investment" },
      {
        type: "text",
        value:
          "A new webshop is often treated as a cost. We see it as removing a major bottleneck. Our Pilot Deal pays back quickly and removes technical stress.",
      },
      {
        type: "text",
        value:
          "No server maintenance. No slow admin dashboards: manage everything in Google Sheets. We are your tech team: we build, maintain and optimize.",
      },
      { type: "h2", value: "Ready for 0ms? Here is how we do it" },
      {
        type: "text",
        value:
          "Speed is the difference between winning and losing. Want to know how much revenue you are leaking today? Book a free speed check or send us a WhatsApp message.",
      },
      {
        type: "cta_box",
        data: {
          title: "Pilot Deal: 0ms or nothing",
          body: "EUR 1,000 one-time, EUR 150 p/m. Includes hosting, unlimited support and continuous development. Typically pays back in month one.",
        },
      },
      { type: "text", value: "Published by Sitedesk Performance Lab — We build the fastest edge e-commerce infrastructure." },
    ],
  },
  {
    id: "waarom-woocommerce-je-groei-belemmert",
    title: "Why WooCommerce limits your growth (and why that is dangerous in the AI era)",
    excerpt:
      "WooCommerce looks free, but in 2026 it is a legacy tax: slow, vulnerable and expensive to maintain. Discover why edge architecture is the logical next step.",
    date: "2026-02-14",
    tags: ["WooCommerce", "Security", "Headless"],
    readingTime: "7 min",
    content: [
      {
        type: "text",
        value:
          "Your webshop probably started with WooCommerce. It is free, familiar and everyone uses it. But what looked like a safe choice is now a growth bottleneck for serious brands. In a market where AI raises the bar for speed and security, a traditional WordPress store is no longer a foundation, but a risk.",
      },
      { type: "h2", value: "The free illusion: the hidden legacy tax" },
      {
        type: "text",
        value:
          "The biggest myth in e-commerce is that WooCommerce is free. The plugin may cost nothing, but the infrastructure required to keep a heavy PHP stack fast is expensive. WooCommerce is monolithic: database, admin and storefront are tightly coupled.",
      },
      {
        type: "text",
        value:
          "As your store grows, database bloat grows too. Every click needs heavy calls to a central server. That creates a slow TTFB, and search rankings and conversion suffer.",
      },
      { type: "h2", value: "The AI security paradox: why WordPress is a target" },
      {
        type: "text",
        value:
          "AI changed the attack landscape. Bots can scan the web 24/7 for known plugin vulnerabilities. Most WooCommerce stores run many third-party plugins, which creates constant weak links.",
      },
      {
        type: "text",
        value:
          "Automated attacks can test thousands of exploit variations in seconds. The central server is the problem: it gives attackers a direct target. Sitedesk solves this by decoupling. Your storefront runs on edge infrastructure, while data stays in a protected backend such as Google Sheets.",
      },
      { type: "h2", value: "The math: WooCommerce vs Sitedesk Edge" },
      {
        type: "calc_box",
        data: {
          leftTitle: "WooCommerce maintenance",
          leftItems: [
            "Updates, security patches and plugin conflicts: 4 hours/month",
            "Developer rate: EUR 90/hour",
            "Total maintenance cost: EUR 360 p/m",
          ],
          rightTitle: "Sitedesk speed system",
          rightItems: ["Fixed fee: EUR 150 p/m", "No maintenance, no update burden", "Edge performance included"],
          summary: "Savings: EUR 2,520 per year in technical overhead, plus extra revenue from higher speed.",
        },
      },
      { type: "h2", value: "The relief of a decoupled backend" },
      {
        type: "text",
        value:
          "The future of e-commerce is headless. We decouple frontend and backend. Why manage stock in a slow dashboard when you can update it in Google Sheets? It is faster, safer and AI-ready.",
      },
      { type: "h2", value: "Conclusion: are you ready to leave 2015 behind?" },
      {
        type: "text",
        value:
          "WooCommerce worked in the previous decade. But when shoppers expect instant loading and bots constantly probe for weaknesses, modern architecture is required. Sitedesk gives you that upgrade.",
      },
      {
        type: "cta_box",
        data: {
          title: "Pilot Deal: move to edge now",
          body: "EUR 1,000 one-time, EUR 150 p/m. We migrate products, set up your Google Sheets backend and launch your store on global edge infrastructure.",
        },
      },
      { type: "text", value: "Published by Sitedesk Performance Lab — We build the fastest edge e-commerce infrastructure." },
    ],
  },
  {
    id: "verborgen-kosten-woocommerce-webshop-stagnatie",
    title: "The hidden cost of WooCommerce: why your webshop growth stalls",
    excerpt:
      "In a market where AI sets the pace for speed and security, traditional WordPress commerce has become a risk. Learn why WooCommerce limits growth.",
    date: "2026-02-11",
    tags: ["E-commerce", "WooCommerce", "AI Security"],
    readingTime: "5 min",
    content: [
      {
        type: "text",
        value:
          "Your webshop likely started with WooCommerce. It is free, familiar and widely used. But in 2026, that old default has become a drag on serious growth. In an AI-driven market, traditional WordPress architecture is no longer a safe baseline.",
      },
      { type: "h2", value: "The free illusion: hidden legacy tax" },
      {
        type: "text",
        value:
          "WooCommerce itself is free, but performance-grade hosting, maintenance and plugin management are not. It is a monolith where storefront, admin and database are tightly coupled.",
      },
      {
        type: "text",
        value:
          "As stores scale, database bloat and plugin complexity increase. Every user interaction triggers heavy server work. Slow TTFB and lower conversion are the predictable result.",
      },
      { type: "h2", value: "The AI security paradox: WordPress as a target" },
      {
        type: "text",
        value:
          "AI bots now scan continuously for plugin vulnerabilities. Typical WooCommerce setups rely on many external plugins, so there is nearly always a weak point.",
      },
      {
        type: "text",
        value:
          "Automated exploitation is faster than ever. On central-server setups, attackers have clear targets. Sitedesk removes this exposure with edge decoupling, keeping storefront and backend separated.",
      },
      {
        type: "calc_box",
        data: {
          title: "The numbers: WooCommerce vs Sitedesk Edge",
          items: [
            "WooCommerce maintenance (updates/fixes): EUR 360 p/m (4h at EUR 90).",
            "Sitedesk speed system: EUR 150 p/m (all-in).",
            "Savings: EUR 2,520 per year + far less technical stress.",
          ],
        },
      },
      { type: "h2", value: "The relief of a decoupled backend" },
      {
        type: "text",
        value:
          "Headless commerce decouples frontend from backend. Instead of fighting a slow dashboard, you manage catalog data in Google Sheets. It is faster, safer and easier to scale.",
      },
      { type: "h2", value: "Conclusion: are you ready to move on?" },
      {
        type: "text",
        value:
          "WooCommerce had its era, but today speed and resilience define growth. If you want a durable architecture, edge-first is the practical move.",
      },
      { type: "cta_box" },
    ],
  },
  {
    id: "future-proof-webshop-langetermijninvestering",
    title: "Your webshop as a long-term investment: future-proof growth without technical debt",
    excerpt:
      "Why a decoupled headless webshop on the edge is the clearest way to avoid technical debt and accelerate growth.",
    date: "2026-02-16",
    tags: ["Headless", "Investment", "Technical Debt"],
    readingTime: "6 min",
    content: [
      {
        type: "text",
        value:
          "Many founders treat a new webshop as a recurring cost that needs a full rebuild every few years. Traditional stacks tie data, design and logic together. When design ages or performance drops, everything has to be rebuilt. Sitedesk breaks that cycle.",
      },
      { type: "h2", value: "Separate data from design" },
      {
        type: "text",
        value:
          "Future-proof commerce starts with decoupling. Keep data (products, pricing, orders) separate from presentation (what customers see).",
      },
      {
        type: "text",
        value:
          "Design changes over time. In a decoupled store you can replace the frontend while keeping backend data intact. Your product structure remains portable and independent from one platform vendor.",
      },
      { type: "h2", value: "Avoid technical debt" },
      {
        type: "text",
        value:
          "Technical debt is the future cost of quick and fragile solutions today. Plugin-heavy stacks add debt every month. Edge-first architecture reduces this burden by design.",
      },
      {
        type: "text",
        value:
          "No maintenance loop: fewer vulnerable extensions, fewer weekly break-fixes. Better scalability: whether you sell 10 or 10,000 products, structure and speed stay consistent.",
      },
      { type: "h2", value: "The math: replacement cost vs growth asset" },
      {
        type: "calc_box",
        data: {
          title: "Total cost of ownership (5 years)",
          leftTitle: "Traditional shop (Magento/Woo)",
          leftItems: [
            "Build cost: EUR 2,500 - EUR 5,000",
            "Monthly maintenance: EUR 150 - EUR 300",
            "Major redesign after 3 years: EUR 2,000 (full rebuild)",
            "Total 5-year cost: EUR 13,500 - EUR 25,000",
          ],
          rightTitle: "Sitedesk Edge investment",
          rightItems: [
            "Build cost: EUR 1,000 (Pilot Deal)",
            "Monthly maintenance: EUR 0 (included in service)",
            "Redesign after 3 years: EUR 500 (frontend only)",
            "Total 5-year cost: around EUR 10,000",
          ],
          summary:
            "The bigger gain is operational focus: less time fixing technology, more time driving marketing and sales.",
        },
      },
      { type: "h2", value: "Ready for the future (and AI)" },
      {
        type: "text",
        value:
          "A future-proof store is also AI-ready. Sitedesk keeps your data clean and structured, so later integrations for recommendations and forecasting are straightforward.",
      },
      {
        type: "text",
        value:
          "Investing in Sitedesk means investing in a foundation that improves as you grow, instead of a system that becomes heavier over time.",
      },
      {
        type: "cta_box",
        data: {
          title: "Pilot Deal: build for growth, not debt",
          body: "EUR 1,000 one-time, EUR 150 p/m. Includes hosting, maintenance and continuous development — the base for a future-proof, AI-ready webshop.",
        },
      },
    ],
  },
];

export const getPostsForLocale = (locale: string): Post[] => (locale === "en" ? postsEn : posts);

export const PAGE_SIZE = 6;

export const paginate = <T,>(items: T[], page: number, perPage: number): T[] => {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
};
