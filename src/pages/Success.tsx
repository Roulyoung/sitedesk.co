import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { getLocaleFromPath, withLocalePath } from "@/lib/i18n";
import { t } from "@/lib/messages";

const Success = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);

  const { product, amountFormatted } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const productName = params.get("product") || "Product";
    const amountRaw = params.get("amount") || "";

    const parsedAmount = Number(amountRaw.replace(",", "."));
    const formatter = new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    });

    const formattedAmount =
      Number.isFinite(parsedAmount) && parsedAmount > 0
        ? formatter.format(parsedAmount)
        : amountRaw || "€0,00";

    return { product: productName, amountFormatted: formattedAmount };
  }, [location.search]);

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-20 md:py-28 max-w-4xl">
        <div className="flex flex-col items-center text-center gap-6">
          <CheckCircle className="text-emerald-500" size={96} strokeWidth={1.5} />
          <h1 className="text-4xl md:text-5xl font-serif text-foreground">
            {t(locale, "success.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t(locale, "success.subtitle")}
          </p>
        </div>

        <div className="mt-14">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-serif text-foreground mb-4">{t(locale, "success.summary")}</h2>
            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between text-foreground">
                <span className="text-sm uppercase tracking-wide text-muted-foreground">
                  {t(locale, "success.product")}
                </span>
                <span className="font-medium">{product}</span>
              </div>
              <div className="flex items-center justify-between text-foreground">
                <span className="text-sm uppercase tracking-wide text-muted-foreground">
                  {t(locale, "success.amount")}
                </span>
                <span className="font-semibold">{amountFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to={withLocalePath("/", locale)}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            {t(locale, "success.backToStore")}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Success;
