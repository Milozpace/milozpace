"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Article } from "@/lib/content";

export type ReadingHeading = { id: string; text: string; level: 2 | 3 };

const FONT_STORAGE_KEY = "milozpace:note-reading-font";
const READING_FONTS = [
  { id: "source-serif", name: "宋体", family: '"思源宋体 CN", "Noto Serif SC", "Songti SC", STSong, serif' },
  { id: "lxgw-wenkai", name: "霞鹜文楷", family: '"霞鹜文楷", "LXGW WenKai", "Kaiti SC", KaiTi, serif' },
] as const;
type ReadingFontId = (typeof READING_FONTS)[number]["id"];
type TimelinePoint = { x: number; y: number };
type TimelineCubic = { p0: TimelinePoint; p1: TimelinePoint; p2: TimelinePoint; p3: TimelinePoint };

const HANDWRITTEN_PATH = "M45 5C34 20 52 31 43 45S35 70 47 82s-8 25-2 39 1 24-8 34";
const CONSTELLATION_POINTS = "40,7 31,42 47,77 35,116 43,153";
const CONSTELLATION_GEOMETRY: TimelinePoint[] = [
  { x: 40, y: 7 }, { x: 31, y: 42 }, { x: 47, y: 77 }, { x: 35, y: 116 }, { x: 43, y: 153 },
];
const HANDWRITTEN_SEGMENTS: TimelineCubic[] = [
  { p0: { x: 45, y: 5 }, p1: { x: 34, y: 20 }, p2: { x: 52, y: 31 }, p3: { x: 43, y: 45 } },
  { p0: { x: 43, y: 45 }, p1: { x: 34, y: 59 }, p2: { x: 35, y: 70 }, p3: { x: 47, y: 82 } },
  { p0: { x: 47, y: 82 }, p1: { x: 59, y: 94 }, p2: { x: 39, y: 107 }, p3: { x: 45, y: 121 } },
  { p0: { x: 45, y: 121 }, p1: { x: 51, y: 135 }, p2: { x: 46, y: 145 }, p3: { x: 37, y: 155 } },
];

function mixPoint(left: TimelinePoint, right: TimelinePoint, amount: number): TimelinePoint {
  return { x: left.x + (right.x - left.x) * amount, y: left.y + (right.y - left.y) * amount };
}

function cubicPoint(segment: TimelineCubic, amount: number): TimelinePoint {
  const inverse = 1 - amount;
  return {
    x: inverse ** 3 * segment.p0.x + 3 * inverse ** 2 * amount * segment.p1.x + 3 * inverse * amount ** 2 * segment.p2.x + amount ** 3 * segment.p3.x,
    y: inverse ** 3 * segment.p0.y + 3 * inverse ** 2 * amount * segment.p1.y + 3 * inverse * amount ** 2 * segment.p2.y + amount ** 3 * segment.p3.y,
  };
}

function splitCubic(segment: TimelineCubic, amount: number): [TimelineCubic, TimelineCubic] {
  const p01 = mixPoint(segment.p0, segment.p1, amount);
  const p12 = mixPoint(segment.p1, segment.p2, amount);
  const p23 = mixPoint(segment.p2, segment.p3, amount);
  const p012 = mixPoint(p01, p12, amount);
  const p123 = mixPoint(p12, p23, amount);
  const point = mixPoint(p012, p123, amount);
  return [{ p0: segment.p0, p1: p01, p2: p012, p3: point }, { p0: point, p1: p123, p2: p23, p3: segment.p3 }];
}

export function sampleTimelineGeometry(geometry: "handwritten" | "constellation", progress: number): TimelinePoint {
  const bounded = Math.max(0, Math.min(1, progress));
  if (geometry === "constellation") {
    const scaled = bounded * (CONSTELLATION_GEOMETRY.length - 1);
    const index = Math.min(Math.floor(scaled), CONSTELLATION_GEOMETRY.length - 2);
    return mixPoint(CONSTELLATION_GEOMETRY[index], CONSTELLATION_GEOMETRY[index + 1], scaled - index);
  }
  const scaled = bounded * HANDWRITTEN_SEGMENTS.length;
  const index = Math.min(Math.floor(scaled), HANDWRITTEN_SEGMENTS.length - 1);
  return cubicPoint(HANDWRITTEN_SEGMENTS[index], Math.min(1, scaled - index));
}

export function getTimelinePoints(count: number, geometry: "handwritten" | "constellation"): TimelinePoint[] {
  const start = 0.12;
  const end = 0.88;
  if (count <= 1) return [sampleTimelineGeometry(geometry, 0.5)];
  return Array.from({ length: count }, (_, index) => sampleTimelineGeometry(geometry, start + ((end - start) * index) / (count - 1)));
}

