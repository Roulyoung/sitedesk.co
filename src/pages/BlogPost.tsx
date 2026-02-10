import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { CalendarDays, Tag, ArrowLeft, ArrowRight, Share2, CheckCircle2 } from "lucide-react";
import { blogPosts, PAGE_SIZE, paginate } from "@/lib/blogData";

const tocItems = [
  { id: "hard-cijfers", label: "De harde cijfers" },
  { id: "centrale-database", label: "Centrale database" },
  { id: "edge-oplossing", label: "Edge-architectuur" },
  { id: "rekensom", label: "Rekensom" },
  { id: "cta-breakout", label: "Pilot Deal" },
  { id: "waarom-sitedesk", label: "Waarom Sitedesk" },
  { id: "klaar-edge", label: "Klaar voor 0ms" },
];

const BlogPost = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialPage = Number(searchParams.get("page")) || 1;

  const [page, setPage] = useState(initialPage);
  const [activeSection, setActiveSection] = useState<string>(tocItems[0].id);

  const current = blogPosts.find((p) => p.slug === slug) ?? blogPosts[0];
  const otherPosts = blogPosts.filter((p) => p.slug !== current.slug);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(otherPosts.length / PAGE_SIZE) || 1), [otherPosts.length]);
  const listing = useMemo(() => paginate(otherPosts, page, PAGE_SIZE), [page, otherPosts]);

  const title = current.title;
  const description =
    "Hoe elke seconde vertraging direct omzet kost en waarom Edge-architectuur dit definitief oplost.";
  const publishedDate = "2026-02-10";
  const readingTime = "6 min";

  useEffect(() => {
    document.title = `${title} | Sitedesk Blog`;
    setPage(initialPage);

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = description;
      document.head.appendChild(newMeta);
    }

    const ldJson = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      datePublished: publishedDate,
      dateModified: publishedDate,
      author: { "@type": "Organization", name: "Sitedesk" },
      publisher: {
        "@type": "Organization",
        name: "Sitedesk",
        logo: {
          "@type": "ImageObject",
          url: "https://sitedesk.co/icon-sitedesk.png",
        },
      },
      description,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": window.location.href,
      },
    };

    const scriptId = "structured-data-article";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(ldJson);
  }, [title, description, initialPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: 0.1 },
    );
    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleBack = () => {
    navigate(`/blog?page=${page}`);
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
      <div className="flex items-center justify-center gap-2 my-8">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(Math.max(1, page - 1))}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Vorige
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? "hero" : "outline"}
            size="sm"
            onClick={() => setPage(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
        >
          Volgende
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        <article className="container mx-auto max-w-5xl pb-20">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Terug naar blogoverzicht
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              High-performance e-commerce inzichten
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
            <div className="relative p-8 md:p-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                <Tag className="w-4 h-4" />
                Blog
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-12">{title}</h1>
              <p className="text-xl text-muted-foreground max-w-4xl" id="lede">
                <strong>Hoe elke seconde vertraging je direct omzet kost en waarom Edge-architectuur dit definitief oplost.</strong> {description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  10 februari 2026
                </span>
                <span className="inline-flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Performance, Edge, CRO
                </span>
                <span className="inline-flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  {readingTime} leestijd
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="hero" size="sm">
                  <a href="/#contact">Plan een Speed-Check</a>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-accent text-accent hover:bg-accent/10">
                  <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer">
                    WhatsApp direct
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-10 grid lg:grid-cols-[1fr,280px] gap-10">
            <section className="article-body max-w-[720px] mx-auto text-lg leading-relaxed text-foreground space-y-12">
              <p className="text-lg leading-relaxed mb-8">
                Je opent een webshop op je telefoon. Je ziet een wit scherm. Eén seconde gaat voorbij... twee seconden... drie...
                <strong> Je bent weg, toch?</strong> In 2026 is de online consument ongeduldiger dan ooit. <strong>Snelheid is niet langer nice-to-have; het is de fundering van je winstgevendheid.</strong>
              </p>

              <section id="hard-cijfers">
                <h2 className="font-extrabold text-3xl mt-24 mb-8">De harde cijfers: elke seconde telt</h2>
                <p className="text-lg leading-relaxed mb-8">
                  Wanneer we zeggen dat traagheid omzet kost, baseren we dat niet op een onderbuikgevoel. <strong>De data van tech-giganten is onverbiddelijk.</strong>
                </p>
                <div className="pl-6 border-l-4 border-yellow-400 my-10 space-y-4">
                  <div className="flex items-start gap-3">
                    <svg aria-hidden="true" className="mt-1 w-4 h-4 text-[#FFB800]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span><strong>De 53%-grens:</strong> 53% van mobiele bezoekers haakt af na 3 seconden laden. (Google/SOASTA)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg aria-hidden="true" className="mt-1 w-4 h-4 text-[#FFB800]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span><strong>Conversie-killer:</strong> 1s laadtijd = 3x hogere conversie vs 5s. (Portent)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg aria-hidden="true" className="mt-1 w-4 h-4 text-[#FFB800]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span><strong>Amazon-effect:</strong> Elke 100ms vertraging kost 1% omzet. (Amazon)</span>
                  </div>
                </div>
                <blockquote className="border-l-4 border-[#FFB800] pl-8 italic text-[1.25rem] my-16">
                  “0ms is geen hype. Het is het verschil tussen groeien en stilstaan.”
                  <div className="text-sm text-muted-foreground mt-1">— Sitedesk Performance Lab</div>
                </blockquote>
                <p className="text-lg leading-relaxed mb-8">
                  <strong>Conclusie:</strong> Draait je shop met ~4s laadtijd? Dan verdampt de helft van je marketingbudget nog voor de betaalknop in beeld komt.
                </p>
              </section>

              <section id="centrale-database">
                <h2 className="font-extrabold text-3xl mt-24 mb-8">Het probleem van de centrale database</h2>
                <p className="text-lg leading-relaxed mb-8">
                  Traditionele shops renderen vanaf een centrale server. <strong>Elke klik wacht op server, database en HTML-build.</strong> Hoe meer plugins, hoe zwaarder de lijn.
                </p>
                <h3 className="font-semibold text-2xl mt-14 mb-4">Waarom dit traag is</h3>
                <p className="text-lg leading-relaxed mb-8">
                  Meer apps = meer latency. Meer thema&apos;s = grotere bundels. <strong>De bezoeker wacht, jij verliest omzet.</strong>
                </p>
              </section>

              <section id="edge-oplossing">
                <h2 className="font-extrabold text-3xl mt-24 mb-8">De oplossing: Edge-architectuur (Sitedesk Engine)</h2>
                <p className="text-lg leading-relaxed mb-8">
                  Wij deployen je shop op Cloudflare Edge. <strong>Niet één server, maar duizenden nodes dichter bij je bezoeker.</strong>
                </p>
                <div className="pl-6 border-l-4 border-yellow-400 my-10 space-y-4">
                  <div className="flex items-start gap-3">
                    <svg aria-hidden="true" className="mt-1 w-4 h-4 text-[#FFB800]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span><strong>0ms gevoel:</strong> Assets staan al naast je bezoeker.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg aria-hidden="true" className="mt-1 w-4 h-4 text-[#FFB800]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span><strong>Geen database-calls:</strong> Data serveert direct vanaf de Edge.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg aria-hidden="true" className="mt-1 w-4 h-4 text-[#FFB800]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span><strong>Headless-snelheid:</strong> Frontend en Sheets-backend zijn ontkoppeld voor pure performance.</span>
                  </div>
                </div>
              </section>

              <section id="rekensom">
                <h2 className="font-extrabold text-3xl mt-24 mb-8">De rekensom: wat levert 0ms op?</h2>
                <p className="text-lg leading-relaxed mb-8">
                  Stel je hebt een bescheiden shop. <strong>Alleen al op snelheid pak je elke maand duizenden euro’s terug.</strong>
                </p>
                <div className="bg-gray-50 p-8 rounded-xl my-12">
                  <h3 className="font-semibold text-2xl mb-4">Huidige situatie (4s)</h3>
                  <ul className="mb-6 space-y-2 list-none pl-6">
                    <li>Bezoekers: 5.000</li>
                    <li>Gemiddelde orderwaarde: €60,-</li>
                    <li>Conversie: 1,5%</li>
                    <li>Maandomzet: €4.500,-</li>
                  </ul>
                  <h3 className="font-semibold text-2xl mb-4">Met Sitedesk Edge (0ms gevoel)</h3>
                  <ul className="space-y-2 list-none pl-6">
                    <li>Bezoekers: 5.000 (gelijk)</li>
                    <li>Gemiddelde orderwaarde: €60,- (gelijk)</li>
                    <li>Conversie: 2,2% (conservatief)</li>
                    <li>Maandomzet: €6.600,-</li>
                  </ul>
                </div>
                <p className="text-lg leading-relaxed mb-8">
                  <strong>Resultaat:</strong> +€2.100 per maand (+€25.200 per jaar) puur door techniek. Geen Shopify app-fees van €50/maand en geen losse developer-uren meer.
                </p>
              </section>

              <section
                id="cta-breakout"
                className="bg-black text-white p-10 rounded-2xl my-16 text-center"
              >
                <h2 className="font-extrabold text-3xl">Pilot Deal: 0ms of niets</h2>
                <p className="text-lg leading-relaxed mt-4">
                  €1.000 eenmalig, €150 p/m. Inclusief hosting, onbeperkt support én doorontwikkeling. <strong>Verdient zichzelf in maand 1 terug.</strong>
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                  <Button asChild variant="hero" size="lg">
                    <a href="/#contact">Plan je Speed-Check</a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer">
                      WhatsApp direct
                    </a>
                  </Button>
                </div>
              </section>

              <section id="waarom-sitedesk">
                <h2 className="font-extrabold text-3xl mt-24 mb-8">Waarom Sitedesk de logische investering is</h2>
                <p className="text-lg leading-relaxed mb-8">
                  Een nieuwe shop voelt vaak als een kostenpost. <strong>Wij zien het als het verwijderen van een blok aan je been.</strong> Onze Pilot Deal verdient zichzelf direct terug en verlaagt je hoofdpijn-belasting.
                </p>
                <div className="pl-6 border-left-4 border-yellow-400 my-10 space-y-4">
                  <div className="flex items-start gap-3">
                    <svg aria-hidden="true" className="mt-1 w-4 h-4 text-[#FFB800]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Geen server-onderhoud.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg aria-hidden="true" className="mt-1 w-4 h-4 text-[#FFB800]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Geen trage admin-dashboards: beheer alles in Google Sheets.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg aria-hidden="true" className="mt-1 w-4 h-4 text-[#FFB800]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Wij zijn je tech-team: wij bouwen, beheren en optimaliseren.</span>
                  </div>
                </div>
              </section>

              <section id="klaar-edge">
                <h2 className="font-extrabold text-3xl mt-24 mb-8">Klaar voor 0ms? Zo pakken we het aan</h2>
                <p className="text-lg leading-relaxed mb-8">
                  <strong>Snelheid is het verschil tussen winnen en verliezen.</strong> Wil je weten hoeveel omzet je nu laat liggen?
                </p>
                <p className="text-lg leading-relaxed mb-8">
                  <a href="/#contact" className="text-accent font-semibold">Plan een gratis Speed-Check</a> of{" "}
                  <a href="https://wa.me/31640326650" className="text-accent font-semibold">stuur een WhatsApp</a>. We laten je zien wat 0ms voor jouw merk doet.
                </p>
              </section>
            </section>

            <aside className="hidden lg:block sticky top-28 self-start">
              <div className="rounded-2xl border border-border bg-card/70 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Inhoudsopgave</h3>
                <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1 ${
                        activeSection === item.id
                          ? "text-foreground bg-accent/10 border border-accent/30"
                          : "hover:text-foreground"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          </div>

          <section className="mt-16 space-y-6">
            <div className="rounded-2xl border border-border bg-card/80 p-6">
              <h4 className="text-lg font-semibold text-foreground">Geschreven door</h4>
              <p className="text-foreground font-bold">Roeland</p>
              <p className="text-muted-foreground text-sm">E-commerce Architect bij Sitedesk</p>
              <p className="text-muted-foreground mt-2">
                Specialist in edge-performance en conversiegedreven checkout flows voor ambitieuze merken.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold text-foreground">Gerelateerde artikelen</h4>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  "Edge Commerce: zo haal je 100/100 op Core Web Vitals",
                  "Waarom je checkout 2 kliks moet zijn (en niets meer)",
                  "Migreren zonder omzetverlies: een 10-dagen draaiboek",
                ].map((relTitle) => (
                  <div key={relTitle} className="p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow">
                    <h5 className="text-lg font-semibold text-foreground leading-snug">{relTitle}</h5>
                    <p className="text-sm text-muted-foreground mt-2">Lees hoe Sitedesk dit in praktijk brengt voor scale-ups.</p>
                    <a href="/blog" className="text-accent text-sm font-semibold mt-3 inline-block">Lees artikel</a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-16">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">Meer artikelen</h3>
            </div>
            <Pagination />
            <div className="grid md:grid-cols-2 gap-6">
              {listing.map((post) => (
                <article key={post.slug} className="p-5 rounded-2xl border border-border bg-card shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    <a href={`/blog/${post.slug}?page=${page}`} className="hover:text-accent transition-colors">
                      {post.title}
                    </a>
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-2xs px-2 py-1 rounded-full bg-secondary/60 text-muted-foreground border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <Pagination />
          </section>
        </article>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default BlogPost;
