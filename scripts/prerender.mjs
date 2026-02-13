import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist");
const ssrEntry = path.resolve(__dirname, "..", "dist-ssr", "entry-ssr.js");

const template = await fs.readFile(path.join(distDir, "index.html"), "utf-8");

const { render, posts } = await import(pathToFileURL(ssrEntry).href);

const staticRoutes = ["/", "/zakelijke-websites", "/shop", "/webshop", "/blog", "/over-ons"];
const blogRoutes = posts.map((post) => `/blog/${post.id}`);
const routes = [...new Set([...staticRoutes, ...blogRoutes])];

const ensureDir = async (filePath) => {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
};

for (const route of routes) {
  const url = route;
  const { html, head } = await render(url);

  let page = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  page = page.replace("</head>", `${head}</head>`);

  const outPath =
    route === "/"
      ? path.join(distDir, "index.html")
      : path.join(distDir, route.replace(/^\//, ""), "index.html");

  await ensureDir(outPath);
  await fs.writeFile(outPath, page, "utf-8");
  console.log(`prerendered: ${route}`);
}
