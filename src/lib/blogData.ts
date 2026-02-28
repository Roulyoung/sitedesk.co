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
    id: "hoe-woocommerce-je-op-10-manieren-geld-kost",
    title: "Hoe WooCommerce je op 10 manieren geld kost",
    excerpt:
      "WooCommerce lijkt goedkoop, maar kost vaak structureel geld via trage performance, plugin-conflicten, developer-uren, hogere advertentiekosten en gemiste conversie.",
    date: "2026-02-27",
    tags: ["WooCommerce", "Performance", "CRO", "Technical Debt"],
    readingTime: "10 min",
    content: [
      {
        type: "text",
        value:
          "Veel ondernemers kijken naar WooCommerce en zien vooral lage instapkosten. De plugin zelf is gratis, hosting lijkt betaalbaar en voor elk probleem bestaat wel een plugin. Daardoor voelt WooCommerce in het begin als een rationele keuze. Het probleem is alleen dat de echte rekening bijna nooit op dag 1 komt. Die komt later, in kleine bedragen, losse incidenten, terugkerende fixes en omzet die je ongemerkt niet binnenhaalt.",
      },
      {
        type: "text",
        value:
          "En juist dat maakt WooCommerce gevaarlijk voor groeiende shops. De schade zit niet op een nette factuur onder elkaar. Hij zit verspreid over developers, advertenties, conversie, SEO, beheer, support en frustratie in je team. Hieronder zetten we de tien meest voorkomende manieren uiteen waarop WooCommerce geld uit je bedrijf trekt.",
      },
      { type: "h2", value: "1. Trage laadtijd kost direct conversie" },
      {
        type: "text",
        value:
          "WooCommerce draait op WordPress, PHP, databasequeries, plugin-hooks en vaak een zwaar thema. Elke extra laag maakt je storefront trager. Op desktop kom je daar soms nog mee weg, maar op mobiel niet. En mobiel is voor veel shops inmiddels het grootste deel van het verkeer.",
      },
      {
        type: "text",
        value:
          "Een bezoeker denkt niet: deze site heeft technische schuld. Die denkt: laat maar. Dat betekent dat performance niet alleen een technisch issue is, maar een directe omzetvariabele. Als je productpagina 2 tot 4 seconden te laat reageert, daalt je doorklikratio, je add-to-cart rate en uiteindelijk je checkout-conversie.",
      },
      { type: "h2", value: "2. Plugin-stapeling zorgt voor structurele frictie" },
      {
        type: "text",
        value:
          "Vrijwel geen serieuze WooCommerce-shop draait alleen op WooCommerce. Je hebt plugins voor SEO, caching, reviews, e-mail, betaalmethoden, verzending, bundels, meertaligheid, filtering, upsells en analytics. Elke plugin voegt code toe. Elke plugin voegt risico toe. En elke plugin vergroot de kans dat een update of conflict precies de flow raakt waar je omzet vandaan komt.",
      },
      {
        type: "text",
        value:
          "Veel ondernemers onderschatten dat plugins niet alleen geld kosten als licentie. Ze kosten ook performance, onderhoud, testwerk en debugging. De werkelijke vraag is dus niet hoeveel een plugin kost, maar hoeveel omzet die plugin-combinatie uiteindelijk weglekt.",
      },
      { type: "h2", value: "3. Updates zijn geen routine, maar risicomomenten" },
      {
        type: "text",
        value:
          "Bij een standaard WooCommerce-stack is er altijd iets dat kan breken: een plugin-update, een WordPress-release, een theme-aanpassing of een PHP-versie. Daardoor wordt zelfs regulier onderhoud een spanningsmoment. Veel shops stellen updates uit uit angst voor schade. Dat lijkt veilig, maar creëert juist nieuwe problemen: security-risico's, compatibiliteitsproblemen en oplopende technische schuld.",
      },
      {
        type: "text",
        value:
          "Het financiële effect daarvan zie je op twee manieren terug. Ofwel je betaalt preventief steeds voor controle en onderhoud, ofwel je betaalt achteraf wanneer iets crasht op een slecht moment. Beide routes kosten geld.",
      },
      { type: "h2", value: "4. Developer-uren stapelen zich veel harder op dan je denkt" },
      {
        type: "text",
        value:
          "Een WooCommerce-shop heeft zelden een duidelijk eindpunt. Er is altijd weer iets dat net niet goed werkt: een checkout-aanpassing, een pluginconflict, een mobiele bug, een trackingissue of een vertaling die niet netjes meekomt. Daardoor koop je niet een systeem, maar een doorlopende stroom kleine developer-taken.",
      },
      {
        type: "text",
        value:
          "Dat lijkt onschuldig als het gaat om een paar uur hier en daar. Maar tel twaalf maanden op en je ziet pas hoeveel budget weglekt naar onderhoud in plaats van verbetering. Het probleem is niet alleen het tarief per uur, maar vooral dat je telkens betaalt om het bestaande systeem stabiel te houden in plaats van iets te bouwen dat structureel beter verkoopt.",
      },
      { type: "h2", value: "5. Hoger advertentiebudget, lagere opbrengst" },
      {
        type: "text",
        value:
          "Trage sites renderen niet alleen slechter voor gebruikers, maar ook slechter voor advertentieprestaties. Als landingspagina's traag of instabiel zijn, dalen kwaliteitsscores en stijgt vaak je cost per click. Je koopt dus verkeer in tegen slechtere voorwaarden, om het vervolgens naar een trager systeem te sturen dat minder goed converteert.",
      },
      {
        type: "text",
        value:
          "Dat is een dubbele belasting op je marketingbudget. Eerst betaal je meer voor de klik. Daarna haal je minder omzet uit die klik. Daardoor lijkt het alsof je advertenties het probleem zijn, terwijl de echte lekkage in de techniek zit.",
      },
      { type: "h2", value: "6. SEO verzwakt door techniek, niet alleen door content" },
      {
        type: "text",
        value:
          "Veel shops investeren keurig in content, categoriepagina's en productteksten, maar vergeten dat Google ook gewoon kijkt naar snelheid, stabiliteit en gebruikerservaring. Een trage WooCommerce-shop kan prima content hebben en toch posities verliezen aan een technisch sterkere concurrent.",
      },
      {
        type: "text",
        value:
          "SEO-verlies is extra verraderlijk omdat het langzaam gaat. Je zakt niet altijd in een dag van plek 2 naar plek 12. Vaker verlies je maand na maand een klein beetje zichtbaarheid. En juist die langzame erosie kost op jaarbasis enorm veel geld.",
      },
      { type: "h2", value: "7. Security is een kostenpost, ook als er niets gebeurt" },
      {
        type: "text",
        value:
          "WooCommerce op WordPress is een populair doelwit. Niet omdat jouw shop persoonlijk interessant is, maar omdat de stack voorspelbaar is. Bots zoeken continu naar oude pluginversies, bekende kwetsbaarheden en slecht onderhouden installaties. Dat betekent dat security nooit echt op nul staat. Je betaalt ervoor in monitoring, patches, onderhoud en voorzichtigheid.",
      },
      {
        type: "text",
        value:
          "En als er wel iets misgaat, zijn de kosten ineens veel groter: downtime, reputatieschade, verlies van klantvertrouwen, opgeslokte developer-tijd en soms zelfs advertentiebudget dat blijft doorlopen terwijl de site slecht of niet werkt.",
      },
      { type: "h2", value: "8. Het team werkt trager door een traag systeem" },
      {
        type: "text",
        value:
          "WooCommerce kost niet alleen aan de voorkant omzet, maar ook aan de achterkant tijd. Trage adminschermen, onlogische plugin-instellingen, dubbele invoer, workarounds en handmatig correctiewerk maken dat je team minder efficiënt werkt. Dat zie je niet als een losse factuur terug, maar wel in operationele kosten.",
      },
      {
        type: "text",
        value:
          "Als marketing, support of operations elke week tijd verliest aan een systeem dat net niet lekker loopt, loopt die verspilling structureel op. Dat is verborgen payroll-lekage.",
      },
      { type: "h2", value: "9. Elke nieuwe groeiwens wordt duurder dan nodig" },
      {
        type: "text",
        value:
          "In theorie is WooCommerce flexibel. In de praktijk betekent flexibiliteit vaak: eerst zoeken welke plugin erbij past, dan testen of die plugin samenwerkt met de rest, dan aanpassen, dan opnieuw testen. Hoe meer je shop groeit, hoe duurder elke volgende stap wordt. Niet omdat de businesswens zo complex is, maar omdat het bestaande fundament steeds rommeliger wordt.",
      },
      {
        type: "text",
        value:
          "Nieuwe landingspagina's, B2B-logica, specifieke staffelkortingen, meertaligheid of custom productflows horen commerciële verbeteringen te zijn. Op WooCommerce veranderen ze vaak in technische trajecten.",
      },
      { type: "h2", value: "10. Het grootste verlies zit in uitgestelde beslissingen" },
      {
        type: "text",
        value:
          "Misschien wel de duurste post van allemaal: ondernemers blijven te lang op WooCommerce hangen omdat het nog net werkt. Daardoor worden betere beslissingen uitgesteld. Een snellere storefront, een schoner datamodel, minder afhankelijkheid van plugins, hogere mobiele conversie en minder supportlast komen later dan nodig. Elke maand uitstel kost dan opnieuw geld.",
      },
      {
        type: "text",
        value:
          "Dat is precies waarom WooCommerce zo'n verraderlijk platform is. Het is zelden een acute ramp. Het is vaker een langzaam lek dat elke maand iets meer marge wegneemt.",
      },
      { type: "h2", value: "De rekensom: hoe groot kan dat lek worden?" },
      {
        type: "calc_box",
        data: {
          leftTitle: "Voorbeeldshop op WooCommerce",
          leftItems: [
            "Maandomzet: EUR 50.000",
            "Developer-onderhoud: EUR 500 p/m",
            "Extra plugin- en toolkosten: EUR 250 p/m",
            "Conversieverlies door traagheid: 5% tot 12%",
          ],
          rightTitle: "Wat dat financieel betekent",
          rightItems: [
            "Directe tech-kosten: EUR 750 p/m",
            "Gemiste omzet bij 5% verlies: EUR 2.500 p/m",
            "Gemiste omzet bij 12% verlies: EUR 6.000 p/m",
            "Totale schade: EUR 3.250 tot EUR 6.750 p/m",
          ],
          summary:
            "Zelfs in een conservatief scenario praat je dan over EUR 39.000 tot EUR 81.000 per jaar aan directe kosten en gederfde omzet.",
        },
      },
      { type: "h2", value: "Waarom dit ondernemers zo laat opvalt" },
      {
        type: "text",
        value:
          "Omdat WooCommerce zelden in een keer faalt. Het probleem is dat de schade verspreid zit over meerdere budgetten: development, marketing, support, operations en omzet. Daardoor lijkt elk onderdeel afzonderlijk nog wel te overzien, terwijl het totaal allang niet meer rationeel is.",
      },
      {
        type: "text",
        value:
          "Wie alleen naar hosting of plugin-licenties kijkt, mist het echte bedrag. De echte vraag is hoeveel extra marge je had kunnen overhouden als je shop niet voortdurend werd afgeremd door het systeem eronder.",
      },
      { type: "h2", value: "Conclusie: WooCommerce is vaak niet te goedkoop, maar te duur" },
      {
        type: "text",
        value:
          "WooCommerce wint vaak de eerste beslissing omdat de instap goedkoop lijkt. Maar voor serieuze shops is de relevante vraag niet wat het kost om te beginnen. De relevante vraag is wat het kost om goed te blijven draaien, snel te blijven laden en zonder stress door te groeien.",
      },
      {
        type: "text",
        value:
          "En precies daar verliest WooCommerce het vaak. Niet in de aanschaf, maar in de maanden en jaren daarna. Daarom is overstappen voor veel ondernemers geen luxeproject, maar een marge-beslissing.",
      },
      {
        type: "cta_box",
        data: {
          title: "Benieuwd hoeveel WooCommerce jou nu kost?",
          body: "Laat ons je shop technisch en commercieel doorlichten. Geen vaag advies, maar een concrete inschatting van onderhoud, performance-lek en gemiste omzet.",
        },
      },
      {
        type: "text",
        value:
          "Gepubliceerd door Sitedesk Performance Lab - Wij bouwen snelle storefronts voor ondernemers die klaar zijn met plugin-stress, trage pagina's en verborgen technische kosten.",
      },
    ],
  },
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
  {
    id: "onzichtbare-lek-omzetverlies-techniek-webshop",
    title: "Het Onzichtbare Lek: Hoeveel Omzet Verliest Jouw Webshop aan Techniek?",
    excerpt:
      "Je webshop kan goed voelen, maar klantdata laat vaak iets anders zien. Ontdek hoe technische vertraging ongemerkt EUR 100.000 tot EUR 250.000 per jaar kan kosten.",
    date: "2026-02-24",
    tags: ["Performance", "CRO", "SEO", "Mobile"],
    readingTime: "8 min",
    content: [
      {
        type: "text",
        value:
          "Veel succesvolle webshopeigenaren kijken naar hun dashboard en zien groene cijfers. Een miljoen omzet, stabiele bezoekers en een platform dat voor hun gevoel gewoon werkt. Maar onder de motorkap van veel shops zit een onzichtbaar lek.",
      },
      {
        type: "text",
        value:
          "Recent analyseerden wij een reele casus van een Nederlandse webshop. De eigenaar ervaarde de site als snel, maar de data van Google liet een ander beeld zien.",
      },
      { type: "h2", value: "De confrontatie: jouw ervaring vs. de data van de klant" },
      {
        type: "text",
        value:
          "Wanneer je als eigenaar je shop test, doe je dat vaak op een modern toestel via snelle wifi of glasvezel. Google Lighthouse simuleert juist de gemiddelde bezoeker: in de trein, op matig 4G, of met een ouder toestel.",
      },
      {
        type: "text",
        value:
          "In onze casus zagen we een Largest Contentful Paint (LCP) van 8,7 seconden. Terwijl het voor de eigenaar vloeiend voelde, keek een groot deel van de mobiele bezoekers in de praktijk onnodig lang naar een wit scherm.",
      },
      { type: "h2", value: "Realistische berekening: wat kost dit onderaan de streep?" },
      {
        type: "text",
        value:
          "Neem een webshop met EUR 1.000.000 jaaromzet. Niet elke business is mobile-first; bij technische B2B of niche-onderdelen ligt mobiel verkeer vaak lager. Juist daarom rekenen we met een conservatieve en realistische bandbreedte.",
      },
      {
        type: "calc_box",
        data: {
          title: "Jaarlijks omzetlek bij trage mobile score (49/100)",
          leftTitle: "Scenario: Conservatief (lage impact)",
          leftItems: [
            "Mobiel conversieverlies: -5%",
            "Hogere advertentiekosten: +2%",
            "SEO ranking verlies: -3%",
            "Totaal jaarlijks verlies: EUR 100.000",
          ],
          rightTitle: "Scenario: Realistisch (gemiddelde impact)",
          rightItems: [
            "Mobiel conversieverlies: -12%",
            "Hogere advertentiekosten: +5%",
            "SEO ranking verlies: -8%",
            "Totaal jaarlijks verlies: EUR 250.000",
          ],
          summary:
            "Zelfs in het voorzichtige scenario laat een webshop met EUR 1 miljoen omzet al snel EUR 100.000 per jaar liggen.",
        },
      },
      {
        type: "text",
        value:
          "Dat is geld dat je al hebt uitgegeven aan inkoop, personeel en marketing, maar dat niet wordt verzilverd door een technische drempel in de user journey.",
      },
      { type: "h2", value: "Waarom standaard platformen vaak vastlopen" },
      {
        type: "text",
        value:
          "Platformen zoals Lightspeed of Shopify zijn sterk om mee te starten. Maar naarmate je groeit, stapelen scripts, trackers en apps zich op. De zichtbare licentiekosten zijn laag, de verborgen performance-kosten zijn vaak veel hoger.",
      },
      {
        type: "text",
        value:
          "Je shop is als een auto met steeds meer extra koffers op het dak: hij blijft rijden, maar verbruikt meer brandstof en accelereert trager wanneer het erop aankomt.",
      },
      { type: "h2", value: "Is een custom webshop de oplossing?" },
      {
        type: "text",
        value:
          "Een custom webshop is geen experiment, maar een precisie-instrument. In plaats van bouwen om een zwaar template heen, schrijf je alleen code die nodig is voor snelheid en conversie.",
      },
      {
        type: "text",
        value:
          "Geen ballast: alleen noodzakelijke code. Toekomstbestendig: 90+ mobile scores als standaard. Lagere CPA: snellere sites krijgen vaak betere kwaliteitssignalen in ads.",
      },
      { type: "h2", value: "Conclusie: durf jij in de spiegel te kijken?" },
      {
        type: "text",
        value:
          "Het gaat niet om of je shop werkt. Het gaat erom of je shop optimaal rendeert. Bij EUR 1 miljoen omzet is een verbetering van 5% al genoeg om een custom build in ongeveer een jaar terug te verdienen. Alles daarna is extra marge.",
      },
      {
        type: "cta_box",
        data: {
          title: "Benieuwd naar de field data van jouw shop?",
          body: "Laat ons een eerlijke scan maken van hoe je klanten je site echt ervaren. Geen verkooppraat, maar harde data over waar je omzetlek zit.",
        },
      },
    ],
  },
];

