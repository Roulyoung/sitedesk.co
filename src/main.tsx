import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AppProviders } from "./AppProviders";
import { AppRoutesSSR } from "./routes/AppRoutes.ssr";
import "./index.css";

const container = document.getElementById("root");
const loadNonCriticalStyles = () => {
  void import("./non-critical.css");
};

const scheduleNonCriticalStyles = () => {
  if (typeof window === "undefined") return;

  const start = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadNonCriticalStyles, { timeout: 6000 });
      return;
    }
    window.setTimeout(loadNonCriticalStyles, 5000);
  };

  if (document.readyState === "complete") {
    start();
    return;
  }
  const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
  const onInteraction = () => {
    start();
    events.forEach((name) => window.removeEventListener(name, onInteraction));
  };
  events.forEach((name) => window.addEventListener(name, onInteraction, { passive: true, once: true }));
  window.addEventListener("load", start, { once: true });
};

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

  scheduleNonCriticalStyles();
}
