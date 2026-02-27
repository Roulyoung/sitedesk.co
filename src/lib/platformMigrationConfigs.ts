import type { SupportedLocale } from "@/lib/i18n";

type LocalizedText = Partial<Record<SupportedLocale, string>>;
type LocalizedTextList = Partial<Record<SupportedLocale, string[]>>;

export type PlatformComparisonRow = {
  problem: LocalizedText;
  nightmare: LocalizedText;
  solution: LocalizedText;
};

type TimelineStep = {
  day: LocalizedText;
  text: LocalizedText;
};

type ExtraMileCard = {
  title: LocalizedText;
  copy: LocalizedText;
};

export type PlatformMigrationConfig = {
  key: string;
  route: string;
  title: LocalizedText;
  description: LocalizedText;
  navLabel: LocalizedText;
  heroEyebrow: LocalizedText;
  heroTitle: LocalizedText;
  heroCopy: LocalizedText;
  heroLeftLabel: LocalizedText;
  heroLeftItems: LocalizedTextList;
  heroRightLabel: LocalizedText;
  matrixTitle: LocalizedText;
  matrixRows: PlatformComparisonRow[];
  checkTitle: LocalizedText;
  checkCopy: LocalizedText;
  checkDeliverables: LocalizedTextList;
  defaultPlatform: string;
  zeroEffortTitle: LocalizedText;
  zeroEffortCopy: LocalizedText;
  threeDTitle: LocalizedText;
  threeDCopy: LocalizedText;
  threeDFootnote: LocalizedText;
  rebuildTitle: LocalizedText;
  rebuildCopy: LocalizedText;
  rebuildExtra: LocalizedText;
  riskTitle: LocalizedText;
  riskCopy: LocalizedText;
  timelineTitle: LocalizedText;
  timelineSteps: TimelineStep[];
  extraMileTitle: LocalizedText;
  extraMileCards: ExtraMileCard[];
  seoTitle: LocalizedText;
  seoCopy: LocalizedText;
  seoExtra: LocalizedText;
  stickyPrompt: LocalizedText;
};

const t = (nl: string, en: string): LocalizedText => ({ nl, en });
const list = (nl: string[], en: string[]): LocalizedTextList => ({ nl, en });

export const getLocalizedMigrationText = (
  value: LocalizedText | LocalizedTextList,
  locale: SupportedLocale,
) => value[locale] ?? value.en ?? value.nl ?? (Array.isArray(value.en) ? [] : "");

const sharedTimeline: TimelineStep[] = [
  {
    day: t("Dag 1", "Day 1"),
    text: t(
      "Kennismaking, data-kopie en inventarisatie van alle koppelingen.",
      "Kickoff, data copy and a full audit of your integrations.",
    ),
  },
  {
    day: t("Dag 3", "Day 3"),
    text: t(
      "Custom rebuild van checkout, verzendlogica en kritieke functies.",
      "Custom rebuild of checkout, shipping logic and the critical business rules.",
    ),
  },
  {
    day: t("Dag 5", "Day 5"),
    text: t(
      "Testfase in een preview-omgeving met redirect- en SEO-check.",
      "Testing in a preview environment including redirects and SEO validation.",
    ),
  },
  {
    day: t("Dag 7", "Day 7"),
    text: t(
      "Livegang zonder downtime, met een shop die direct sneller voelt.",
      "Go live with zero downtime and a storefront that immediately feels faster.",
    ),
  },
];

const sharedExtraMileCards: ExtraMileCard[] = [
  {
    title: t("Future Proof", "Future Proof"),
    copy: t(
      "Je shop draait niet meer op een stapel plugins en verouderde code, maar op een platform dat jaren mee kan.",
      "Your shop no longer depends on aging plugins and patchwork code, but on a platform that can scale for years.",
    ),
  },
  {
    title: t("Breekt Niet", "Does Not Break"),
    copy: t(
      "Geen pluginconflicten, geen update-paniek en geen onverwachte checkout-fouten na een release.",
      "No plugin conflicts, no update anxiety and no surprise checkout bugs after a release.",
    ),
  },
  {
    title: t("Directe Lijn", "Direct Line"),
    copy: t(
      "Geen ticketsysteem of doorschuiven tussen partijen. Je spreekt direct met het team dat het bouwt.",
      "No ticket maze and no vendors blaming each other. You talk directly to the team building the system.",
    ),
  },
];

