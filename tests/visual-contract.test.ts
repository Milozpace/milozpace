import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("1.3.1 visual contract", () => {
  test("uses the cloud-breath shell instead of the rejected editorial shell", () => {
    const layout = read("src/app/layout.tsx");
    const frame = read("src/components/site-frame.tsx");
    const css = `${read("src/app/globals.css")}\n${read("src/styles/shell.css")}`;
    expect(layout).toContain("<SiteFrame");
    expect(frame).toContain("<ConfirmedAmbient");
    expect(frame).toContain("<SiteHeader");
    expect(css).toContain("#EAF4FA");
    expect(css).toContain("#111827");
    expect(css).not.toContain("--paper: #f3efe7");
  });

  test("keeps the selected 1.3.1 page structures", () => {
    const frame = read("src/components/site-frame.tsx");
    expect(read("src/app/page.tsx")).toContain("identity-hero");
    expect(read("src/app/page.tsx")).not.toContain("留一点空间");
    expect(read("src/app/notes/page.tsx")).toContain("notes-compact-index");
    expect(read("src/components/life-template.ts")).toContain("life-v9-timeline");
    expect(read("src/app/says/page.tsx")).toContain("confirmed-quote-masonry");
    expect(read("src/app/about/page.tsx")).toContain("about-pocket-note-fine-sig-swash");
    expect(frame).toContain('"note-reading-layout"');
  });

  test("runs the copied refined-v3 homepage motion controller instead of hardcoding final states", () => {
    const page = read("src/app/page.tsx");
    const layout = read("src/app/layout.tsx");
    const motion = read("src/components/home-narrative-refined-v3-motion.tsx");
    const css = read("src/styles/home.css");
    expect(page).toContain("HomeNarrativeRefinedV3Motion");
    expect(page).not.toMatch(/identity-is-entered|writing-is-entered|life-is-entered|wind-is-finished|final-transition-is-active/);
    expect(layout).toContain('id="home-motion-init"');
    expect(layout).toContain("<head>");
    expect(layout).toContain("dangerouslySetInnerHTML");
    expect(layout.indexOf('id="home-motion-init"')).toBeLessThan(layout.indexOf("<body>"));
    expect(layout).toContain('classList.add("home-motion-booting")');
    expect(css).toContain("html.home-motion-booting .home-refined-v3");
    expect(motion).toContain("new IntersectionObserver");
    expect(motion).toContain("identity-motion-ready");
    expect(motion).toContain("void identity.offsetWidth");
    expect(motion).toContain('window.addEventListener("pageshow"');
    expect(motion).toContain('classList.remove("home-motion-booting")');
    expect(motion).toContain("page-breath-is-responding");
  });

  test("uses the frozen 1.3.1 identity viewport rhythm instead of the legacy full-height hero", () => {
    const css = read("src/styles/home.css");
    expect(css).toContain("--identity-next-peek: clamp(3.5rem, 7vh, 4.5rem)");
    expect(css).toContain("min-height: max(28rem, calc(100svh - 18.75rem - var(--identity-next-peek)))");
    expect(css).toContain("padding: clamp(2.75rem, 6vh, 4.5rem) 1rem");
    expect(css).toContain("min-height: auto; padding: 4rem 0.25rem 5.5rem");
    expect(css).not.toContain("min-height: calc(100svh - 4.25rem)");
  });

  test("uses the selected 1.3.1 ambient component rather than an inline approximation", () => {
    const layout = read("src/app/layout.tsx");
    const frame = read("src/components/site-frame.tsx");
    const ambient = read("src/components/confirmed-ambient.tsx");
    expect(frame).toContain("<ConfirmedAmbient");
    expect(layout).not.toContain("cloud-blur");
    expect(ambient).toContain('viewBox="0 0 1200 700"');
    expect(ambient).toContain("feTurbulence");
    expect(ambient).toContain("confirmed-evening-star");
    expect(ambient).toContain("Array.from({ length: 11 }");
  });

  test("copies the selected navigation DOM and interaction controller", () => {
    const header = read("src/components/site-header.tsx");
    expect(header).toContain("confirmed-header--no-backdrop");
    expect(header).toContain('"confirmed-nav-item"');
    expect(header).toContain('"preview-nav-item"');
    expect(header).toContain("confirmed-menu-icon");
    expect(header).toContain("confirmed-more-menu--no-backdrop");
    expect(header).toContain("aria-expanded={open}");
    expect(header).toContain("onMouseEnter");
    expect(header).toContain('event.key !== "Escape"');
    expect(header).toContain("nav-is-hidden");
    expect(header).toContain("accumulatedDistance >= 16");
    expect(header).toContain("currentScrollY > 600");
    expect(header).not.toContain("<details");
    expect(header).not.toContain("<summary");
  });

  test("uses the frozen navigation geometry without legacy shell offsets", () => {
    const css = read("src/styles/nav.css");
    expect(css).toContain("position: sticky");
    expect(css).toContain("top: 0");
    expect(css).toContain("min-height: 0");
    expect(css).toContain("padding-top: 0");
    expect(css).toContain("align-items: stretch");
  });

  test("initializes theme synchronously in the document head and uses formal svg icons", () => {
    const layout = read("src/app/layout.tsx");
    const theme = read("src/components/theme-toggle.tsx");
    expect(layout).not.toContain('import Script from "next/script"');
    expect(layout).toContain('id="theme-init"');
    expect(layout.indexOf('id="theme-init"')).toBeLessThan(layout.indexOf("<body>"));
    expect(layout).toContain("milozpace-theme");
    expect(theme).toContain("<svg");
    expect(theme).toContain("theme-is-transitioning");
    expect(theme).not.toContain(">☼<");
    expect(theme).not.toContain(">☾<");
  });

  test("copies the formal compact Notes structure around local demo content", () => {
    const notes = read("src/app/notes/page.tsx");
    const frame = read("src/components/site-frame.tsx");
    expect(frame).toContain('"notes-compact-main"');
    expect(notes).toContain("notes-compact-featured-cover");
    expect(notes).toContain('data-featured-cover="embedded"');
    expect(notes).toContain('aria-labelledby="compact-earlier-notes"');
    expect(notes).toContain("compact-year-${year}");
    expect(notes).toContain("data-archive-note");
    expect(notes).toContain('aria-hidden="true"');
    expect(notes).toContain('aria-label={`${article.title}的信息`}');
    expect(notes).not.toContain("String(2 - index)");
  });

  test("copies the formal day-night article reader contract", () => {
    const reader = read("src/app/notes/[slug]/page.tsx");
    const frame = read("src/components/site-frame.tsx");
    const experience = read("src/components/note-reading-experience.tsx");
    const css = read("src/styles/reader.css");
    expect(frame).toContain("note-reading-edge-progress");
    expect(reader).toContain("NoteReadingExperience");
    expect(frame).toContain("data-note-timeline-theme");
    expect(reader).toContain("slugger");
    expect(experience).toContain("note-reading-cover");
    expect(experience).toContain("note-reading-mobile-toc");
    expect(experience).toContain("note-reading-bottom-topic");
    expect(experience).toContain("headingIdByLine.get");
    expect(experience).toContain("milozpace:note-reading-font");
    expect(experience).toContain("ResizeObserver");
    expect(experience).toContain("M45 5C34 20 52 31 43 45S35 70 47 82s-8 25-2 39 1 24-8 34");
    expect(experience).toContain("getTimelinePoints(visible.length, geometry)");
    expect(css).toMatch(/\.note-reading-progress\s*\{\s*width:\s*1rem;\s*height:\s*1rem;/);
    expect(css).toContain("stroke-dasharray: 2 3");
    expect(css).toContain(".note-reading-prose.has-drop-cap > p:first-child::first-letter");
    expect(frame).toContain('data-note-timeline-variant={reader ? "theme-responsive"');
  });
});
