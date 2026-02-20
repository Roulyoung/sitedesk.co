import { saveCart, type CartItem } from "@/lib/cart";
import { getLocalizedSlug, getLocalizedValue } from "@/lib/i18n";

const PRODUCTS_ENDPOINT = "https://stripe-webhook.rdo90.workers.dev/products";

type LatestProduct = {
  key: string;
  name: string;
  priceCents: number;
  deliveryCostCents: number;
  stockRaw: string;
};

type ValidationResult = {
  ok: boolean;
  cart: CartItem[];
  message?: string;
};

const parsePriceToCents = (value: string) => {
  const numeric = parseFloat((value || "").replace(/[^\d.,-]/g, "").replace(",", "."));
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round(numeric * 100);
};

const parseShippingToCents = (value: string) => {
  const numeric = parseFloat((value || "").replace(/[^\d.,-]/g, "").replace(",", "."));
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.round(numeric * 100);
};

const key = (value: string) => (value || "").toString().trim().toLowerCase();

const parseStockLimit = (stockRaw: string): number | null => {
  const raw = (stockRaw || "").toLowerCase().trim();
  if (!raw) return null;
  if (/(uitverkocht|sold out|geen voorraad|niet op voorraad|out of stock)/.test(raw)) return 0;
  const numberMatch = raw.match(/\d+/);
  if (numberMatch) return Number(numberMatch[0]);
  return null;
};

const fetchLatestProducts = async (): Promise<Map<string, LatestProduct>> => {
  const response = await fetch(PRODUCTS_ENDPOINT, { cache: "no-store" });
  if (!response.ok) throw new Error("Kon actuele productdata niet laden.");

  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Onverwachte serverrespons (geen geldige JSON).");
  }

  const byKey = new Map<string, LatestProduct>();
  const rows = Array.isArray(data?.products) ? data.products : [];
  rows.forEach((row: any, idx: number) => {
    const name =
      (
        getLocalizedValue(row, "name", "nl") ||
        row.name ||
        row.naam ||
        row.description ||
        row.omschrijving ||
        `Product ${idx + 1}`
      ).toString();
    const slugs = [
      getLocalizedSlug(row, "nl"),
      getLocalizedSlug(row, "en"),
      getLocalizedSlug(row, "de"),
      (row.slug || row.id || "").toString(),
    ].filter(Boolean);
    const price = row.sale_price || row.sale || row.price || row.prijs || "0";
    const stockRaw = (row.stock || row.voorraad || "").toString();
    const latest: LatestProduct = {
      key: key(slugs[0] || name),
      name,
      priceCents: parsePriceToCents(String(price)),
      deliveryCostCents: parseShippingToCents(String(row.delivery_cost || row.verzendkosten || "0")),
      stockRaw,
    };

    slugs.forEach((slug) => byKey.set(key(slug), latest));
    byKey.set(key(name), latest);
  });
  return byKey;
};

export const validateCartBeforeCheckout = async (cartItems: CartItem[]): Promise<ValidationResult> => {
  if (cartItems.length === 0) {
    return { ok: false, cart: cartItems, message: "Je mandje is leeg." };
  }

  const latest = await fetchLatestProducts();
  const updated: CartItem[] = [];
  const issues: string[] = [];

  cartItems.forEach((item) => {
    const match = latest.get(key(item.id)) || latest.get(key(item.name));
    if (!match) {
      issues.push(`${item.name} bestaat niet meer.`);
      return;
    }

    const stockLimit = parseStockLimit(match.stockRaw);
    if (stockLimit === 0) {
      issues.push(`${item.name} is uitverkocht.`);
      return;
    }

    const nextQty = stockLimit == null ? item.quantity : Math.min(item.quantity, stockLimit);
    if (stockLimit != null && nextQty < item.quantity) {
      issues.push(`${item.name} aangepast naar ${nextQty} stuk(s) door voorraad.`);
    }
    if (nextQty <= 0) return;

    updated.push({
      ...item,
      name: match.name || item.name,
      priceCents: match.priceCents || item.priceCents,
      deliveryCostCents: match.deliveryCostCents,
      stock: match.stockRaw || item.stock,
      quantity: nextQty,
    });
  });

  saveCart(updated);
  if (issues.length > 0) {
    return {
      ok: false,
      cart: updated,
      message: `Winkelmand is geupdate: ${issues.join(" ")}`,
    };
  }

  return { ok: true, cart: updated };
};
