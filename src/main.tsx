import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AppProviders } from "./AppProviders";
import { AppRoutesClient, loadInitialRouteComponents } from "./routes/AppRoutes.client";
import "./index.css";

const container = document.getElementById("root");

const bootstrap = async () => {
  if (!container) return;

  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
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
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }
};

bootstrap();