export const postsEn: Post[] = [
  {
    id: "hoe-woocommerce-je-op-10-manieren-geld-kost",
    title: "10 ways WooCommerce is quietly costing you money",
    excerpt:
      "WooCommerce looks cheap, but often becomes expensive through slow performance, plugin conflicts, developer hours, higher ad costs and lost conversion.",
    date: "2026-02-27",
    tags: ["WooCommerce", "Performance", "CRO", "Technical Debt"],
    readingTime: "10 min",
    content: [
      {
        type: "text",
        value:
          "Many founders look at WooCommerce and mainly see low entry cost. The plugin is free, hosting feels affordable and there is a plugin for nearly every problem. That makes WooCommerce feel like a rational starting point. The issue is that the real bill rarely arrives on day one. It shows up later, in small incidents, recurring fixes and revenue that quietly never gets captured.",
      },
      {
        type: "text",
        value:
          "That is exactly what makes WooCommerce dangerous for growing stores. The damage does not appear as one clean invoice. It is spread across developers, ads, conversion, SEO, support, internal time and decision delay. Below are ten common ways WooCommerce drains money out of a business.",
      },
      { type: "h2", value: "1. Slow load time cuts conversion immediately" },
      {
        type: "text",
        value:
          "WooCommerce sits on top of WordPress, PHP, database queries, plugin hooks and often a heavy theme. Every layer adds friction. On desktop you can sometimes get away with that. On mobile you usually cannot.",
      },
      {
        type: "text",
        value:
          "Visitors do not think in technical terms. They simply leave. That means performance is not just a technical issue; it is a direct revenue variable. If product pages are two to four seconds too slow, click-through, add-to-cart rate and checkout conversion all drop.",
      },
      { type: "h2", value: "2. Plugin stacking creates constant friction" },
      {
        type: "text",
        value:
          "Very few serious WooCommerce stores run on WooCommerce alone. There are plugins for SEO, caching, reviews, email, payments, shipping, bundles, translations, filtering, upsells and analytics. Every plugin adds code. Every plugin adds risk. And every plugin increases the chance that an update or conflict will hit the exact revenue flow your store depends on.",
      },
      {
        type: "text",
        value:
          "Most founders underestimate that plugins do not only cost money as licenses. They also cost performance, maintenance, testing and debugging. The real question is not what a plugin costs, but what the plugin stack leaks.",
      },
      { type: "h2", value: "3. Updates are not routine, but recurring risk moments" },
      {
        type: "text",
        value:
          "In a standard WooCommerce stack, something can always break: a plugin update, a WordPress release, a theme change or a PHP version shift. That turns routine maintenance into a point of tension. Many stores delay updates to avoid damage. That feels safe, but it creates fresh problems: security risk, compatibility drift and technical debt.",
      },
      {
        type: "text",
        value:
          "Financially, that shows up in two ways. Either you keep paying preventive maintenance, or you pay the bigger bill after something breaks at the wrong time. Both cost money.",
      },
      { type: "h2", value: "4. Developer hours add up much faster than expected" },
      {
        type: "text",
        value:
          "A WooCommerce store rarely reaches a stable end state. There is always something slightly off: checkout adjustments, plugin conflicts, mobile bugs, tracking issues or translation gaps. That means you are not buying a finished system. You are buying a flow of recurring technical tasks.",
      },
      {
        type: "text",
        value:
          "It may look harmless as a few hours here and there. Across twelve months, it becomes a serious budget line. The core problem is not just the hourly rate, but the fact that you keep paying to stabilize the existing stack instead of building something that sells better structurally.",
      },
      { type: "h2", value: "5. Higher ad spend, lower return" },
      {
        type: "text",
        value:
          "Slow sites do not just hurt users, they also hurt campaign efficiency. Weak landing page performance often lowers quality signals and pushes cost per click up. So you buy traffic at worse conditions, then send that traffic to a slower store that converts less well.",
      },
      {
        type: "text",
        value:
          "That is a double tax on your marketing budget. First, you pay more for the click. Then, you get less revenue from the click. It makes ads look like the problem while the real leak sits in the stack underneath.",
      },
      { type: "h2", value: "6. SEO weakens because of technical drag, not just content" },
      {
        type: "text",
        value:
          "Many stores invest in content, category pages and product copy while forgetting that Google also evaluates speed, stability and user experience. A slow WooCommerce setup can have decent content and still lose positions to a technically stronger competitor.",
      },
      {
        type: "text",
        value:
          "SEO decline is especially deceptive because it is gradual. You do not always fall from position 2 to position 12 overnight. More often, visibility erodes a little every month. On a yearly basis, that gets expensive.",
      },
      { type: "h2", value: "7. Security is a cost center even when nothing happens" },
      {
        type: "text",
        value:
          "WooCommerce on WordPress is a common target. Not because your store is uniquely interesting, but because the stack is predictable. Bots constantly scan for outdated plugins, known vulnerabilities and poorly maintained installs. That means security is never really at zero cost. You pay in monitoring, patching, maintenance and caution.",
      },
      {
        type: "text",
        value:
          "And if something does go wrong, the cost jumps: downtime, trust damage, wasted developer time and ad spend that may keep running while the site is unstable or unavailable.",
      },
      { type: "h2", value: "8. Your team works slower because the system works slower" },
      {
        type: "text",
        value:
          "WooCommerce does not only cost money on the customer side. It also costs time internally. Slow admin screens, awkward plugin settings, duplicate work, workarounds and manual corrections make your team less efficient. You do not always see that as a line item, but it absolutely shows up in operating cost.",
      },
      {
        type: "text",
        value:
          "If marketing, support or operations lose time every week because the system never feels clean, that becomes structural payroll leakage.",
      },
      { type: "h2", value: "9. Every growth request becomes more expensive than it should be" },
      {
        type: "text",
        value:
          "In theory WooCommerce is flexible. In practice, flexibility often means searching for another plugin, testing if it plays nicely with the rest, adjusting things and testing again. The more the store grows, the more expensive every next improvement becomes. Not because the business request is so complex, but because the foundation underneath keeps getting messier.",
      },
      {
        type: "text",
        value:
          "New landing pages, B2B logic, volume pricing, multilingual flows or custom product journeys should be commercial improvements. In WooCommerce they often become technical projects.",
      },
      { type: "h2", value: "10. The biggest loss is the decision you postpone" },
      {
        type: "text",
        value:
          "Maybe the most expensive line of all: businesses stay on WooCommerce too long because it still kind of works. That delays better decisions. A faster storefront, cleaner data model, lower plugin dependency, higher mobile conversion and less support overhead all arrive later than they should. Every month of delay costs more money.",
      },
      {
        type: "text",
        value:
          "That is what makes WooCommerce so deceptive. It is rarely one acute disaster. It is usually a slow leak that removes a little more margin every month.",
      },
      { type: "h2", value: "The math: how large can that leak become?" },
      {
        type: "calc_box",
        data: {
          leftTitle: "Example WooCommerce store",
          leftItems: [
            "Monthly revenue: EUR 50,000",
            "Developer maintenance: EUR 500 p/m",
            "Extra plugin and tool costs: EUR 250 p/m",
            "Conversion loss from slowness: 5% to 12%",
          ],
          rightTitle: "What that means financially",
          rightItems: [
            "Direct tech cost: EUR 750 p/m",
            "Lost revenue at 5%: EUR 2,500 p/m",
            "Lost revenue at 12%: EUR 6,000 p/m",
            "Total damage: EUR 3,250 to EUR 6,750 p/m",
          ],
          summary:
            "Even in a conservative scenario, that means roughly EUR 39,000 to EUR 81,000 per year in direct cost and missed revenue.",
        },
      },
      { type: "h2", value: "Why founders notice this too late" },
      {
        type: "text",
        value:
          "Because WooCommerce rarely fails all at once. The damage is spread across multiple budgets: development, marketing, support, operations and revenue. Each line can still look manageable by itself while the total has already become irrational.",
      },
      {
        type: "text",
        value:
          "Anyone only looking at hosting or plugin licenses misses the real number. The real question is how much extra margin you would keep if the store were not being held back by the system underneath.",
      },
      { type: "h2", value: "Conclusion: WooCommerce is often not cheap, but expensive" },
      {
        type: "text",
        value:
          "WooCommerce often wins the first decision because the entry looks cheap. For serious stores, that is the wrong metric. The relevant question is what it costs to keep performing, stay fast and keep growing without constant stress.",
      },
      {
        type: "text",
        value:
          "That is where WooCommerce often loses. Not in setup cost, but in the months and years after launch. For many founders, switching is not a luxury project. It is a margin decision.",
      },
      {
        type: "cta_box",
        data: {
          title: "Want to know what WooCommerce is costing you right now?",
          body: "Let us audit your store from both a technical and commercial angle. No vague advice, just a concrete estimate of maintenance burden, performance leakage and missed revenue.",
        },
      },
      {
        type: "text",
        value:
          "Published by Sitedesk Performance Lab - We build fast storefronts for founders who are done with plugin stress, slow pages and hidden technical cost.",
      },
    ],
  },
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
  {
    id: "onzichtbare-lek-omzetverlies-techniek-webshop",
    title: "The Invisible Leak: How Much Revenue Is Your Webshop Losing to Technology?",
    excerpt:
      "Your storefront can feel fast while customer data says otherwise. Learn how technical drag can quietly cost EUR 100,000 to EUR 250,000 per year.",
    date: "2026-02-24",
    tags: ["Performance", "CRO", "SEO", "Mobile"],
    readingTime: "8 min",
    content: [
      {
        type: "text",
        value:
          "Many successful webshop owners look at their dashboard and see healthy numbers. Revenue is strong, traffic is stable, and the platform appears to work fine. But under the hood, many stores have an invisible leak.",
      },
      {
        type: "text",
        value:
          "We recently analyzed a real Dutch webshop case. The owner experienced the site as fast, but Google data told a different story.",
      },
      { type: "h2", value: "Your experience vs. customer reality" },
      {
        type: "text",
        value:
          "As an owner, you usually test on a modern phone and fast office internet. Lighthouse simulates average customer conditions: weaker mobile signal, transit use, and older devices.",
      },
      {
        type: "text",
        value:
          "In this case, Largest Contentful Paint (LCP) was 8.7 seconds. While the owner perceived smooth performance, a significant share of mobile visitors was waiting far too long for meaningful content.",
      },
      { type: "h2", value: "Realistic math: what does this cost?" },
      {
        type: "text",
        value:
          "Assume a webshop with EUR 1,000,000 annual revenue. Not every business is mobile-first, so we model both conservative and realistic impact ranges.",
      },
      {
        type: "calc_box",
        data: {
          title: "Annual revenue leak at weak mobile performance (49/100)",
          leftTitle: "Conservative scenario",
          leftItems: [
            "Mobile conversion loss: -5%",
            "Higher ad costs: +2%",
            "SEO ranking drag: -3%",
            "Total annual loss: EUR 100,000",
          ],
          rightTitle: "Realistic scenario",
          rightItems: [
            "Mobile conversion loss: -12%",
            "Higher ad costs: +5%",
            "SEO ranking drag: -8%",
            "Total annual loss: EUR 250,000",
          ],
          summary:
            "Even in the conservative case, a EUR 1M webshop can leak around EUR 100,000 per year due to technical friction.",
        },
      },
      {
        type: "text",
        value:
          "That is revenue already funded by inventory, payroll and marketing, but not captured because the buying journey is slowed down by technical overhead.",
      },
      { type: "h2", value: "Why standard platforms often plateau" },
      {
        type: "text",
        value:
          "Platforms such as Lightspeed and Shopify are excellent to start with. But as stores grow, scripts, trackers and app layers accumulate. Visible license costs stay low while hidden performance costs rise.",
      },
      {
        type: "text",
        value:
          "Think of it as a car carrying more and more luggage: it still runs, but acceleration gets worse and efficiency drops.",
      },
      { type: "h2", value: "Is custom architecture the answer?" },
      {
        type: "text",
        value:
          "A custom webshop is not an experiment. It is a precision system. Instead of extending heavy generic templates, you run only the code needed for speed and conversion.",
      },
      {
        type: "text",
        value:
          "No ballast, better maintainability, and mobile 90+ scores as a target baseline. Faster experience also supports stronger ad efficiency and lower CPA.",
      },
      { type: "h2", value: "Conclusion: are you ready to look at the real data?" },
      {
        type: "text",
        value:
          "The key question is not whether your shop works, but whether it performs at its revenue potential. At EUR 1M turnover, a 5% lift can already justify a full custom build within one year.",
      },
      {
        type: "cta_box",
        data: {
          title: "Want the real field data for your webshop?",
          body: "We run an honest performance scan based on customer reality. No sales fluff, only hard data on where revenue is leaking.",
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