function cubicCommand(segment: TimelineCubic) {
  return `C${segment.p1.x} ${segment.p1.y} ${segment.p2.x} ${segment.p2.y} ${segment.p3.x} ${segment.p3.y}`;
}

function handwrittenExtension(position: "top" | "bottom") {
  const progress = position === "top" ? 0.12 : 0.88;
  const scaled = progress * HANDWRITTEN_SEGMENTS.length;
  const index = Math.min(Math.floor(scaled), HANDWRITTEN_SEGMENTS.length - 1);
  const [before, after] = splitCubic(HANDWRITTEN_SEGMENTS[index], scaled - index);
  if (position === "top") return `M${HANDWRITTEN_SEGMENTS[0].p0.x} ${HANDWRITTEN_SEGMENTS[0].p0.y}${HANDWRITTEN_SEGMENTS.slice(0, index).map(cubicCommand).join("")}${cubicCommand(before)}`;
  return `M${after.p0.x} ${after.p0.y}${cubicCommand(after)}${HANDWRITTEN_SEGMENTS.slice(index + 1).map(cubicCommand).join("")}`;
}

function constellationExtension(position: "top" | "bottom") {
  const progress = position === "top" ? 0.12 : 0.88;
  const scaled = progress * (CONSTELLATION_GEOMETRY.length - 1);
  const index = Math.min(Math.floor(scaled), CONSTELLATION_GEOMETRY.length - 2);
  const point = sampleTimelineGeometry("constellation", progress);
  const points = position === "top" ? [...CONSTELLATION_GEOMETRY.slice(0, index + 1), point] : [point, ...CONSTELLATION_GEOMETRY.slice(index + 1)];
  return points.map(({ x, y }) => `${x},${y}`).join(" ");
}

function DayNightTimelineLine({ shapeId }: { shapeId: string }) {
  const handwrittenStart = sampleTimelineGeometry("handwritten", 0.12);
  const handwrittenEnd = sampleTimelineGeometry("handwritten", 0.88);
  const constellationStart = sampleTimelineGeometry("constellation", 0.12);
  const constellationEnd = sampleTimelineGeometry("constellation", 0.88);
  return <svg aria-hidden="true" className="note-reading-day-night-line" preserveAspectRatio="none" viewBox="0 0 80 160">
    <defs>
      <linearGradient id={`${shapeId}-top-gradient`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="white" stopOpacity="0" /><stop offset="1" stopColor="white" /></linearGradient>
      <linearGradient id={`${shapeId}-bottom-gradient`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="white" /><stop offset="1" stopColor="white" stopOpacity="0" /></linearGradient>
      <mask id={`${shapeId}-top-mask`}><rect fill={`url(#${shapeId}-top-gradient)`} height="24" width="80" /></mask>
      <mask id={`${shapeId}-bottom-mask`}><rect fill={`url(#${shapeId}-bottom-gradient)`} height="24" width="80" y="136" /></mask>
      <clipPath id={`${shapeId}-handwritten-core`}><rect height={handwrittenEnd.y - handwrittenStart.y} width="100" x="-10" y={handwrittenStart.y} /></clipPath>
      <clipPath id={`${shapeId}-constellation-core`}><rect height={constellationEnd.y - constellationStart.y} width="100" x="-10" y={constellationStart.y} /></clipPath>
    </defs>
    <path className="note-reading-day-night-handwritten" d={HANDWRITTEN_PATH} clipPath={`url(#${shapeId}-handwritten-core)`} />
    <path className="note-reading-day-night-extension note-reading-day-night-extension--handwritten note-reading-day-night-extension--top" d={handwrittenExtension("top")} mask={`url(#${shapeId}-top-mask)`} />
    <path className="note-reading-day-night-extension note-reading-day-night-extension--handwritten note-reading-day-night-extension--bottom" d={handwrittenExtension("bottom")} mask={`url(#${shapeId}-bottom-mask)`} />
    <polyline className="note-reading-day-night-constellation" points={CONSTELLATION_POINTS} clipPath={`url(#${shapeId}-constellation-core)`} />
    <polyline className="note-reading-day-night-extension note-reading-day-night-extension--constellation note-reading-day-night-extension--top" mask={`url(#${shapeId}-top-mask)`} points={constellationExtension("top")} />
    <polyline className="note-reading-day-night-extension note-reading-day-night-extension--constellation note-reading-day-night-extension--bottom" mask={`url(#${shapeId}-bottom-mask)`} points={constellationExtension("bottom")} />
  </svg>;
}

function Timeline({ article, articles, theme }: { article: Article; articles: Article[]; theme: "light" | "dark" }) {
  const currentIndex = Math.max(0, articles.findIndex((item) => item.slug === article.slug));
  const windowSize = Math.min(5, articles.length);
  const nodeStart = Math.max(0, Math.min(currentIndex - 2, articles.length - windowSize));
  const visible = articles.slice(nodeStart, nodeStart + windowSize);
  const geometry = theme === "dark" ? "constellation" : "handwritten";
  const points = getTimelinePoints(visible.length, geometry);
  const shapeId = `note-reading-day-night-static-${useId().replaceAll(":", "")}`;
  return <div className="note-reading-day-night-timeline-static" data-timeline-geometry={geometry} data-timeline-theme={theme}>
    <div className="note-reading-day-night-viewport"><div className="note-reading-day-night-canvas" style={{ "--timeline-canvas-height": "160px" } as React.CSSProperties}>
      <DayNightTimelineLine shapeId={shapeId} />
      <ol aria-label="手记时间轨" className="note-reading-day-night-nodes">{visible.map((item, index) => {
        const point = points[index];
        const selected = item.slug === article.slug;
        return <li className={`note-reading-day-night-node${selected ? " is-current" : ""}`} key={item.slug} style={{ "--timeline-node-x": `${(point.x / 80) * 100}%`, "--timeline-node-y": `${(point.y / 160) * 100}%` } as React.CSSProperties}>
          <Link aria-current={selected ? "page" : undefined} href={`/notes/${item.slug}`} prefetch={false}>
            <span className="note-reading-day-night-label"><time>{item.date}</time><span>{item.title}</span></span><span aria-hidden="true" className="note-reading-day-night-dot" />
          </Link>
        </li>;
      })}</ol>
    </div></div>
  </div>;
}

function formatPublishedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

function calculateReadingProgress(scrollY: number, articleTop: number, articleBottom: number, viewportHeight: number) {
  const distance = articleBottom - articleTop - viewportHeight;
  if (distance <= 0) return 100;
  return Math.round(Math.min(1, Math.max(0, (scrollY - articleTop) / distance)) * 100);
}

function useReadingProgress(readingRef: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = readingRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const top = window.scrollY + rect.top;
      setProgress(calculateReadingProgress(window.scrollY, top, top + element.offsetHeight, window.innerHeight));
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    if (readingRef.current) observer.observe(readingRef.current);
    return () => { window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); observer.disconnect(); if (frame) window.cancelAnimationFrame(frame); };
  }, [readingRef]);
  return progress;
}

