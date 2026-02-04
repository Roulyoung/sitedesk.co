export type CartItem = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  image?: string;
  stripe_link?: string;
  price_id?: string;
  deliveryCostCents?: number;
  deliveryTime?: string;
  stock?: string;
};

const CART_KEY = "cart_items";

export function loadCart(): CartItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item && typeof item.id === "string" && typeof item.quantity === "number");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(items: CartItem[], newItem: CartItem): CartItem[] {
  const existing = items.find((i) => i.id === newItem.id);
  if (existing) {
    const updated = items.map((i) =>
      i.id === newItem.id ? { ...i, quantity: Math.max(1, i.quantity + newItem.quantity) } : i,
    );
    saveCart(updated);
    return updated;
  }
  const updated = [...items, newItem];
  saveCart(updated);
  return updated;
}

export function updateQuantity(items: CartItem[], id: string, delta: number): CartItem[] {
  const updated = items
    .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
    .filter((item) => item.quantity > 0);
  saveCart(updated);
  return updated;
}

export function clearCart() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(CART_KEY);
}
