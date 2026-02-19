import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AppProviders } from "./AppProviders";
import { AppRoutesClient } from "./routes/AppRoutes.client";
import "./index.css";

const container = document.getElementById("root");
const loadNonCriticalStyles = () => {
  void import("./non-critical.css");
};

const scheduleNonCriticalStyles = () => {
  if (typeof window === "undefined") return;

  const start = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadNonCriticalStyles, { timeout: 2500 });
      return;
    }
    window.setTimeout(loadNonCriticalStyles, 1500);
  };

  if (document.readyState === "complete") {
    start();
    return;
  }
  window.addEventListener("load", start, { once: true });
};

const app = (
  <HelmetProvider>
    <AppProviders>
      <BrowserRouter>
        <AppRoutesClient />
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

  scheduleNonCriticalStyles();
}
