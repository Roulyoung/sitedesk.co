import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { CalendarDays, Tag, ArrowLeft, ArrowRight } from "lucide-react";
import { blogPosts, PAGE_SIZE, paginate } from "@/lib/blogData";

const BlogPost = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const initialPage = Number(searchParams.get("page")) || 1;
  const [page, setPage] = useState(initialPage);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(blogPosts.length / PAGE_SIZE)), []);
  const listing = useMemo(() => paginate(blogPosts, page, PAGE_SIZE), [page]);
  const current = blogPosts.find((p) => p.slug === slug) ?? blogPosts[0];

  const title = current.title;
  const description =
    "Hoe elke seconde vertraging direct omzet kost en waarom Edge-architectuur dit definitief oplost.";

  useEffect(() => {
    document.title = `${title} | Sitedesk Blog`;
    setPage(initialPage);
  }, [title]);

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
        <article className="container mx-auto max-w-3xl pb-20">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Terug naar blogoverzicht
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              High-performance e-commerce inzichten
            </div>
          </div>
          <header className="space-y-4 mb-8">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Blog</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{title}</h1>
            <p className="text-lg text-muted-foreground">{description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                10 februari 2026
              </span>
              <span className="inline-flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Performance, Edge, CRO
              </span>
            </div>
          </header>

          <section className="prose prose-invert prose-lg max-w-none">
            <p>
              Hoe elke seconde vertraging je direct omzet kost en waarom de Edge-architectuur dit definitief oplost.
            </p>
            <p>
              Je opent een webshop op je telefoon. Je ziet een wit scherm. Eén seconde gaat voorbij... twee seconden... drie...
              Je bent weg, toch? Je bent niet de enige. In 2026 is de online consument ongeduldiger dan ooit. Snelheid is
              niet langer een &quot;nice-to-have&quot; feature; het is de fundering van je winstgevendheid.
            </p>
            <h2>De harde cijfers: Elke seconde telt (letterlijk)</h2>
            <p>
              Wanneer we zeggen dat traagheid omzet kost, baseren we dat niet op een onderbuikgevoel. De data van tech-giganten is onverbiddelijk:
            </p>
            <ul>
              <li>
                <strong>De 53%-grens:</strong> Volgens onderzoek van Google verlaat 53% van de mobiele bezoekers een website als het laden langer dan 3 seconden duurt. (Bron: Google/SOASTA Research)
              </li>
              <li>
                <strong>Conversie-killer:</strong> Portent toonde aan dat een website die in 1 seconde laadt, een conversiepercentage heeft dat 3x hoger is dan een site die er 5 seconden over doet. (Bron: Portent Speed Study)
              </li>
              <li>
                <strong>Het Amazon-effect:</strong> Al jaren geleden ontdekte Amazon dat elke 100 milliseconden (0,1 seconde!) extra vertraging hen 1% van de totale omzet kostte. (Bron: Amazon Strategy Audit)
              </li>
            </ul>
            <p>
              De conclusie? Als jouw shop op Shopify of WooCommerce draait en een laadtijd heeft van 4 seconden, gooi je technisch gezien de helft van je marketingbudget direct in de prullenbak.
            </p>
            <h2>Het probleem van de &quot;Centrale Database&quot;</h2>
            <p>
              Waarom zijn traditionele shops traag? Omdat ze werken met een ouderwetse structuur. Wanneer een klant klikt, moet er een verzoek naar een centrale server (vaak in Duitsland of de VS). Die server moet een database induiken, pagina’s opbouwen en ze weer terugsturen. Dit noemen we latency. Hoe meer plugins, hoe meer &quot;verkeer&quot; op die lijn, hoe trager de shop.
            </p>
            <h2>De Oplossing: Edge-architectuur (De Sitedesk Engine)</h2>
            <p>Bij Sitedesk doen we het anders. Wij gebruiken de Cloudflare Edge-architectuur. In plaats van één centrale server, staat jouw webshop op duizenden servers over de hele wereld tegelijk.</p>
            <ul>
              <li><strong>0ms vertraging:</strong> De shop staat fysiek al &quot;naast&quot; de bezoeker.</li>
              <li><strong>Geen Database-calls:</strong> We serveren data direct vanaf de Edge.</li>
              <li><strong>Headless-snelheid:</strong> De voorkant (wat de klant ziet) is volledig ontkoppeld van de achterkant (jouw Google Sheets).</li>
            </ul>
            <h2>De Rekensom: Wat levert 0ms je op?</h2>
            <p>
              Laten we stoppen met praten over techniek en praten over rendement. Stel je voor: je hebt een bescheiden webshop.
            </p>
            <h3>Huidige situatie:</h3>
            <ul>
              <li>Bezoekers per maand: 5.000</li>
              <li>Gemiddelde orderwaarde: €60,-</li>
              <li>Huidige conversie (bij 4s laadtijd): 1,5%</li>
              <li>Maandomzet: €4.500,-</li>
            </ul>
            <h3>Sitedesk Situatie (na overstap naar 0ms):</h3>
            <ul>
              <li>Bezoekers per maand: 5.000 (blijft gelijk)</li>
              <li>Gemiddelde orderwaarde: €60,- (blijft gelijk)</li>
              <li>Nieuwe conversie (door snelheid & UX): 2,2% (een conservatieve stijging van 0,7%)</li>
              <li>Nieuwe maandomzet: €6.600,-</li>
            </ul>
            <p>
              Het verschil? €2.100,- extra omzet per maand. Dat is €25.200,- per jaar extra winst, puur door de techniek te fixen. Hier zijn de verborgen besparingen nog niet eens in meegeteld: geen dure Shopify-apps meer van €50/maand en geen urenfacturen van developers die &quot;plugins moeten updaten&quot;.
            </p>
            <h2>Waarom Sitedesk de enige logische investering is</h2>
            <p>
              Veel ondernemers zien een nieuwe webshop als een grote kostenpost. Bij Sitedesk zien we het als het verwijderen van een blok aan je been. Onze Pilot Deal (€1.000 eenmalig, €150 p/m) verdient zichzelf in het bovenstaande voorbeeld al in de éérste maand terug. Je bespaart niet alleen op verloren klanten, je bespaart ook op de &quot;hoofdpijn-belasting&quot;:
            </p>
            <ul>
              <li>Geen onderhoud aan servers.</li>
              <li>Geen trage admin-dashboards (beheer alles in Google Sheets).</li>
              <li>Wij zijn je tech-team: wij bouwen, wij beheren, jij verkoopt.</li>
            </ul>
            <h2>Klaar voor de overstap naar de Edge?</h2>
            <p>
              Snelheid is geen luxe. Het is het verschil tussen een bezoeker die koopt en een bezoeker die naar de concurrent gaat. Wil jij weten hoeveel omzet je nu laat liggen door je huidige laadtijd?
            </p>
            <p>
              <a href="/#contact" className="text-accent font-semibold">Plan een gratis Speed-Check in</a> of{" "}
              <a href="https://wa.me/31640326650" className="text-accent font-semibold">stuur ons direct een WhatsApp-bericht</a>.
              Wij kijken gratis met je mee en laten je zien wat 0ms voor jouw merk kan betekenen.
            </p>
            <p><strong>Waarom een laadtijd van 0ms geen luxe is, maar pure noodzaak.</strong></p>
            <p>
              Vond je dit een waardevol artikel? Bekijk ook onze andere blogs over hoe wij e-commerce herdefiniëren met Edge-technologie.
            </p>
          </section>

          <section className="mt-12">
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
