import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { AppProviders } from "./AppProviders";
import { AppRoutesSSR } from "./routes/AppRoutes.ssr";
import { posts } from "./lib/blogData";

export { posts };

export async function render(url: string) {
  const helmetContext: Record<string, unknown> = {};

  const app = (
    <HelmetProvider context={helmetContext}>
      <AppProviders>
        <StaticRouter location={url}>
          <AppRoutesSSR />
        </StaticRouter>
      </AppProviders>
    </HelmetProvider>
  );

  const html = renderToString(app);
  const { helmet } = helmetContext as any;
  const head = `${helmet?.title?.toString() ?? ""}${helmet?.meta?.toString() ?? ""}${helmet?.link?.toString() ?? ""}`;

  return { html, head };
}
