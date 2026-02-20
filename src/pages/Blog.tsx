import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CalendarDays, Tag } from "lucide-react";
import { getPostsForLocale, PAGE_SIZE, paginate } from "@/lib/blogData";
import { Helmet } from "react-helmet-async";
import { getAlternateHrefLangs, getLocaleFromPath, stripLocaleFromPath, withLocalePath } from "@/lib/i18n";
import { useLocation } from "react-router-dom";

const formatDate = (value: string, locale: "nl" | "en") =>
  new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

const Pagination = ({
  page,
  totalPages,
  onChange,
  prevLabel,
  nextLabel,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  prevLabel: string;
  nextLabel: string;
}) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 my-8">
      <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onChange(Math.max(1, page - 1))}>
        <ArrowLeft className="w-4 h-4 mr-1" />
        {prevLabel}
      </Button>
      {pages.map((p) => (
        <Button key={p} variant={p === page ? "hero" : "outline"} size="sm" onClick={() => onChange(p)}>
          {p}
        </Button>
      ))}
      <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => onChange(Math.min(totalPages, page + 1))}>
        {nextLabel}
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

const Blog = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";
  const posts = useMemo(() => getPostsForLocale(locale), [locale]);
  const pathWithoutLocale = stripLocaleFromPath(location.pathname);
  const alternateLinks = getAlternateHrefLangs(pathWithoutLocale);
  const [page, setPage] = useState(1);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(posts.length / PAGE_SIZE)), [posts.length]);
  const visiblePosts = useMemo(() => paginate(posts, page, PAGE_SIZE), [page, posts]);
  const title = "Blog | Sitedesk";
  const description = isEn
    ? "Practical insights on edge performance, CRO, checkout, and scalable e-commerce architecture."
    : "Praktische inzichten over edge-performance, CRO, checkout en schaalbare e-commerce architectuur.";
  const canonical = `https://sitedesk.co${withLocalePath("/blog", locale)}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        {alternateLinks.map((alt) => (
          <link key={alt.locale} rel="alternate" hrefLang={alt.locale} href={alt.href} />
        ))}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
      </Helmet>
      <Header />
      <main className="pt-24">
        <section className="container mx-auto pb-12">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-semibold">
              <Tag className="w-4 h-4" />
              Blog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              {isEn ? "Insights for ambitious webshops" : "Inzichten voor ambitieuze webshops"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isEn
                ? "Practical articles on edge performance, CRO, checkout, and operations without developers."
                : "Praktische artikelen over edge-performance, CRO, checkout en beheer zonder developers. We schrijven vanuit de praktijk van managed headless webshops."}
            </p>
          </div>
        </section>

        <section className="container mx-auto pb-12">
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            prevLabel={isEn ? "Previous" : "Vorige"}
            nextLabel={isEn ? "Next" : "Volgende"}
          />

          <div className="grid md:grid-cols-2 gap-8">
            {visiblePosts.map((post) => (
              <article
                key={post.id}
                className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <CalendarDays className="w-4 h-4" />
                  <span suppressHydrationWarning>{formatDate(post.date, isEn ? "en" : "nl")}</span>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  <a href={withLocalePath(`/blog/${post.id}`, locale)} className="hover:text-accent transition-colors">
                    {post.title}
                  </a>
                </h2>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                {post.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full bg-secondary/60 text-muted-foreground border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Button asChild variant="heroOutline" size="sm">
                  <a href={withLocalePath(`/blog/${post.id}`, locale)}>{isEn ? "Read more" : "Lees meer"}</a>
                </Button>
              </article>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            prevLabel={isEn ? "Previous" : "Vorige"}
            nextLabel={isEn ? "Next" : "Volgende"}
          />
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Blog;
