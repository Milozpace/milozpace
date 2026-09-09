import { expect, test } from "@playwright/test";

const routes = [
  ["/", ".identity-hero h1"],
  ["/notes/", ".notes-compact-featured"],
  ["/life/", ".life-v9-stream"],
  ["/says/", ".confirmed-page-intro h1"],
  ["/about/", ".confirmed-about-note"],
  ["/notes/quiet-morning/", ".note-reading-header h1"],
  ["/notes/walking-after-rain/", ".note-reading-header h1"],
  ["/notes/small-collection/", ".note-reading-header h1"],
] as const;

test.describe("公开页面", () => {
  test("首页运行正式 refined-v3 动效控制器和 cloud-breath 环境", async ({ page }) => {
    await page.goto("/");
    const identity = page.locator("[data-architecture-section='identity']");
    await expect(identity).toHaveClass(/identity-motion-ready/);
    await expect(identity).toHaveClass(/identity-is-entered/);

    const ambient = page.locator(".confirmed-ambient");
    await expect(ambient.locator("feTurbulence")).toHaveCount(1);
    await expect(ambient.locator(".confirmed-distant-lights i")).toHaveCount(11);

    const writing = page.locator("[data-writing-concept='sky-manuscript']");
    await writing.scrollIntoViewIfNeeded();
    await expect(writing).toHaveClass(/writing-is-entered/);

    const life = page.locator("[data-life-concept='natural-two-column']");
    await life.scrollIntoViewIfNeeded();
    await expect(life).toHaveClass(/life-is-entered/);
  });

  for (const [path, selector] of routes) {
    test(`${path} 可访问`, async ({ page }) => {
      const externalRequests: string[] = [];
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      page.on("requestfailed", (request) => failedRequests.push(`${request.url()}: ${request.failure()?.errorText}`));
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (!['127.0.0.1', 'localhost'].includes(url.hostname)) externalRequests.push(request.url());
      });
      await page.goto(path);
      const navigation = page.getByRole("navigation", { name: "主导航" });
      await expect(navigation.getByRole("link", { name: "首页" })).toBeVisible();
      await expect(navigation.getByRole("link", { name: "手记", exact: true })).toBeVisible();
      await expect(navigation.getByRole("link", { name: "生活", exact: true })).toBeVisible();
      await expect(page.locator(selector).first()).toBeVisible();
      expect(externalRequests).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(failedRequests).toEqual([]);
    });
  }

  test("未知文章返回自定义 404", async ({ page }) => {
    const response = await page.goto("/notes/not-a-real-note/");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "这一页还没有被写下" })).toBeVisible();
  });

  test("主题切换会持久化", async ({ page }) => {
    await page.goto("/");
    const initial = await page.locator("html").getAttribute("data-theme");
    await page.getByRole("button", { name: /切换到/ }).click();
    const changed = await page.locator("html").getAttribute("data-theme");
    expect(changed).not.toBe(initial);
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", changed!);
  });

  test("所有正式路由的主题图标保持居中", async ({ page }) => {
    const routes = ["/notes/", "/life/", "/says/", "/about/", "/notes/quiet-morning/"];
    const waitForSettledIcon = async () => page.waitForFunction(() => {
      const dark = document.documentElement.dataset.theme === "dark";
      const icon = document.querySelector<HTMLElement>(dark ? ".confirmed-theme-moon" : ".confirmed-theme-sun");
      if (!icon) return false;
      const style = getComputedStyle(icon);
      const matrix = new DOMMatrixReadOnly(style.transform === "none" ? undefined : style.transform);
      return Number.parseFloat(style.opacity) > 0.99 && Math.abs(matrix.m41) < 0.01 && Math.abs(matrix.m42) < 0.01;
    });
    const centerDelta = async () => page.evaluate(() => {
      const button = document.querySelector<HTMLElement>(".confirmed-theme-toggle");
      const visible = document.querySelector<HTMLElement>(
        document.documentElement.dataset.theme === "dark" ? ".confirmed-theme-moon" : ".confirmed-theme-sun",
      );
      const svg = visible?.querySelector<SVGElement>("svg");
      if (!button || !svg) throw new Error("主题按钮或可见图标缺失");
      const buttonRect = button.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      return {
        buttonWidth: buttonRect.width,
        buttonHeight: buttonRect.height,
        x: svgRect.x + svgRect.width / 2 - (buttonRect.x + buttonRect.width / 2),
        y: svgRect.y + svgRect.height / 2 - (buttonRect.y + buttonRect.height / 2),
      };
    });

    for (const route of routes) {
      await page.goto(route);
      for (let state = 0; state < 2; state += 1) {
        await waitForSettledIcon();
        const measured = await centerDelta();
        expect(measured.buttonWidth).toBeCloseTo(40, 0);
        expect(measured.buttonHeight).toBeCloseTo(40, 0);
        expect(Math.abs(measured.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(measured.y)).toBeLessThanOrEqual(1);
        await page.locator(".confirmed-theme-toggle").click();
      }
    }
  });

  test("更多菜单遵循正式悬停、锁定、外部关闭和 Escape 行为", async ({ page }) => {
    await page.goto("/");
    const more = page.locator(".preview-more");
    const button = more.getByRole("button", { name: "更多" });
    const menu = page.locator("#preview-more-menu");

    await more.hover();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toBeVisible();

    await button.click();
    await page.locator(".identity-hero h1").click();
    await expect(button).toHaveAttribute("aria-expanded", "false");

    await button.click();
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("Notes 保留正式 featured 封面、年份语义和日期轨道", async ({ page }) => {
    await page.goto("/notes/");
    await expect(page.locator(".notes-compact-main")).toBeVisible();
    await expect(page.locator('[data-featured-cover="embedded"] img')).toBeVisible();
    await expect(page.locator("#compact-earlier-notes")).toBeVisible();
    const year = page.locator(".notes-compact-year").first();
    const yearId = await year.getAttribute("aria-labelledby");
    expect(yearId).toMatch(/^compact-year-/);
    await expect(page.locator(`#${yearId}`)).toBeVisible();
    await expect(page.locator(".notes-compact-date").first()).toHaveAttribute("aria-label");
    await expect(page.locator("[data-archive-note]").first()).toHaveAttribute("data-archive-note");
  });

  test("文章内页保留正式 v9 封面、时间轨、阅读进度与字体控制", async ({ page }, testInfo) => {
    await page.goto("/notes/quiet-morning/");
    await expect(page.locator('[data-note-reading-template="paper-system"]')).toBeVisible();
    await expect(page.locator('[data-note-timeline-variant="theme-responsive"]')).toBeVisible();
    await expect(page.locator(".note-reading-edge-progress")).toBeAttached();
    await expect(page.locator(".note-reading-cover img")).toBeVisible();
    await expect(page.locator(".note-reading-meta time")).toHaveText("2026年8月12日");
    await expect(page.locator(".note-reading-day-night-node.is-current")).toHaveCount(1);
    await expect(page.locator(".note-reading-day-night-handwritten")).toHaveAttribute("d", "M45 5C34 20 52 31 43 45S35 70 47 82s-8 25-2 39 1 24-8 34");
    await expect(page.locator(".note-reading-day-night-constellation")).toHaveAttribute("points", "40,7 31,42 47,77 35,116 43,153");
    await expect(page.locator(".note-reading-day-night-extension")).toHaveCount(4);
    if (testInfo.project.name !== "mobile") {
      const progressSize = await page.locator(".note-reading-progress").evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      expect(progressSize.width).toBeCloseTo(16, 0);
      expect(progressSize.height).toBeCloseTo(16, 0);
      const beforeFont = await page.locator(".note-reading-prose").evaluate((node) => getComputedStyle(node).fontFamily);
      const font = page.getByRole("button", { name: "切换为霞鹜文楷" });
      await font.click();
      await expect(page.getByRole("button", { name: "切换为宋体" })).toBeVisible();
      const changedFont = await page.locator(".note-reading-prose").evaluate((node) => getComputedStyle(node).fontFamily);
      expect(changedFont).not.toBe(beforeFont);
      await page.reload();
      await expect(page.getByRole("button", { name: "切换为宋体" })).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect(page.getByRole("button", { name: "回到顶部" })).toBeVisible();
    }
  });

  test("阅读器区分无封面文章并在移动端提供真实目录", async ({ page }, testInfo) => {
    await page.goto("/notes/small-collection/");
    await expect(page.locator(".note-reading-cover")).toHaveCount(0);
    await expect(page.locator(".note-reading-prose h2")).toHaveCount(2);
    if (testInfo.project.name === "mobile") {
      const toc = page.locator(".note-reading-mobile-toc");
      await expect(toc).toBeVisible();
      await toc.locator("summary").click();
      await expect(toc.getByRole("link", { name: "留下的片段" })).toBeVisible();
    }
  });

  test("导航在深处下滚隐藏、上滚后恢复", async ({ page }) => {
    await page.goto("/");
    const header = page.locator(".preview-header");
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(80);
    await expect(header).toHaveClass(/nav-is-hidden/);
    await page.evaluate(() => window.scrollBy(0, -80));
    await page.waitForTimeout(180);
    await expect(header).not.toHaveClass(/nav-is-hidden/);
    await expect(header).toHaveClass(/nav-is-revealed/);
  });

  test("键盘可操作导航和阅读工具", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "移动端按正式版隐藏侧栏阅读工具");
    await page.goto("/notes/quiet-morning/");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
    const sizeButton = page.getByRole("button", { name: "切换为霞鹜文楷" });
    await sizeButton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "切换为宋体" })).toBeFocused();
  });
});

test.describe("减少动态效果", () => {
  test.use({ reducedMotion: "reduce" });
  test("页面立即可读且背景漂移关闭", async ({ page }) => {
    await page.goto("/says/");
    await expect(page.getByRole("heading", { name: "一言" })).toBeVisible();
    const duration = await page.locator(".confirmed-quote-masonry blockquote").first().evaluate((node) => Number.parseFloat(getComputedStyle(node).animationDuration));
    expect(duration).toBeLessThanOrEqual(0.001);
  });
});
