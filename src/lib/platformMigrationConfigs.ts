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
  route: LocalizedText;
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
  keywordTitle: LocalizedText;
  keywordIntro: LocalizedText;
  keywordPhrases: LocalizedTextList;
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

export const getMigrationMenuLabel = (
  platform: Pick<PlatformMigrationConfig, "key">,
  locale: SupportedLocale,
) => {
  if (locale === "en") {
    switch (platform.key) {
      case "woocommerce":
        return "WooCommerce migration";
      case "shopify":
        return "Shopify alternative";
      case "lightspeed":
        return "Lightspeed alternative";
      case "magento":
        return "Magento alternative";
      case "prestashop":
        return "PrestaShop alternative";
      default:
        return "Migration";
    }
  }

  switch (platform.key) {
    case "woocommerce":
      return "WooCommerce migratie";
    case "shopify":
      return "Shopify alternatief";
    case "lightspeed":
      return "Lightspeed alternatief";
    case "magento":
      return "Magento alternatief";
    case "prestashop":
      return "PrestaShop alternatief";
    default:
      return "Migratie";
  }
};

export const getPlatformRoute = (
  platform: Pick<PlatformMigrationConfig, "route">,
  locale: SupportedLocale,
) => {
  const value = platform.route[locale] ?? platform.route.en ?? platform.route.nl ?? "/";
  const normalized = String(value).startsWith("/") ? String(value) : `/${String(value)}`;
  return normalized === "/" ? "/" : normalized.replace(/\/+$/, "");
};

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
    route: t("/migratie", "/woocommerce-migration"),
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
    keywordTitle: t(
      "Herkenbare signalen",
      "Common signs you have outgrown WooCommerce",
    ),
    keywordIntro: t(
      "Dit zijn meestal de eerste signalen dat WooCommerce je niet meer helpt groeien, maar juist begint af te remmen.",
      "These are usually the first signs that WooCommerce is no longer helping your growth, but quietly slowing it down.",
    ),
    keywordPhrases: list(
      [
        "Trage productpagina's op mobiel",
        "Plugin-conflicten na updates",
        "Steeds terugkerende developer-kosten",
        "Checkout die net niet stabiel voelt",
        "SEO die technisch wordt afgeremd",
        "Nieuwe wensen die te duur worden",
      ],
      [
        "Slow mobile product pages",
        "Plugin conflicts after updates",
        "Recurring developer costs",
        "Checkout that never feels fully stable",
        "SEO held back by technical drag",
        "New features that become too expensive",
      ],
    ),
    riskTitle: t("Geen groot verschil? Dan is de migratie gratis.", "No big difference? Then the migration is free."),
    riskCopy: t(
      "Als je nieuwe shop niet duidelijk sneller, stabieler en makkelijker te beheren is dan je huidige WooCommerce-omgeving, hoort daar geen migratiefactuur bij.",
      "If the new storefront is not clearly faster, more stable and easier to manage than your current WooCommerce setup, there should be no migration invoice.",
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
    route: t("/shopify-alternatief", "/shopify-alternative"),
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
    keywordTitle: t(
      "Herkenbare signalen",
      "Common signs you have outgrown Shopify",
    ),
    keywordIntro: t(
      "Hier lopen groeiende Shopify-shops meestal op vast: niet in een groot drama, maar in maand na maand frictie en extra kosten.",
      "This is where growing Shopify stores usually get stuck: not in one dramatic failure, but in month after month of friction and extra cost.",
    ),
    keywordPhrases: list(
      [
        "Te veel betaalde apps naast elkaar",
        "Theme-beperkingen bij maatwerk",
        "Oplopende maandelijkse app-kosten",
        "Storefront die zwaarder wordt door scripts",
        "Logica die niet goed in Shopify past",
        "Te weinig controle over UX en flow",
      ],
      [
        "Too many paid apps stacked together",
        "Theme limitations for custom features",
        "Rising monthly app costs",
        "A storefront getting heavier because of scripts",
        "Business logic that does not fit Shopify cleanly",
        "Too little control over UX and flow",
      ],
    ),
    riskTitle: t(
      "Geen groot verschil? Dan is de migratie gratis.",
      "No big difference? Then the migration is free.",
    ),
    riskCopy: t(
      "Als de nieuwe storefront niet duidelijk sneller, flexibeler en makkelijker door te ontwikkelen is dan je huidige Shopify-opzet, hoort daar geen migratiefactuur bij.",
      "If the new storefront is not clearly faster, more flexible and easier to improve than your current Shopify setup, there should be no migration invoice.",
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
    route: t("/lightspeed-alternatief", "/lightspeed-alternative"),
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
    keywordTitle: t(
      "Herkenbare signalen",
      "Common signs you have outgrown Lightspeed",
    ),
    keywordIntro: t(
      "Bij Lightspeed zie je het meestal terug in traagheid, templatebeperkingen en aanpassingen die steeds meer tijd gaan kosten.",
      "With Lightspeed, it usually shows up as slowness, template limits and changes that start costing more and more time.",
    ),
    keywordPhrases: list(
      [
        "Trage categorie- en productpagina's",
        "Template die commerciële wensen blokkeert",
        "Te veel omwegen voor simpele aanpassingen",
        "Mobiele UX die niet strak genoeg voelt",
        "Developer-tijd die weglekt aan workarounds",
        "Te weinig controle over de storefront",
      ],
      [
        "Slow category and product pages",
        "A template blocking commercial ideas",
        "Too many detours for simple changes",
        "Mobile UX that does not feel sharp enough",
        "Developer time wasted on workarounds",
        "Too little control over the storefront",
      ],
    ),
    riskTitle: t(
      "Geen groot verschil? Dan is de migratie gratis.",
      "No big difference? Then the migration is free.",
    ),
    riskCopy: t(
      "De winst van weggaan bij Lightspeed moet duidelijk voelbaar zijn in snelheid, beheer en flexibiliteit. Is dat verschil niet groot genoeg, dan hoort daar geen migratiefactuur bij.",
      "The value in leaving Lightspeed should be obvious in speed, manageability and flexibility. If that difference is not big enough, there should be no migration invoice.",
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
  {
    key: "magento",
    route: t("/magento-alternatief", "/magento-alternative"),
    title: t(
      "Magento Alternatief voor Minder Complexiteit | Sitedesk",
      "Magento Alternative with Less Complexity | Sitedesk",
    ),
    description: t(
      "Van Magento naar een lichter systeem zonder enterprise ballast. Minder onderhoud, minder technische schuld en meer snelheid.",
      "Move from Magento to a lighter system without enterprise ballast. Less maintenance, less technical debt and more speed.",
    ),
    navLabel: t("Magento", "Magento"),
    heroEyebrow: t("Magento Alternatief", "Magento Alternative"),
    heroTitle: t(
      "Magento kan alles. De vraag is alleen hoeveel tijd, geld en geduld dat je kost.",
      "Magento can do almost everything. The question is how much time, money and patience that costs you.",
    ),
    heroCopy: t(
      "Wij vervangen enterprise-complexiteit, trage releases en zware onderhoudslasten door een custom storefront die sneller te beheren, sneller te bouwen en sneller te laden is.",
      "We replace enterprise complexity, slow releases and heavy maintenance overhead with a custom storefront that is faster to manage, faster to develop and faster to load.",
    ),
    heroLeftLabel: t("Magento", "Magento"),
    heroLeftItems: list(
      ["Modules", "Deploy gedoe", "Indexers", "Legacy code", "Hoge onderhoudslast"],
      ["Modules", "Deploy friction", "Indexers", "Legacy code", "High maintenance load"],
    ),
    heroRightLabel: t("Sitedesk", "Sitedesk"),
    matrixTitle: t(
      "Waarom Magento vaak zwaarder wordt dan je business nodig heeft",
      "Why Magento often becomes heavier than your business actually needs",
    ),
    matrixRows: [
      {
        problem: t("Complexiteit", "Complexity"),
        nightmare: t(
          "Nieuwe wensen lopen snel vast in modules, dependencies en deployment-risico's.",
          "New requirements quickly get tangled up in modules, dependencies and deployment risk.",
        ),
        solution: t(
          "Wij bouwen alleen wat je echt nodig hebt, zonder enterprise ballast.",
          "We build only what you actually need, without enterprise ballast.",
        ),
      },
      {
        problem: t("Onderhoud", "Maintenance"),
        nightmare: t(
          "Beheer, hosting en releases vreten tijd en budget nog voordat je iets nieuws oplevert.",
          "Hosting, maintenance and releases eat time and budget before you ship anything new.",
        ),
        solution: t(
          "Een lichtere stack met minder moving parts en veel minder technische schuld.",
          "A lighter stack with fewer moving parts and far less technical debt.",
        ),
      },
      {
        problem: t("Snelheid", "Speed"),
        nightmare: t(
          "Magento kan krachtig zijn, maar voelt voor veel shops te zwaar op mobiel en te stroperig in iteratie.",
          "Magento can be powerful, but for many stores it feels too heavy on mobile and too slow to iterate on.",
        ),
        solution: t(
          "Snelle frontend delivery en maatwerk zonder het gewicht van een volledige Magento-stack.",
          "Fast frontend delivery and custom functionality without the weight of a full Magento stack.",
        ),
      },
      {
        problem: t("Kosten", "Costs"),
        nightmare: t(
          "Je betaalt voor enterprise-complexiteit ook als je maar een deel van die kracht echt benut.",
          "You pay for enterprise complexity even when you use only a fraction of its capabilities.",
        ),
        solution: t(
          "Meer focus op wat verkoopt, minder budget op wat alleen het systeem in leven houdt.",
          "More focus on what sells, less budget on what merely keeps the system alive.",
        ),
      },
    ],
    checkTitle: t(
      "Laat ons je Magento-stack en onderhoudslast analyseren",
      "Let us analyze your Magento stack and maintenance load",
    ),
    checkCopy: t(
      "Stuur je URL en context door. Dan beoordelen wij welke delen van Magento je echt nodig hebt, wat ballast is geworden en hoe een slimmere custom setup eruitziet.",
      "Send your URL and context. We assess which parts of Magento you truly need, what has become ballast and what a smarter custom setup looks like.",
    ),
    checkDeliverables: list(
      [
        "Welke Magento-complexiteit je kunt afbouwen",
        "Welke modules of processen maatwerk moeten blijven",
        "Waar onderhoud en hosting nu onnodig budget verbruiken",
        "Een realistische overstapinschatting",
      ],
      [
        "Which Magento complexity you can remove",
        "Which modules or processes should remain as custom functionality",
        "Where maintenance and hosting are wasting budget today",
        "A realistic switch estimate",
      ],
    ),
    defaultPlatform: "Magento",
    zeroEffortTitle: t(
      "Jij houdt de omzet draaiend, wij halen de enterprise ballast eruit.",
      "You keep revenue moving, we strip out the enterprise ballast.",
    ),
    zeroEffortCopy: t(
      "Je hoeft niet zelf uit te zoeken welke Magento-onderdelen kritisch zijn en welke alleen complexiteit toevoegen. Wij brengen die scheiding voor je aan en bouwen daarna een lichtere omgeving.",
      "You do not need to figure out which Magento parts are critical and which only add complexity. We draw that line for you and then build a lighter environment.",
    ),
    threeDTitle: t(
      "Rijke productervaring mag niet nog meer technische zwaarte toevoegen.",
      "Rich product experiences should not add even more technical weight.",
    ),
    threeDCopy: t(
      "Magento-projecten worden vaak al zwaar genoeg door modules en releases. Dan wil je onderscheidende features zoals 3D of configuratie niet nog in diezelfde zware laag proppen.",
      "Magento projects are usually heavy enough because of modules and release overhead. You do not want to cram differentiated features like 3D or configuration into that same heavy layer.",
    ),
    threeDFootnote: t(
      "Hier laat je maatwerk zien zonder er nog een nieuwe laag complexiteit bij te bouwen.",
      "Here you show off custom functionality without creating another layer of complexity.",
    ),
    rebuildTitle: t(
      "Wij houden de businesslogica, niet de overkill",
      "We keep the business logic, not the overkill",
    ),
    rebuildCopy: t(
      "Denk aan pricing rules, B2B uitzonderingen, complexe cataloguslogica of specifieke orderflows. We behouden wat omzet draagt en laten de rest achter.",
      "Think pricing rules, B2B exceptions, complex catalog logic or specific order flows. We keep what carries revenue and leave the rest behind.",
    ),
    rebuildExtra: t(
      "Het resultaat is geen afgeslankte Magento-kopie, maar een gerichter systeem dat sneller werkt voor je team en je klant.",
      "The result is not a slimmed-down Magento clone, but a more focused system that works faster for both your team and your customer.",
    ),
    keywordTitle: t(
      "Herkenbare signalen",
      "Common signs you have outgrown Magento",
    ),
    keywordIntro: t(
      "Magento voelt vaak niet ineens fout, maar wel steeds zwaarder. Meer onderhoud, tragere releases en meer budget dat opgaat aan complexiteit.",
      "Magento rarely feels wrong all at once, but it often starts feeling heavier over time: more maintenance, slower releases and more budget consumed by complexity.",
    ),
    keywordPhrases: list(
      [
        "Te veel enterprise-complexiteit",
        "Trage releases en dure development",
        "Onderhoud dat te veel budget kost",
        "Stack die zwaarder is dan nodig",
        "Te veel technische schuld in modules",
        "Te weinig snelheid voor moderne conversie",
      ],
      [
        "Too much enterprise complexity",
        "Slow releases and expensive development",
        "Maintenance eating too much budget",
        "A stack that is heavier than needed",
        "Too much technical debt in modules",
        "Not enough speed for modern conversion",
      ],
    ),
    riskTitle: t(
      "Geen groot verschil? Dan is de migratie gratis.",
      "No big difference? Then the migration is free.",
    ),
    riskCopy: t(
      "Magento verlaten heeft alleen zin als de nieuwe omgeving duidelijk eenvoudiger, sneller en lichter voelt. Is dat verschil niet groot genoeg, dan hoort daar geen migratiefactuur bij.",
      "Leaving Magento only makes sense if the new environment feels clearly simpler, faster and lighter. If that difference is not big enough, there should be no migration invoice.",
    ),
    timelineTitle: t(
      "Van Magento naar custom live in 7 dagen",
      "From Magento to custom live in 7 days",
    ),
    timelineSteps: sharedTimeline,
    extraMileTitle: t(
      "Waarom Magento-overstappers vooral opluchting terugkrijgen",
      "Why Magento switchers mainly get relief back",
    ),
    extraMileCards: sharedExtraMileCards,
    seoTitle: t(
      "Je bestaande zichtbaarheid meenemen zonder de oude complexiteit te bewaren",
      "Carry over visibility without carrying over the old complexity",
    ),
    seoCopy: t(
      "We behouden je URL-logica en content waar dat waardevol is, maar nemen niet blind de technische schuld van Magento mee.",
      "We preserve your URL logic and content where it matters, without blindly carrying Magento's technical debt forward.",
    ),
    seoExtra: t(
      "De winst zit niet alleen in SEO-behoud, maar in een stack die daarna eindelijk sneller te ontwikkelen en sneller te verkopen is.",
      "The upside is not just preserving SEO, but ending up with a stack that is finally faster to build on and faster to sell from.",
    ),
    stickyPrompt: t(
      "Benieuwd hoeveel Magento-complexiteit je nu kost?",
      "Curious what Magento complexity is costing you right now?",
    ),
  },
  {
    key: "prestashop",
    route: t("/prestashop-alternatief", "/prestashop-alternative"),
    title: t(
      "PrestaShop Alternatief voor Meer Snelheid | Sitedesk",
      "PrestaShop Alternative for More Speed | Sitedesk",
    ),
    description: t(
      "Van PrestaShop naar een sneller en moderner storefront. Minder module-gedoe, minder onderhoud en meer grip op conversie.",
      "Move from PrestaShop to a faster, more modern storefront. Less module friction, less maintenance and more control over conversion.",
    ),
    navLabel: t("PrestaShop", "PrestaShop"),
    heroEyebrow: t("PrestaShop Alternatief", "PrestaShop Alternative"),
    heroTitle: t(
      "PrestaShop houdt je shop online, maar niet altijd snel, strak en makkelijk schaalbaar.",
      "PrestaShop keeps your store online, but not always fast, clean and easy to scale.",
    ),
    heroCopy: t(
      "Wij vervangen module-stapeling, verouderde theme-logica en omslachtige doorontwikkeling door een storefront die sneller laadt en makkelijker converteert.",
      "We replace module stacking, dated theme logic and slow iteration with a storefront that loads faster and converts more cleanly.",
    ),
    heroLeftLabel: t("PrestaShop", "PrestaShop"),
    heroLeftItems: list(
      ["Modules", "Theme overrides", "Backoffice frictie", "Langzame categorieën", "Veel kleine fixes"],
      ["Modules", "Theme overrides", "Back office friction", "Slow category pages", "Many small fixes"],
    ),
    heroRightLabel: t("Sitedesk", "Sitedesk"),
    matrixTitle: t(
      "Waarom PrestaShop vaak blijft hangen in kleine technische remmen",
      "Why PrestaShop often gets stuck in many small technical bottlenecks",
    ),
    matrixRows: [
      {
        problem: t("Modules", "Modules"),
        nightmare: t(
          "Extra functionaliteit betekent al snel nog een module en nog een afhankelijkheid.",
          "Extra functionality quickly means another module and another dependency.",
        ),
        solution: t(
          "Wij bouwen de kritieke functies direct in, zonder extra modulelaag.",
          "We build the critical functionality directly into the system without another module layer.",
        ),
      },
      {
        problem: t("Theme-logica", "Theme logic"),
        nightmare: t(
          "Aanpassingen belanden in overrides en kleine workarounds die later weer breken.",
          "Changes end up in overrides and small workarounds that later break again.",
        ),
        solution: t(
          "Een heldere storefront-architectuur zonder thema-pleisters.",
          "A clear storefront architecture without theme band-aids.",
        ),
      },
      {
        problem: t("Snelheid", "Speed"),
        nightmare: t(
          "Vooral op mobiel gaat conversie verloren door frictie in scripts, pagina-opbouw en interacties.",
          "Especially on mobile, conversion gets lost through friction in scripts, page structure and interactions.",
        ),
        solution: t(
          "Snelle product- en categoriepagina's met veel minder frontend ballast.",
          "Fast product and category pages with far less frontend ballast.",
        ),
      },
      {
        problem: t("Doorontwikkeling", "Iteration"),
        nightmare: t(
          "Je blijft kleine bugs en uitzonderingen oplossen in plaats van echt beter te bouwen.",
          "You keep solving small bugs and exceptions instead of building something better.",
        ),
        solution: t(
          "Een systeem dat makkelijker te verbeteren is zodra je nieuwe ideeën wilt testen.",
          "A system that is easier to improve the moment you want to test new ideas.",
        ),
      },
    ],
    checkTitle: t(
      "Laat ons je PrestaShop-setup en technische remmen analyseren",
      "Let us analyze your PrestaShop setup and its technical bottlenecks",
    ),
    checkCopy: t(
      "Stuur je URL en context door. Dan beoordelen wij waar modules, theme-logica of front-end frictie je nu afremmen en hoe een sneller alternatief eruitziet.",
      "Send your URL and context. We assess where modules, theme logic or frontend friction are slowing you down and what a faster alternative looks like.",
    ),
    checkDeliverables: list(
      [
        "Welke modules of overrides je nu afremmen",
        "Waar mobiele conversie onnodig lekt",
        "Welke functies custom slimmer gebouwd worden",
        "Een realistische overstapinschatting",
      ],
      [
        "Which modules or overrides are slowing you down",
        "Where mobile conversion is leaking unnecessarily",
        "Which functions are smarter to build custom",
        "A realistic switch estimate",
      ],
    ),
    defaultPlatform: "PrestaShop",
    zeroEffortTitle: t(
      "Jij hoeft geen module-oorlog uit te pluizen. Wij doen dat.",
      "You do not need to untangle a module war. We do that.",
    ),
    zeroEffortCopy: t(
      "Je hoeft niet zelf te bepalen wat essentieel is, wat weg kan en waar de echte vertraging zit. Wij brengen dat terug tot een scherpe blueprint en bouwen daarna de betere versie.",
      "You do not need to decide what is essential, what can go and where the real slowdown lives. We reduce that to a sharp blueprint and then build the better version.",
    ),
    threeDTitle: t(
      "Als je al frictie voelt in je frontend, wil je geen extra laag module-logica toevoegen.",
      "If your frontend already feels strained, you do not want to add another layer of module logic.",
    ),
    threeDCopy: t(
      "PrestaShop-projecten verliezen vaak snelheid in kleine optelsommen. Dan moet onderscheidende productbeleving juist schoon gebouwd worden, niet eraan vastgelijmd.",
      "PrestaShop projects often lose speed through many small accumulations. That is exactly why differentiating product experiences should be built cleanly, not glued on top.",
    ),
    threeDFootnote: t(
      "Zo hoort maatwerk eruit te zien: sneller, rijker en zonder nieuwe technische rommel.",
      "This is what custom should look like: faster, richer and without new technical clutter.",
    ),
    rebuildTitle: t(
      "Wij behouden wat werkt en slopen de frictie eromheen weg",
      "We keep what works and remove the friction around it",
    ),
    rebuildCopy: t(
      "Denk aan filters, cataloguslogica, verzendregels, promoties en landingspagina's. Alles wat omzet ondersteunt blijft. Alleen de technische ballast gaat eruit.",
      "Think filters, catalog logic, shipping rules, promotions and landing pages. Everything that supports revenue stays. Only the technical ballast goes.",
    ),
    rebuildExtra: t(
      "Zo wordt je volgende stap niet opnieuw een theme-tweak of module-fix, maar echte verbetering aan je storefront.",
      "That way your next step is not another theme tweak or module fix, but a real storefront improvement.",
    ),
    keywordTitle: t(
      "Herkenbare signalen",
      "Common signs you have outgrown PrestaShop",
    ),
    keywordIntro: t(
      "Bij PrestaShop zie je de frictie vaak terug in modulegedoe, overrides en een storefront die op mobiel net niet scherp genoeg voelt.",
      "With PrestaShop, the friction usually shows up in module issues, overrides and a storefront that never feels quite sharp enough on mobile.",
    ),
    keywordPhrases: list(
      [
        "Te veel module-afhankelijkheid",
        "Overrides die later weer breken",
        "Mobiele ervaring die conversie kost",
        "Te veel kleine fixes in plaats van vooruitgang",
        "Frontend die zwaarder aanvoelt dan nodig",
        "Aanpassingen die te technisch worden",
      ],
      [
        "Too much module dependency",
        "Overrides that break again later",
        "A mobile experience that leaks conversion",
        "Too many small fixes instead of real progress",
        "A frontend that feels heavier than necessary",
        "Changes that become too technical",
      ],
    ),
    riskTitle: t(
      "Geen groot verschil? Dan is de migratie gratis.",
      "No big difference? Then the migration is free.",
    ),
    riskCopy: t(
      "Een overstap weg van PrestaShop moet merkbaar fijner zijn in snelheid, beheer en doorontwikkeling. Is dat verschil niet groot genoeg, dan hoort daar geen migratiefactuur bij.",
      "A move away from PrestaShop should feel clearly better in speed, maintenance and iteration. If that difference is not big enough, there should be no migration invoice.",
    ),
    timelineTitle: t(
      "Van PrestaShop naar custom live in 7 dagen",
      "From PrestaShop to custom live in 7 days",
    ),
    timelineSteps: sharedTimeline,
    extraMileTitle: t(
      "Waarom PrestaShop-overstappers eindelijk een schonere basis krijgen",
      "Why PrestaShop switchers finally get a cleaner foundation",
    ),
    extraMileCards: sharedExtraMileCards,
    seoTitle: t(
      "Je bestaande content en rankings meenemen zonder de oude frictie",
      "Carry over content and rankings without carrying over the old friction",
    ),
    seoCopy: t(
      "We behouden wat zoekverkeer oplevert, maar vervangen de technische laag waar PrestaShop je nu remt.",
      "We preserve what drives search traffic while replacing the technical layer that is slowing you down today.",
    ),
    seoExtra: t(
      "Zo eindig je niet alleen met dezelfde zichtbaarheid, maar met een shop die daar veel meer uit kan halen.",
      "That way you do not just keep the same visibility, you end up with a storefront that can get much more out of it.",
    ),
    stickyPrompt: t(
      "Benieuwd hoeveel PrestaShop-frictie je nu kost?",
      "Curious what PrestaShop friction is costing you right now?",
    ),
  },
];

export const getPlatformMigrationConfig = (key: string) =>
  migrationPlatforms.find((platform) => platform.key === key);
