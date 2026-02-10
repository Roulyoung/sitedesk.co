import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CalendarDays, Tag } from "lucide-react";

type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  tags: string[];
};

const allPosts: BlogPost[] = [
  {
    title: "Edge-first e-commerce: waarom laadtijd de nieuwe merkbeleving is",
    slug: "edge-first-ecommerce",
    excerpt: "Ontdek hoe een edge-architectuur je conversie verhoogt en hostingkosten verlaagt.",
    date: "2026-02-01",
    tags: ["Edge", "Performance", "E-commerce"],
  },
  {
    title: "Google Sheets als CMS: zo beheer je 10.000 SKU's zonder developers",
    slug: "sheets-cms-sku",
    excerpt: "Praktische tips om grote catalogi te beheren vanuit Sheets met realtime sync.",
    date: "2026-01-25",
    tags: ["Sheets", "Operations", "CMS"],
  },
  {
    title: "Stripe Lean Checkout: verdubbel je mobiele conversie",
    slug: "stripe-lean-checkout",
    excerpt: "Een breakdown van een ultra-snelle checkout flow die frictie minimaliseert.",
    date: "2026-01-18",
    tags: ["Checkout", "Stripe", "CRO"],
  },
  {
    title: "Migreren van WooCommerce: wat je in week 1 geregeld moet hebben",
    slug: "migreren-woocommerce",
    excerpt: "Een checklist voor een soepele migratie zonder omzetverlies.",
    date: "2026-01-10",
    tags: ["Migratie", "WooCommerce"],
  },
  {
    title: "Shopify app-fees vs. headless vast bedrag: de echte TCO",
    slug: "shopify-tco",
    excerpt: "We rekenen de verborgen kosten door en vergelijken met een managed headless stack.",
    date: "2025-12-20",
    tags: ["Kosten", "Shopify", "TCO"],
  },
  {
    title: "CRO in 5 dagen: welke quick wins elke shop kan doen",
    slug: "cro-quick-wins",
    excerpt: "Snelle A/B-ideeën die direct impact maken op je conversie.",
    date: "2025-12-05",
    tags: ["CRO", "Optimalisatie"],
  },
  {
    title: "Zero trust voor webshops: zo bescherm je klantdata op de Edge",
    slug: "zero-trust-webshops",
    excerpt: "Beveiligingsprincipes die je kunt toepassen zonder complexiteit voor je team.",
    date: "2025-11-15",
    tags: ["Security", "Edge"],
  },
  {
    title: "Black Friday zonder stress: autoscaling zonder servers",
    slug: "black-friday-stress",
    excerpt: "Hoe je piekverkeer opvangt zonder servers warm te draaien.",
    date: "2025-11-01",
    tags: ["Scaling", "Events"],
  },
  {
    title: "Productfeeds en marketplaces: zo houd je prijzen realtime gelijk",
    slug: "productfeeds-marketplaces",
    excerpt: "Synchroniseer prijzen en voorraad over kanalen zonder inconsistencies.",
    date: "2025-10-20",
    tags: ["Integraties", "Feeds"],
  },
];

const PAGE_SIZE = 6;

const paginate = (items: BlogPost[], page: number, perPage: number) => {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
};

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
  const totalPages = useMemo(() => Math.max(1, Math.ceil(allPosts.length / PAGE_SIZE)), []);
  const posts = useMemo(() => paginate(allPosts, page, PAGE_SIZE), [page]);

  return (
    <div className="min-h-screen bg-background">
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
            {posts.map((post) => (
              <article
                key={post.slug}
                className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <CalendarDays className="w-4 h-4" />
                  <span>{new Date(post.date).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  <a href={`/blog/${post.slug}`} className="hover:text-accent transition-colors">
                    {post.title}
                  </a>
                </h2>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-secondary/60 text-muted-foreground border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
                <Button asChild variant="heroOutline" size="sm">
                  <a href={`/blog/${post.slug}`}>Lees meer</a>
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
