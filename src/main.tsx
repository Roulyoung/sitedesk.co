import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AppProviders } from "./AppProviders";
import { AppRoutesSSR } from "./routes/AppRoutes.ssr";
import "./index.css";

const container = document.getElementById("root");

const app = (
  <HelmetProvider>
    <AppProviders>
      <BrowserRouter>
        <AppRoutesSSR />
      </BrowserRouter>
    </AppProviders>
  </HelmetProvider>
);

if (container) {
  if (container.hasChildNodes()) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }
}
