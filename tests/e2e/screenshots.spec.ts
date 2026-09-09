import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { expect, type Page, test } from "@playwright/test";

async function prepareHomeForFullPageScreenshot(page: Page) {
  const writing = page.locator("[data-writing-concept='sky-manuscript']");
  const life = page.locator("[data-life-concept='natural-two-column']");
  const ending = page.locator("[data-home-refined-v3-ending]");

  await writing.scrollIntoViewIfNeeded();
  await expect(writing).toHaveClass(/writing-is-entered/);
  await life.scrollIntoViewIfNeeded();
  await expect(life).toHaveClass(/life-is-entered/);
  await ending.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images, (image) => {
        if (image.complete && image.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((resolveImage) => {
          image.addEventListener("load", () => resolveImage(), { once: true });
          image.addEventListener("error", () => resolveImage(), { once: true });
        });
      }),
    );
    window.scrollTo(0, 0);
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.waitForTimeout(300);
}

test("生成公开 demo 截图", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "截图只由桌面项目生成一次");
  const directory = resolve(process.cwd(), "docs", "screenshots");
  mkdirSync(directory, { recursive: true });

  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await prepareHomeForFullPageScreenshot(page);
  await page.screenshot({ path: resolve(directory, "home-light-desktop.png"), fullPage: true });

  for (const [path, name, ready] of [["/notes/", "notes-light-desktop.png", ".notes-compact-featured"], ["/life/", "life-light-desktop.png", ".life-v9-stream"], ["/says/", "says-light-desktop.png", ".confirmed-quote-masonry"], ["/about/", "about-light-desktop.png", ".confirmed-about-note"], ["/notes/quiet-morning/", "article-light-desktop.png", ".note-reading-paper"]] as const) {
    await page.goto(path);
    await page.locator(ready).waitFor({ state: "visible" });
    await page.waitForTimeout(path === "/about/" ? 1400 : 300);
    await page.screenshot({ path: resolve(directory, name), fullPage: true });
  }

  await page.goto("/");

  await page.getByRole("button", { name: /切换到夜间模式/ }).click();
  await prepareHomeForFullPageScreenshot(page);
  await page.screenshot({ path: resolve(directory, "home-dark-desktop.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/life/");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: resolve(directory, "life-dark-mobile.png"), fullPage: true });
});
