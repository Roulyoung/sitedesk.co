import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { Ban } from "lucide-react";
import { getLocaleFromPath, withLocalePath } from "@/lib/i18n";
import { t } from "@/lib/messages";

const Cancel = () => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-6 py-20 md:py-28 text-center space-y-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 text-destructive mx-auto">
            <Ban size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground">{t(locale, "cancel.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(locale, "cancel.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={withLocalePath("/shop", locale)}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              {t(locale, "cancel.backToShop")}
            </Link>
            <Link
              to={withLocalePath("/cart", locale)}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-foreground hover:bg-muted transition"
            >
              {t(locale, "cancel.toCart")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

export default Cancel;
