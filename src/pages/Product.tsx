import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { ArrowRight } from "lucide-react";
import { addToCart as addToCartStore, loadCart, type CartItem } from "@/lib/cart";
import { validateCartBeforeCheckout } from "@/lib/checkoutValidation";
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from "react-helmet-async";
import {
  getAlternateHrefLangs,
  getLocaleFromPath,
  getLocalizedSlug,
  getLocalizedValue,
  stripLocaleFromPath,
  ACTIVE_LOCALES,
  withLocalePath,
  type SupportedLocale,
} from "@/lib/i18n";

type Product = {
  id: string;
  slug?: string;
  slugByLocale: Partial<Record<SupportedLocale, string>>;
  lookupKeys: string[];
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

const mapProductRow = (row: any, idx: number, locale: SupportedLocale): Product => {
  const localizedName = getLocalizedValue(row, "name", locale);
  const localizedDescription = getLocalizedValue(row, "description", locale);
  const name =
    localizedName ||
    row.name ||
    row.naam ||
    row.omschrijving ||
    row.description ||
    row.slug ||
    `Product ${idx + 1}`;
  const rawPrice = row.sale_price || row.sale || row.price || row.prijs || "0";
  const priceCents = parsePriceToCents(String(rawPrice));
  const slugByLocale: Partial<Record<SupportedLocale, string>> = {
    nl: getLocalizedSlug(row, "nl"),
    en: getLocalizedSlug(row, "en"),
    de: getLocalizedSlug(row, "de"),
  };
  const slug = (slugByLocale[locale] || row.slug || row.id || name || `item-${idx}`).toString();
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
  const lookupKeys = Array.from(
    new Set(
      [slug, slugByLocale.nl, slugByLocale.en, slugByLocale.de, row.slug, row.id, name]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase().trim()),
    ),
  );

  return {
    id: slug,
    slug,
    slugByLocale,
    lookupKeys,
    name: name.toString(),
    description: localizedDescription || row.description || row.omschrijving || "",
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

const getPrerenderProducts = (locale: SupportedLocale): Product[] => {
  try {
    const seeded = (globalThis as any).__PRERENDER_PRODUCTS__;
    if (!Array.isArray(seeded)) return [];
    return seeded.map((row: any, idx: number) => mapProductRow(row, idx, locale));
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
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";
  const pathWithoutLocale = stripLocaleFromPath(location.pathname);
  const alternateLinks = getAlternateHrefLangs(pathWithoutLocale);
  const initialProducts = useMemo(() => getPrerenderProducts(locale), [locale]);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(() => initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mainVariantFailed, setMainVariantFailed] = useState(false);
  const [failedThumbs, setFailedThumbs] = useState<Record<string, true>>({});

  useEffect(() => {
    let cancelled = false;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const fetchProducts = async (showLoader: boolean) => {
      if (showLoader) setLoading(true);
      try {
        const res = await fetch(PRODUCTS_ENDPOINT, { cache: "no-store" });
        if (!res.ok) throw new Error(isEn ? "Could not load products" : "Kon producten niet laden");
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (_err) {
          throw new Error(isEn ? "Unexpected server response (invalid JSON)" : "Onverwachte serverrespons (geen geldige JSON)");
        }
        const mapped: Product[] = data?.products?.map((row: any, idx: number) => mapProductRow(row, idx, locale)) || [];
        if (!cancelled) {
          setProducts(mapped);
          setError(null);
        }
      } catch (err) {
        if (!cancelled && initialProducts.length === 0) {
          setError(err instanceof Error ? err.message : "Onbekende fout");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (initialProducts.length === 0) {
      // No prerender data available: fetch immediately.
      fetchProducts(true);
    } else {
      // Keep product LCP path clean; refresh catalog only when browser is idle.
      const runRefresh = () => {
        if (!cancelled) fetchProducts(false);
      };
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        idleId = (window as Window & { requestIdleCallback: (cb: IdleRequestCallback) => number }).requestIdleCallback(
          () => runRefresh(),
        );
      } else {
        timeoutId = setTimeout(runRefresh, 2200);
      }
    }

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        fetchProducts(false);
      }
    };

    window.addEventListener("pageshow", onPageShow);
    return () => {
      cancelled = true;
      if (idleId !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [initialProducts, locale, isEn]);

  const product = useMemo(
    () => {
      const lookup = (id || "").toString().toLowerCase();
      return products.find(
        (p) =>
          p.lookupKeys.includes(lookup),
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
  const localeAlternates = product
    ? [
        ...ACTIVE_LOCALES.map((altLocale) => {
          const localizedSlug = product.slugByLocale[altLocale] || product.slug || product.id;
          return {
            locale: altLocale,
            href: `https://sitedesk.co${withLocalePath(`/product/${encodeURIComponent(localizedSlug)}`, altLocale)}`,
          };
        }),
        {
          locale: "x-default",
          href: `https://sitedesk.co${withLocalePath(`/product/${encodeURIComponent(product.slugByLocale.nl || product.slug || product.id)}`, "nl")}`,
        },
      ]
    : alternateLinks;
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
    toast({ title: isEn ? "Added to cart" : "Toegevoegd aan winkelmand", description: product.name });
    navigate(withLocalePath("/cart", locale));
  };

  const handleCheckout = async () => {
    if (!product) return;
    const existingCart = loadCart();
    const checkoutItem: CartItem = {
      id: product.id,
      name: product.name,
      priceCents: product.priceCents,
      quantity: 1,
      deliveryCostCents: parsePriceToCents(product.delivery_cost || "0"),
      stock: product.stock || "",
      stripe_link: product.stripe_link,
      price_id: product.price_id,
      image: product.image || product.images?.[0],
    };
    const combinedCart: CartItem[] = existingCart.map((item) => ({ ...item })).concat(checkoutItem);

    try {
      setError(null);
      const validation = await validateCartBeforeCheckout(combinedCart);
      if (!validation.ok) {
        setError(validation.message || (isEn ? "Check your cart and try again." : "Controleer je winkelmand en probeer opnieuw."));
        return;
      }

      const validatedCurrent = validation.cart.find((item) => item.id === checkoutItem.id);
      if (!validatedCurrent) {
        setError(`${product.name} ${isEn ? "is no longer available." : "is niet meer beschikbaar."}`);
        return;
      }

      const existingValidated = validation.cart
        .map((item) =>
          item.id === checkoutItem.id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item,
        )
        .filter((item) => item.quantity > 0);
      const shippingCents = Math.max(...validation.cart.map((c) => c.deliveryCostCents || 0), 0);

      if (product.stripe_link && existingValidated.length === 0 && shippingCents === 0) {
        window.location.href = product.stripe_link;
        return;
      }

      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: existingValidated
            .map((item) => ({
              id: item.id,
              name: item.name,
              price: (item.priceCents || 0) / 100,
              quantity: item.quantity,
            }))
            .concat([
              {
                id: validatedCurrent.id,
                name: validatedCurrent.name,
                price: validatedCurrent.priceCents / 100,
                quantity: 1,
              },
            ])
            .concat(
              shippingCents > 0
                ? [
                    {
                      id: "shipping",
                      name: isEn ? "Shipping" : "Verzendkosten",
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
      if (!data?.url) throw new Error(isEn ? "No checkout URL received" : "Geen checkout URL ontvangen");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : isEn ? "Checkout failed" : "Checkout mislukt");
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
          <title>{isEn ? "Product not found | Sitedesk" : "Product niet gevonden | Sitedesk"}</title>
          <meta
            name="description"
            content={
              isEn
                ? "This product page is unavailable. View the full collection in the shop."
                : "Deze productpagina is niet beschikbaar. Bekijk het volledige aanbod in de shop."
            }
          />
          <link rel="canonical" href={canonical} />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-lg text-center space-y-4">
            <h1 className="text-3xl font-semibold">{isEn ? "Product not found" : "Product niet gevonden"}</h1>
            <p className="text-muted-foreground">{error || (isEn ? "Check the URL or return to the shop." : "Controleer de link of ga terug naar de shop.")}</p>
            <Link
              to={withLocalePath("/shop", locale)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              {isEn ? "Back to shop" : "Terug naar shop"}
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
        {localeAlternates.map((alt) => (
          <link key={alt.locale} rel="alternate" hrefLang={alt.locale} href={alt.href} />
        ))}
        <link rel="preload" as="image" href={resolvedMainSrc} />
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
            {isEn ? "Cart" : "In mand"}
          </button>
          <button
            onClick={handleCheckout}
            className="min-h-12 px-4 py-3 rounded-lg bg-primary text-primary-foreground touch-manipulation"
          >
            {isEn ? "Buy now" : "Koop nu"}
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
                  width={704}
                  height={704}
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
                  <div>{isEn ? "Delivery" : "Levering"}: {product.delivery_time || (isEn ? "1-2 days" : "1-2 dagen")}</div>
                  {parsePriceToCents(product.delivery_cost || "0") > 0 ? (
                    <div>
                      {isEn ? "Shipping" : "Verzendkosten"}:{" "}
                      {new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(
                        parsePriceToCents(product.delivery_cost || "0") / 100,
                      )}
                    </div>
                  ) : (
                    <div>{isEn ? "Free shipping" : "Gratis verzending"}</div>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || (isEn ? "No description available." : "Geen beschrijving beschikbaar.")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="rounded-lg border border-border px-4 py-3 bg-gray-50">
                    <p className="font-semibold text-foreground">{isEn ? "Ready to order" : "Direct te bestellen"}</p>
                    <p>{isEn ? "Secure payment via Stripe" : "Veilige betaling via Stripe"}</p>
                  </div>
                  <div className="rounded-lg border border-border px-4 py-3 bg-gray-50">
                    <p className="font-semibold text-foreground">{isEn ? "Support included" : "Inclusief support"}</p>
                    <p>{isEn ? "Personal follow-up after your order" : "Persoonlijk contact na je bestelling"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition"
                  >
                    {isEn ? "Add to cart" : "In winkelmand"}
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
                  >
                    {isEn ? "Order now" : "Bestel nu"}
                    <ArrowRight size={16} />
                  </button>
                  <Link
                    to={withLocalePath("/shop", locale)}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-border text-foreground hover:bg-muted transition"
                  >
                    {isEn ? "Back to shop" : "Terug naar shop"}
                  </Link>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="pt-2">
                  <Link to={withLocalePath("/shop", locale)} className="text-sm text-gray-500 hover:text-primary">
                    {isEn ? "Continue shopping" : "Verder winkelen"}
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
