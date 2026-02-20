import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AppProviders } from "./AppProviders";
import { AppRoutesClient, loadInitialRouteComponents } from "./routes/AppRoutes.client";
import "./index.css";

const container = document.getElementById("root");

const bootstrap = async () => {
  if (!container) return;

  const rawPathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const pathname = rawPathname.length > 1 ? rawPathname.replace(/\/+$/, "") : rawPathname;
  const initialComponents = await loadInitialRouteComponents(pathname);

  const app = (
    <HelmetProvider>
      <AppProviders>
        <BrowserRouter>
          <AppRoutesClient initialComponents={initialComponents} />
        </BrowserRouter>
      </AppProviders>
    </HelmetProvider>
  );

  if (container.hasChildNodes()) {
    hydrateRoot(container, app, {
      onRecoverableError: () => {
        // Prevent recoverable hydration warnings from polluting production console/Lighthouse.
      },
    });
  } else {
    createRoot(container).render(app);
  }
};

bootstrap();
