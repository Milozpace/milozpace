import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, relative, resolve } from "node:path";

import { loadDemoContent } from "../src/lib/content";
import { scanForbiddenText } from "../src/lib/release-policy";

const root = process.cwd();
const requiredFiles = ["README.md", "LICENSE", "CONTENT_LICENSE.md", "THIRD_PARTY_NOTICES.md", "CHANGELOG.md", "SECURITY.md"];
const requiredRoutes = ["index.html", "notes/index.html", "life/index.html", "says/index.html", "about/index.html", "404.html"];
const textExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".css", ".html", ".svg", ".yml", ".yaml"]);
const scanRoots = ["src", "content", "public", "docs", "out", ".github"];
const exclusions = new Set(["src/lib/release-policy.ts", "tests/release-policy.test.ts", "scripts/release-check.ts"]);

function filesUnder(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

const failures: string[] = [];
for (const name of requiredFiles) if (!existsSync(resolve(root, name))) failures.push(`缺少发行文件：${name}`);
for (const route of requiredRoutes) if (!existsSync(resolve(root, "out", route))) failures.push(`缺少构建路由：/${route.replace(/index\.html$/, "")}`);

const content = loadDemoContent();
for (const article of content.articles) {
  const route = `notes/${article.slug}/index.html`;
  if (!existsSync(resolve(root, "out", route))) failures.push(`缺少文章路由：/${route}`);
}

for (const base of scanRoots) {
  for (const path of filesUnder(resolve(root, base))) {
    const name = relative(root, path).replaceAll("\\", "/");
    if (!textExtensions.has(extname(path)) || exclusions.has(name)) continue;
    for (const reason of scanForbiddenText(name, readFileSync(path, "utf8"))) failures.push(`${name}: ${reason}`);
  }
}

const builtFiles = filesUnder(resolve(root, "out"));
for (const file of builtFiles.filter((path) => extname(path) === ".html")) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:src|href)=["'](\/[^"'#?]+)["']/g)) {
    const candidate = resolve(root, "out", match[1].slice(1));
    const valid = existsSync(candidate) || existsSync(`${candidate}.html`) || existsSync(resolve(candidate, "index.html"));
    if (!valid) failures.push(`${relative(root, file)}: 失效本地资源 ${match[1]}`);
  }
}

if (failures.length) {
  console.error(`发行检查失败（${failures.length} 项）：\n- ${[...new Set(failures)].join("\n- ")}`);
  process.exit(1);
}

const manifest = builtFiles.sort().map((path) => ({
  path: relative(resolve(root, "out"), path).replaceAll("\\", "/"),
  bytes: statSync(path).size,
  sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
}));
mkdirSync(resolve(root, "artifacts"), { recursive: true });
writeFileSync(resolve(root, "artifacts", "release-manifest.json"), `${JSON.stringify({ version: "1.0.0", files: manifest }, null, 2)}\n`);
console.log(`发行检查通过：${requiredRoutes.length + content.articles.length} 个页面入口，${manifest.length} 个构建文件。`);
