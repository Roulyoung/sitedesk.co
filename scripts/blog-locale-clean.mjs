import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const args = process.argv.slice(2);

const getArg = (name, fallback = "") => {
  const flag = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(flag));
  if (!found) return fallback;
  return found.slice(flag.length).trim();
};

const lang = getArg("lang", "");
const scope = getArg("scope", "private").toLowerCase();

if (!["private", "public", "all"].includes(scope)) {
  console.error("Invalid --scope value. Use --scope=private|public|all");
  process.exit(1);
}

const targets = [];
if (scope === "private" || scope === "all") {
  targets.push(path.join(rootDir, ".private", "blog-locales", lang || ""));
}
if (scope === "public" || scope === "all") {
  targets.push(path.join(rootDir, "i18n", "blog-locales", lang || ""));
}

const cleanPath = async (targetPath) => {
  try {
    await fs.rm(targetPath, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
};

const main = async () => {
  let count = 0;
  for (const target of targets) {
    const ok = await cleanPath(target);
    if (ok) {
      count += 1;
      console.log(`Removed: ${path.relative(rootDir, target).replace(/\\/g, "/")}`);
    }
  }
  if (count === 0) {
    console.log("Nothing removed.");
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
