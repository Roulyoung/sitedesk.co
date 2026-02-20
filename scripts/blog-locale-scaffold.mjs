import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const blogSourcePath = path.join(rootDir, "src", "lib", "blogData.ts");
const promptsPath = path.join(rootDir, "i18n", "BLOG_REWRITE_PROMPTS.md");

const args = process.argv.slice(2);
const getArg = (name, fallback = "") => {
  const flag = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(flag));
  if (!found) return fallback;
  return found.slice(flag.length).trim();
};

const targetLang = getArg("lang");
const sourceLang = getArg("source", "nl");
const outputMode = getArg("out", "private").toLowerCase();

if (!targetLang) {
  console.error(
    "Usage: node scripts/blog-locale-scaffold.mjs --lang=<target_lang> [--source=nl] [--out=private|public]",
  );
  process.exit(1);
}

if (!["private", "public"].includes(outputMode)) {
  console.error("Invalid --out value. Use --out=private or --out=public");
  process.exit(1);
}

const parsePosts = (source) => {
  const matches = [...source.matchAll(/\bid:\s*"([^"]+)"[\s\S]*?\btitle:\s*"([^"]+)"[\s\S]*?\bexcerpt:\s*"([^"]+)"/g)];
  return matches.map((match) => ({
    id: match[1],
    title: match[2],
    excerpt: match[3],
  }));
};

const buildDraftTemplate = (post) => `# Blog Rewrite Draft

Target language: ${targetLang}
Source language: ${sourceLang}
Post ID: ${post.id}

Source title:
${post.title}

Source excerpt:
${post.excerpt}

Reference prompts:
- ../../BLOG_REWRITE_PROMPTS.md

## Task
Use Prompt 1 + Prompt 2 + Prompt 3 from the prompt pack.
Return final JSON for this post in the contract format.

## Final JSON
\`\`\`json
{}
\`\`\`
`;

const main = async () => {
  const source = await fs.readFile(blogSourcePath, "utf-8");
  const posts = parsePosts(source);
  if (posts.length === 0) {
    throw new Error("No posts found in src/lib/blogData.ts");
  }

  const outDir =
    outputMode === "public"
      ? path.join(rootDir, "i18n", "blog-locales", targetLang)
      : path.join(rootDir, ".private", "blog-locales", targetLang);
  await fs.mkdir(outDir, { recursive: true });

  const indexLines = [
    `# Blog Locale Scaffold (${targetLang})`,
    "",
    `Generated from: \`src/lib/blogData.ts\``,
    `Prompts: \`${path.relative(rootDir, promptsPath).replace(/\\/g, "/")}\``,
    "",
    "## Files",
  ];

  for (const post of posts) {
    const filePath = path.join(outDir, `${post.id}.md`);
    await fs.writeFile(filePath, buildDraftTemplate(post), "utf-8");
    indexLines.push(`- \`${targetLang}/${post.id}.md\``);
  }

  await fs.writeFile(path.join(outDir, "README.md"), `${indexLines.join("\n")}\n`, "utf-8");

  const printedBase = outputMode === "public" ? "i18n/blog-locales" : ".private/blog-locales";
  console.log(
    `Scaffolded ${posts.length} blog rewrite drafts at ${printedBase}/${targetLang}/ (mode=${outputMode})`,
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
