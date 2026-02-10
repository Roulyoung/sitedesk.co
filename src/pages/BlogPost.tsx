import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { CalendarDays, Tag } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();
  const title = "Lorem Ipsum Guide voor High-Performance Webshops";
  const description =
    "Een voorbeeldblog die laat zien hoe je content structureert voor SEO en leesbaarheid, inclusief headings, meta-informatie en duidelijke calls-to-action.";

  useEffect(() => {
    document.title = `${title} | Sitedesk Blog`;
  }, [title]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        <article className="container mx-auto max-w-3xl pb-20">
          <header className="space-y-4 mb-8">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Blog</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{title}</h1>
            <p className="text-lg text-muted-foreground">{description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                1 februari 2026
              </span>
              <span className="inline-flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Edge, CRO, Checkout
              </span>
              <span className="inline-flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Slug: {slug}
              </span>
            </div>
          </header>

          <section className="prose prose-invert prose-lg max-w-none">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error
              sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
              veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
            <h2>Waarom structuur telt voor SEO</h2>
            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
              dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor
              sit amet.
            </p>
            <h3>Snelle kernpunten</h3>
            <ul>
              <li>Gebruik duidelijke headings (H1, H2, H3) voor scanbaarheid.</li>
              <li>Schrijf compacte alinea&apos;s met 1 hoofdgedachte.</li>
              <li>Link intern naar relevante product- of featurepagina&apos;s.</li>
            </ul>
            <p>
              At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti
              atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
            </p>
            <h3>Call to action</h3>
            <p>
              Wil je weten hoe dit werkt voor jouw webshop? Plan een call of stuur ons een WhatsApp, wij regelen de
              technische kant.
            </p>
          </section>
        </article>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default BlogPost;
