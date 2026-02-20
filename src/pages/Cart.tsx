import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { loadCart, updateQuantity as updateQtyStore, saveCart, clearCart, type CartItem } from "@/lib/cart";
import { validateCartBeforeCheckout } from "@/lib/checkoutValidation";
import { ArrowRight, Loader2, Minus, Plus, ShoppingBag, Trash } from "lucide-react";

const CHECKOUT_ENDPOINT = "https://stripe-webhook.rdo90.workers.dev/create-checkout-session";

const currency = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setCart(loadCart());
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (item.priceCents || 0) * item.quantity, 0),
    [cart],
  );
  const shippingCents = useMemo(
    () => Math.max(...cart.map((c) => c.deliveryCostCents || 0), 0),
    [cart],
  );
  const grandTotal = total + shippingCents;

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => updateQtyStore(prev, id, delta));
  };

  const removeItem = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveCart(updated);
      return updated;
    });
  };

  const handleCheckout = async () => {
    try {
      setError(null);
      setCheckoutLoadingId("cart");
      const validation = await validateCartBeforeCheckout(cart);
      setCart(validation.cart);
      if (!validation.ok) {
        setError(validation.message || "Controleer je winkelmand en probeer opnieuw.");
        return;
      }

      const nonLinkItems = validation.cart.filter((item) => !item.stripe_link);
      const linkItems = validation.cart.filter((item) => item.stripe_link);
      const liveShippingCents = Math.max(...validation.cart.map((c) => c.deliveryCostCents || 0), 0);

      if (nonLinkItems.length === 0 && linkItems.length === 1 && liveShippingCents === 0) {
        window.location.href = linkItems[0].stripe_link as string;
        return;
      }

      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: validation.cart
            .map((item) => ({
              id: item.id,
              name: item.name,
              price: (item.priceCents || 0) / 100,
              quantity: item.quantity,
            }))
            .concat(
              liveShippingCents > 0
                ? [
                    {
                      id: "shipping",
                      name: "Verzendkosten",
                      price: liveShippingCents / 100,
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
      clearCart();
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout mislukt");
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  const handleContinueShopping = () => navigate("/shop");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Winkelmand</p>
              <h1 className="text-3xl font-bold text-foreground">Je bestelling</h1>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="bg-white border border-border rounded-2xl p-8 text-center shadow-sm">
              <p className="text-muted-foreground mb-4">Je mandje is leeg.</p>
              <ButtonLink to="/shop" label="Verder winkelen" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
              <div className="bg-white border border-border rounded-2xl shadow-sm divide-y divide-border">
                {cart.map((item) => (
                  <div key={item.id} className="p-5 flex items-center gap-4">
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-muted-foreground">Geen afbeelding</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {currency.format((item.priceCents || 0) / 100)}
                      </p>
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
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition"
                      aria-label="Verwijder"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-border rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotaal</span>
                  <span className="font-semibold text-foreground">{currency.format(total / 100)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Verzendkosten</span>
                  <span>{currency.format(shippingCents / 100)}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-foreground font-semibold">Totaal</span>
                  <span className="text-lg font-bold text-foreground">{currency.format(grandTotal / 100)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Prijzen inclusief btw. Verzendkosten op basis van het hoogste tarief in je mandje.
                </p>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoadingId === "cart" || loading}
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
                <button
                  onClick={handleContinueShopping}
                  className="w-full inline-flex items-center justify-center gap-2 border border-border text-foreground px-4 py-3 rounded-lg hover:bg-muted transition"
                >
                  Verder winkelen
                </button>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

const ButtonLink = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
  >
    {label}
    <ArrowRight size={16} />
  </Link>
);

export default CartPage;