function useActiveHeading(headings: ReadingHeading[]) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");
  useEffect(() => {
    if (!headings.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const positions = headings.flatMap((heading) => { const element = document.getElementById(heading.id); return element ? [{ id: heading.id, top: element.getBoundingClientRect().top }] : []; });
      if (!positions.length) return;
      const line = Math.min(180, window.innerHeight * 0.22);
      setActiveId(positions.reduce((active, heading) => heading.top <= line ? heading.id : active, positions[0].id));
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); if (frame) window.cancelAnimationFrame(frame); };
  }, [headings]);
  return activeId;
}

function ReadingTools({ headings, progress, fontId, onFontChange }: { headings: ReadingHeading[]; progress: number; fontId: ReadingFontId; onFontChange: (font: ReadingFontId) => void }) {
  const activeHeading = useActiveHeading(headings);
  const current = READING_FONTS.find((font) => font.id === fontId) ?? READING_FONTS[0];
  const target = READING_FONTS.find((font) => font.id !== current.id) ?? READING_FONTS[1];
  const circumference = 2 * Math.PI * 7;
  const backToTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  return <aside aria-label="阅读工具" className="note-reading-tools note-reading-tools-v4">
    {headings.length > 0 && <><nav aria-label="文章目录" className="note-reading-toc note-reading-toc-v4">{headings.map((heading) => <a aria-current={activeHeading === heading.id ? "location" : undefined} className={heading.level === 3 ? "is-subheading" : undefined} href={`#${heading.id}`} key={heading.id}>{heading.text}</a>)}</nav><svg aria-hidden="true" className="note-reading-toc-divider" preserveAspectRatio="none" viewBox="0 0 128 10"><path d="M2 5.4c12-4.2 22 3.5 34 .2s23-3.7 35-.1 22 3.8 33 .3 15-2.4 22-.5" /></svg></>}
    <div className="note-reading-accessory"><div className="note-reading-progress-row"><div aria-label={`阅读进度 ${progress}%`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={progress} className="note-reading-progress" role="progressbar"><svg aria-hidden="true" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" /><circle className="note-reading-progress-value" cx="9" cy="9" r="7" style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - progress / 100) }} /></svg></div><span className="note-reading-progress-label">{progress}%</span>{progress > 10 && <button aria-label="回到顶部" className="note-reading-backtop note-reading-backtop-v4" onClick={backToTop} type="button"><svg aria-hidden="true" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" /><path d="M7 9.5V4.8M4.9 6.8 7 4.7l2.1 2.1" /></svg></button>}</div>
      <button aria-label={`切换为${target.name}`} className="note-reading-font-switch" onClick={() => onFontChange(target.id)} type="button"><span aria-hidden="true" className="note-reading-font-mark">A</span><span className="note-reading-font-current" style={{ fontFamily: current.family }}>{current.name}</span><span aria-hidden="true" className="note-reading-font-arrow">→</span><span className="note-reading-font-target" style={{ fontFamily: target.family }}>{target.name}</span></button>
    </div>
  </aside>;
}

