import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import styles from "./PreviewShell.module.css";
import PreviewShopDemo from "@/previews/PreviewShopDemo";

type PreviewProduct = {
  id: string;
  name: string;
  image: string;
  price: string;
  category: string;
};

const PRODUCTS_ENDPOINT = "https://stripe-webhook.rdo90.workers.dev/products";

const getProductsSeed = (): any[] => {
  try {
    const seeded = (globalThis as any).__PRERENDER_PRODUCTS__;
    return Array.isArray(seeded) ? seeded : [];
  } catch {
    return [];
  }
};

const mapPreviewProducts = (rows: any[]) =>
  rows.map((row: any, idx: number) => ({
    id: String(row.id || row.slug || row.name || `row-${idx}`),
    name: String(row.name || row.naam || row.description || `Item ${idx + 1}`),
    image: String(row.image || row.image1 || row.image2 || row.image3 || ""),
    price: String(row.price || row.prijs || row.sale_price || row.sale || ""),
    category: String(row.category || row.categorie || ""),
  })) as PreviewProduct[];

const normalizeSlug = (value: string | undefined) => String(value || "").trim().toLowerCase();

const filterByClientSlug = (rows: any[], clientSlug: string) =>
  rows.filter((row) => normalizeSlug(String(row.client_slug || "")) === clientSlug);

const PreviewShell = () => {
  const { clientSlug } = useParams<{ clientSlug: string }>();
  const location = useLocation();
  const normalizedClientSlug = normalizeSlug(clientSlug);
  const canonical = `https://sitedesk.co${location.pathname}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<PreviewProduct[]>([]);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        setLoading(true);
        const seededRows = filterByClientSlug(getProductsSeed(), normalizedClientSlug);
        if (seededRows.length > 0) {
          if (!cancelled) {
            setProducts(mapPreviewProducts(seededRows));
            setError(null);
            setLoading(false);
          }
          return;
        }

        const response = await fetch(PRODUCTS_ENDPOINT, { cache: "no-store" });
        if (!response.ok) throw new Error("Could not load preview products");
        const payload = await response.json();
        const rows = Array.isArray(payload?.products) ? payload.products : [];
        const filtered = filterByClientSlug(rows, normalizedClientSlug);
        if (!cancelled) {
          setProducts(mapPreviewProducts(filtered));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown preview error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [normalizedClientSlug]);

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Preview | {normalizedClientSlug || "client"}</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <main className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Sitedesk Preview</p>
          <h1 className={styles.title}>Client Preview: {normalizedClientSlug || "unknown"}</h1>
          <p className={styles.subtitle}>
            Shell route sourced from Google Sheets (`Products`) and filtered on `client_slug`.
          </p>
        </section>

        {loading && <div className={styles.status}>Loading preview data...</div>}
        {!loading && error && <div className={styles.status}>{error}</div>}

        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className={styles.status}>No products found for this client slug.</div>
            ) : (
              <>
                <div className={styles.status}>
                  Demo mode: this preview uses the regular shop-style layout and only shows products for
                  <strong> {normalizedClientSlug}</strong>.
                </div>
                <PreviewShopDemo products={products} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PreviewShell;
