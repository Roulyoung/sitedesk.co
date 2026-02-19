import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2, Plus, Minus, X, SlidersHorizontal, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Link, useSearchParams } from "react-router-dom";
import { addToCart as addToCartStore, loadCart, updateQuantity as updateQtyStore, type CartItem } from "@/lib/cart";
import { useToast } from "@/components/ui/use-toast";

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
  stock?: string;
  delivery_time?: string;
  delivery_cost?: string;
  deliveryCostCents?: number;
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

const parseShippingToCents = (value: string) => {
  const numeric = parseFloat(value.replace(/[^\d.,-]/g, "").replace(",", "."));
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
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
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [addedProduct, setAddedProduct] = useState<string | null>(null);

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
            const image =
              row.image ||
              row.image1 ||
              row.image2 ||
              row.image3 ||
              row.image4 ||
              row.image5 ||
              "";
            const deliveryCostCents = parseShippingToCents(String(row.delivery_cost || row.verzendkosten || "0"));
            const deliveryTime = row.delivery_time || row.delivery || "1-2 dagen";
            const stock = row.stock || row.voorraad || "";
            return {
              id: (slug || name || `item-${idx}`).toString(),
              slug,
              name: name.toString(),
              price: priceDisplay,
              price_id: row.price_id || "",
              priceCents,
              image: image || "",
              stripe_link: row.stripe_link || "",
              description: row.description || row.omschrijving || "",
              category: row.category || "",
              tags,
              delivery_time: deliveryTime,
              delivery_cost: row.delivery_cost || row.verzendkosten || "",
              deliveryCostCents,
              stock,
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

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    () => (searchParams.get("categorie") || "").split(",").filter(Boolean),
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    () => (searchParams.get("tags") || "").split(",").filter(Boolean),
  );
  const [minPrice, setMinPrice] = useState<string>(() => searchParams.get("min_prijs") || "");
  const [maxPrice, setMaxPrice] = useState<string>(() => searchParams.get("max_prijs") || "");
  const [sortBy, setSortBy] = useState<string>(() => searchParams.get("sort") || "relevance");
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedTags([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const activeFilterChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    selectedCategories.forEach((c) => chips.push({ label: `Categorie: ${c}`, onRemove: () => toggleCategory(c) }));
    selectedTags.forEach((t) => chips.push({ label: `Tag: ${t}`, onRemove: () => toggleTag(t) }));
    if (minPrice) chips.push({ label: `Min €${minPrice}`, onRemove: () => setMinPrice("") });
    if (maxPrice) chips.push({ label: `Max €${maxPrice}`, onRemove: () => setMaxPrice("") });
    if (searchQuery) chips.push({ label: `Zoek: ${searchQuery}`, onRemove: () => setSearchQuery("") });
    return chips;
  }, [selectedCategories, selectedTags, minPrice, maxPrice, searchQuery]);

  const displayProducts = useMemo(
    () =>
      products.map((p) => ({
        ...p,
        price: normalizePrice(p.price || "0"),
        priceCents: parsePriceToCents(p.price || "0"),
        id: p.id || p.slug || p.name || "product",
        deliveryCostCents:
          typeof p.deliveryCostCents === "number"
            ? p.deliveryCostCents
            : parseShippingToCents(p.delivery_cost || "0"),
        deliveryTime: p.delivery_time || "1-2 dagen",
        stock: p.stock || "",
      })),
    [products],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    displayProducts.forEach((p) => {
      if (p.category) set.add(p.category.toString());
    });
    return Array.from(set).sort();
  }, [displayProducts]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    displayProducts.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [displayProducts]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    displayProducts.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [displayProducts]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    displayProducts.forEach((p) => (p.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    return counts;
  }, [displayProducts]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (searchQuery) next.set("q", searchQuery);
    if (selectedCategories.length > 0) next.set("categorie", selectedCategories.join(","));
    if (selectedTags.length > 0) next.set("tags", selectedTags.join(","));
    if (minPrice) next.set("min_prijs", minPrice);
    if (maxPrice) next.set("max_prijs", maxPrice);
    if (sortBy && sortBy !== "relevance") next.set("sort", sortBy);
    setSearchParams(next, { replace: true });
  }, [searchQuery, selectedCategories, selectedTags, minPrice, maxPrice, sortBy, setSearchParams]);

  const filteredProducts = useMemo(() => {
    const min = parseFloat(minPrice.replace(",", "."));
    const max = parseFloat(maxPrice.replace(",", "."));
    const q = searchQuery.trim().toLowerCase();

    const passes = (p: Product & { priceCents?: number }) => {
      if (selectedCategories.length > 0) {
        if (!p.category || !selectedCategories.includes(p.category)) return false;
      }
      if (selectedTags.length > 0) {
        const ptags = p.tags || [];
        if (!ptags.some((tag) => selectedTags.includes(tag))) return false;
      }
      if (Number.isFinite(min) && (p.priceCents || 0) < min * 100) return false;
      if (Number.isFinite(max) && (p.priceCents || 0) > max * 100) return false;
      if (q) {
        const hay = `${p.name || ""} ${p.description || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    };

    let result = displayProducts.filter(passes);

    const sortFn: Record<string, (a: Product, b: Product) => number> = {
      price_asc: (a, b) => (a.priceCents || 0) - (b.priceCents || 0),
      price_desc: (a, b) => (b.priceCents || 0) - (a.priceCents || 0),
      newest: (a, b) => {
        const adate = dateValue(a);
        const bdate = dateValue(b);
        return bdate - adate;
      },
      relevance: () => 0,
    };
    const sorter = sortFn[sortBy] || sortFn.relevance;
    result = [...result].sort(sorter);
    return result;
  }, [displayProducts, selectedCategories, selectedTags, minPrice, maxPrice, searchQuery, sortBy]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = loadCart();
    return stored;
  });

  const addToCart = (product: Product) => {
    const priceCents = product.priceCents || parsePriceToCents(product.price || "0");
    if (!priceCents || priceCents <= 0) {
      setError("Geen geldige prijs beschikbaar voor dit product.");
      return;
    }
    setCart((prev) =>
      addToCartStore(prev, {
        id: product.id || product.name || "product",
        name: product.name || "Product",
        priceCents,
        stripe_link: product.stripe_link,
        price_id: product.price_id,
        image: product.image,
        quantity: 1,
        deliveryCostCents: parsePriceToCents(product.delivery_cost || "0"),
        deliveryTime: product.delivery_time || "1-2 dagen",
        stock: product.stock || "Op voorraad",
      }),
    );
    setAddedProduct(product.name || "Product");
    toast({
      title: "Toegevoegd aan winkelmand",
      description: product.name || "Product",
    });
    setTimeout(() => setAddedProduct(null), 2000);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => updateQtyStore(prev, id, delta));
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

    const shippingCents = Math.max(...cart.map((c) => c.deliveryCostCents || 0), 0);

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
          })).concat(
            shippingCents > 0
              ? [
                  {
                    id: "shipping",
                    name: "Verzendkosten",
                    price: shippingCents / 100,
                    quantity: 1,
                  },
                ]
              : [],
          ),
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

  const handleBuyNow = async (product: Product) => {
    const priceCents = product.priceCents || parsePriceToCents(product.price || "0");
    if (!priceCents || priceCents <= 0) {
      setError("Geen geldige prijs voor dit product.");
      return;
    }
    const newItem = {
      id: product.id || product.name || "product",
      name: product.name || "Product",
      price: priceCents / 100,
      quantity: 1,
    };
    const existingCart = cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: (item.priceCents || 0) / 100,
      quantity: item.quantity,
    }));
    const shippingCentsExisting = Math.max(...cart.map((c) => c.deliveryCostCents || 0), 0);
    const shippingCentsNew = parseShippingToCents(product.delivery_cost || "0");
    const shippingCents = Math.max(shippingCentsExisting, shippingCentsNew);

    // Direct link only if cart empty and product has direct link
    if (product.stripe_link && existingCart.length === 0) {
      window.location.href = product.stripe_link;
      return;
    }
    try {
      setError(null);
      setCheckoutLoadingId(item.id);
      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: existingCart
            .concat(newItem)
            .concat(
              shippingCents > 0
                ? [
                    {
                      id: "shipping",
                      name: "Verzendkosten",
                      price: shippingCents / 100,
                      quantity: 1,
                    },
                  ]
                : [],
            ),
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

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">⚡</div>
            <div>
              <p className="font-semibold text-foreground">Snelle levering</p>
              <p className="text-sm text-muted-foreground">1-2 dagen, direct verstuurd</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">✅</div>
            <div>
              <p className="font-semibold text-foreground">Veilige betaling</p>
              <p className="text-sm text-muted-foreground">iDEAL / kaart, SSL-beveiligd</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">💬</div>
            <div>
              <p className="font-semibold text-foreground">Persoonlijke support</p>
              <p className="text-sm text-muted-foreground">Antwoord binnen 1 werkdag</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm mb-8 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal size={16} />
            Filters
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Zoek</label>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek op titel of omschrijving"
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Categorie</label>
              <div className="flex flex-wrap gap-2">
                {categories.length === 0 && <span className="text-xs text-muted-foreground">Geen categorieën</span>}
                {categories.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  const count = categoryCounts[cat] || 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1 rounded-full border text-sm transition ${
                        active ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground"
                      }`}
                    >
                      {cat} {count ? `(${count})` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Tags</label>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-auto">
                {tags.length === 0 && <span className="text-xs text-muted-foreground">Geen tags</span>}
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  const count = tagCounts[tag] || 0;
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full border text-sm transition ${
                        active ? "bg-secondary text-secondary-foreground border-primary" : "border-border text-foreground"
                      }`}
                    >
                      {tag} {count ? `(${count})` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Prijs (min - max)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
                <input
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-sm text-muted-foreground">Sorteer op:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="relevance">Relevantie</option>
                <option value="price_asc">Prijs: laag naar hoog</option>
                <option value="price_desc">Prijs: hoog naar laag</option>
                <option value="newest">Nieuwste</option>
              </select>
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Alles wissen
              </button>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredProducts.length} van {displayProducts.length} producten getoond
            </div>
          </div>

          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilterChips.map((chip, idx) => (
                <button
                  key={`${chip.label}-${idx}`}
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm text-foreground"
                >
                  {chip.label}
                  <X size={14} />
                </button>
              ))}
            </div>
          )}
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

        {!loading && !error && filteredProducts.length > 0 && (
          <>
          <h2 className="sr-only">Productoverzicht</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id || product.slug || product.name}
                className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4"
              >
                <Link
                  to={`/product/${product.slug || product.id || ""}`}
                  className="group flex-1 flex flex-col gap-3"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name || "Product"}
                      className="object-cover h-64 w-full rounded-lg transition group-hover:opacity-90"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-64 w-full rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
                      Geen afbeelding
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition">
                      {product.name || "Naam onbekend"}
                    </h3>
                    <p className="text-primary font-semibold">{product.price}</p>
                    <div className="text-sm text-muted-foreground flex flex-col gap-1">
                      <span>Levering: {product.deliveryTime || "1-2 dagen"}</span>
                      {parsePriceToCents(product.delivery_cost || "0") > 0 ? (
                        <span>Verzendkosten: {currency.format(parsePriceToCents(product.delivery_cost || "0") / 100)}</span>
                      ) : (
                        <span>Gratis verzending</span>
                      )}
                    </div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => addToCart(product)}
                    className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition"
                  >
                    In winkelmand
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => handleBuyNow(product)}
                    disabled={checkoutLoadingId === (product.id || product.name)}
                    className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {checkoutLoadingId === (product.id || product.name) ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Even geduld...
                      </>
                    ) : (
                      <>
                        Koop nu
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
        {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center text-muted-foreground bg-card border border-border rounded-2xl p-10">
          Geen producten gevonden met deze filters.
        </div>
        )}

        {/* Cart Summary */}
        <div id="winkelmand" className="mt-12 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Winkelmand</h2>
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
                    <div className="text-sm text-muted-foreground">
                      {currency.format((item.priceCents || 0) / 100)}
                    </div>
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
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Verzendkosten</span>
                <span>
                  {currency.format(Math.max(...cart.map((c) => c.deliveryCostCents || 0), 0) / 100)}
                </span>
              </div>
              <Link
                to="/cart"
                className="w-full inline-flex items-center justify-center gap-2 border border-border text-foreground px-4 py-3 rounded-lg hover:bg-muted transition"
              >
                Naar winkelmand pagina
              </Link>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FloatingContact />
      <Link
        to="/cart"
        className="fixed bottom-24 right-6 inline-flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-primary text-primary-foreground hover:opacity-90 transition"
      >
        <ShoppingCart size={18} />
        Winkelmand ({cart.reduce((sum, item) => sum + item.quantity, 0)})
      </Link>
    </div>
  );
};

export default Shop;

function dateValue(p: Product) {
  // Try date fields, else numeric id fallback
  const candidates = [
    (p as any).created_at,
    (p as any).date,
    (p as any).datum,
    p.id,
    p.slug,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const d = new Date(c);
    if (!Number.isNaN(d.getTime())) return d.getTime();
    const n = Number(c);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}