export function NoteReadingExperience({ article, articles, headings }: { article: Article; articles: Article[]; headings: ReadingHeading[] }) {
  const readingRef = useRef<HTMLElement>(null);
  const progress = useReadingProgress(readingRef);
  const [fontId, setFontId] = useState<ReadingFontId>("source-serif");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const headingIdByLine = useMemo(() => {
    const ids = new Map<number, string>();
    let index = 0;
    article.body.split(/\r?\n/).forEach((line, lineIndex) => { if (/^#{2,3}\s+/.test(line)) { const heading = headings[index++]; if (heading) ids.set(lineIndex + 1, heading.id); } });
    return ids;
  }, [article.body, headings]);
  const currentIndex = articles.findIndex((item) => item.slug === article.slug);
  const previous = articles[currentIndex + 1];
  const next = articles[currentIndex - 1];
  const selectedFont = READING_FONTS.find((font) => font.id === fontId) ?? READING_FONTS[0];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { const stored = window.localStorage.getItem(FONT_STORAGE_KEY); if (READING_FONTS.some((font) => font.id === stored)) setFontId(stored as ReadingFontId); });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const sync = () => {
      const resolved = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      setTheme(resolved);
      document.querySelector<HTMLElement>(".note-reading-site")?.setAttribute("data-note-timeline-theme", resolved);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const edge = document.querySelector<HTMLElement>(".note-reading-edge-progress span");
    if (edge) edge.style.height = `${progress}%`;
  }, [progress]);

  const changeFont = (value: ReadingFontId) => { setFontId(value); window.localStorage.setItem(FONT_STORAGE_KEY, value); };
  return <>
    <div className="note-reading-left-rail"><Timeline article={article} articles={articles} theme={theme} /></div>
    <article className="note-reading-paper" ref={readingRef}>
      {article.cover && <div className="note-reading-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={article.cover} />
      </div>}
      <header className="note-reading-header">
        {article.topic && <span className="note-reading-topic-ribbon">{article.topic}</span>}
        <h1>{article.title}</h1>
        <div className="note-reading-meta" aria-label="文章信息"><time dateTime={article.date}>{formatPublishedDate(article.date)}</time>{article.place && <span>{article.place}</span>}{article.weather && <span>{article.weather}</span>}{article.mood && <span>{article.mood}</span>}</div>
        <div className="note-reading-summary"><span>摘要</span><p>{article.summary}</p></div>
        {headings.length > 0 && <details className="note-reading-mobile-toc"><summary>目录 · {headings.length} 节</summary><nav aria-label="移动文章目录">{headings.map((heading) => <a href={`#${heading.id}`} key={heading.id}>{heading.text}</a>)}</nav></details>}
      </header>
      <div className="note-reading-prose has-drop-cap" style={{ "--note-reading-font": selectedFont.family } as React.CSSProperties}><ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h2: ({ children, node, ...props }) => <h2 id={headingIdByLine.get(node?.position?.start.line ?? 0)} {...props}>{children}</h2>, h3: ({ children, node, ...props }) => <h3 id={headingIdByLine.get(node?.position?.start.line ?? 0)} {...props}>{children}</h3>, a: ({ children, ...props }) => <a {...props} rel="noreferrer">{children}</a> }}>{article.body}</ReactMarkdown></div>
      <footer className="note-reading-ending">
        {article.topic && <section className="note-reading-bottom-topic"><span>收录于主题</span><strong>{article.topic}</strong></section>}
        <nav aria-label="相邻手记" className="note-reading-adjacent note-reading-adjacent-v2">{previous ? <Link prefetch={false} href={`/notes/${previous.slug}`}><span>← 上一篇</span><strong>{previous.title}</strong></Link> : <span />}<Link prefetch={false} className="note-reading-return" href="/notes/">返回手记</Link>{next ? <Link prefetch={false} href={`/notes/${next.slug}`}><span>下一篇 →</span><strong>{next.title}</strong></Link> : <span />}</nav>
      </footer>
    </article>
    <div className="note-reading-right-rail"><ReadingTools fontId={fontId} headings={headings} onFontChange={changeFont} progress={progress} /></div>
  </>;
}
