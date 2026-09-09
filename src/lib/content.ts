import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, extname, resolve } from "node:path";

import matter from "gray-matter";

export type Article = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  cover?: string;
  topic?: string;
  weather?: string;
  mood?: string;
  place?: string;
  body: string;
};

export type LifeEntry = {
  displayDate: string;
  kind: "text" | "photo";
  body: string;
  image?: string;
  imageAlt?: string;
  aspect?: "portrait" | "landscape";
};

export type Saying = {
  body: string;
  collectedDate: string;
  author?: string;
  source?: string;
};

export type DemoContent = {
  articles: Article[];
  life: LifeEntry[];
  says: Saying[];
  assetPaths: string[];
};

const contentRoot = resolve(process.cwd(), "content", "demo");
const articleRoot = resolve(contentRoot, "articles");

function requireText(value: unknown, field: string, source: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${source}: missing required frontmatter field ${field}`);
  }
  return value.trim();
}

export function validateLocalAssetPath(value: string, source: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("..") || /^https?:/i.test(value)) {
    throw new Error(`${source}: asset path must be local and rooted at /`);
  }
  return value;
}

export function parseArticleSource(fileName: string, source: string): Article {
  const parsed = matter(source);
  const title = requireText(parsed.data.title, "title", fileName);
  const summary = requireText(parsed.data.summary, "summary", fileName);
  const rawDate = parsed.data.date instanceof Date
    ? parsed.data.date.toISOString().slice(0, 10)
    : requireText(parsed.data.date, "date", fileName);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    throw new Error(`${fileName}: date must use YYYY-MM-DD`);
  }
  const cover = parsed.data.cover === undefined
    ? undefined
    : validateLocalAssetPath(requireText(parsed.data.cover, "cover", fileName), fileName);
  const optionalText = (field: string) => parsed.data[field] === undefined
    ? undefined
    : requireText(parsed.data[field], field, fileName);
  const slug = basename(fileName, extname(fileName));
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`${fileName}: filename must be a lowercase kebab-case slug`);
  }
  const body = parsed.content.trim();
  if (!body) throw new Error(`${fileName}: article body is empty`);
  return {
    slug,
    title,
    summary,
    date: rawDate,
    ...(cover ? { cover } : {}),
    ...(optionalText("topic") ? { topic: optionalText("topic") } : {}),
    ...(optionalText("weather") ? { weather: optionalText("weather") } : {}),
    ...(optionalText("mood") ? { mood: optionalText("mood") } : {}),
    ...(optionalText("place") ? { place: optionalText("place") } : {}),
    body,
  };
}

export function assertUniqueSlugs(slugs: string[]): void {
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) throw new Error(`duplicate article slug: ${slug}`);
    seen.add(slug);
  }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function validateLife(entries: LifeEntry[]): LifeEntry[] {
  if (!Array.isArray(entries)) throw new Error("content/demo/life.json: expected an array");
  return entries.map((entry, index) => {
    const source = `content/demo/life.json entry ${index + 1}`;
    if (!entry.displayDate || !/^\d{4}-\d{2}-\d{2}$/.test(entry.displayDate) || !entry.body?.trim()) {
      throw new Error(`${source}: displayDate (YYYY-MM-DD) and body are required`);
    }
    if (entry.kind !== "text" && entry.kind !== "photo") throw new Error(`${source}: kind must be text or photo`);
    if (entry.image) validateLocalAssetPath(entry.image, source);
    if (entry.image && !entry.imageAlt) throw new Error(`${source}: imageAlt is required with image`);
    if (entry.kind === "photo" && (!entry.image || !entry.imageAlt)) throw new Error(`${source}: photo entries require image and imageAlt`);
    if (entry.aspect && entry.aspect !== "portrait" && entry.aspect !== "landscape") throw new Error(`${source}: invalid aspect`);
    return entry;
  });
}

function validateSays(entries: Saying[]): Saying[] {
  if (!Array.isArray(entries)) throw new Error("content/demo/says.json: expected an array");
  return entries.map((entry, index) => {
    if (!entry.body?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(entry.collectedDate)) {
      throw new Error(`content/demo/says.json entry ${index + 1}: body and collectedDate (YYYY-MM-DD) are required`);
    }
    return entry;
  });
}

export function loadDemoContent(): DemoContent {
  const articles = readdirSync(articleRoot)
    .filter((file) => file.endsWith(".md"))
    .map((file) => parseArticleSource(file, readFileSync(resolve(articleRoot, file), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date));
  assertUniqueSlugs(articles.map((article) => article.slug));
  const life = validateLife(readJson<LifeEntry[]>(resolve(contentRoot, "life.json")));
  const says = validateSays(readJson<Saying[]>(resolve(contentRoot, "says.json")));
  const assetPaths = [
    ...articles.flatMap((article) => article.cover ? [article.cover] : []),
    ...life.flatMap((entry) => entry.image ? [entry.image] : []),
  ];
  for (const asset of assetPaths) {
    if (!existsSync(resolve(process.cwd(), "public", asset.slice(1)))) {
      throw new Error(`missing local asset: ${asset}`);
    }
  }
  return { articles, life, says, assetPaths };
}

export function getAllArticles(): Article[] {
  return loadDemoContent().articles;
}

export function getArticle(slug: string): Article | undefined {
  return getAllArticles().find((article) => article.slug === slug);
}
