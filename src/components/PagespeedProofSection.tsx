import { ExternalLink, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { getLocaleFromPath } from "@/lib/i18n";

const SHOP_PAGESPEED_URL =
  "https://pagespeed.web.dev/analysis/https-sitedesk-co-demo/3fxw6dx1ql?form_factor=mobile";
const PRODUCT_PAGESPEED_URL =
  "https://pagespeed.web.dev/analysis/https-sitedesk-co-en-product-silver-heritage/xiwwii78lj?form_factor=mobile";

type Props = {
  className?: string;
};

const PagespeedProofSection = ({ className = "" }: Props) => {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const isEn = locale === "en";

  return (
    <section className={`container mx-auto ${className}`.trim()}>
      <div className="overflow-hidden rounded-[2rem] border border-accent/20 bg-[linear-gradient(135deg,rgba(15,23,42,0.02),rgba(14,165,233,0.08),rgba(16,185,129,0.06))] shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)]">
        <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              <Gauge className="h-4 w-4" />
              {isEn ? "Live proof" : "Live bewijslast"}
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-foreground md:text-3xl">
                {isEn ? "Our own architecture is the case." : "Onze eigen architectuur is de case."}
              </h3>
              <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {isEn
                  ? "We do not ask you to trust a vague promise. This website runs on the same edge stack we build for clients. Test the live Google PageSpeed score of both the shop and a real product page."
                  : "We vragen je niet om een vage belofte te geloven. Deze website draait op exact dezelfde edge-stack die we voor klanten bouwen. Test zelf de live Google PageSpeed-score van zowel de shop als een echte productpagina."}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {isEn
                ? "Opens in a new tab via Google PageSpeed Insights."
                : "Opent in een nieuw tabblad via Google PageSpeed Insights."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            <a
              href={SHOP_PAGESPEED_URL}
              target="_blank"
              rel="noreferrer"
              className="group rounded-[1.5rem] border border-success/20 bg-white/85 p-5 shadow-[0_18px_34px_-24px_rgba(16,185,129,0.45)] transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-success">
                    {isEn ? "Shop page" : "Shop pagina"}
                  </p>
                  <h4 className="mt-2 text-lg font-bold text-foreground">
                    {isEn ? "View the live 100/100 shop score" : "Bekijk de live 100/100 shopscore"}
                  </h4>
                </div>
                <span className="rounded-full bg-success/10 px-3 py-1 text-sm font-bold text-success">100/100</span>
              </div>
              <Button variant="outline" size="sm" className="mt-5 w-full justify-between border-success/30 text-success hover:bg-success hover:text-white">
                {isEn ? "Test shop performance" : "Test shop performance"}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>

            <a
              href={PRODUCT_PAGESPEED_URL}
              target="_blank"
              rel="noreferrer"
              className="group rounded-[1.5rem] border border-primary/20 bg-white/85 p-5 shadow-[0_18px_34px_-24px_rgba(37,99,235,0.35)] transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    {isEn ? "Product page" : "Productpagina"}
                  </p>
                  <h4 className="mt-2 text-lg font-bold text-foreground">
                    {isEn ? "See the live 99-100/100 product score" : "Bekijk de live 99-100/100 productscore"}
                  </h4>
                </div>
                <span className="whitespace-nowrap rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">99-100</span>
              </div>
              <Button variant="outline" size="sm" className="mt-5 w-full justify-between border-primary/30 text-primary hover:bg-primary hover:text-white">
                {isEn ? "Test product performance" : "Test product performance"}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PagespeedProofSection;
