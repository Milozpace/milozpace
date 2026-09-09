import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import {
  assertUniqueSlugs,
  loadDemoContent,
  parseArticleSource,
  validateLocalAssetPath,
} from "@/lib/content";

describe("article content contract", () => {
  test("derives the slug from the Markdown filename", () => {
    const article = parseArticleSource(
      "quiet-morning.md",
      `---\ntitle: 安静的清晨\nsummary: 一段示例摘要\ndate: 2026-08-12\ncover: /demo/morning.svg\n---\n\n正文。`,
    );
    expect(article).toMatchObject({ slug: "quiet-morning", title: "安静的清晨", date: "2026-08-12" });
    expect(article.body).toContain("正文");
  });

  test("reports the source file when required frontmatter is missing", () => {
    expect(() => parseArticleSource("broken.md", "---\nsummary: 缺少标题\ndate: 2026-08-12\n---\n正文"))
      .toThrow("broken.md: missing required frontmatter field title");
  });

  test("rejects duplicate article slugs", () => {
    expect(() => assertUniqueSlugs(["one", "two", "one"]))
      .toThrow("duplicate article slug: one");
  });

  test("rejects remote and escaping asset paths", () => {
    expect(() => validateLocalAssetPath("https://example.test/a.jpg", "article.md")).toThrow();
    expect(() => validateLocalAssetPath("../private.jpg", "article.md")).toThrow();
    expect(validateLocalAssetPath("/demo/morning.svg", "article.md")).toBe("/demo/morning.svg");
  });

  test("loads exactly the reviewed demo content and its assets", () => {
    const demo = loadDemoContent();
    expect(demo.articles).toHaveLength(3);
    expect(demo.life).toHaveLength(6);
    expect(demo.says).toHaveLength(6);
    expect(demo.articles.every((article) => article.topic && article.weather && article.mood && article.place)).toBe(true);
    expect(demo.life.every((entry) => entry.displayDate && ["text", "photo"].includes(entry.kind))).toBe(true);
    expect(demo.says.every((entry) => entry.body && entry.collectedDate)).toBe(true);
    for (const asset of demo.assetPaths) {
      expect(existsSync(resolve(process.cwd(), "public", asset.slice(1))), asset).toBe(true);
    }
  });
});
