import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { ArrowRight } from "lucide-react";
import { addToCart as addToCartStore, loadCart, type CartItem } from "@/lib/cart";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet-async";

type Product = {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  priceCents: number;
  priceDisplay: string;
  image?: string;
  images?: string[];
  category?: string;
  tags?: string[];
  stripe_link?: string;
  price_id?: string;
  delivery_time?: string;
  delivery_cost?: string;
  stock?: string;
};

const PRODUCTS_ENDPOINT = "https://stripe-webhook.rdo90.workers.dev/products";
const CHECKOUT_ENDPOINT = "https://stripe-webhook.rdo90.workers.dev/create-checkout-session";
const CLOUDFLARE_IMAGE_HOST = "imagedelivery.net";
const CF_MAIN_IMAGE_VARIANT = import.meta.env.VITE_CF_IMAGE_MAIN_VARIANT || "productmain";
const CF_THUMB_IMAGE_VARIANT = import.meta.env.VITE_CF_IMAGE_THUMB_VARIANT || "productthumb";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);

const parsePriceToCents = (value: string) => {
  const numeric = parseFloat(value.replace(/[^\d.,-]/g, "").replace(",", "."));
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round(numeric * 100);
};

const mapProductRow = (row: any, idx: number): Product => {
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
  const image =
    row.image ||
    row.image1 ||
    row.image2 ||
    row.image3 ||
    row.image4 ||
    row.image5 ||
    "";
  const images = [row.image, row.image1, row.image2, row.image3, row.image4, row.image5]
    .map((v: string) => v?.toString())
    .filter(Boolean);
  const tags = ["tag1", "tag2", "tag3", "tag4", "tag5"]
    .map((t) => (row[t] || "").toString().trim())
    .filter(Boolean);
  const deliveryCostCents = parsePriceToCents(String(row.delivery_cost || row.verzendkosten || "0"));
  const deliveryTime = row.delivery_time || row.delivery || "1-2 dagen";
  const stock = row.stock || row.voorraad || "";
  return {
    id: slug,
    slug,
    name: name.toString(),
    description: row.description || row.omschrijving || "",
    priceCents,
    priceDisplay: formatPrice(priceCents),
    image: image || "",
    images,
    category: row.category || "",
    tags,
    stripe_link: row.stripe_link || "",
    price_id: row.price_id || "",
    delivery_time: deliveryTime,
    delivery_cost: deliveryCostCents.toString(),
    stock,
  };
};

const getPrerenderProducts = (): Product[] => {
  try {
    const seeded = (globalThis as any).__PRERENDER_PRODUCTS__;
    if (!Array.isArray(seeded)) return [];
    return seeded.map((row: any, idx: number) => mapProductRow(row, idx));
  } catch {
    return [];
  }
};

const withCloudflareVariant = (src: string | undefined, variant: string) => {
  if (!src) return "";
  if (!variant || variant === "public") return src;
  try {
    const url = new URL(src);
    if (!url.hostname.includes(CLOUDFLARE_IMAGE_HOST)) return src;
    const segments = url.pathname.split("/").filter(Boolean);
    // Expected path: /<account_hash>/<image_id>/<variant>
    if (segments.length < 3) return src;
    segments[2] = variant;
    url.pathname = `/${segments.join("/")}`;
    return url.toString();
  } catch {
    return src;
  }
};

const ProductPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(() => getPrerenderProducts());
  const [loading, setLoading] = useState(() => getPrerenderProducts().length === 0);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mainVariantFailed, setMainVariantFailed] = useState(false);
  const [failedThumbs, setFailedThumbs] = useState<Record<string, true>>({});

  useEffect(() => {
    if (products.length > 0) {
      setLoading(false);
      return;
    }
    const fetchProducts = async () => {
      try {
        const res = await fetch(PRODUCTS_ENDPOINT);
        if (!res.ok) throw new Error("Kon producten niet laden");
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (_err) {
          throw new Error("Onverwachte serverrespons (geen geldige JSON)");
        }
        const mapped: Product[] = data?.products?.map((row: any, idx: number) => mapProductRow(row, idx)) || [];
        setProducts(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [products.length]);

  const product = useMemo(
    () => {
      const lookup = (id || "").toString().toLowerCase();
      return products.find(
        (p) =>
          p.id.toLowerCase() === lookup ||
          (p.slug || "").toString().toLowerCase() === lookup,
      );
    },
    [products, id],
  );

  useEffect(() => {
    if (product) {
      const primary = product.image || product.images?.[0] || null;
      setSelectedImage(primary);
      setMainVariantFailed(false);
      setFailedThumbs({});
    }
  }, [product]);

  const canonical = `https://sitedesk.co${location.pathname}`;
  const seoTitle = product ? `${product.name} | Shop | Sitedesk` : "Product | Sitedesk";
  const seoDescription = product?.description?.trim()
    ? product.description.trim().slice(0, 155)
    : "Bekijk productinformatie, prijs, levering en reken direct af via Sitedesk.";
  const selectedMainSrc = selectedImage || product?.image || product?.images?.find(Boolean) || "https://dummyimage.com/800x600/edf2f7/1a202c&text=Product";
  const mainVariantSrc = withCloudflareVariant(selectedMainSrc, CF_MAIN_IMAGE_VARIANT);
  const resolvedMainSrc = mainVariantFailed ? selectedMainSrc : mainVariantSrc;

  const handleAddToCart = () => {
    if (!product) return;
    const item: CartItem = {
      id: product.id,
      name: product.name,
      priceCents: product.priceCents || 0,
      quantity: 1,
      image: product.image || product.images?.[0],
      stripe_link: product.stripe_link,
      price_id: product.price_id,
      deliveryCostCents: parsePriceToCents(product.delivery_cost || "0"),
      deliveryTime: product.delivery_time || "1-2 dagen",
      stock: product.stock || "",
    };
    const current = loadCart();
    addToCartStore(current, item);
    toast({ title: "Toegevoegd aan winkelmand", description: product.name });
    navigate("/cart");
  };

  const handleCheckout = async () => {
    if (!product) return;
    const existingCart = loadCart();
    const shippingExisting = Math.max(...existingCart.map((c) => c.deliveryCostCents || 0), 0);
    const shippingCents = Math.max(shippingExisting, parsePriceToCents(product.delivery_cost || "0"));

    if (product.stripe_link && existingCart.length === 0 && shippingCents === 0) {
      window.location.href = product.stripe_link;
      return;
    }
    try {
      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: existingCart
            .map((item) => ({
              id: item.id,
              name: item.name,
              price: (item.priceCents || 0) / 100,
              quantity: item.quantity,
            }))
            .concat([
              {
                id: product.id,
                name: product.name,
                price: product.priceCents / 100,
                quantity: 1,
              },
            ])
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
      if (!res.ok) throw new Error(await res.text());
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
        <Helmet>
          <title>{seoTitle}</title>
          <meta name="description" content={seoDescription} />
          <link rel="canonical" href={canonical} />
          <meta property="og:title" content={seoTitle} />
          <meta property="og:description" content={seoDescription} />
          <meta property="og:type" content="product" />
          <meta property="og:url" content={canonical} />
        </Helmet>
        <Header />
        <main className="flex-1 bg-gradient-to-b from-gray-50 via-white to-gray-50">
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-xl overflow-hidden border border-border animate-pulse">
              <div className="grid md:grid-cols-2">
                <div className="aspect-square bg-gray-200" />
                <div className="p-8 lg:p-10 space-y-5">
                  <div className="h-6 w-1/3 rounded bg-gray-200" />
                  <div className="h-10 w-4/5 rounded bg-gray-200" />
                  <div className="h-10 w-1/3 rounded bg-gray-200" />
                  <div className="h-20 w-full rounded bg-gray-200" />
                  <div className="h-11 w-full rounded bg-gray-200" />
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <FloatingContact className="hidden md:flex" />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Helmet>
          <title>Product niet gevonden | Sitedesk</title>
          <meta name="description" content="Deze productpagina is niet beschikbaar. Bekijk het volledige aanbod in de shop." />
          <link rel="canonical" href={canonical} />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-lg text-center space-y-4">
            <h1 className="text-3xl font-semibold">Product niet gevonden</h1>
            <p className="text-muted-foreground">{error || "Controleer de link of ga terug naar de shop."}</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Terug naar shop
            </Link>
          </div>
        </main>
        <Footer />
        <FloatingContact className="hidden md:flex" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
      </Helmet>
      <Header />
      {/* Sticky CTA for mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur md:hidden border-t border-border px-4 py-3 flex items-center justify-between gap-3">
        <div className="text-sm">
          <div className="font-semibold text-foreground">{product.name}</div>
          <div className="text-primary font-bold">{product.priceDisplay || formatPrice(product.priceCents)}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="min-h-12 px-4 py-3 rounded-lg border border-border text-foreground touch-manipulation"
          >
            In mand
          </button>
          <button
            onClick={handleCheckout}
            className="min-h-12 px-4 py-3 rounded-lg bg-primary text-primary-foreground touch-manipulation"
          >
            Koop nu
          </button>
        </div>
      </div>
      <main className="flex-1 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-xl overflow-hidden border border-border">
            <div className="grid md:grid-cols-2">
              <div className="bg-gray-100 relative aspect-square">
                <img
                  src={resolvedMainSrc}
                  alt={product.name}
                  width={768}
                  height={768}
                  decoding="async"
                  loading="eager"
                  fetchpriority="high"
                  onError={(e) => {
                    if (mainVariantFailed) return;
                    setMainVariantFailed(true);
                    (e.currentTarget as HTMLImageElement).src = selectedMainSrc;
                  }}
                  className="object-cover w-full h-full transition"
                />
              </div>
              <div className="p-8 lg:p-10 space-y-5">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-border">
                    {product.category || "Product"}
                  </span>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>
                <div className="text-4xl font-semibold text-emerald-600">
                  {product.priceDisplay || formatPrice(product.priceCents)}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Levering: {product.delivery_time || "1-2 dagen"}</div>
                  {parsePriceToCents(product.delivery_cost || "0") > 0 ? (
                    <div>
                      Verzendkosten:{" "}
                      {new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(
                        parsePriceToCents(product.delivery_cost || "0") / 100,
                      )}
                    </div>
                  ) : (
                    <div>Gratis verzending</div>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || "Geen beschrijving beschikbaar."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="rounded-lg border border-border px-4 py-3 bg-gray-50">
                    <p className="font-semibold text-foreground">Direct te bestellen</p>
                    <p>Veilige betaling via Stripe</p>
                  </div>
                  <div className="rounded-lg border border-border px-4 py-3 bg-gray-50">
                    <p className="font-semibold text-foreground">Inclusief support</p>
                    <p>Persoonlijk contact na je bestelling</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition"
                  >
                    In winkelmand
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                  >
                    Bestel nu
                    <ArrowRight size={16} />
                  </button>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition"
                  >
                    Terug naar shop
                  </Link>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="pt-2">
                  <Link to="/shop" className="text-sm text-gray-500 hover:text-primary">
                    Verder winkelen
                  </Link>
                </div>
              </div>
            </div>
            {product.images && product.images.length > 0 && (
              <div className="border-t border-border bg-gray-50 px-6 py-4">
                <div className="flex gap-3 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      aria-label={`Bekijk afbeelding ${i + 1} van ${product.name}`}
                      aria-pressed={selectedImage === img}
                      className={`relative h-20 w-20 rounded-lg border transition ${
                        selectedImage === img ? "ring-2 ring-primary border-primary" : "border-border"
                      }`}
                    >
                      {(() => {
                        const variantThumb = withCloudflareVariant(img, CF_THUMB_IMAGE_VARIANT);
                        const src = failedThumbs[img] ? img : variantThumb;
                        return (
                      <img
                        src={src}
                        alt={`${product.name} thumb ${i + 1}`}
                        width={96}
                        height={96}
                        loading="lazy"
                        decoding="async"
                        fetchpriority="low"
                        onError={(e) => {
                          if (failedThumbs[img]) return;
                          setFailedThumbs((prev) => ({ ...prev, [img]: true }));
                          (e.currentTarget as HTMLImageElement).src = img;
                        }}
                        className="h-full w-full object-cover rounded-lg"
                      />
                        );
                      })()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingContact className="hidden md:flex" />
    </div>
  );
};

export default ProductPage;
