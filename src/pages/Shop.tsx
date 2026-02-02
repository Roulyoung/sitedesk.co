import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2, Plus, Minus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Link } from "react-router-dom";

type Product = {
  name: string;
  price: string;
  image?: string;
  stripe_link?: string;
  price_id?: string;
  priceCents?: number;
  id?: string;
  slug?: string;
  description?: string;
  category?: string;
  tags?: string[];
};

const PRODUCTS_ENDPOINT = "https://stripe-webhook.rdo90.workers.dev/products";
const CHECKOUT_ENDPOINT = "https://stripe-webhook.rdo90.workers.dev/create-checkout-session";

const currency = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const parsePriceToCents = (value: string) => {
  const numeric = parseFloat(value.replace(/[^\d.,-]/g, "").replace(",", "."));
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round(numeric * 100);
};

const normalizePrice = (value: string) => {
  const numeric = parseFloat(value.replace(/[^\d.,-]/g, "").replace(",", "."));
  if (Number.isFinite(numeric)) {
    return currency.format(numeric);
  }
  return value || "€0,00";
};

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(PRODUCTS_ENDPOINT);
        if (!response.ok) throw new Error("Kon producten niet laden");
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          throw new Error("Onverwachte serverrespons (geen geldige JSON)");
        }
        const mapped =
          data?.products?.map((row: any, idx: number) => {
            const name =
              row.name ||
              row.naam ||
              row.omschrijving ||
              row.description ||
              row.slug ||
              `Product ${idx + 1}`;
            const sale = row.sale_price || row.sale || "";
            const basePrice = sale && parsePriceToCents(String(sale)) > 0 ? sale : row.price || row.prijs || "";
            const priceCents = parsePriceToCents(String(basePrice || "0"));
            const priceDisplay = normalizePrice(String(basePrice || "0"));
            const tags = ["tag1", "tag2", "tag3", "tag4", "tag5"]
              .map((t) => (row[t] || "").toString().trim())
              .filter(Boolean);
            const slug = (row.slug || row.id || "").toString();
            return {
              id: (slug || name || `item-${idx}`).toString(),
              slug,
              name: name.toString(),
              price: priceDisplay,
              price_id: row.price_id || "",
              priceCents,
              image: row.image || "",
              stripe_link: row.stripe_link || "",
              description: row.description || row.omschrijving || "",
              category: row.category || "",
              tags,
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

  const displayProducts = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        price: normalizePrice(p.price || "0"),
        priceCents: parsePriceToCents(p.price || "0"),
        id: p.id || p.slug || p.name || "product",
      })),
    [products],
  );

  type CartItem = {
    id: string;
    name: string;
    price: string;
    priceCents: number;
    stripe_link?: string;
    price_id?: string;
    image?: string;
    quantity: number;
  };

  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    const priceCents = product.priceCents || parsePriceToCents(product.price || "0");
    if (!priceCents || priceCents <= 0) {
      setError("Geen geldige prijs beschikbaar voor dit product.");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === (product.id || product.name));
      if (existing) {
        return prev.map((item) =>
          item.id === (product.id || product.name)
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: product.id || product.name || "product",
          name: product.name || "Product",
          price: product.price || "",
          priceCents,
          stripe_link: product.stripe_link,
          price_id: product.price_id,
          image: product.image,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Je mandje is leeg.");
      return;
    }

    const nonLinkItems = cart.filter((item) => !item.stripe_link);
    const linkItems = cart.filter((item) => item.stripe_link);

    if (nonLinkItems.length === 0 && linkItems.length === 1) {
      window.location.href = linkItems[0].stripe_link as string;
      return;
    }

    try {
      setError(null);
      setCheckoutLoadingId("cart");
      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.priceCents / 100,
            quantity: item.quantity,
          })),
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
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-20 md:py-28">
        <div className="text-center mb-12">
          <p className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
            <ArrowRight size={16} />
            Shop
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-4">
            Shop onze producten
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Kies uit de beschikbare producten en bestel direct via onze Stripe links.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        )}

        {error && (
          <div className="text-center text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-4 max-w-xl mx-auto">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((product, idx) => (
              <div
                key={`${product.name}-${idx}`}
                className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4"
              >
                {product.image ? (
                  <Link to={`/product/${product.slug || product.id || ""}`} className="block group">
                    <img
                      src={product.image}
                      alt={product.name || "Product"}
                      className="object-cover h-64 w-full rounded-lg transition group-hover:opacity-90"
                      loading="lazy"
                    />
                  </Link>
                ) : (
                  <div className="h-64 w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    Geen afbeelding
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-2">
                  <Link to={`/product/${product.slug || product.id || ""}`}>
                    <h3 className="font-bold text-lg text-foreground line-clamp-2 hover:text-primary transition">
                      {product.name || "Naam onbekend"}
                    </h3>
                  </Link>
                  <p className="text-primary font-semibold">{product.price}</p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition"
                >
                  In winkelmand
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Cart Summary */}
        <div id="winkelmand" className="mt-12 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">Winkelmand</h3>
            <span className="text-sm text-muted-foreground">
              {cart.length} item{cart.length === 1 ? "" : "s"}
            </span>
          </div>
          {cart.length === 0 ? (
            <p className="text-muted-foreground">Je mandje is leeg.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b border-border pb-3"
                >
                  <div>
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 rounded-md border border-border hover:bg-muted transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 rounded-md border border-border hover:bg-muted transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground">Totaal</span>
                <span className="font-semibold text-foreground">
                  {currency.format(
                    cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0) / 100,
                  )}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoadingId === "cart"}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {checkoutLoadingId === "cart" ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Bezig met afrekenen...
                  </>
                ) : (
                  <>
                    Naar de kassa
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Shop;
