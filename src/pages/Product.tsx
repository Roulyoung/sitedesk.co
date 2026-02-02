import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { ArrowRight, Loader2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  priceDisplay: string;
  image?: string;
  stripe_link?: string;
  price_id?: string;
  slug?: string;
};

const PRODUCTS_ENDPOINT = "https://stripe-webhook.rdo90.workers.dev/products";
const CHECKOUT_ENDPOINT = "https://stripe-webhook.rdo90.workers.dev/create-checkout-session";

const currency = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const ProductPage = () => {
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(PRODUCTS_ENDPOINT);
        if (!res.ok) throw new Error("Kon producten niet laden");
        const text = await res.text();
        const data = JSON.parse(text);
    const mapped =
      data?.products?.map((row: any, idx: number) => {
        const name =
          row.name ||
          row.naam ||
              row.omschrijving ||
              row.description ||
              row.slug ||
              `Product ${idx + 1}`;
        const rawPrice = row.sale_price || row.sale || row.price || row.prijs || "0";
        const priceCents = parsePriceToCents(String(rawPrice));
        const slug = (row.slug || row.id || name || `item-${idx}`).toString();
        return {
          id: slug,
          slug,
          name: name.toString(),
          description: row.description || row.omschrijving || "",
          priceCents,
          priceDisplay: formatPrice(priceCents),
          image: row.image || "",
              stripe_link: row.stripe_link || "",
              price_id: row.price_id || "",
            } as Product;
          }) || [];
        setProducts(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const product = useMemo(
    () => products.find((p) => p.id === (id || "") || p.slug === (id || "")),
    [products, id],
  );

  const handleCheckout = async () => {
    if (!product) return;
    // If a direct Stripe link exists, use it
    if (product.stripe_link) {
      window.location.href = product.stripe_link;
      return;
    }
    try {
      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: [
            {
              id: product.id,
              name: product.name,
              price: product.priceCents / 100,
              quantity: 1,
            },
          ],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Aanmaken van checkout sessie mislukt");
      }
      const data = await res.json();
      if (!data?.url) throw new Error("Geen checkout URL ontvangen");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout mislukt");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </main>
        <Footer />
        <FloatingContact />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-lg text-center space-y-4">
            <h1 className="text-3xl font-semibold">Product niet gevonden</h1>
            <p className="text-muted-foreground">{error || "Controleer de link of ga terug naar de shop."}</p>
            <a
              href="/shop"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              ← Terug naar shop
            </a>
          </div>
        </main>
        <Footer />
        <FloatingContact />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-gray-100 flex items-center justify-center">
                <img
                  src={product.image || "https://dummyimage.com/800x600/edf2f7/1a202c&text=Product"}
                  alt={product.name}
                  className="object-cover w-full h-full max-h-[520px]"
                />
              </div>
              <div className="p-8 space-y-4">
                <p className="text-sm uppercase tracking-wide text-gray-500">Product</p>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="text-2xl font-semibold text-emerald-600">
                  {product.priceDisplay || formatPrice(product.priceCents)}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || "Geen beschrijving beschikbaar."}
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCheckout}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                  >
                    Bestel nu
                    <ArrowRight size={16} />
                  </button>
                  <a
                    href="/shop"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition"
                  >
                    Terug naar shop
                  </a>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

function parsePriceToCents(value: string) {
  const numeric = parseFloat(value.replace(/[^\d.,-]/g, "").replace(",", "."));
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round(numeric * 100);
}

function formatPrice(cents: number) {
  const f = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
  return f.format(cents / 100);
}

export default ProductPage;