export const migrationPlatforms: PlatformMigrationConfig[] = [
  {
    key: "woocommerce",
    route: "/migratie",
    title: t(
      "WooCommerce Migratie in 1 Week | Sitedesk",
      "WooCommerce Migration in 1 Week | Sitedesk",
    ),
    description: t(
      "Van WooCommerce naar Sitedesk in 1 week. Minder plugin-chaos, lagere developer-kosten en een shop die eindelijk snel blijft.",
      "Move from WooCommerce to Sitedesk in 1 week. Less plugin chaos, lower developer costs and a storefront that finally stays fast.",
    ),
    navLabel: t("WooCommerce", "WooCommerce"),
    heroEyebrow: t("WooCommerce Migratie", "WooCommerce Migration"),
    heroTitle: t(
      "Van WooCommerce-chaos naar een shop die weer geld oplevert.",
      "Move from WooCommerce chaos to a storefront that makes money again.",
    ),
    heroCopy: t(
      "Wij bouwen je WooCommerce-functies 1-op-1 na, verhuizen je data en halen je weg uit plugin-stress, trage laadtijden en terugkerende developer-kosten.",
      "We rebuild your WooCommerce functionality one-for-one, migrate your data and pull you out of plugin stress, slow loading times and recurring developer costs.",
    ),
    heroLeftLabel: t("WooCommerce", "WooCommerce"),
    heroLeftItems: list(
      ["Plugin SEO", "Plugin Checkout", "Plugin Cache", "Plugin Security", "Plugin Updates"],
      ["SEO Plugin", "Checkout Plugin", "Cache Plugin", "Security Plugin", "Update Conflicts"],
    ),
    heroRightLabel: t("Sitedesk", "Sitedesk"),
    matrixTitle: t(
      "Waarom WooCommerce je steeds meer kost naarmate je groeit",
      "Why WooCommerce gets more expensive as your store grows",
    ),
    matrixRows: [
      {
        problem: t("Updates", "Updates"),
        nightmare: t(
          "Elke update kan je checkout, theme of plugin-stack breken.",
          "Every update can break your checkout, theme or plugin stack.",
        ),
        solution: t(
          "Geen plugin-updates meer. Je shop draait op vaste, gecontroleerde code.",
          "No more plugin updates. Your storefront runs on stable, controlled code.",
        ),
      },
      {
        problem: t("Snelheid", "Speed"),
        nightmare: t(
          "Meer plugins betekent meer scripts, meer queries en een tragere shop.",
          "More plugins means more scripts, more queries and a slower store.",
        ),
        solution: t(
          "Schone code, edge delivery en Pagespeed als standaard in plaats van een project op zich.",
          "Clean code, edge delivery and Pagespeed as a default instead of a separate project.",
        ),
      },
      {
        problem: t("Developer-kosten", "Developer Costs"),
        nightmare: t(
          "Je betaalt steeds opnieuw voor fixes, compatibiliteit en kleine wijzigingen.",
          "You keep paying for fixes, compatibility issues and small changes.",
        ),
        solution: t(
          "Doorontwikkeling zit in de samenwerking. Geen terugkerende plugin-brandjes.",
          "Further development is built into the collaboration. No recurring plugin fires.",
        ),
      },
      {
        problem: t("Support", "Support"),
        nightmare: t(
          "Hosting, theme, plugins en developers wijzen naar elkaar als iets stuk gaat.",
          "Hosting, themes, plugins and developers all blame each other when something breaks.",
        ),
        solution: t(
          "Een team, een lijn, directe oplossing.",
          "One team, one line of communication, one direct fix.",
        ),
      },
    ],
    checkTitle: t(
      "Laat ons je WooCommerce-shop, plugins en risico's in kaart brengen",
      "Let us map your WooCommerce store, plugins and migration risks",
    ),
    checkCopy: t(
      "Stuur je URL en de belangrijkste context door. Dan beoordelen wij hoe complex je WooCommerce-migratie is, welke plugins maatwerk nodig hebben en waar je nu geld laat liggen.",
      "Send us your URL and the key context. We assess how complex your WooCommerce migration is, which plugins require custom work and where your current stack is leaking revenue.",
    ),
    checkDeliverables: list(
      [
        "Een snelle inschatting van de migratiecomplexiteit",
        "Welke plugins of koppelingen maatwerk nodig hebben",
        "Waar je WooCommerce-stack nu snelheid en conversie blokkeert",
        "Of 7 dagen realistisch is voor jouw shop",
      ],
      [
        "A quick estimate of migration complexity",
        "Which plugins or integrations require custom rebuilds",
        "Where your WooCommerce stack is blocking speed and conversion",
        "Whether 7 days is realistic for your store",
      ],
    ),
    defaultPlatform: "WooCommerce",
    zeroEffortTitle: t(
      "Jij verkoopt, wij trekken je uit het plugin-moeras.",
      "You sell, we pull you out of the plugin swamp.",
    ),
    zeroEffortCopy: t(
      "Je hoeft geen exports te maken, geen pluginlijst uit te pluizen en geen projectmanager te spelen. Wij inventariseren je stack, bouwen de functies na en zetten pas live als jij de preview hebt goedgekeurd.",
      "You do not need to export products, audit plugins or act as project manager. We map your stack, rebuild the functions and only go live once you approve the preview.",
    ),
    threeDTitle: t(
      "WooCommerce wordt traag van maatwerk. Hier begint het pas.",
      "WooCommerce slows down when custom features get serious. Here that is where things start.",
    ),
    threeDCopy: t(
      "Zware productervaringen zoals 3D, complexe productlogica of interactieve configurators zijn op WooCommerce vaak precies wat de boel vertraagt. Bij Sitedesk bouwen we dat soort features zonder dat je hele frontend dichtslibt.",
      "Heavy product experiences such as 3D, complex product logic or interactive configurators are exactly what usually slows WooCommerce down. At Sitedesk we build those features without choking the frontend.",
    ),
    threeDFootnote: t(
      "Dit is het soort maatwerk dat op WooCommerce meestal een performanceprobleem wordt. Hier is het de standaard.",
      "This is the kind of custom feature that usually becomes a performance problem on WooCommerce. Here it is part of the baseline.",
    ),
    rebuildTitle: t(
      "Wij bouwen de plugins na die je echt gebruikt",
      "We rebuild the plugins you actually depend on",
    ),
    rebuildCopy: t(
      "Je bent niet verliefd op WooCommerce zelf, maar op wat je shop moet kunnen. Daarom bouwen wij de functies na die omzet opleveren: checkoutlogica, verzendregels, prijsregels, voorraadkoppelingen en B2B-uitzonderingen.",
      "You are not attached to WooCommerce itself, you are attached to what your store needs to do. So we rebuild the functions that drive revenue: checkout logic, shipping rules, pricing rules, stock integrations and B2B exceptions.",
    ),
    rebuildExtra: t(
      "Gebruik je MyParcel, Mollie, PostNL, een ERP-koppeling of maatwerk voor staffelkorting? Dan bouwen we precies dat deel opnieuw, zonder de ballast van de rest.",
      "Using MyParcel, Mollie, PostNL, an ERP connection or custom volume pricing? We rebuild exactly that part, without dragging the rest of the plugin stack along.",
    ),
    riskTitle: t("Niet sneller? Geen factuur.", "Not faster? No invoice."),
    riskCopy: t(
      "Als je nieuwe shop niet merkbaar sneller en stabieler voelt dan je huidige WooCommerce-omgeving, hoort daar geen migratiefactuur bij.",
      "If the new storefront is not clearly faster and more stable than your current WooCommerce setup, that migration should not come with an invoice.",
    ),
    timelineTitle: t(
      "Van WooCommerce naar live in 7 dagen",
      "From WooCommerce to live in 7 days",
    ),
    timelineSteps: sharedTimeline,
    extraMileTitle: t(
      "Waarom overstappers juist hier rust terugkrijgen",
      "Why switchers finally get peace of mind here",
    ),
    extraMileCards: sharedExtraMileCards,
    seoTitle: t(
      "Je ranking houden en je conversie terugpakken",
      "Protect your rankings and recover conversion",
    ),
    seoCopy: t(
      "Je oude WooCommerce-URL's worden netjes gemapt naar de nieuwe structuur. Zo voorkom je SEO-verlies terwijl je shop technisch eindelijk weer lucht krijgt.",
      "Your old WooCommerce URLs are mapped cleanly to the new structure. That protects SEO while your storefront finally gets technical breathing room.",
    ),
    seoExtra: t(
      "Veel WooCommerce-shops verliezen geen omzet door marketing, maar door frictie in snelheid en beheer. Dat is precies het lek dat we hier dichten.",
      "Many WooCommerce stores do not lose revenue because of marketing, but because of friction in speed and maintenance. That is exactly the leak we close here.",
    ),
    stickyPrompt: t(
      "Benieuwd hoeveel WooCommerce je je nu echt kost?",
      "Curious what WooCommerce is really costing you right now?",
    ),
  },
  {
    key: "shopify",
    route: "/shopify-alternatief",
    title: t(
      "Shopify Alternatief voor Snellere Groei | Sitedesk",
      "Shopify Alternative for Faster Growth | Sitedesk",
    ),
    description: t(
      "Shopify groeit makkelijk mee tot je tegen templates, apps en maandelijkse extra kosten aanloopt. Sitedesk bouwt een sneller alternatief zonder app-bloat.",
      "Shopify scales easily until you hit template limits, app bloat and rising monthly costs. Sitedesk builds a faster alternative without the app stack.",
    ),
    navLabel: t("Shopify", "Shopify"),
    heroEyebrow: t("Shopify Alternatief", "Shopify Alternative"),
    heroTitle: t(
      "Wanneer Shopify te klein begint te voelen, bouw je geen app-stack maar een beter systeem.",
      "When Shopify starts to feel too small, you do not add more apps. You build a better system.",
    ),
    heroCopy: t(
      "Wij vervangen je Shopify-apps, thema-beperkingen en oplopende maandkosten door een custom storefront die sneller laadt, meer vrijheid geeft en makkelijker doorontwikkelt.",
      "We replace your Shopify apps, theme limitations and rising monthly costs with a custom storefront that loads faster, gives you more freedom and is easier to evolve.",
    ),
    heroLeftLabel: t("Shopify", "Shopify"),
    heroLeftItems: list(
      ["Apps voor SEO", "Apps voor bundles", "Apps voor reviews", "Apps voor upsells", "Theme workarounds"],
      ["Apps for SEO", "Apps for bundles", "Apps for reviews", "Apps for upsells", "Theme workarounds"],
    ),
    heroRightLabel: t("Sitedesk", "Sitedesk"),
    matrixTitle: t(
      "Waarom Shopify vaak netjes oogt, maar stiekem marge opeet",
      "Why Shopify often looks clean while quietly eating into margin",
    ),
    matrixRows: [
      {
        problem: t("Apps", "Apps"),
        nightmare: t(
          "Elke nieuwe wens eindigt in nog een app, nog een script en nog een maandabonnement.",
          "Every new requirement ends in another app, another script and another monthly subscription.",
        ),
        solution: t(
          "Wij bouwen de functies native na, zonder extra app-stack.",
          "We rebuild the functionality natively, without another app layer.",
        ),
      },
      {
        problem: t("Flexibiliteit", "Flexibility"),
        nightmare: t(
          "Je kunt veel aanpassen, maar net niet ver genoeg zonder workarounds of dure development.",
          "You can customize a lot, but not far enough without workarounds or expensive development.",
        ),
        solution: t(
          "Volledige vrijheid in checkoutlogica, contentstructuur en UX.",
          "Full freedom in checkout logic, content structure and UX.",
        ),
      },
      {
        problem: t("Snelheid", "Speed"),
        nightmare: t(
          "Apps, tracking en theme-code stapelen zich op tot een trage storefront.",
          "Apps, tracking and theme code pile up into a slow storefront.",
        ),
        solution: t(
          "Headless performance zonder afhankelijkheid van een theme-ecosysteem.",
          "Headless performance without dependency on a theme ecosystem.",
        ),
      },
      {
        problem: t("Kosten", "Costs"),
        nightmare: t(
          "Maandelijkse app-kosten en development stapelen zich ongemerkt op.",
          "Monthly app costs and development spend quietly keep stacking up.",
        ),
        solution: t(
          "Een platform, een team, minder losse kostenposten.",
          "One platform, one team and fewer disconnected cost centers.",
        ),
      },
    ],
    checkTitle: t(
      "Laat ons je Shopify-stack en groeiblokkades in kaart brengen",
      "Let us map your Shopify stack and growth bottlenecks",
    ),
    checkCopy: t(
      "Stuur je Shopify-URL en context door. Dan beoordelen wij welke apps of workarounds je nu afremmen, wat je alternatief wordt en hoe snel een overstap realistisch is.",
      "Send your Shopify URL and context. We assess which apps or workarounds are slowing you down, what the better replacement looks like and how realistic a switch is.",
    ),
    checkDeliverables: list(
      [
        "Welke apps je kunt schrappen of samenvoegen",
        "Waar je theme of Shopify-structuur nu je groei remt",
        "Welke functies custom slimmer zijn dan nog een extra app",
        "Een realistische overstapinschatting",
      ],
      [
        "Which apps you can remove or consolidate",
        "Where your theme or Shopify structure is limiting growth",
        "Which functions are smarter to build custom than solve with yet another app",
        "A realistic switch estimate",
      ],
    ),
    defaultPlatform: "Shopify",
    zeroEffortTitle: t(
      "Jij verkoopt, wij halen je los uit de app-stack.",
      "You sell, we pull you out of the app stack.",
    ),
    zeroEffortCopy: t(
      "Je hoeft niet zelf uit te zoeken welke apps kritisch zijn of waar je theme nu vastloopt. Wij brengen dat voor je terug naar een lean systeem dat alleen doet wat jij nodig hebt.",
      "You do not need to figure out which apps are critical or where your theme is blocking you. We reduce it to a lean system that only does what you actually need.",
    ),
    threeDTitle: t(
      "Apps maken Shopify zwaarder. Maatwerk moet juist lichter worden.",
      "Apps make Shopify heavier. Custom features should make your storefront lighter, not slower.",
    ),
    threeDCopy: t(
      "Zodra je op Shopify echt onderscheidende productervaringen wilt, kom je snel uit bij apps en scripts die je storefront vertragen. Wij bouwen dat maatwerk zonder de performancebelasting van nog meer third-party code.",
      "The moment you want truly differentiated product experiences on Shopify, you end up with apps and scripts that slow the storefront down. We build that custom work without the performance cost of more third-party code.",
    ),
    threeDFootnote: t(
      "Waar Shopify vaak nog een app nodig heeft, bouwen wij een snellere native ervaring.",
      "Where Shopify often needs another app, we build a faster native experience.",
    ),
    rebuildTitle: t(
      "Wij vervangen apps door functies die echt van jou zijn",
      "We replace apps with features that actually belong to your business",
    ),
    rebuildCopy: t(
      "Upsells, bundles, reviews, custom productlogica, B2B prijzen of slimme contentblokken: we bouwen wat je nodig hebt, zonder afhankelijk te blijven van een rij betaalde apps.",
      "Upsells, bundles, reviews, custom product logic, B2B pricing or smart content blocks: we build what you need without staying dependent on a row of paid apps.",
    ),
    rebuildExtra: t(
      "Het resultaat is minder complexiteit, minder vendor-lock-in en veel meer controle over wat je storefront precies doet.",
      "The result is less complexity, less vendor lock-in and much more control over what your storefront actually does.",
    ),
    riskTitle: t(
      "Niet merkbaar beter? Dan was het de overstap niet waard.",
      "If it is not clearly better, the switch was not worth it.",
    ),
    riskCopy: t(
      "Als de nieuwe storefront niet sneller, flexibeler en duidelijk winstgevender voelt dan je huidige Shopify-opzet, dan hebben we het probleem niet goed genoeg opgelost.",
      "If the new storefront does not feel faster, more flexible and clearly more profitable than your current Shopify setup, then we did not solve the real problem well enough.",
    ),
    timelineTitle: t(
      "Van Shopify-appstapel naar custom live in 7 dagen",
      "From Shopify app stack to custom live in 7 days",
    ),
    timelineSteps: sharedTimeline,
    extraMileTitle: t(
      "Waarom Shopify-overstappers meer vrijheid terugkrijgen",
      "Why Shopify switchers get control back",
    ),
    extraMileCards: sharedExtraMileCards,
    seoTitle: t(
      "Je organische zichtbaarheid behouden terwijl je meer controle krijgt",
      "Protect organic visibility while gaining more control",
    ),
    seoCopy: t(
      "We nemen bestaande Shopify-URL's, redirects en content mee zodat je niet opnieuw hoeft te beginnen terwijl je storefront technisch veel lichter wordt.",
      "We carry over existing Shopify URLs, redirects and content so you do not have to restart while your storefront becomes technically much lighter.",
    ),
    seoExtra: t(
      "Veel Shopify-shops hebben geen gebrek aan omzetkansen, maar aan ruimte om sneller, slimmer en goedkoper door te ontwikkelen.",
      "Many Shopify stores do not lack revenue opportunities. They lack room to build faster, smarter and with lower ongoing costs.",
    ),
    stickyPrompt: t(
      "Benieuwd hoeveel je Shopify-appstack je nu kost?",
      "Curious what your Shopify app stack is costing you right now?",
    ),
  },
  {
    key: "lightspeed",
    route: "/lightspeed-alternatief",
    title: t(
      "Lightspeed Alternatief zonder Traagheid | Sitedesk",
      "Lightspeed Alternative Without the Slowness | Sitedesk",
    ),
    description: t(
      "Van Lightspeed naar een sneller custom storefront. Minder template-beperkingen, minder workarounds en meer controle over snelheid en conversie.",
      "Move from Lightspeed to a faster custom storefront. Fewer template limitations, fewer workarounds and more control over speed and conversion.",
    ),
    navLabel: t("Lightspeed", "Lightspeed"),
    heroEyebrow: t("Lightspeed Alternatief", "Lightspeed Alternative"),
    heroTitle: t(
      "Lightspeed werkt, tot je merkt hoeveel omzet blijft hangen in een traag en star systeem.",
      "Lightspeed works, until you notice how much revenue gets trapped inside a slow and rigid system.",
    ),
    heroCopy: t(
      "Wij vervangen je template-beperkingen, theme-trucs en technische compromissen door een storefront die sneller laadt, makkelijker converteert en eindelijk echt van jou is.",
      "We replace template limitations, theme hacks and technical compromises with a storefront that loads faster, converts better and finally belongs to you.",
    ),
    heroLeftLabel: t("Lightspeed", "Lightspeed"),
    heroLeftItems: list(
      ["Theme beperkingen", "Apps en scripts", "Omslachtige content", "Trage productpagina's", "Developer omwegen"],
      ["Theme limitations", "Apps and scripts", "Clunky content flow", "Slow product pages", "Developer workarounds"],
    ),
    heroRightLabel: t("Sitedesk", "Sitedesk"),
    matrixTitle: t(
      "Waarom Lightspeed vaak prima start, maar duur wordt zodra je wilt groeien",
      "Why Lightspeed is fine to start with, but expensive once growth gets serious",
    ),
    matrixRows: [
      {
        problem: t("Templates", "Templates"),
        nightmare: t(
          "Je zit vast aan wat het theme toelaat en stapelt workarounds op zodra je wilt afwijken.",
          "You are boxed in by what the theme allows and start stacking workarounds the moment you want something custom.",
        ),
        solution: t(
          "Wij bouwen de storefront op jouw logica in plaats van op templatebeperkingen.",
          "We build the storefront around your business logic instead of template limits.",
        ),
      },
      {
        problem: t("Snelheid", "Speed"),
        nightmare: t(
          "Zwaardere pagina's, scripts en aanpassingen zorgen snel voor een tragere mobiele ervaring.",
          "Heavier pages, scripts and customizations quickly turn mobile performance into a bottleneck.",
        ),
        solution: t(
          "Schone frontend, edge rendering en een setup die voor snelheid is gemaakt.",
          "Clean frontend delivery, edge rendering and an architecture built for speed.",
        ),
      },
      {
        problem: t("Developer-tijd", "Developer Time"),
        nightmare: t(
          "Eenvoudige wensen kosten onnodig veel tijd omdat je om het platform heen moet bouwen.",
          "Simple requests take too much time because development keeps working around the platform.",
        ),
        solution: t(
          "Maatwerk zonder omwegen. Nieuwe wensen worden gewoon in het systeem gebouwd.",
          "Custom work without detours. New requirements are built directly into the system.",
        ),
      },
      {
        problem: t("Conversie", "Conversion"),
        nightmare: t(
          "Een shop die net niet lekker voelt op mobiel kost structureel orders en advertentierendement.",
          "A storefront that feels slightly off on mobile quietly costs you orders and ad efficiency.",
        ),
        solution: t(
          "Snellere productpagina's, meer controle over UX en minder frictie in checkout en navigatie.",
          "Faster product pages, tighter UX control and less friction in checkout and navigation.",
        ),
      },
    ],
    checkTitle: t(
      "Laat ons je Lightspeed-shop en groeiblokkades analyseren",
      "Let us analyze your Lightspeed store and the bottlenecks holding growth back",
    ),
    checkCopy: t(
      "Stuur je URL en context door. Dan beoordelen wij waar Lightspeed je nu afremt, welke onderdelen custom slimmer zijn en hoe een overstap eruitziet.",
      "Send us your URL and context. We assess where Lightspeed is slowing you down, which parts are better rebuilt custom and what a switch would look like.",
    ),
    checkDeliverables: list(
      [
        "Waar je huidige Lightspeed-opzet snelheid en omzet laat liggen",
        "Welke functies of contentblokken slimmer custom gebouwd worden",
        "Welke workarounds je na de overstap kwijt bent",
        "Een realistische inschatting van planning en complexiteit",
      ],
      [
        "Where your current Lightspeed setup is leaking speed and revenue",
        "Which features or content blocks are smarter to rebuild custom",
        "Which workarounds disappear after the switch",
        "A realistic estimate of planning and complexity",
      ],
    ),
    defaultPlatform: "Lightspeed",
    zeroEffortTitle: t(
      "Jij runt de shop, wij halen je uit de templatebeperkingen.",
      "You run the store, we pull you out of the template limitations.",
    ),
    zeroEffortCopy: t(
      "Geen exports, geen technische puzzel en geen eindeloze afstemming tussen partijen. Wij halen de logica uit je huidige shop, bouwen de nieuwe omgeving en zetten pas live als jij alles hebt getest.",
      "No exports, no technical puzzle and no endless coordination between vendors. We extract the logic from your current store, build the new environment and only go live once you have tested everything.",
    ),
    threeDTitle: t(
      "Dit soort rijke productervaring hoort conversie te helpen, niet performance te slopen.",
      "Rich product experiences should improve conversion, not destroy performance.",
    ),
    threeDCopy: t(
      "Zodra je op Lightspeed visueel of interactief wilt uitpakken, loop je snel tegen frontendbeperkingen aan. Wij bouwen zulke ervaringen direct in een snelle storefront, zonder afhankelijk te zijn van theme-trucs.",
      "The moment you want a richer visual or interactive experience on Lightspeed, frontend limitations show up fast. We build those experiences directly into a fast storefront without theme hacks.",
    ),
    threeDFootnote: t(
      "Precies dit soort ervaring is waar standaardplatformen vaak beginnen te wringen.",
      "This is exactly the type of experience where standard platforms start to show strain.",
    ),
    rebuildTitle: t(
      "Wij bouwen de belangrijke functies opnieuw, zonder de ballast eromheen",
      "We rebuild the important functionality without carrying over the ballast",
    ),
    rebuildCopy: t(
      "Denk aan verzendregels, contentblokken, productstructuren, filters, landingspagina's en specifieke conversielogica. Niet meer passen en meten binnen wat een template net toelaat.",
      "Think shipping rules, content blocks, product structures, filters, landing pages and specific conversion logic. No more squeezing ideas into what a template barely allows.",
    ),
    rebuildExtra: t(
      "Het resultaat is een shop die niet alleen sneller laadt, maar ook sneller doorontwikkelt zodra je iets nieuws wilt testen.",
      "The result is a store that not only loads faster, but also evolves faster the moment you want to test something new.",
    ),
    riskTitle: t(
      "Niet merkbaar lichter en sneller? Dan schiet de overstap zijn doel voorbij.",
      "If it is not clearly lighter and faster, the switch misses the point.",
    ),
    riskCopy: t(
      "De winst van weggaan bij Lightspeed zit niet alleen in techniek, maar in minder frictie voor je team en je klanten. Als dat niet voelbaar is, hebben we niet ver genoeg doorgepakt.",
      "The value in leaving Lightspeed is not just technical. It is less friction for your team and your customers. If that is not obvious, we did not go far enough.",
    ),
    timelineTitle: t(
      "Van Lightspeed naar custom live in 7 dagen",
      "From Lightspeed to custom live in 7 days",
    ),
    timelineSteps: sharedTimeline,
    extraMileTitle: t(
      "Waarom Lightspeed-overstappers vooral meer controle terugkrijgen",
      "Why Lightspeed switchers mainly get control back",
    ),
    extraMileCards: sharedExtraMileCards,
    seoTitle: t(
      "Je SEO behouden terwijl je shop technisch een flinke stap vooruit zet",
      "Keep your SEO while your storefront makes a real technical leap forward",
    ),
    seoCopy: t(
      "We mappen je bestaande URL's en contentstructuur zodat je niet eerst verkeer hoeft op te offeren om technisch beter te worden.",
      "We map your existing URLs and content structure so you do not have to sacrifice traffic to become technically stronger.",
    ),
    seoExtra: t(
      "Het doel is niet alleen weg uit Lightspeed, maar naar een shop die sneller verkoopt en makkelijker groeit.",
      "The goal is not just to leave Lightspeed, but to land on a storefront that sells faster and grows more easily.",
    ),
    stickyPrompt: t(
      "Benieuwd hoeveel Lightspeed-frictie je nu kost?",
      "Curious what Lightspeed friction is costing you right now?",
    ),
  },
];

export const getPlatformMigrationConfig = (key: string) =>
  migrationPlatforms.find((platform) => platform.key === key);
