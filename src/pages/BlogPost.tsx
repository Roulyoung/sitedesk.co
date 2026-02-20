import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { CalendarDays, Tag, ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { getPostsForLocale, PAGE_SIZE, paginate, type ContentBlock } from "@/lib/blogData";
import { Helmet } from "react-helmet-async";
import { getAlternateHrefLangs, getLandingSectionHash, getLocaleFromPath, stripLocaleFromPath, withLocalePath } from "@/lib/i18n";

const formatDate = (value: string, isEn: boolean) =>
  new Intl.DateTimeFormat(isEn ? "en-GB" : "nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

const BlogPost = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";
  const posts = useMemo(() => getPostsForLocale(locale), [locale]);
  const pathWithoutLocale = stripLocaleFromPath(location.pathname);
  const alternateLinks = getAlternateHrefLangs(pathWithoutLocale);
  const searchParams = new URLSearchParams(location.search);
  const initialPage = Number(searchParams.get("page")) || 1;

  const current = posts.find((p) => p.id === slug) ?? posts[0];
  const otherPosts = posts.filter((p) => p.id !== current.id);
  const [page, setPage] = useState(initialPage);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(otherPosts.length / PAGE_SIZE) || 1), [otherPosts.length]);
  const listing = useMemo(() => paginate(otherPosts, page, PAGE_SIZE), [page, otherPosts]);

  const title = current.title;
  const description = current.excerpt;
  const publishedDate = formatDate(current.date, isEn);
  const readingTime = current.readingTime ?? "6 min";
  const canonical = `https://sitedesk.co${location.pathname}`;
  const isBrowser = typeof window !== "undefined";

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const headingIds = useMemo(() => {
    let count = 0;
    return current.content.map((block) => {
      if (block.type === "h2") {
        const id = `${slugify(block.value)}-${count}`;
        count += 1;
        return id;
      }
      return null;
    });
  }, [current.content]);
  const ldJson = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: current.date,
    dateModified: current.date,
    author: { "@type": "Organization", name: "Sitedesk" },
    publisher: {
      "@type": "Organization",
      name: "Sitedesk",
      logo: { "@type": "ImageObject", url: "https://sitedesk.co/icon-sitedesk.png" },
    },
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
  };

  const handleBack = () => navigate(`${withLocalePath("/blog", locale)}?page=${page}`);

  const Pagination = () => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
      <div className="flex items-center justify-center gap-2 my-8">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          {isEn ? "Previous" : "Vorige"}
        </Button>
        {pages.map((p) => (
          <Button key={p} variant={p === page ? "hero" : "outline"} size="sm" onClick={() => setPage(p)}>
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
        >
          {isEn ? "Next" : "Volgende"}
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  };

  useEffect(() => {
    if (!isBrowser) return;
    const targets = headingIds
      .map((id) => (id ? document.getElementById(id) : null))
      .filter((el): el is Element => Boolean(el));
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 1] },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headingIds, isBrowser]);

  const handleTocClick = (id: string) => {
    if (!isBrowser) return;
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActiveHeading(id);
  };

  const renderBlock = (block: ContentBlock, idx: number) => {
    switch (block.type) {
      case "h2":
        return (
          <h2 key={idx} id={headingIds[idx] ?? undefined} className="font-extrabold text-3xl mt-24 mb-8 scroll-mt-28">
            {block.value}
          </h2>
        );
      case "text":
        return (
          <p key={idx} className="text-lg leading-relaxed mb-8">
            {block.value}
          </p>
        );
      case "calc_box":
        if (!block.data) return null;
        const hasColumns =
          (block.data.leftItems && block.data.leftItems.length > 0) ||
          (block.data.rightItems && block.data.rightItems.length > 0);
        const singleItems = block.data.items && block.data.items.length > 0 ? block.data.items : null;
        return (
          <div key={idx} className="bg-gray-50 p-8 rounded-xl my-12">
            {block.data.title && <h3 className="font-semibold text-2xl mb-6">{block.data.title}</h3>}
            {hasColumns ? (
              <div className="grid md:grid-cols-2 gap-8">
                {(block.data.leftItems?.length || block.data.leftTitle) && (
                  <div>
                    {block.data.leftTitle && <h3 className="font-semibold text-xl mb-4">{block.data.leftTitle}</h3>}
                    {block.data.leftItems && (
                      <ul className="space-y-2 list-none pl-6">
                        {block.data.leftItems.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {(block.data.rightItems?.length || block.data.rightTitle) && (
                  <div>
                    {block.data.rightTitle && <h3 className="font-semibold text-xl mb-4">{block.data.rightTitle}</h3>}
                    {block.data.rightItems && (
                      <ul className="space-y-2 list-none pl-6">
                        {block.data.rightItems.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ) : (
              singleItems && (
                <ul className="space-y-2 list-none pl-6">
                  {singleItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )
            )}
            {block.data.summary && (
              <p className="text-lg leading-relaxed mt-6">
                <strong>{block.data.summary}</strong>
              </p>
            )}
          </div>
        );
      case "cta_box":
        return (
          <section key={idx} className="bg-black text-white p-10 rounded-2xl my-16 text-center">
            <h2 className="font-extrabold text-3xl">{block.data?.title ?? "Pilot Deal"}</h2>
            <p className="text-lg leading-relaxed mt-4">
              {block.data?.body ??
                (isEn
                  ? "EUR 1,000 one-time, EUR 150 p/m. Includes hosting, unlimited support, and continuous development."
                  : "â¬1.000 eenmalig, â¬150 p/m. Inclusief hosting, onbeperkt support Ã©n doorontwikkeling.")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <Button asChild variant="hero" size="lg">
                <a href={`${withLocalePath("/", locale)}${getLandingSectionHash(locale, "contact")}`}>{isEn ? "Plan your speed check" : "Plan je Speed-Check"}</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer">
                  {isEn ? "WhatsApp now" : "WhatsApp direct"}
                </a>
              </Button>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${title} | Sitedesk Blog`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        {alternateLinks.map((alt) => (
          <link key={alt.locale} rel="alternate" hrefLang={alt.locale} href={alt.href} />
        ))}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
      </Helmet>
      <Header />
      <main className="pt-24">
        <article className="container mx-auto max-w-5xl pb-20">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {isEn ? "Back to blog overview" : "Terug naar blogoverzicht"}
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {isEn ? "High-performance e-commerce insights" : "High-performance e-commerce inzichten"}
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
                {description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span suppressHydrationWarning>{publishedDate}</span>
                </span>
                {current.tags && (
                  <span className="inline-flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {current.tags.join(", ")}
                  </span>
                )}
                <span className="inline-flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  {readingTime} {isEn ? "read time" : "leestijd"}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="hero" size="sm">
                  <a href={`${withLocalePath("/", locale)}${getLandingSectionHash(locale, "contact")}`}>{isEn ? "Plan a speed check" : "Plan een Speed-Check"}</a>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-accent text-accent hover:bg-accent/10">
                  <a href="https://wa.me/31640326650" target="_blank" rel="noreferrer">
                    {isEn ? "WhatsApp now" : "WhatsApp direct"}
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-10 grid lg:grid-cols-[1fr,280px] gap-10">
            <h2 className="sr-only">{isEn ? "Article content" : "Artikelinhoud"}</h2>
            <section className="article-body max-w-[720px] mx-auto text-lg leading-relaxed text-foreground space-y-12">
              {current.content.map((block, idx) => renderBlock(block, idx))}
            </section>

            <aside className="hidden lg:block sticky top-28 self-start">
              <div className="rounded-2xl border border-border bg-card/70 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{isEn ? "Table of contents" : "Inhoudsopgave"}</h3>
                <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {current.content
                    .map((c, i) => ({ block: c, id: headingIds[i] }))
                    .filter((item) => item.block.type === "h2" && item.id)
                    .map((item, i) => {
                      const active = activeHeading ? activeHeading === item.id : i === 0;
                      return (
                        <button
                          key={`${(item.block as any).value}-${item.id}`}
                          onClick={() => item.id && handleTocClick(item.id)}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors ${
                            active ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${active ? "bg-accent" : "bg-border"}`}
                            aria-hidden
                          />
                          {(item.block as any).value}
                        </button>
                      );
                    })}
                </nav>
              </div>
            </aside>
          </div>

          <section className="mt-16 space-y-6">
            <div className="rounded-2xl border border-border bg-card/80 p-6">
              <h3 className="text-lg font-semibold text-foreground">{isEn ? "Written by" : "Geschreven door"}</h3>
              <p className="text-foreground font-bold">Roeland</p>
              <p className="text-muted-foreground text-sm">{isEn ? "E-commerce Architect at Sitedesk" : "E-commerce Architect bij Sitedesk"}</p>
              <p className="text-muted-foreground mt-2">
                {isEn
                  ? "Specialist in edge performance and conversion-focused checkout flows for ambitious brands."
                  : "Specialist in edge-performance en conversiegedreven checkout flows voor ambitieuze merken."}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">{isEn ? "Related articles" : "Gerelateerde artikelen"}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{isEn ? "Our most relevant articles will appear here soon." : "Binnenkort vind je hier onze meest relevante artikelen."}</p>
            </div>
          </section>

          <section className="mt-16">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">{isEn ? "More articles" : "Meer artikelen"}</h3>
            </div>
            <Pagination />
            <div className="grid md:grid-cols-2 gap-6">
              {listing.map((post) => (
                <article key={post.id} className="p-5 rounded-2xl border border-border bg-card shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <CalendarDays className="w-4 h-4" />
                    <span suppressHydrationWarning>{formatDate(post.date, isEn)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    <a href={`${withLocalePath(`/blog/${post.id}`, locale)}?page=${page}`} className="hover:text-accent transition-colors">
                      {post.title}
                    </a>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{post.excerpt}</p>
                  {post.tags && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-2xs px-2 py-1 rounded-full bg-secondary/60 text-muted-foreground border border-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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
