import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { AppProviders, AppRoutes, createQueryClient } from "./App";
import { posts } from "./lib/blogData";

export { posts };

export async function render(url: string) {
  const helmetContext: Record<string, unknown> = {};
  const queryClient = createQueryClient();

  const app = (
    <HelmetProvider context={helmetContext}>
      <AppProviders client={queryClient}>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </AppProviders>
    </HelmetProvider>
  );

  const html = renderToString(app);
  const { helmet } = helmetContext as any;
  const head = `${helmet?.title?.toString() ?? ""}${helmet?.meta?.toString() ?? ""}${helmet?.link?.toString() ?? ""}`;

  return { html, head };
}
