import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanRoots = ["src", "public", "functions", "index.html"];
const skipDirs = new Set(["node_modules", "dist", "dist-ssr", ".git", ".wrangler"]);
const blockedPatterns = [
  /TrabajarEnHolanda/gi,
  /trabajarenholanda/gi,
  /trabajar-en-holanda/gi,
];

const findings = [];

const shouldScanFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (!ext) return true;
  return [".ts", ".tsx", ".js", ".jsx", ".json", ".html", ".css", ".md", ".txt", ".yml", ".yaml"].includes(ext);
};

const scanFile = (filePath) => {
  if (!shouldScanFile(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, idx) => {
    for (const pattern of blockedPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        findings.push(`${path.relative(root, filePath)}:${idx + 1}: ${line.trim()}`);
      }
    }
  });
};

const walk = (targetPath) => {
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    scanFile(targetPath);
    return;
  }

  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && skipDirs.has(entry.name)) continue;
    walk(path.join(targetPath, entry.name));
  }
};

for (const relPath of scanRoots) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) continue;
  walk(fullPath);
}

if (findings.length > 0) {
  console.error("Site boundary check failed. Found foreign brand references:");
  findings.forEach((line) => console.error(`- ${line}`));
  process.exit(1);
}

console.log("Site boundary check passed.");
