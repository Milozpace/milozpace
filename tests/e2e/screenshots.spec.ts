import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "@playwright/test";

test("生成公开 demo 截图", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "截图只由桌面项目生成一次");
  const directory = resolve(process.cwd(), "docs", "screenshots");
  mkdirSync(directory, { recursive: true });

  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: resolve(directory, "home-light-desktop.png"), fullPage: true });

  for (const [path, name, ready] of [["/notes/", "notes-light-desktop.png", ".notes-compact-featured"], ["/life/", "life-light-desktop.png", ".life-v9-stream"], ["/says/", "says-light-desktop.png", ".confirmed-quote-masonry"], ["/about/", "about-light-desktop.png", ".confirmed-about-note"], ["/notes/quiet-morning/", "article-light-desktop.png", ".note-reading-paper"]] as const) {
    await page.goto(path);
    await page.locator(ready).waitFor({ state: "visible" });
    await page.waitForTimeout(path === "/about/" ? 1400 : 300);
    await page.screenshot({ path: resolve(directory, name), fullPage: true });
  }

  await page.goto("/");

  await page.getByRole("button", { name: /切换到夜间模式/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: resolve(directory, "home-dark-desktop.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/life/");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: resolve(directory, "life-dark-mobile.png"), fullPage: true });
});
