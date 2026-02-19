import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CalendarDays, Tag } from "lucide-react";
import { posts, PAGE_SIZE, paginate, type Post } from "@/lib/blogData";
import { Helmet } from "react-helmet-async";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

const Pagination = ({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 my-8">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onChange(Math.max(1, page - 1))}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Vorige
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "hero" : "outline"}
          size="sm"
          onClick={() => onChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
      >
        Volgende
        <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

const Blog = () => {
  const [page, setPage] = useState(1);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(posts.length / PAGE_SIZE)), []);
  const visiblePosts = useMemo(() => paginate(posts, page, PAGE_SIZE), [page]);
  const title = "Blog | Sitedesk";
  const description =
    "Praktische inzichten over edge-performance, CRO, checkout en schaalbare e-commerce architectuur.";
  const canonical = "https://sitedesk.co/blog";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
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
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Inzichten voor ambitieuze webshops</h1>
            <p className="text-lg text-muted-foreground">
              Praktische artikelen over edge-performance, CRO, checkout en beheer zonder developers. We schrijven vanuit de praktijk van managed headless webshops.
            </p>
          </div>
        </section>

        <section className="container mx-auto pb-12">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />

          <div className="grid md:grid-cols-2 gap-8">
            {visiblePosts.map((post) => (
              <article
                key={post.id}
                className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <CalendarDays className="w-4 h-4" />
                  <span suppressHydrationWarning>{formatDate(post.date)}</span>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  <a href={`/blog/${post.id}`} className="hover:text-accent transition-colors">
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
                  <a href={`/blog/${post.id}`}>Lees meer</a>
                </Button>
              </article>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Blog;
